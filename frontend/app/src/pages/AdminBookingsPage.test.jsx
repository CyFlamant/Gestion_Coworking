import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { Route } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ApiError, createBooking, deleteBooking, getBookings, getClients, getSpaces, updateBooking,
} from "../lib/api.js";
import { renderWithUser } from "../test/renderWithUser.jsx";
import AdminBookingsPage from "./AdminBookingsPage.jsx";

// Fake API: each test chooses what it answers.
vi.mock("../lib/api.js", async (importOriginal) => ({
  ...(await importOriginal()),
  getSpaces: vi.fn(),
  getBookings: vi.fn(),
  getClients: vi.fn(),
  createBooking: vi.fn(),
  updateBooking: vi.fn(),
  deleteBooking: vi.fn(),
}));

const ADMIN = { id: "1", role: "ADMIN", firstName: "Gérant" };
const MARIE_ID = "00000000-0000-0000-0000-000000000002";
const SPACES = [
  { id: 1, name: "Openspace 1", type: "OPENSPACE", hourRate: 4, halfDayRate: 14, dayRate: 25, monthRate: 250 },
  { id: 2, name: "Openspace 2", type: "OPENSPACE", hourRate: 4, halfDayRate: 14, dayRate: 25, monthRate: 250 },
  { id: 3, name: "Bureau 1", type: "OFFICE", hourRate: 9, halfDayRate: 30, dayRate: 50, monthRate: 700 },
];
const CLIENTS = [
  { id: MARIE_ID, firstName: "Marie", lastName: "Dubois", email: "marie.dubois@exemple.be" },
  { id: "00000000-0000-0000-0000-000000000003", firstName: "Thomas", lastName: "Lambert", email: "thomas.lambert@exemple.be" },
];
// "Today" is Monday 16 November 2026 at 10:00 (see beforeEach).
const TODAY_MARIE = {
  id: 1, spaceId: 1, spaceName: "Openspace 1", spaceType: "OPENSPACE", userId: MARIE_ID, userName: "Marie Dubois",
  startDateTime: "2026-11-16T09:00:00", endDateTime: "2026-11-16T12:00:00", formula: "HOUR", price: 12,
};
const TOMORROW_THOMAS = {
  id: 2, spaceId: 3, spaceName: "Bureau 1", spaceType: "OFFICE", userId: CLIENTS[1].id, userName: "Thomas Lambert",
  startDateTime: "2026-11-17T08:00:00", endDateTime: "2026-11-17T19:00:00", formula: "DAY", price: 50,
};
const LAST_WEEK_MARIE = {
  id: 3, spaceId: 2, spaceName: "Openspace 2", spaceType: "OPENSPACE", userId: MARIE_ID, userName: "Marie Dubois",
  startDateTime: "2026-11-10T08:00:00", endDateTime: "2026-11-10T13:00:00", formula: "HALF_DAY", price: 14,
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(2026, 10, 16, 10));
  getSpaces.mockResolvedValue(SPACES);
  getBookings.mockResolvedValue([LAST_WEEK_MARIE, TODAY_MARIE, TOMORROW_THOMAS]);
  getClients.mockResolvedValue(CLIENTS);
});

afterEach(() => vi.useRealTimers());

function renderPage() {
  return renderWithUser(<Route path="/admin/reservations" element={<AdminBookingsPage />} />, {
    user: ADMIN,
    path: "/admin/reservations",
  });
}

// The free-slot button of the day view for a space at an hour.
function slot(space, hour) {
  return screen.queryByRole("button", { name: `Ajouter une réservation pour ${space} à ${hour}` });
}

