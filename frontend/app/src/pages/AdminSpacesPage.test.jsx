import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { Route } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, createSpace, deleteSpace, getBookings, getSpaces, updateSpace } from "../lib/api.js";
import { renderWithUser } from "../test/renderWithUser.jsx";
import AdminSpacesPage from "./AdminSpacesPage.jsx";

// Fake API: each test chooses what it answers.
vi.mock("../lib/api.js", async (importOriginal) => ({
  ...(await importOriginal()),
  getSpaces: vi.fn(),
  getBookings: vi.fn(),
  createSpace: vi.fn(),
  updateSpace: vi.fn(),
  deleteSpace: vi.fn(),
}));

const ADMIN = { id: "1", role: "ADMIN", firstName: "Gérant" };
// Not in display order: the page sorts them by type, then by name.
const SPACES = [
  { id: 6, name: "Salle Atelier", type: "ROOM", hourRate: 25, halfDayRate: 80, dayRate: 140, monthRate: 2000 },
  { id: 3, name: "Bureau 1", type: "OFFICE", hourRate: 9, halfDayRate: 30, dayRate: 50, monthRate: 700 },
  { id: 2, name: "Openspace 2", type: "OPENSPACE", hourRate: 4, halfDayRate: 14, dayRate: 25, monthRate: 250 },
  { id: 1, name: "Openspace 1", type: "OPENSPACE", hourRate: 4, halfDayRate: 14, dayRate: 25, monthRate: 250 },
];
// Two bookings on Openspace 1, one on Bureau 1.
const BOOKINGS = [{ id: 1, spaceId: 1 }, { id: 2, spaceId: 1 }, { id: 3, spaceId: 3 }];

beforeEach(() => {
  vi.clearAllMocks();
  getSpaces.mockResolvedValue(SPACES);
  getBookings.mockResolvedValue(BOOKINGS);
});

function renderPage() {
  return renderWithUser(<Route path="/admin/espaces" element={<AdminSpacesPage />} />, {
    user: ADMIN,
    path: "/admin/espaces",
  });
}

// The table row of a space, found from its name.
async function row(name) {
  return screen.findByRole("row", { name: new RegExp(name) });
}

// The space names in the order of the table.
function namesInTable() {
  return screen.getAllByRole("row").slice(1).map((r) => within(r).getAllByRole("cell")[0].textContent);
}

// Types a value in the field with that label, inside the dialog.
function type(dialog, label, value) {
  fireEvent.change(within(dialog).getByLabelText(label), { target: { value } });
}

