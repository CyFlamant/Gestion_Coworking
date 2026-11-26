import { render, screen } from "@testing-library/react";
import { MemoryRouter, Outlet, Route, Routes } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { ApiError, getSpaces } from "../lib/api.js";
import HomePage from "./HomePage.jsx";

// Replaces getSpaces with a fake whose answer each test chooses; the rest of api.js stays real.
vi.mock("../lib/api.js", async (importOriginal) => ({
  ...(await importOriginal()),
  getSpaces: vi.fn(),
}));

const SPACES = [
  { id: 1, name: "Openspace 1", type: "OPENSPACE", hourRate: 5 },
  { id: 2, name: "Openspace 2", type: "OPENSPACE", hourRate: 4 },
  { id: 3, name: "Bureau 1", type: "OFFICE", hourRate: 9 },
];
const CLIENT = { id: "2", role: "CLIENT", firstName: "Marie" };

// The outer route stands in for Layout and RequireRole: it passes the user down.
function renderHome(user) {
  return render(
    <MemoryRouter>
      <Routes>
        <Route element={<Outlet context={user} />}>
          <Route path="/" element={<HomePage />} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe("HomePage", () => {
  it("invites a guest to see the spaces and sign up", () => {
    getSpaces.mockResolvedValue(SPACES);
    renderHome(null);
    expect(
      screen.getByRole("link", { name: "Voir les espaces disponibles" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Créer un compte" }),
    ).toBeInTheDocument();
  });

  it("invites a client to book", () => {
    getSpaces.mockResolvedValue(SPACES);
    renderHome(CLIENT);
    expect(
      screen.getByRole("link", { name: "Réserver un espace" }),
    ).toBeInTheDocument();
  });

  it("shows how many spaces each type has and the lowest hourly price", async () => {
    getSpaces.mockResolvedValue(SPACES);
    renderHome(null);
    expect(
      await screen.findByText(/2 espace\(s\) · dès 4,00/),
    ).toBeInTheDocument();
    expect(screen.getByText(/1 espace\(s\) · dès 9,00/)).toBeInTheDocument();
    expect(screen.getByText("0 espace(s)")).toBeInTheDocument();
  });

  it("shows an error when the spaces cannot be loaded", async () => {
    getSpaces.mockRejectedValue(
      new ApiError(0, "Impossible de joindre le serveur."),
    );
    renderHome(null);
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Impossible de joindre le serveur.",
    );
  });
});
