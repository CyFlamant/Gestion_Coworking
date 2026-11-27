import { useEffect, useState } from "react";
import AdminBookingDialog from "../components/AdminBookingDialog.jsx";
import AdminBookingList from "../components/AdminBookingList.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import DayTimeline from "../components/DayTimeline.jsx";
import ErrorAlert from "../components/ErrorAlert.jsx";
import MonthCalendar from "../components/MonthCalendar.jsx";
import PageTitle from "../components/PageTitle.jsx";
import Segmented from "../components/Segmented.jsx";
import StatusMessage from "../components/StatusMessage.jsx";
import { deleteBooking, getBookings, getClients, getSpaces } from "../lib/api.js";
import { SPACE_TYPES } from "../lib/config.js";
import { addDays, formatDate, overlaps, parseLocal, startOfDay, toDateInput, today } from "../lib/dates.js";
import { t } from "../lib/i18n/index.js";
import { formValuesFromRange } from "../lib/pricing.js";
import { describeRange } from "../lib/slots.js";
import { byTypeThenName } from "../lib/spaces.js";

const NO_DATA = { spaces: [], bookings: [], clients: [] };

// Réservations (admin): type + space filters, month calendar and day timeline, plus a list view.
// Create, update and delete bookings for any client.
export default function AdminBookingsPage() {
  const [data, setData] = useState(null); // { spaces, bookings, clients }
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null); // confirmation of the last change
  const [type, setType] = useState("ALL");
  const [spaceId, setSpaceId] = useState("ALL");
  const [date, setDate] = useState(today);
  const [view, setView] = useState("calendar");
  const [showPast, setShowPast] = useState(false);
  const [editing, setEditing] = useState(null); // { booking, initial } while the booking dialog is open
  const [toDelete, setToDelete] = useState(null);
  const [version, setVersion] = useState(0); // bumped to load the data again
  const [now] = useState(() => new Date());

  useEffect(() => {
    Promise.all([getSpaces(), getBookings(), getClients()])
      .then(([spaces, bookings, clients]) => setData({ spaces, bookings, clients }))
      .catch((err) => setError(t("common.loadError", { detail: err.detail })));
  }, [version]);

  // Until the data arrives, the page shows its head and filters with empty lists, like the other pages.
  const loaded = data ?? NO_DATA;
  const ofType = loaded.spaces.filter((space) => type === "ALL" || space.type === type).sort(byTypeThenName);
  const shownSpaces = ofType.filter((space) => spaceId === "ALL" || space.id === spaceId);
  const shownIds = new Set(shownSpaces.map((space) => space.id));
  const shownBookings = loaded.bookings.filter((booking) => shownIds.has(booking.spaceId));
  const ofDay = shownBookings.filter((b) =>
    overlaps(date, addDays(date, 1), parseLocal(b.startDateTime), parseLocal(b.endDateTime)),
  );

  // Days with at least one booking, for the dots in the calendar.
  const marked = new Set();
  for (const booking of shownBookings) {
    const last = startOfDay(parseLocal(booking.endDateTime));
    for (let day = startOfDay(parseLocal(booking.startDateTime)); day <= last; day = addDays(day, 1)) {
      marked.add(toDateInput(day));
    }
  }

  function openNew(preset) {
    setEditing({ booking: null, initial: { userId: "", ...preset } });
  }

  function openExisting(booking) {
    const start = parseLocal(booking.startDateTime);
    const end = parseLocal(booking.endDateTime);
    setEditing({
      booking,
      initial: { type: booking.spaceType, spaceId: booking.spaceId, userId: booking.userId, ...formValuesFromRange(start, end) },
    });
  }

  function saved(message, day) {
    setEditing(null);
    setNotice(message);
    setDate(day);
    setVersion((v) => v + 1);
  }

  async function confirmDelete() {
    const booking = toDelete;
    setToDelete(null);
    setError(null);
    try {
      await deleteBooking(booking.id);
      setNotice(t("adminBookings.deleted"));
      setVersion((v) => v + 1);
    } catch (err) {
      setNotice(null);
      setError(err.detail ?? String(err));
    }
  }

  const first = shownSpaces[0] ?? loaded.spaces[0];
  const newPreset = { type: first?.type, spaceId: first?.id, formula: "HOUR", date: date < today() ? today() : date, startHour: 9, hours: 1, halfDay: "MORNING" };

  return (
    <main className="inner page">
      <PageTitle title={t("pages.adminBookings")} />
      <div className="page-head">
        <div className="page-head__text">
          <h1>{t("pages.adminBookings")}</h1>
          <p className="lead">{t("adminBookings.lead")}</p>
        </div>
        <button type="button" className="btn btn--primary" disabled={!data} onClick={() => openNew(newPreset)}>
          {t("adminBookings.add")}
        </button>
      </div>
      <div className="toolbar">
        <div className="field">
          <label className="field__label" htmlFor="filter-type">
            {t("adminBookings.filterType")}
          </label>
          <select
            id="filter-type"
            className="select"
            value={type}
            onChange={(event) => {
              setType(event.target.value);
              setSpaceId("ALL");
            }}
          >
            <option value="ALL">{t("adminBookings.allTypes")}</option>
            {SPACE_TYPES.map((value) => (
              <option key={value} value={value}>
                {t(`types.${value}`)}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label className="field__label" htmlFor="filter-space">
            {t("adminBookings.filterSpace")}
          </label>
          <select
            id="filter-space"
            className="select"
            value={spaceId}
            onChange={(event) => setSpaceId(event.target.value === "ALL" ? "ALL" : Number(event.target.value))}
          >
            <option value="ALL">{t("adminBookings.allSpaces")}</option>
            {ofType.map((space) => (
              <option key={space.id} value={space.id}>
                {space.name}
              </option>
            ))}
          </select>
        </div>
        <Segmented
          name="view"
          value={view}
          options={[
            { value: "calendar", label: t("adminBookings.viewCalendar") },
            { value: "list", label: t("adminBookings.viewList") },
          ]}
          onChange={setView}
        />
      </div>
      <ErrorAlert>{error}</ErrorAlert>
      <StatusMessage>{notice}</StatusMessage>

      {data && view === "calendar" && (
        <div className="admin-grid">
          <div className="admin-grid__side">
            <MonthCalendar selected={date} marked={marked} onSelect={setDate} />
          </div>
          <div className="admin-grid__main" aria-live="polite">
            <div className="day-head">
              <div>
                <h2>{formatDate(date)}</h2>
                <p className="muted">{t("adminBookings.dayCount", { n: ofDay.length })}</p>
              </div>
            </div>
            {shownSpaces.length ? (
              <DayTimeline
                date={date}
                spaces={shownSpaces}
                bookings={ofDay}
                onSlot={(space, hour) =>
                  openNew({ type: space.type, spaceId: space.id, formula: "HOUR", date, startHour: hour, hours: 1, halfDay: "MORNING" })
                }
                onBooking={openExisting}
              />
            ) : (
              <p className="empty">{t("adminBookings.empty")}</p>
            )}
          </div>
        </div>
      )}
      {data && view === "list" && (
        <AdminBookingList
          bookings={shownBookings.filter((b) => showPast || parseLocal(b.endDateTime) >= now)}
          showPast={showPast}
          onShowPast={setShowPast}
          onEdit={openExisting}
          onDelete={setToDelete}
        />
      )}

      {editing && (
        <AdminBookingDialog
          booking={editing.booking}
          initial={editing.initial}
          data={data}
          onSaved={saved}
          onDelete={(booking) => {
            setEditing(null);
            setToDelete(booking);
          }}
          onClose={() => setEditing(null)}
        />
      )}
      {toDelete && (
        <ConfirmDialog
          title={t("adminBookings.deleteTitle")}
          message={t("adminBookings.deleteMessage", {
            client: toDelete.userName,
            space: toDelete.spaceName,
            slot: describeRange({ start: parseLocal(toDelete.startDateTime), end: parseLocal(toDelete.endDateTime) }),
          })}
          confirmLabel={t("common.delete")}
          danger
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </main>
  );
}

