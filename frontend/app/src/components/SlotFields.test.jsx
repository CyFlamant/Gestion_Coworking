import { fireEvent, render, screen, within } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import SlotFields from "./SlotFields.jsx";

// Tuesday 17 November 2026 (months start at 0 in JavaScript).
const TUESDAY_DAY = { formula: "DAY", date: new Date(2026, 10, 17), startHour: 9, hours: 2, halfDay: "MORNING" };

// SlotFields is controlled: its parent keeps the values. This stand-in parent keeps them in a state.
function Harness({ initial = TUESDAY_DAY, onChange = () => {} }) {
  const [values, setValues] = useState(initial);
  return (
    <SlotFields
      idPrefix="test"
      values={values}
      onChange={(next) => {
        setValues(next);
        onChange(next);
      }}
    />
  );
}

describe("SlotFields", () => {
  it("describes the chosen slot", () => {
    render(<Harness />);
    expect(screen.getByText("Mardi 17 novembre 2026, de 8:00 à 19:00")).toBeInTheDocument();
  });

  it("asks for the start hour and duration with the hourly formula", () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole("radio", { name: "À l’heure" }));
    expect(screen.getByRole("combobox", { name: "Heure de début" })).toHaveValue("9");
    expect(screen.getByRole("combobox", { name: "Durée" })).toHaveValue("2");
    expect(screen.getByText(/de 9:00 à 11:00/)).toBeInTheDocument();
  });

  it("offers the morning and the afternoon with the half-day formula", () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole("radio", { name: "Demi-journée" }));
    const halfDay = screen.getByRole("combobox", { name: "Demi-journée" });
    expect(within(halfDay).getAllByRole("option")).toHaveLength(2);
  });

  it("disables the day formula on a Saturday", () => {
    render(<Harness />);
    fireEvent.change(screen.getByLabelText("Date"), { target: { value: "2026-11-21" } });
    expect(screen.getByRole("radio", { name: "Journée" })).toBeDisabled();
    expect(screen.getByRole("radio", { name: "À l’heure" })).toBeChecked();
  });

  it("refuses a Sunday and keeps the previous date", () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    fireEvent.change(screen.getByLabelText("Date"), { target: { value: "2026-11-22" } });
    expect(screen.getByText("L’espace de coworking est fermé ce jour-là.")).toBeInTheDocument();
    expect(screen.getByLabelText("Date")).toHaveValue("2026-11-17");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("gives the new values to its parent", () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    fireEvent.click(screen.getByRole("radio", { name: "Mois" }));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ formula: "MONTH" }));
  });
});