describe("AdminBookingsPage", () => {
  it("shows today's bookings in the day view", async () => {
    renderPage();
    expect(await screen.findByRole("heading", { name: "Lundi 16 novembre 2026" })).toBeInTheDocument();
    expect(screen.getByText("1 réservation(s) ce jour")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Marie Dubois/ })).toHaveTextContent("9:00 – 12:00");
  });

  it("shows the bookings of the day chosen in the calendar", async () => {
    renderPage();
    await screen.findByRole("button", { name: /Marie Dubois/ });
    fireEvent.click(screen.getByRole("button", { name: "Mardi 17 novembre 2026" }));
    expect(screen.getByRole("heading", { name: "Mardi 17 novembre 2026" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Thomas Lambert/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Marie Dubois/ })).not.toBeInTheDocument();
  });

  it("filters the day view by type and by space", async () => {
    renderPage();
    await screen.findByRole("button", { name: /Marie Dubois/ });
    fireEvent.change(screen.getByLabelText("Type d’espace"), { target: { value: "OPENSPACE" } });
    expect(slot("Bureau 1", "14:00")).not.toBeInTheDocument();
    expect(slot("Openspace 2", "14:00")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Nom"), { target: { value: "1" } });
    expect(slot("Openspace 2", "14:00")).not.toBeInTheDocument();
    expect(slot("Openspace 1", "14:00")).toBeInTheDocument();
  });

  it("lists the bookings that are not over, and the past ones on request", async () => {
    renderPage();
    await screen.findByRole("button", { name: /Marie Dubois/ });
    fireEvent.click(screen.getByRole("radio", { name: "Liste" }));
    const table = screen.getByRole("table");
    expect(within(table).getByRole("row", { name: /Openspace 1.*Marie Dubois/ })).toBeInTheDocument();
    expect(within(table).getByRole("row", { name: /Bureau 1.*Thomas Lambert/ })).toBeInTheDocument();
    expect(within(table).queryByRole("row", { name: /Openspace 2/ })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("checkbox", { name: "Afficher les réservations passées" }));
    expect(within(screen.getByRole("table")).getByRole("row", { name: /Openspace 2.*Marie Dubois/ })).toBeInTheDocument();
  });

  it("adds a booking for a client from a free hour of the day view", async () => {
    createBooking.mockResolvedValue({ id: 10 });
    renderPage();
    await screen.findByRole("button", { name: /Marie Dubois/ });
    fireEvent.click(slot("Bureau 1", "14:00"));
    const dialog = screen.getByRole("dialog", { name: "Nouvelle réservation" });
    fireEvent.change(within(dialog).getByLabelText("Client"), { target: { value: MARIE_ID } });
    fireEvent.click(within(dialog).getByRole("button", { name: "Enregistrer" }));
    await waitFor(() =>
      expect(createBooking).toHaveBeenCalledWith({
        spaceId: 3,
        userId: MARIE_ID,
        startDateTime: "2026-11-16T14:00:00",
        endDateTime: "2026-11-16T15:00:00",
      }),
    );
    expect(await screen.findByRole("status")).toHaveTextContent("Réservation ajoutée.");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(getBookings).toHaveBeenCalledTimes(2); // the bookings are loaded again
  });

  it("edits a booking clicked in the day view", async () => {
    updateBooking.mockResolvedValue({ ...TODAY_MARIE });
    renderPage();
    fireEvent.click(await screen.findByRole("button", { name: /Marie Dubois/ }));
    const dialog = screen.getByRole("dialog", { name: "Modifier la réservation" });
    expect(within(dialog).getByLabelText("Client")).toHaveValue(MARIE_ID);
    fireEvent.change(within(dialog).getByLabelText("Durée"), { target: { value: "2" } });
    fireEvent.click(within(dialog).getByRole("button", { name: "Enregistrer" }));
    await waitFor(() =>
      expect(updateBooking).toHaveBeenCalledWith(1, {
        spaceId: 1,
        userId: MARIE_ID,
        startDateTime: "2026-11-16T09:00:00",
        endDateTime: "2026-11-16T11:00:00",
      }),
    );
    expect(await screen.findByRole("status")).toHaveTextContent("Réservation modifiée.");
  });

  it("deletes a booking once the admin confirms", async () => {
    deleteBooking.mockResolvedValue(null);
    renderPage();
    fireEvent.click(await screen.findByRole("button", { name: /Marie Dubois/ }));
    fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Supprimer" }));
    const confirm = screen.getByRole("dialog", { name: /Supprimer la réservation/ });
    fireEvent.click(within(confirm).getByRole("button", { name: "Supprimer" }));
    await waitFor(() => expect(deleteBooking).toHaveBeenCalledWith(1));
    expect(await screen.findByRole("status")).toHaveTextContent("Réservation supprimée.");
  });

  it("shows the API's error in the dialog and keeps it open", async () => {
    createBooking.mockRejectedValue(new ApiError(409, "Cet espace est déjà réservé sur ce créneau"));
    renderPage();
    await screen.findByRole("button", { name: /Marie Dubois/ });
    fireEvent.click(slot("Bureau 1", "14:00"));
    const dialog = screen.getByRole("dialog", { name: "Nouvelle réservation" });
    fireEvent.change(within(dialog).getByLabelText("Client"), { target: { value: MARIE_ID } });
    fireEvent.click(within(dialog).getByRole("button", { name: "Enregistrer" }));
    expect(await within(dialog).findByRole("alert")).toHaveTextContent("Cet espace est déjà réservé sur ce créneau");
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("shows an error when the data cannot be loaded", async () => {
    getBookings.mockRejectedValue(new ApiError(501, "Pas encore disponible : ce service n’est pas encore développé."));
    renderPage();
    expect(await screen.findByRole("alert")).toHaveTextContent("Pas encore disponible");
  });
});
