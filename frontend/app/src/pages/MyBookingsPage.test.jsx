import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { Route } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, deleteBooking, getMyBookings } from "../lib/api.js";
import { renderWithUser } from "../test/renderWithUser.jsx";
import MyBookingsPage from "./MyBookingsPage.jsx";

// Fake API: each test chooses what it answers.
vi.mock("../lib/api.js", async (importOriginal) => ({
  ...(await importOriginal()),
  getMyBookings: vi.fn(),
  deleteBooking: vi.fn(),
}));

const CLIENT = { id: "2", role: "CLIENT", firstName: "Marie" };
// "Today" is Monday 16 November 2026 at 10:00 (see beforeEach).
const UPCOMING = {
  id: 1, spaceId: 1, spaceName: "Openspace 1", spaceType: "OPENSPACE",
  startDateTime: "2026-11-17T09:00:00", endDateTime: "2026-11-17T12:00:00", formula: "HOUR", price: 12,
};
const STARTED = {
  id: 2, spaceId: 3, spaceName: "Bureau 1", spaceType: "OFFICE",
  startDateTime: "2026-11-16T09:00:00", endDateTime: "2026-11-16T11:00:00", formula: "HOUR", price: 18,
};
const PAST = {
  id: 3, spaceId: 6, spaceName: "Salle Atelier", spaceType: "ROOM",
  startDateTime: "2026-11-10T08:00:00", endDateTime: "2026-11-10T19:00:00", formula: "DAY", price: 140,
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(2026, 10, 16, 10));
  getMyBookings.mockResolvedValue([PAST, STARTED, UPCOMING]); // sorted by start, as the API does
  deleteBooking.mockResolvedValue(null);
});

afterEach(() => vi.useRealTimers());

function renderPage() {
  return renderWithUser(<Route path="/mes-reservations" element={<MyBookingsPage />} />, {
    user: CLIENT,
    path: "/mes-reservations",
  });
}

describe("MyBookingsPage", () => {
  it("lists the upcoming bookings", async () => {
    renderPage();
    expect(await screen.findByRole("heading", { name: "Openspace 1" })).toBeInTheDocument();
    expect(screen.getByText("Mardi 17 novembre 2026, de 9:00 à 12:00")).toBeInTheDocument();
    expect(screen.getByText(/12,00/)).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Salle Atelier" })).not.toBeInTheDocument();
  });

  it("shows a booking in progress, without the cancel option", async () => {
    renderPage();
    const ticket = (await screen.findByRole("heading", { name: "Bureau 1" })).closest("li");
    expect(within(ticket).getByText("Lundi 16 novembre 2026, de 9:00 à 11:00")).toBeInTheDocument();
    expect(within(ticket).queryByRole("button", { name: "Annuler" })).not.toBeInTheDocument();
  });

  it("cancels a booking once the client confirms", async () => {
    renderPage();
    fireEvent.click(await screen.findByRole("button", { name: "Annuler" }));
    const dialog = screen.getByRole("dialog", { name: /Annuler la réservation/ });
    getMyBookings.mockResolvedValue([PAST, STARTED]); // the list once the booking is gone
    fireEvent.click(within(dialog).getByRole("button", { name: "Annuler la réservation" }));
    await waitFor(() => expect(deleteBooking).toHaveBeenCalledWith(1));
    await waitFor(() => expect(screen.queryByRole("heading", { name: "Openspace 1" })).not.toBeInTheDocument());
    expect(screen.getByRole("heading", { name: "Bureau 1" })).toBeInTheDocument();
  });

  it("keeps the booking when the client changes their mind", async () => {
    renderPage();
    fireEvent.click(await screen.findByRole("button", { name: "Annuler" }));
    fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Garder" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(deleteBooking).not.toHaveBeenCalled();
    expect(screen.getByRole("heading", { name: "Openspace 1" })).toBeInTheDocument();
  });

  it("invites the client to book when nothing is coming up", async () => {
    getMyBookings.mockResolvedValue([PAST]);
    renderPage();
    expect(await screen.findByText("Vous n’avez aucune réservation à venir.")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Réserver un espace" }).length).toBeGreaterThan(0);
  });

  it("shows an error when the bookings cannot be loaded", async () => {
    getMyBookings.mockRejectedValue(new ApiError(0, "Impossible de joindre le serveur."));
    renderPage();
    expect(await screen.findByRole("alert")).toHaveTextContent("Impossible de joindre le serveur.");
  });
});
