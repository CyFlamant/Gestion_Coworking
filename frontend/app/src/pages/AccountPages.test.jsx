import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, login, register } from "../lib/api.js";
import { goTo } from "../lib/browser.js";
import { clearFlash, readFlash } from "../lib/flash.js";
import LoginPage from "./LoginPage.jsx";
import SignupPage from "./SignupPage.jsx";

// Fake API calls and page loads; each test chooses what the API answers.
vi.mock("../lib/api.js", async (importOriginal) => ({
  ...(await importOriginal()),
  login: vi.fn(),
  register: vi.fn(),
}));
vi.mock("../lib/browser.js", () => ({ goTo: vi.fn() }));

// Forget the calls and the message recorded by the previous test.
beforeEach(() => {
  vi.clearAllMocks();
  clearFlash();
});

// Types a value in the field with that label, as a user would.
function type(label, value) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

describe("LoginPage", () => {
  it("signs in and goes to the role's home page", async () => {
    login.mockResolvedValue({ id: "1", role: "ADMIN" });
    render(<LoginPage />, { wrapper: MemoryRouter });
    type("Adresse e-mail", "admin@exemple.be");
    type("Mot de passe", "demo1234");
    fireEvent.click(screen.getByRole("button", { name: "Se connecter" }));
    await waitFor(() =>
      expect(goTo).toHaveBeenCalledWith("/admin/reservations"),
    );
    expect(login).toHaveBeenCalledWith({
      email: "admin@exemple.be",
      password: "demo1234",
    });
    expect(readFlash()).toMatch(/Bienvenue/); // shown on the next page
  });

  it("shows the error and stays on the page when the password is wrong", async () => {
    login.mockRejectedValue(
      new ApiError(401, "Adresse e-mail ou mot de passe incorrect"),
    );
    render(<LoginPage />, { wrapper: MemoryRouter });
    type("Adresse e-mail", "admin@exemple.be");
    type("Mot de passe", "wrong");
    fireEvent.click(screen.getByRole("button", { name: "Se connecter" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Adresse e-mail ou mot de passe incorrect",
    );
    expect(goTo).not.toHaveBeenCalled();
  });

  it("fills in a demo account", () => {
    render(<LoginPage />, { wrapper: MemoryRouter });
    fireEvent.click(screen.getByRole("button", { name: /Remplir.*client/ }));
    expect(screen.getByLabelText("Adresse e-mail")).toHaveValue(
      "marie.dubois@exemple.be",
    );
    expect(screen.getByLabelText("Mot de passe")).toHaveValue("demo1234");
  });
});

describe("SignupPage", () => {
  it("creates the account and goes to the home page", async () => {
    register.mockResolvedValue({ id: "5", role: "CLIENT" });
    render(<SignupPage />, { wrapper: MemoryRouter });
    type("Prénom", "Léa");
    type("Nom", "Martin");
    type("Adresse e-mail", "lea.martin@exemple.be");
    type("Mot de passe", "motdepasse");
    type("Confirmer le mot de passe", "motdepasse");
    fireEvent.click(screen.getByRole("button", { name: "Créer mon compte" }));
    await waitFor(() => expect(goTo).toHaveBeenCalledWith("/"));
    expect(register).toHaveBeenCalledWith({
      firstName: "Léa",
      lastName: "Martin",
      email: "lea.martin@exemple.be",
      password: "motdepasse",
      passwordConfirm: "motdepasse",
    });
    expect(readFlash()).toMatch(/Compte créé/); // shown on the next page
  });

  it("shows the API's errors next to the fields", async () => {
    register.mockRejectedValue(
      new ApiError(400, "Données invalides", {
        email: "Adresse e-mail invalide",
      }),
    );
    render(<SignupPage />, { wrapper: MemoryRouter });
    fireEvent.click(screen.getByRole("button", { name: "Créer mon compte" }));
    expect(
      await screen.findByText("Adresse e-mail invalide"),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Adresse e-mail")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