describe("AdminSpacesPage", () => {
  it("lists the spaces with their rates and number of bookings", async () => {
    renderPage();
    const openspace = await row("Openspace 1");
    expect(within(openspace).getByText(/250,00/)).toBeInTheDocument();
    expect(within(openspace).getAllByRole("cell").at(-2)).toHaveTextContent("2");
    expect(screen.getByText("4 espace(s)")).toBeInTheDocument();
  });

  it("sorts the spaces by type, then by name", async () => {
    renderPage();
    await row("Openspace 1");
    expect(namesInTable()).toEqual(["Openspace 1", "Openspace 2", "Bureau 1", "Salle Atelier"]);
  });

  it("filters the spaces by type", async () => {
    renderPage();
    await row("Openspace 1");
    fireEvent.click(screen.getByRole("radio", { name: "Bureaux individuels" }));
    expect(namesInTable()).toEqual(["Bureau 1"]);
    expect(screen.getByText("1 espace(s)")).toBeInTheDocument();
  });

  it("adds a space", async () => {
    createSpace.mockResolvedValue({ id: 7, name: "Bureau 3", type: "OFFICE" });
    renderPage();
    await row("Openspace 1");
    fireEvent.click(screen.getByRole("button", { name: "Ajouter un espace" }));
    const dialog = screen.getByRole("dialog", { name: "Nouvel espace" });
    type(dialog, "Nom", "Bureau 3");
    fireEvent.change(within(dialog).getByLabelText("Type"), { target: { value: "OFFICE" } });
    type(dialog, "À l’heure", "10");
    type(dialog, "Demi-journée", "32");
    type(dialog, "Journée", "55");
    type(dialog, "Mois", "750");
    fireEvent.click(within(dialog).getByRole("button", { name: "Enregistrer" }));
    await waitFor(() =>
      expect(createSpace).toHaveBeenCalledWith({
        name: "Bureau 3", type: "OFFICE", hourRate: 10, halfDayRate: 32, dayRate: 55, monthRate: 750,
      }),
    );
    expect(await screen.findByRole("status")).toHaveTextContent(/Bureau 3.*ajouté/);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(getSpaces).toHaveBeenCalledTimes(2); // the list is loaded again
  });

  it("edits a space", async () => {
    updateSpace.mockResolvedValue({ ...SPACES[1], name: "Bureau 1 bis" });
    renderPage();
    fireEvent.click(within(await row("Bureau 1")).getByRole("button", { name: "Modifier" }));
    const dialog = screen.getByRole("dialog", { name: "Modifier l’espace" });
    expect(within(dialog).getByLabelText("Nom")).toHaveValue("Bureau 1");
    type(dialog, "Nom", "Bureau 1 bis");
    fireEvent.click(within(dialog).getByRole("button", { name: "Enregistrer" }));
    await waitFor(() =>
      expect(updateSpace).toHaveBeenCalledWith(3, {
        name: "Bureau 1 bis", type: "OFFICE", hourRate: 9, halfDayRate: 30, dayRate: 50, monthRate: 700,
      }),
    );
    expect(await screen.findByRole("status")).toHaveTextContent(/Bureau 1 bis.*modifié/);
  });

  it("shows the API's errors in the form and keeps it open", async () => {
    createSpace.mockRejectedValue(new ApiError(400, "Données invalides", { name: "Champ obligatoire" }));
    renderPage();
    await row("Openspace 1");
    fireEvent.click(screen.getByRole("button", { name: "Ajouter un espace" }));
    const dialog = screen.getByRole("dialog", { name: "Nouvel espace" });
    fireEvent.click(within(dialog).getByRole("button", { name: "Enregistrer" }));
    expect(await within(dialog).findByText("Champ obligatoire")).toBeInTheDocument();
    expect(within(dialog).getByLabelText("Nom")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("deletes a space once the admin confirms", async () => {
    deleteSpace.mockResolvedValue(null);
    renderPage();
    fireEvent.click(within(await row("Openspace 2")).getByRole("button", { name: "Supprimer" }));
    const dialog = screen.getByRole("dialog", { name: /Supprimer.*Openspace 2/ });
    fireEvent.click(within(dialog).getByRole("button", { name: "Supprimer" }));
    await waitFor(() => expect(deleteSpace).toHaveBeenCalledWith(2));
    expect(await screen.findByRole("status")).toHaveTextContent(/Openspace 2.*supprimé/);
  });

  it("explains why a space with bookings cannot be deleted", async () => {
    deleteSpace.mockRejectedValue(new ApiError(409, "Impossible de supprimer l'espace 1 : il a des réservations"));
    renderPage();
    fireEvent.click(within(await row("Openspace 1")).getByRole("button", { name: "Supprimer" }));
    fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Supprimer" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("il a des réservations");
  });

  it("still lists the spaces when the bookings are not available", async () => {
    getBookings.mockRejectedValue(new ApiError(501, "Pas encore disponible"));
    renderPage();
    const openspace = await row("Openspace 1");
    expect(within(openspace).getAllByRole("cell").at(-2)).toHaveTextContent("0");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows an error when the spaces cannot be loaded", async () => {
    getSpaces.mockRejectedValue(new ApiError(0, "Impossible de joindre le serveur."));
    renderPage();
    expect(await screen.findByRole("alert")).toHaveTextContent("Impossible de joindre le serveur.");
  });
});
