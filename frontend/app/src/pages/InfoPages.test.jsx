import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ContactPage from "./ContactPage.jsx";
import HoursPage from "./HoursPage.jsx";
import LegalPage from "./LegalPage.jsx";

describe("HoursPage", () => {
  it("shows the opening hours", () => {
    render(<HoursPage />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Horaires" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Du lundi au vendredi de 8h à 19h/),
    ).toBeInTheDocument();
  });

  it("sets the browser tab title", () => {
    render(<HoursPage />);
    expect(document.title).toBe("Horaires · L’Échappée");
  });
});

describe("ContactPage", () => {
  it("shows the postal address", () => {
    render(<ContactPage />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Contact" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Chaussée d’Alsemberg 104/)).toBeInTheDocument();
  });
});

describe("LegalPage", () => {
  it("shows the four sections of the legal notice", () => {
    render(<LegalPage />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Mentions légales" }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(4);
  });
});
