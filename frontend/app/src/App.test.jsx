import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App.jsx";
import { getAvailableSpaces, getBookings, getClients, getMyBookings, getSpaces } from "./lib/api.js";
import { getCurrentUser } from "./lib/auth.js";

// Checks the wiring in App.jsx: each address shows its real page, for the right role.
// The pages themselves are tested in their own files; here the API answers with empty lists.
vi.mock("./lib/auth.js", async (importOriginal) => ({
  ...(await importOriginal()),
  getCurrentUser: vi.fn(),
}));
vi.mock("./lib/api.js", async (importOriginal) => ({
  ...(await importOriginal()),
  getSpaces: vi.fn(),
  getAvailableSpaces: vi.fn(),
  getMyBookings: vi.fn(),
  getBookings: vi.fn(),
  getClients: vi.fn(),
}));

const USERS = {
  guest: null,
  client: { id: "2", role: "CLIENT", firstName: "Marie" },
  admin: { id: "1", role: "ADMIN", firstName: "Gérant" },
};

beforeEach(() => {
  document.title = ""; // the tab title is checked below; start each test without one
  getSpaces.mockResolvedValue([]);
  getAvailableSpaces.mockResolvedValue([]);
  getMyBookings.mockResolvedValue([]);
  getBookings.mockResolvedValue([]);
  getClients.mockResolvedValue([]);
});

function renderAt(path, who) {
  getCurrentUser.mockResolvedValue(USERS[who]);
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

describe("App", () => {
  // A placeholder page has the right heading but no tab title, so the title shows the real page is there.
  it.each([
    ["/", "guest", "Espace de coworking", "Accueil"],
    ["/espaces", "guest", "Espaces disponibles", "Espaces disponibles"],
    ["/connexion", "guest", "Connexion", "Connexion"],
    ["/inscription", "guest", "Créer un compte", "Inscription"],
    ["/reserver", "client", "Réserver", "Réserver"],
    ["/mes-reservations", "client", "Mes réservations", "Mes réservations"],
    ["/contact", "guest", "Contact", "Contact"],
    ["/horaires", "guest", "Horaires", "Horaires"],
    ["/mentions-legales", "guest", "Mentions légales", "Mentions légales"],
  ])("shows the page at %s to a %s", async (path, who, heading, title) => {
    renderAt(path, who);
    expect(await screen.findByRole("heading", { level: 1, name: heading })).toBeInTheDocument();
    await waitFor(() => expect(document.title).toBe(`${title} · L’Échappée`));
  });

  it("shows the admin pages to an admin", async () => {
    const { unmount } = renderAt("/admin/espaces", "admin");
    expect(await screen.findByRole("heading", { level: 1, name: "Espaces" })).toBeInTheDocument();
    await waitFor(() => expect(document.title).toBe("Espaces · L’Échappée"));
    unmount();

    document.title = "";
    renderAt("/admin/reservations", "admin");
    expect(await screen.findByRole("heading", { level: 1, name: "Réservations" })).toBeInTheDocument();
    await waitFor(() => expect(document.title).toBe("Réservations · L’Échappée"));
  });

  it("sends a guest who opens a client page to the home page", async () => {
    renderAt("/reserver", "guest");
    expect(await screen.findByRole("heading", { level: 1, name: "Espace de coworking" })).toBeInTheDocument();
  });

  it("says when a page does not exist", async () => {
    renderAt("/nimporte-quoi", "guest");
    expect(await screen.findByRole("heading", { level: 1, name: "Page introuvable" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Retour à l’accueil" })).toHaveAttribute("href", "/");
    await waitFor(() => expect(document.title).toBe("Page introuvable · L’Échappée"));
  });
});
