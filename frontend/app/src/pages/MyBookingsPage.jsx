import { useEffect, useState } from "react";
import { Link } from "react-router";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import ErrorAlert from "../components/ErrorAlert.jsx";
import PageTitle from "../components/PageTitle.jsx";
import TypeChip from "../components/TypeChip.jsx";
import { deleteBooking, getMyBookings } from "../lib/api.js";
import { formatMoney, formatMonthShort, parseLocal } from "../lib/dates.js";
import { t } from "../lib/i18n/index.js";
import { describeRange } from "../lib/slots.js";

// Mes réservations (client): upcoming bookings, each one can be cancelled.
export default function MyBookingsPage() {
  const [bookings, setBookings] = useState(null);
  const [error, setError] = useState(null);
  const [toCancel, setToCancel] = useState(null); // the booking whose cancellation is being confirmed
  const [version, setVersion] = useState(0); // bumped to load the list again
  const [now] = useState(() => new Date()); // read once: drawing the page must give the same result each time

  useEffect(() => {
    getMyBookings()
      .then(setBookings)
      .catch((err) => setError(t("common.loadError", { detail: err.detail })));
  }, [version]);

  async function confirmCancel() {
    const booking = toCancel;
    setToCancel(null);
    try {
      await deleteBooking(booking.id);
      setVersion((v) => v + 1);
    } catch (err) {
      setError(err.detail ?? String(err));
    }
  }

  // Bookings that haven't ended yet; one that has started is shown but can no longer be cancelled.
  const upcoming = (bookings ?? []).filter(
    (b) => parseLocal(b.endDateTime) > now,
  );

  return (
    <main className="inner page">
      <PageTitle title={t("pages.myBookings")} />
      <div className="page-head">
        <div className="page-head__text">
          <h1>{t("pages.myBookings")}</h1>
        </div>
        <Link className="btn btn--primary" to="/reserver">
          {t("myBookings.bookNow")}
        </Link>
      </div>
      <ErrorAlert>{error}</ErrorAlert>
      {bookings && (
        <div aria-live="polite">
          {upcoming.length === 0 ? (
            <div className="empty">
              <p>{t("myBookings.emptyUpcoming")}</p>
              <Link className="btn" to="/reserver">
                {t("myBookings.bookNow")}
              </Link>
            </div>
          ) : (
            <ul className="ticket-list">
              {upcoming.map((booking) => (
                <Ticket
                  key={booking.id}
                  booking={booking}
                  cancellable={parseLocal(booking.startDateTime) > now}
                  onCancel={() => setToCancel(booking)}
                />
              ))}
            </ul>
          )}
        </div>
      )}
      {toCancel && (
        <ConfirmDialog
          title={t("myBookings.cancelTitle")}
          message={t("myBookings.cancelMessage", {
            space: toCancel.spaceName,
            slot: describeRange({
              start: parseLocal(toCancel.startDateTime),
              end: parseLocal(toCancel.endDateTime),
            }),
          })}
          confirmLabel={t("myBookings.cancelConfirm")}
          cancelLabel={t("myBookings.keep")}
          danger
          onConfirm={confirmCancel}
          onCancel={() => setToCancel(null)}
        />
      )}
    </main>
  );
}

// One booking as a ticket: date block, space and slot, price, and "Annuler" if it hasn't started.
function Ticket({ booking, cancellable, onCancel }) {
  const start = parseLocal(booking.startDateTime);
  const end = parseLocal(booking.endDateTime);
  const type = booking.spaceType.toLowerCase();
  return (
    <li className="ticket">
      <div className={`ticket__date ticket__date--${type}`} aria-hidden="true">
        <span className="ticket__day">{start.getDate()}</span>
        <span className="ticket__month">{formatMonthShort(start)}</span>
      </div>
      <div className="ticket__body">
        <h2 className="space-card__name">{booking.spaceName}</h2>
        <p>{describeRange({ start, end })}</p>
        <div className="ticket__meta">
          <TypeChip type={booking.spaceType} />
          <span>{t(`formulas.${booking.formula}`)}</span>
        </div>
      </div>
      <div className="ticket__side">
        <span className="ticket__price">
          {booking.price != null ? formatMoney(booking.price) : "—"}
        </span>
        {cancellable && (
          <button
            type="button"
            className="btn btn--danger btn--small"
            onClick={onCancel}
          >
            {t("myBookings.cancel")}
          </button>
        )}
      </div>
    </li>
  );
}
