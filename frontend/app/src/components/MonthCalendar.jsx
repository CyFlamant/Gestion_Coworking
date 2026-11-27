import { useState } from "react";
import {
  addDays,
  addMonths,
  formatDate,
  formatMonth,
  formatWeekdayShort,
  sameDay,
  startOfMonth,
  toDateInput,
  today,
} from "../lib/dates.js";
import { t } from "../lib/i18n/index.js";

const MONDAY = new Date(2024, 0, 1);
const WEEKDAYS = Array.from({ length: 7 }, (_, i) => formatWeekdayShort(addDays(MONDAY, i)));

// Month calendar, weeks starting on Monday. Days in `marked` (yyyy-mm-dd) get a dot.
// The parent keeps the selected day; the calendar only remembers which month it shows.
export default function MonthCalendar({ selected, marked = new Set(), onSelect }) {
  const [view, setView] = useState(() => startOfMonth(selected));
  const [now] = useState(today);

  const firstWeekday = (view.getDay() + 6) % 7; // Monday = 0
  const gridStart = addDays(view, -firstWeekday);
  const days = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));

  function choose(day) {
    if (day.getMonth() !== view.getMonth()) setView(startOfMonth(day));
    onSelect(day);
  }

  return (
    <div className="calendar">
      <div className="calendar__head">
        <button type="button" className="icon-btn" aria-label={t("calendar.previous")} onClick={() => setView(addMonths(view, -1))}>
          ‹
        </button>
        <span className="calendar__title" aria-live="polite">
          {formatMonth(view)}
        </span>
        <button type="button" className="icon-btn" aria-label={t("calendar.next")} onClick={() => setView(addMonths(view, 1))}>
          ›
        </button>
      </div>
      <div className="calendar__grid">
        {WEEKDAYS.map((day) => (
          <span key={day} className="calendar__weekday" aria-hidden="true">
            {day}
          </span>
        ))}
        {days.map((day) => {
          const classes = ["calendar__day"];
          if (day.getMonth() !== view.getMonth()) classes.push("calendar__day--outside");
          if (sameDay(day, now)) classes.push("calendar__day--today");
          if (marked.has(toDateInput(day))) classes.push("calendar__day--marked");
          return (
            <button
              key={toDateInput(day)}
              type="button"
              className={classes.join(" ")}
              aria-pressed={sameDay(day, selected)}
              aria-label={formatDate(day)}
              onClick={() => choose(day)}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
