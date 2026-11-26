import { fireEvent, screen, waitFor } from "@testing-library/react";
import { Route } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, createBooking, getAvailableSpaces, getSpaces } from "../lib/api.js";
import { saveDraft } from "../lib/draft.js";
import { renderWithUser } from "../test/renderWithUser.jsx";
import BookPage from "./BookPage.jsx";

// Fake API: each test chooses what it answers.
vi.mock("../lib/api.js", async (importOriginal) => ({
  ...(await importOriginal()),
  getSpaces: vi.fn(),
  getAvailableSpaces: vi.fn(),
  createBooking: vi.fn(),
}));

const SPACES = [
  { id: 1, name: "Openspace 1", type: "OPENSPACE", hourRate: 4, halfDayRate: 14, dayRate: 25, monthRate: 250 },
  { id: 2, name: "Openspace 2", type: "OPENSPACE", hourRate: 4, halfDayRate: 14, dayRate: 25, monthRate: 250 },
  { id: 3, name: "Bureau 1", type: "OFFICE", hourRate: 9, halfDayRate: 30, dayRate: 50, monthRate: 700 },
];
const CLIENT = { id: "2", role: "CLIENT", firstName: "Marie" };
const TUESDAY = new Date(2026, 10, 17);
// What the spaces page saves when a client clicks "Réserver" on Bureau 1 for a full day.
const OFFICE_DAY = { spaceId: 3, type: "OFFICE", formula: "DAY", date: TUESDAY, startHour: 9, hours: 2, halfDay: "MORNING" };

beforeEach(() => {
  vi.clearAllMocks();
  sessionStorage.clear(); // no draft left by a previous test
  // "Today" is Monday 16 November 2026. Only the date is faked, not the timers.
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(2026, 10, 16, 10));
  getSpaces.mockResolvedValue(SPACES);
  getAvailableSpaces.mockResolvedValue([SPACES[1], SPACES[2]]); // Openspace 1 is booked
});

afterEach(() => vi.useRealTimers());

function renderPage() {
  return renderWithUser(
    <>
      <Route path="/reserver" element={<BookPage />} />
      <Route path="/mes-reservations" element={<p>Page Mes réservations</p>} />
    </>,
    { user: CLIENT, path: "/reserver" },
  );
}

// The amount next to "Total" in the summary.
function total() {
  return screen.getByText("Total").nextElementSibling;
}

describe("BookPage", () => {
  it("starts from the space and slot chosen on the spaces page", async () => {
    saveDraft(OFFICE_DAY);
    renderPage();
    expect(await screen.findByRole("combobox", { name: "Espace" })).toHaveValue("3");
    expect(screen.getByRole("radio", { name: "Journée" })).toBeChecked();
  });

  it("starts with two hours tomorrow when nothing was chosen", async () => {
    renderPage();
    expect(await screen.findByRole("radio", { name: "À l’heure" })).toBeChecked();
    expect(screen.getAllByText(/Mardi 17 novembre 2026, de 9:00 à 11:00/).length).toBeGreaterThan(0);
  });

  it("chooses a free space of the type", async () => {
    renderPage();
    await waitFor(() => expect(screen.getByRole("combobox", { name: "Espace" })).toHaveValue("2"));
  });

  it("marks the booked spaces in the list", async () => {
    renderPage();
    expect(await screen.findByRole("option", { name: "Openspace 1 — déjà réservé" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Openspace 2" })).toBeInTheDocument();
  });

  it("shows the price of the booking", async () => {
    saveDraft(OFFICE_DAY);
    renderPage();
    await waitFor(() => expect(total()).toHaveTextContent("50,00"));
    expect(screen.getByText("1 jour(s)")).toBeInTheDocument();
  });

  it("warns when the chosen space is already booked", async () => {
    saveDraft({ ...OFFICE_DAY, spaceId: 1, type: "OPENSPACE" });
    renderPage();
    expect(await screen.findByText("Cet espace est déjà réservé sur ce créneau.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Confirmer la réservation" })).toBeDisabled();
  });

  it("says so when no space of the type is free", async () => {
    getAvailableSpaces.mockResolvedValue([SPACES[2]]); // both open spaces are booked
    renderPage();
    expect(await screen.findByText("Aucun espace de ce type n’est disponible pour ce créneau.")).toBeInTheDocument();
    expect(screen.queryByRole("combobox", { name: "Espace" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Confirmer la réservation" })).toBeDisabled();
  });

  it("books the space and goes to the client's bookings", async () => {
    createBooking.mockResolvedValue({ id: 10 });
    saveDraft(OFFICE_DAY);
    renderPage();
    await waitFor(() => expect(total()).toHaveTextContent("50,00"));
    fireEvent.click(screen.getByRole("button", { name: "Confirmer la réservation" }));
    expect(await screen.findByText("Page Mes réservations")).toBeInTheDocument();
    expect(createBooking).toHaveBeenCalledWith({
      spaceId: 3,
      startDateTime: "2026-11-17T08:00:00",
      endDateTime: "2026-11-17T19:00:00",
    });
  });

  it("shows the API's error and stays on the page when the booking fails", async () => {
    createBooking.mockRejectedValue(new ApiError(409, "Cet espace est déjà réservé sur ce créneau"));
    saveDraft(OFFICE_DAY);
    renderPage();
    await waitFor(() => expect(total()).toHaveTextContent("50,00"));
    fireEvent.click(screen.getByRole("button", { name: "Confirmer la réservation" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Cet espace est déjà réservé sur ce créneau");
    expect(screen.queryByText("Page Mes réservations")).not.toBeInTheDocument();
  });
});
