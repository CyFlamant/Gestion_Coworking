import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { OPENING_HOURS } from "../lib/config.js";
import { t } from "../lib/i18n/index.js";
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

  // The hours are written as a sentence in fr.js and as rules in config.js (used for bookings):
  // this test fails if one is changed without the other.
  it("states the same opening hours as the booking rules", () => {
    const [sunday, monday, , , , friday, saturday] = OPENING_HOURS; // indexed by Date.getDay(): 0 = Sunday
    const weekdays = OPENING_HOURS.slice(1, 6);
    expect(weekdays.every((day) => day.open === monday.open && day.close === monday.close)).toBe(true);
    expect(friday).toBe(monday);
    expect(sunday).toBeNull(); // closed: the sentence doesn't mention Sunday

    const sentence = t("info.hours");
    expect(sentence).toContain(`Du lundi au vendredi de ${monday.open}h à ${monday.close}h`);
    expect(sentence).toContain(`le samedi de ${saturday.open}h à ${saturday.close}h`);
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
