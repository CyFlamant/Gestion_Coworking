import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import BookingForm from "../components/BookingForm.jsx";
import ErrorAlert from "../components/ErrorAlert.jsx";
import PageTitle from "../components/PageTitle.jsx";
import RateList from "../components/RateList.jsx";
import TypeChip from "../components/TypeChip.jsx";
import { useFreeSpaces } from "../hooks/useFreeSpaces.js";
import { useSubmit } from "../hooks/useSubmit.js";
import { createBooking, getSpaces } from "../lib/api.js";
import { applyBookingChange, resolveSpaceId } from "../lib/booking.js";
import { SPACE_TYPES } from "../lib/config.js";
import { addDays, formatMoney, toLocalIso, today } from "../lib/dates.js";
import { clearDraft, readDraft } from "../lib/draft.js";
import { setFlash } from "../lib/flash.js";
import { errorMessage } from "../lib/forms.js";
import { t } from "../lib/i18n/index.js";
import { bookingRange, computePrice, fitToOpeningHours } from "../lib/pricing.js";
import { describeRange } from "../lib/slots.js";

const DEFAULT_SLOT = {
  formula: "HOUR",
  startHour: 9,
  hours: 2,
  halfDay: "MORNING",
};

// Starts from the draft left by "Espaces disponibles", or two hours tomorrow.
function initialBooking() {
  const { spaceId = null, type = SPACE_TYPES[0], ...slot } = readDraft() ?? {};
  return {
    type,
    spaceId,
    spaceChosen: spaceId != null, // a space picked on the spaces page is kept even if it turns out booked
    slot: fitToOpeningHours({
      ...DEFAULT_SLOT,
      date: addDays(today(), 1),
      ...slot,
    }),
  };
}

// Réserver (client): booking form on the left, rates and price summary on the right.
export default function BookPage() {
  const navigate = useNavigate();
  const [booking, setBooking] = useState(initialBooking);
  const [spaces, setSpaces] = useState(null);
  const [loadError, setLoadError] = useState(null);

  const range = bookingRange(booking.slot);
  const start = toLocalIso(range.start);
  const end = toLocalIso(range.end);
  // When the search fails, `free` stays null (unknown): the API decides when the booking is sent.
  const { free } = useFreeSpaces(start, end);

  useEffect(() => {
    clearDraft(); // read once in initialBooking; forgotten now so a later visit starts fresh
    getSpaces()
      .then(setSpaces)
      .catch((err) =>
        setLoadError(t("common.loadError", { detail: err.detail })),
      );
  }, []);

  const spaceId = spaces ? resolveSpaceId({ spaces, free, ...booking }) : null;
  const space = spaces?.find((s) => s.id === spaceId) ?? null;
  const price = space ? computePrice(space, range.start, range.end) : null;
  const busy = Boolean(space && free && !free.has(space.id));

  function change(changes) {
    setBooking((current) => applyBookingChange(current, changes));
  }

  const { submit, errors, submitting } = useSubmit(
    () => createBooking({ spaceId, startDateTime: start, endDateTime: end }),
    () => {
      setFlash(t("booking.created"));
      navigate("/mes-reservations");
    },
  );

  return (
    <main className="inner page">
      <PageTitle title={t("pages.book")} />
      <div className="page-head">
        <div className="page-head__text">
          <h1>{t("pages.book")}</h1>
        </div>
      </div>
      <ErrorAlert>{loadError}</ErrorAlert>
      {spaces && (
        <div className="split">
          <form
            id="booking-form"
            className="card"
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
              submit();
            }}
          >
            <ErrorAlert>{errorMessage(errors)}</ErrorAlert>
            <BookingForm
              idPrefix="booking"
              spaces={spaces}
              booking={booking}
              spaceId={spaceId}
              free={free}
              minDate={today()}
              onChange={change}
            />
          </form>
          <aside className="card summary" aria-live="polite">
            <h2>{t("booking.summary")}</h2>
            {space && (
              <div className="space-card__head">
                <h3>{space.name}</h3>
                <TypeChip type={space.type} />
              </div>
            )}
            <p className="muted">{describeRange(range)}</p>
            {space && <RateList space={space} formula={price.formula} />}
            {price && (
              <div className="summary__line">
                <span>
                  {t(`formulaUnits.${price.formula}`, { n: price.quantity })}
                </span>
                <span>× {formatMoney(price.unitPrice)}</span>
              </div>
            )}
            <div className="summary__total">
              <span className="field__label">{t("booking.total")}</span>
              <span className="summary__amount">
                {price ? formatMoney(price.total) : "—"}
              </span>
            </div>
            <button
              type="submit"
              form="booking-form"
              className="btn btn--primary"
              disabled={!space || busy || submitting}
            >
              {t("booking.confirm")}
            </button>
            <p className="field__hint">{t("booking.payOnSite")}</p>
          </aside>
        </div>
      )}
    </main>
  );
}
