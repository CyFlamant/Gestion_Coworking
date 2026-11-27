import { formatHour, formatTime, parseLocal, startOfDay } from "../lib/dates.js";
import { t } from "../lib/i18n/index.js";
import { openingHours } from "../lib/pricing.js";
import ShapeIcon from "./ShapeIcon.jsx";

const ROW_MINUTES = 30;

// Day view for the admin: one column per space, one row per half hour from opening to closing time.
// onSlot(space, hour) when a free hour is clicked; onBooking(booking) when a booking is clicked.
export default function DayTimeline({ date, spaces, bookings, onSlot, onBooking }) {
  const hoursOfDay = openingHours(date);
  if (!hoursOfDay) return <p className="empty">{t("slots.closed")}</p>;

  const { open, close } = hoursOfDay;
  const rows = ((close - open) * 60) / ROW_MINUTES;
  const dayStart = startOfDay(date);
  const minutesOf = (d) => Math.round((d - dayStart) / 60000);
  const top = (minutes) => `calc(${(minutes - open * 60) / ROW_MINUTES} * var(--timeline-row-h))`;
  const hours = Array.from({ length: close - open }, (_, i) => open + i);

  return (
    <div className="timeline">
      <div
        className="timeline__grid"
        style={{ gridTemplateColumns: `52px repeat(${spaces.length}, minmax(var(--timeline-col-min), 1fr))` }}
      >
        <div className="timeline__corner" />
        {spaces.map((space) => (
          <div key={space.id} className="timeline__colhead">
            <ShapeIcon type={space.type} />
            {space.name}
          </div>
        ))}
        <div className="timeline__timecol" style={{ "--rows": rows }}>
          <div className="timeline__times" aria-hidden="true">
            {hours.slice(1).map((hour) => (
              <span key={hour} className="timeline__time" style={{ top: top(hour * 60) }}>
                {formatHour(hour)}
              </span>
            ))}
          </div>
        </div>
        {spaces.map((space) => (
          <div key={space.id} className="timeline__col" style={{ "--rows": rows }}>
            {hours.map((hour) => (
              <button
                key={hour}
                type="button"
                className="timeline__slot"
                style={{ top: top(hour * 60) }}
                aria-label={t("adminBookings.slotLabel", { space: space.name, hour: formatHour(hour) })}
                onClick={() => onSlot(space, hour)}
              />
            ))}
            {bookings
              .filter((booking) => booking.spaceId === space.id)
              .map((booking) => {
                const start = parseLocal(booking.startDateTime);
                const end = parseLocal(booking.endDateTime);
                // A booking over several days (month) is clipped to the opening hours of this day.
                const from = Math.max(minutesOf(start), open * 60);
                const to = Math.min(minutesOf(end), close * 60);
                if (to <= from) return null;
                const multiDay = minutesOf(start) < 0 || minutesOf(end) > 24 * 60;
                return (
                  <button
                    key={booking.id}
                    type="button"
                    className={`timeline__booking timeline__booking--${(booking.spaceType ?? space.type).toLowerCase()}`}
                    style={{ top: top(from), height: `calc(${(to - from) / ROW_MINUTES} * var(--timeline-row-h) - 2px)` }}
                    onClick={() => onBooking(booking)}
                  >
                    <strong>{booking.userName}</strong>
                    <span>{multiDay ? t(`formulas.${booking.formula}`) : `${formatTime(start)} – ${formatTime(end)}`}</span>
                  </button>
                );
              })}
          </div>
        ))}
      </div>
    </div>
  );
}
