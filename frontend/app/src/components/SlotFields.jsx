import { useState } from "react";
import { formatHour, fromDateInput, toDateInput } from "../lib/dates.js";
import { t } from "../lib/i18n/index.js";
import {
  bookingRange,
  fitToOpeningHours,
  FORMULAS,
  formulasOn,
  halfDaysOn,
  openingHours,
} from "../lib/pricing.js";
import { describeRange } from "../lib/slots.js";
import Segmented from "./Segmented.jsx";

// Formula + date + time fields, following the opening hours of the chosen day.
// Controlled: the parent keeps the values ({ formula, date, startHour, hours, halfDay }) and gets the new ones in onChange.
export default function SlotFields({ idPrefix, values, minDate, onChange }) {
  const [dateError, setDateError] = useState(null);
  const { open, close } = openingHours(values.date);
  const offered = formulasOn(values.date);

  const update = (changes) =>
    onChange(fitToOpeningHours({ ...values, ...changes }));

  function changeDate(event) {
    if (!event.target.value) return;
    const date = fromDateInput(event.target.value);
    if (!openingHours(date)) {
      setDateError(t("slots.closed")); // the input goes back to the previous date
      return;
    }
    setDateError(null);
    update({ date });
  }

  return (
    <div className="form">
      <fieldset className="field">
        <legend className="field__label">{t("booking.formula")}</legend>
        <Segmented
          name={`${idPrefix}-formula`}
          value={values.formula}
          options={FORMULAS.map((formula) => ({
            value: formula,
            label: t(`formulas.${formula}`),
            disabled: !offered.includes(formula),
          }))}
          onChange={(formula) => update({ formula })}
        />
      </fieldset>
      <div className="field-row">
        <div className={dateError ? "field field--invalid" : "field"}>
          <label className="field__label" htmlFor={`${idPrefix}-date`}>
            {values.formula === "MONTH"
              ? t("booking.startDate")
              : t("booking.date")}
          </label>
          <input
            type="date"
            id={`${idPrefix}-date`}
            className="input"
            value={toDateInput(values.date)}
            min={minDate ? toDateInput(minDate) : undefined}
            aria-invalid={Boolean(dateError)}
            onChange={changeDate}
          />
          {dateError && <p className="field__error">{dateError}</p>}
        </div>
        {values.formula === "HOUR" && (
          <>
            <div className="field">
              <label className="field__label" htmlFor={`${idPrefix}-start`}>
                {t("booking.startHour")}
              </label>
              <select
                id={`${idPrefix}-start`}
                className="select"
                value={values.startHour}
                onChange={(event) =>
                  update({ startHour: Number(event.target.value) })
                }
              >
                {range(open, close).map((hour) => (
                  <option key={hour} value={hour}>
                    {formatHour(hour)}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label className="field__label" htmlFor={`${idPrefix}-hours`}>
                {t("booking.duration")}
              </label>
              <select
                id={`${idPrefix}-hours`}
                className="select"
                value={values.hours}
                onChange={(event) =>
                  update({ hours: Number(event.target.value) })
                }
              >
                {range(1, close - values.startHour + 1).map((n) => (
                  <option key={n} value={n}>
                    {t("booking.hours", { n })}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}
        {values.formula === "HALF_DAY" && (
          <div className="field">
            <label className="field__label" htmlFor={`${idPrefix}-half`}>
              {t("booking.halfDay")}
            </label>
            <select
              id={`${idPrefix}-half`}
              className="select"
              value={values.halfDay}
              onChange={(event) => update({ halfDay: event.target.value })}
            >
              {halfDaysOn(values.date).map((key) => (
                <option key={key} value={key}>
                  {slotLabel(key, values.date)}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
      <p className="field__hint" aria-live="polite">
        {describeRange(bookingRange(values))}
      </p>
    </div>
  );
}

// [from, …, to - 1]
function range(from, to) {
  return Array.from({ length: to - from }, (_, i) => from + i);
}

// "Matin (9:00 – 13:00)"
function slotLabel(halfDay, date) {
  const slot = openingHours(date).slots[halfDay];
  return t(`slots.${halfDay}`, {
    start: formatHour(slot.start),
    end: formatHour(slot.end),
  });
}
