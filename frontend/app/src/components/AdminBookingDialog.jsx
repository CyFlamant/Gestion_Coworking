import { useState } from "react";
import { useSubmit } from "../hooks/useSubmit.js";
import { createBooking, updateBooking } from "../lib/api.js";
import { applyBookingChange, resolveSpaceId } from "../lib/booking.js";
import { overlaps, parseLocal, startOfDay, toLocalIso } from "../lib/dates.js";
import { errorMessage } from "../lib/forms.js";
import { t } from "../lib/i18n/index.js";
import { bookingRange } from "../lib/pricing.js";
import BookingForm from "./BookingForm.jsx";
import Dialog from "./Dialog.jsx";
import ErrorAlert from "./ErrorAlert.jsx";

// The admin booking form in a dialog: creates a booking for a client, or updates the one given.
// initial: { type, spaceId, userId, formula, date, startHour, hours, halfDay }.
// data: { spaces, bookings, clients }; free spaces are computed from the loaded bookings, leaving out the one being edited.
export default function AdminBookingDialog({ booking, initial, data, onSaved, onDelete, onClose }) {
  const { type, spaceId: initialSpaceId, userId, ...slot } = initial;
  const [form, setForm] = useState({ type, spaceId: initialSpaceId, spaceChosen: true, userId, slot });

  const range = bookingRange(form.slot);
  const busy = new Set(
    data.bookings
      .filter((b) => b.id !== booking?.id && overlaps(range.start, range.end, parseLocal(b.startDateTime), parseLocal(b.endDateTime)))
      .map((b) => b.spaceId),
  );
  const free = new Set(data.spaces.filter((space) => !busy.has(space.id)).map((space) => space.id));
  const spaceId = resolveSpaceId({ spaces: data.spaces, free, ...form });

  const request = {
    spaceId,
    userId: form.userId || null,
    startDateTime: toLocalIso(range.start),
    endDateTime: toLocalIso(range.end),
  };
  const { submit, errors, submitting: saving } = useSubmit(
    () => (booking ? updateBooking(booking.id, request) : createBooking(request)),
    () => onSaved(t(booking ? "adminBookings.updated" : "adminBookings.created"), startOfDay(range.start)),
  );

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
      <form
        id="admin-booking-form"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <ErrorAlert>{errorMessage(errors)}</ErrorAlert>
        <BookingForm
          idPrefix="admin-booking"
          spaces={data.spaces}
          clients={data.clients}
          booking={form}
          spaceId={spaceId}
          free={free}
          onChange={(changes) => setForm((current) => applyBookingChange(current, changes))}
        />
      </form>
    </Dialog>
  );
}
