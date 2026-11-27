import { useEffect, useState } from "react";
import BookingForm from "../components/BookingForm.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import DayTimeline from "../components/DayTimeline.jsx";
import Dialog from "../components/Dialog.jsx";
import ErrorAlert from "../components/ErrorAlert.jsx";
import MonthCalendar from "../components/MonthCalendar.jsx";
import PageTitle from "../components/PageTitle.jsx";
import Segmented from "../components/Segmented.jsx";
import ShapeIcon from "../components/ShapeIcon.jsx";
import { createBooking, deleteBooking, getBookings, getClients, getSpaces, updateBooking } from "../lib/api.js";
import { resolveSpaceId } from "../lib/booking.js";
import { SPACE_TYPES } from "../lib/config.js";
import {
  addDays,
  formatDate,
  formatMoney,
  formatShortDate,
  formatTime,
  overlaps,
  parseLocal,
  startOfDay,
  toDateInput,
  toLocalIso,
  today,
} from "../lib/dates.js";
import { t } from "../lib/i18n/index.js";
import { bookingRange, formValuesFromRange } from "../lib/pricing.js";
import { describeRange } from "../lib/slots.js";
import { byTypeThenName } from "../lib/spaces.js";

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

  if (!data) {
    return (
      <main className="inner page">
        <PageTitle title={t("pages.adminBookings")} />
        <h1>{t("pages.adminBookings")}</h1>
        <ErrorAlert>{error}</ErrorAlert>
      </main>
    );
  }

  const ofType = data.spaces.filter((space) => type === "ALL" || space.type === type).sort(byTypeThenName);
  const shownSpaces = ofType.filter((space) => spaceId === "ALL" || space.id === spaceId);
  const shownIds = new Set(shownSpaces.map((space) => space.id));
  const shownBookings = data.bookings.filter((booking) => shownIds.has(booking.spaceId));
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

  const first = shownSpaces[0] ?? data.spaces[0];
  const newPreset = { type: first?.type, spaceId: first?.id, formula: "HOUR", date: date < today() ? today() : date, startHour: 9, hours: 1, halfDay: "MORNING" };

  return (
    <main className="inner page">
      <PageTitle title={t("pages.adminBookings")} />
      <div className="page-head">
        <div className="page-head__text">
          <h1>{t("pages.adminBookings")}</h1>
          <p className="lead">{t("adminBookings.lead")}</p>
        </div>
        <button type="button" className="btn btn--primary" onClick={() => openNew(newPreset)}>
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
      {notice && (
        <p className="alert alert--info" role="status">
          {notice}
        </p>
      )}

      {view === "calendar" ? (
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
      ) : (
        <BookingList
          bookings={shownBookings.filter((b) => showPast || parseLocal(b.endDateTime) >= now)}
          showPast={showPast}
          onShowPast={setShowPast}
          onEdit={openExisting}
          onDelete={setToDelete}
        />
      )}

      {editing && (
        <BookingDialog
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

// The bookings as a table, with a checkbox to include the past ones.
function BookingList({ bookings, showPast, onShowPast, onEdit, onDelete }) {
  return (
    <div className="form">
      <label className="field__hint">
        <input type="checkbox" checked={showPast} onChange={(event) => onShowPast(event.target.checked)} />{" "}
        {t("adminBookings.showPast")}
      </label>
      {bookings.length === 0 ? (
        <p className="empty">{t("adminBookings.empty")}</p>
      ) : (
        <div className="table-wrap">
          <table className="table table--cards">
            <thead>
              <tr>
                {["colDate", "colTime", "colSpace", "colClient", "colFormula"].map((key) => (
                  <th key={key} scope="col">
                    {t(`adminBookings.${key}`)}
                  </th>
                ))}
                <th scope="col" className="num">
                  {t("adminBookings.colPrice")}
                </th>
                <th scope="col">
                  <span className="visually-hidden">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => {
                const start = parseLocal(booking.startDateTime);
                const end = parseLocal(booking.endDateTime);
                const multiDay = startOfDay(start).getTime() !== startOfDay(end).getTime();
                return (
                  <tr key={booking.id}>
                    <td data-label={t("adminBookings.colDate")}>
                      {multiDay ? `${formatShortDate(start)} → ${formatShortDate(end)}` : formatShortDate(start)}
                    </td>
                    <td data-label={t("adminBookings.colTime")}>{`${formatTime(start)} – ${formatTime(end)}`}</td>
                    <td data-label={t("adminBookings.colSpace")}>
                      <span className="table__name">
                        <ShapeIcon type={booking.spaceType} />
                        {booking.spaceName}
                      </span>
                    </td>
                    <td data-label={t("adminBookings.colClient")}>{booking.userName}</td>
                    <td data-label={t("adminBookings.colFormula")}>{t(`formulas.${booking.formula}`)}</td>
                    <td className="num" data-label={t("adminBookings.colPrice")}>
                      {booking.price != null ? formatMoney(booking.price) : "—"}
                    </td>
                    <td>
                      <div className="table__actions">
                        <button type="button" className="btn btn--small" onClick={() => onEdit(booking)}>
                          {t("common.edit")}
                        </button>
                        <button type="button" className="btn btn--small btn--danger" onClick={() => onDelete(booking)}>
                          {t("common.delete")}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// The booking form in a dialog: creates a booking for a client, or updates the one given.
// Free spaces are computed from the loaded bookings, leaving out the booking being edited.
function BookingDialog({ booking, initial, data, onSaved, onDelete, onClose }) {
  const { type, spaceId: initialSpaceId, userId, ...slot } = initial;
  const [form, setForm] = useState({ type, spaceId: initialSpaceId, spaceChosen: true, userId, slot });
  const [submitError, setSubmitError] = useState(null);
  const [saving, setSaving] = useState(false);

  const range = bookingRange(form.slot);
  const busy = new Set(
    data.bookings
      .filter((b) => b.id !== booking?.id && overlaps(range.start, range.end, parseLocal(b.startDateTime), parseLocal(b.endDateTime)))
      .map((b) => b.spaceId),
  );
  const free = new Set(data.spaces.filter((space) => !busy.has(space.id)).map((space) => space.id));
  const spaceId = resolveSpaceId({ spaces: data.spaces, free, ...form });

  function change(changes) {
    setForm((current) => ({
      ...current,
      ...changes,
      spaceChosen: "spaceId" in changes ? true : "type" in changes ? false : current.spaceChosen,
    }));
  }

  async function submit(event) {
    event.preventDefault();
    setSubmitError(null);
    setSaving(true);
    const request = {
      spaceId,
      userId: form.userId || null,
      startDateTime: toLocalIso(range.start),
      endDateTime: toLocalIso(range.end),
    };
    try {
      if (booking) await updateBooking(booking.id, request);
      else await createBooking(request);
      onSaved(t(booking ? "adminBookings.updated" : "adminBookings.created"), startOfDay(range.start));
    } catch (err) {
      setSubmitError(err.detail ?? String(err));
      setSaving(false);
    }
  }

  return (
    <Dialog
      title={t(booking ? "adminBookings.editTitle" : "adminBookings.newTitle")}
      onClose={onClose}
      actions={
        <>
          {booking && (
            <button type="button" className="btn btn--danger push-left" onClick={() => onDelete(booking)}>
              {t("common.delete")}
            </button>
          )}
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            {t("common.cancel")}
          </button>
          <button type="submit" form="admin-booking-form" className="btn btn--primary" disabled={saving || !spaceId}>
            {t("common.save")}
          </button>
        </>
      }
    >
      <form id="admin-booking-form" noValidate onSubmit={submit}>
        <ErrorAlert>{submitError}</ErrorAlert>
        <BookingForm
          idPrefix="admin-booking"
          spaces={data.spaces}
          clients={data.clients}
          booking={form}
          spaceId={spaceId}
          free={free}
          onChange={change}
        />
      </form>
    </Dialog>
  );
}
