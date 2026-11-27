import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { Route } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, getAvailableSpaces, getSpaces } from "../lib/api.js";
import { takeDraft } from "../lib/draft.js";
import { renderWithUser } from "../test/renderWithUser.jsx";
import SpacesPage from "./SpacesPage.jsx";

// Fake API: each test chooses what it answers.
vi.mock("../lib/api.js", async (importOriginal) => ({
  ...(await importOriginal()),
  getSpaces: vi.fn(),
  getAvailableSpaces: vi.fn(),
}));

const SPACES = [
  { id: 1, name: "Openspace 1", type: "OPENSPACE", hourRate: 4, halfDayRate: 14, dayRate: 25, monthRate: 250 },
  { id: 2, name: "Openspace 2", type: "OPENSPACE", hourRate: 4, halfDayRate: 14, dayRate: 25, monthRate: 250 },
  { id: 3, name: "Bureau 1", type: "OFFICE", hourRate: 9, halfDayRate: 30, dayRate: 50, monthRate: 700 },
];
const CLIENT = { id: "2", role: "CLIENT", firstName: "Marie" };

beforeEach(() => {
  vi.clearAllMocks();
  // "Today" is Monday 16 November 2026, so the default search is Tuesday 17. Only the date is faked, not the timers.
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(2026, 10, 16, 10));
  getSpaces.mockResolvedValue(SPACES);
  getAvailableSpaces.mockResolvedValue([SPACES[1], SPACES[2]]); // Openspace 1 is booked
});

afterEach(() => vi.useRealTimers());

function renderPage({ user = null, path = "/espaces" } = {}) {
  return renderWithUser(
    <>
      <Route path="/espaces" element={<SpacesPage />} />
      <Route path="/reserver" element={<p>Page Réserver</p>} />
      <Route path="/connexion" element={<p>Page Connexion</p>} />
    </>,
    { user, path },
  );
}

// The card of a space, found from its name.
async function card(name) {
  return (await screen.findByRole("heading", { name })).closest("article");
}

describe("SpacesPage", () => {
  it("shows every space with its rates", async () => {
    renderPage();
    const office = await card("Bureau 1");
    expect(within(office).getByText(/9,00/)).toBeInTheDocument();
    expect(within(office).getByText(/700,00/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Openspace 1" })).toBeInTheDocument();
  });

  it("searches for the free spaces on the chosen slot", async () => {
    renderPage();
    await waitFor(() =>
      expect(getAvailableSpaces).toHaveBeenCalledWith({ start: "2026-11-17T08:00:00", end: "2026-11-17T19:00:00" }),
    );
  });

  it("searches again when the slot changes", async () => {
    renderPage();
    await card("Bureau 1");
    fireEvent.click(screen.getByRole("radio", { name: "À l’heure" }));
    await waitFor(() =>
      expect(getAvailableSpaces).toHaveBeenLastCalledWith({ start: "2026-11-17T09:00:00", end: "2026-11-17T11:00:00" }),
    );
  });

  it("marks which spaces are booked and counts the free ones", async () => {
    renderPage();
    expect(within(await card("Openspace 1")).getByText("Déjà réservé")).toBeInTheDocument();
    expect(within(await card("Openspace 2")).getByText("Disponible")).toBeInTheDocument();
    expect(screen.getByText(/2 espace\(s\) disponible\(s\) sur 3/)).toBeInTheDocument();
  });

  it("shows the price of each space for the chosen slot", async () => {
    renderPage();
    const office = await card("Bureau 1");
    expect(within(office).getByText("Prix pour ce créneau").nextElementSibling).toHaveTextContent("50,00");
  });

  it("filters the spaces by type", async () => {
    renderPage();
    await card("Openspace 1");
    fireEvent.click(screen.getByRole("radio", { name: "Bureaux individuels" }));
    expect(screen.queryByRole("heading", { name: "Openspace 1" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Bureau 1" })).toBeInTheDocument();
  });

  it("preselects the type chosen on the home page", async () => {
    renderPage({ path: "/espaces#office" });
    expect(await screen.findByRole("heading", { name: "Bureau 1" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Openspace 1" })).not.toBeInTheDocument();
  });

  it("invites a guest to sign in to book a free space", async () => {
    renderPage();
    expect(within(await card("Bureau 1")).getByRole("link", { name: "Se connecter pour réserver" })).toBeInTheDocument();
    expect(within(await card("Openspace 1")).queryByRole("link")).not.toBeInTheDocument();
  });

  it("keeps a guest's choice for after sign-in", async () => {
    renderPage();
    fireEvent.click(within(await card("Bureau 1")).getByRole("link", { name: "Se connecter pour réserver" }));
    expect(await screen.findByText("Page Connexion")).toBeInTheDocument();
    expect(takeDraft()).toMatchObject({ spaceId: 3, formula: "DAY", date: new Date(2026, 10, 17) });
  });

  it("takes a client to the booking page with the chosen space and slot", async () => {
    renderPage({ user: CLIENT });
    fireEvent.click(within(await card("Bureau 1")).getByRole("button", { name: "Réserver" }));
    expect(await screen.findByText("Page Réserver")).toBeInTheDocument();
    expect(takeDraft()).toMatchObject({ spaceId: 3, formula: "DAY", date: new Date(2026, 10, 17) });
  });

  it("shows every space as free when the search is not available", async () => {
    getAvailableSpaces.mockRejectedValue(new ApiError(501, "Pas encore disponible : ce service n’est pas encore développé."));
    renderPage();
    expect(within(await card("Openspace 1")).getByText("Disponible")).toBeInTheDocument();
    expect(screen.getByText(/Pas encore disponible/)).toBeInTheDocument();
  });

  it("shows an error when the spaces cannot be loaded", async () => {
    getSpaces.mockRejectedValue(new ApiError(0, "Impossible de joindre le serveur."));
    renderPage();
    expect(await screen.findByRole("alert")).toHaveTextContent("Impossible de joindre le serveur.");
  });
});
