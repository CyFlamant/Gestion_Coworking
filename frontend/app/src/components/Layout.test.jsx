import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { getCurrentUser } from "../lib/auth.js";
import Layout from "./Layout.jsx";

// Replaces getCurrentUser with a fake whose answer each test chooses; the rest of auth.js stays real.
vi.mock("../lib/auth.js", async (importOriginal) => ({
  ...(await importOriginal()),
  getCurrentUser: vi.fn(),
}));

function renderLayout() {
  return render(
    <MemoryRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<p>Contenu de la page</p>} />
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
});
