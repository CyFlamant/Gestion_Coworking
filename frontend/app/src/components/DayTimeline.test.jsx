import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import DayTimeline from "./DayTimeline.jsx";

const OPENSPACE = { id: 1, name: "Openspace 1", type: "OPENSPACE" };
const OFFICE = { id: 3, name: "Bureau 1", type: "OFFICE" };
// Months start at 0 in JavaScript: 10 = November.
const MONDAY = new Date(2026, 10, 16);
const SATURDAY = new Date(2026, 10, 21);
const SUNDAY = new Date(2026, 10, 22);
const MARIE_MORNING = {
  id: 1, spaceId: 1, spaceType: "OPENSPACE", userName: "Marie Dubois",
  startDateTime: "2026-11-16T09:00:00", endDateTime: "2026-11-16T12:00:00", formula: "HOUR",
};
const SOFIA_MONTH = {
  id: 2, spaceId: 3, spaceType: "OFFICE", userName: "Sofia Benali",
  startDateTime: "2026-11-02T08:00:00", endDateTime: "2026-12-01T19:00:00", formula: "MONTH",
};

function renderDay(date, bookings = [], handlers = {}) {
  return render(
    <DayTimeline
      date={date}
      spaces={[OPENSPACE, OFFICE]}
      bookings={bookings}
      onSlot={handlers.onSlot ?? (() => {})}
      onBooking={handlers.onBooking ?? (() => {})}
    />,
  );
}

describe("DayTimeline", () => {
  it("shows one column per space, with its bookings and their times", () => {
    renderDay(MONDAY, [MARIE_MORNING]);
    expect(screen.getByText("Openspace 1")).toBeInTheDocument();
    expect(screen.getByText("Bureau 1")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Marie Dubois/ })).toHaveTextContent("9:00 – 12:00");
  });

  it("shows the formula instead of times for a booking over several days", () => {
    renderDay(MONDAY, [SOFIA_MONTH]);
    expect(screen.getByRole("button", { name: /Sofia Benali/ })).toHaveTextContent("Mois");
  });

  it("gives the clicked booking to its parent", () => {
    const onBooking = vi.fn();
    renderDay(MONDAY, [MARIE_MORNING], { onBooking });
    fireEvent.click(screen.getByRole("button", { name: /Marie Dubois/ }));
    expect(onBooking).toHaveBeenCalledWith(MARIE_MORNING);
  });

  it("gives the space and hour of a clicked free slot to its parent", () => {
    const onSlot = vi.fn();
    renderDay(MONDAY, [], { onSlot });
    fireEvent.click(screen.getByRole("button", { name: "Ajouter une réservation pour Bureau 1 à 14:00" }));
    expect(onSlot).toHaveBeenCalledWith(OFFICE, 14);
  });

  it("follows the opening hours of the day", () => {
    renderDay(SATURDAY);
    expect(screen.getByRole("button", { name: "Ajouter une réservation pour Bureau 1 à 9:00" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ajouter une réservation pour Bureau 1 à 12:00" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Ajouter une réservation pour Bureau 1 à 13:00" })).not.toBeInTheDocument();
  });

  it("says the coworking space is closed on Sunday", () => {
    renderDay(SUNDAY);
    expect(screen.getByText("L’espace de coworking est fermé ce jour-là.")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
