import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useNavigate } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { logout } from "../lib/api.js";
import { getCurrentUser } from "../lib/auth.js";
import { goTo } from "../lib/browser.js";
import { clearFlash, readFlash, setFlash } from "../lib/flash.js";
import Layout from "./Layout.jsx";

// Replaces getCurrentUser with a fake whose answer each test chooses; the rest of auth.js stays real.
vi.mock("../lib/auth.js", async (importOriginal) => ({
  ...(await importOriginal()),
  getCurrentUser: vi.fn(),
}));
vi.mock("../lib/api.js", async (importOriginal) => ({
  ...(await importOriginal()),
  logout: vi.fn(),
}));
vi.mock("../lib/browser.js", () => ({ goTo: vi.fn(), reload: vi.fn() }));

beforeEach(() => {
  vi.clearAllMocks();
  clearFlash();
});

// A page that saves a message, then goes to another page inside the app (as "Réserver" does).
function SavesAndLeaves() {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => {
        setFlash("Réservation confirmée.");
        navigate("/suivante");
      }}
    >
      Confirmer
    </button>
  );
}

function renderLayout() {
  return render(
    <MemoryRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<p>Contenu de la page</p>} />
          <Route path="/depart" element={<SavesAndLeaves />} />
          <Route path="/suivante" element={<p>Page suivante</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe("Layout", () => {
  it("shows the sign-in link to a guest", async () => {
    getCurrentUser.mockResolvedValue(null);
    renderLayout();
    expect(
      await screen.findByRole("link", { name: "Connexion / Inscription" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Déconnexion" }),
    ).not.toBeInTheDocument();
  });

  it("shows the client links and first name", async () => {
    getCurrentUser.mockResolvedValue({
      id: "2",
      role: "CLIENT",
      firstName: "Marie",
    });
    renderLayout();
    expect(
      await screen.findByRole("link", { name: "Réserver" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Mes réservations" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Marie")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Déconnexion" }),
    ).toBeInTheDocument();
  });

  it("shows the admin links", async () => {
    getCurrentUser.mockResolvedValue({
      id: "1",
      role: "ADMIN",
      firstName: "Gérant",
    });
    renderLayout();
    expect(
      await screen.findByRole("link", { name: "Réservations" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Espaces" })).toBeInTheDocument();
  });

  it("shows the page inside the layout", async () => {
    getCurrentUser.mockResolvedValue(null);
    renderLayout();
    expect(await screen.findByText("Contenu de la page")).toBeInTheDocument();
  });

  it("shows a message saved by the previous page", async () => {
    getCurrentUser.mockResolvedValue(null);
    render(
      <MemoryRouter initialEntries={["/depart"]}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/depart" element={<SavesAndLeaves />} />
            <Route path="/suivante" element={<p>Page suivante</p>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );
    fireEvent.click(await screen.findByRole("button", { name: "Confirmer" }));
    expect(await screen.findByText("Page suivante")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Réservation confirmée.");
  });

  it("signs out and says so on the next page", async () => {
    getCurrentUser.mockResolvedValue({ id: "2", role: "CLIENT", firstName: "Marie" });
    logout.mockResolvedValue(null);
    renderLayout();
    fireEvent.click(await screen.findByRole("button", { name: "Déconnexion" }));
    await waitFor(() => expect(goTo).toHaveBeenCalledWith("/"));
    expect(readFlash()).toBe("Vous êtes déconnecté.");
  });
});
