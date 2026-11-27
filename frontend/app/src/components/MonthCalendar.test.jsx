import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import MonthCalendar from "./MonthCalendar.jsx";

const MONDAY_16 = new Date(2026, 10, 16); // months start at 0 in JavaScript: 10 = November

describe("MonthCalendar", () => {
  it("shows the month of the selected day, with weeks starting on Monday", () => {
    render(<MonthCalendar selected={MONDAY_16} onSelect={() => {}} />);
    expect(screen.getByText("Novembre 2026")).toBeInTheDocument();
    // 1 November 2026 is a Sunday, so the first row starts on Monday 26 October.
    expect(screen.getByRole("button", { name: "Lundi 26 octobre 2026" })).toBeInTheDocument();
  });

  it("highlights the selected day", () => {
    render(<MonthCalendar selected={MONDAY_16} onSelect={() => {}} />);
    expect(screen.getByRole("button", { name: "Lundi 16 novembre 2026" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Mardi 17 novembre 2026" })).toHaveAttribute("aria-pressed", "false");
  });

  it("gives the clicked day to its parent", () => {
    const onSelect = vi.fn();
    render(<MonthCalendar selected={MONDAY_16} onSelect={onSelect} />);
    fireEvent.click(screen.getByRole("button", { name: "Mardi 17 novembre 2026" }));
    expect(onSelect).toHaveBeenCalledWith(new Date(2026, 10, 17));
  });

  it("moves to the next and previous months", () => {
    render(<MonthCalendar selected={MONDAY_16} onSelect={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: "Mois suivant" }));
    expect(screen.getByText("Décembre 2026")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Mois précédent" }));
    fireEvent.click(screen.getByRole("button", { name: "Mois précédent" }));
    expect(screen.getByText("Octobre 2026")).toBeInTheDocument();
  });

  it("puts a dot on the days that have bookings", () => {
    render(<MonthCalendar selected={MONDAY_16} marked={new Set(["2026-11-17"])} onSelect={() => {}} />);
    // The dot is drawn in CSS; the class is what the test can see.
    expect(screen.getByRole("button", { name: "Mardi 17 novembre 2026" })).toHaveClass("calendar__day--marked");
    expect(screen.getByRole("button", { name: "Lundi 16 novembre 2026" })).not.toHaveClass("calendar__day--marked");
  });
});
