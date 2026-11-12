// Formula + date + time fields. Shared by the availability search, the client booking form and the admin dialog.
// The choices follow the opening hours of the chosen day (js/config.js).
import { formatDate, formatHour, formatTime, fromDateInput, sameDay, toDateInput } from '../dates.js';
import { h } from '../dom.js';
import { t } from '../i18n/index.js';
import { bookingRange, fitToOpeningHours, FORMULAS, formulasOn, halfDaysOn, openingHours } from '../pricing.js';
import { field, segmented, select, setFieldError } from './form.js';

export function describeRange({ start, end }) {
  return sameDay(start, end)
    ? t('slots.range', { date: formatDate(start), start: formatTime(start), end: formatTime(end) })
    : t('slots.multiDay', { start: formatDate(start), end: formatDate(end) });
}

export function slotLabel(halfDay, date) {
  const slot = openingHours(date).slots[halfDay];
  return t(`slots.${halfDay}`, { start: formatHour(slot.start), end: formatHour(slot.end) });
}

// values: { formula, date, startHour, hours, halfDay }. A closed day moves to the next open one.
export function slotFields({ idPrefix, values, minDate, onChange }) {
  const v = fitToOpeningHours(values);
  const hint = h('p', { class: 'field__hint', 'aria-live': 'polite' });

  const emit = () => {
    hint.textContent = describeRange(bookingRange(v));
    onChange?.({ ...v });
  };

  const dateField = field({
    id: `${idPrefix}-date`,
    name: 'startDateTime',
    label: t('booking.date'),
    control: h('input', {
      type: 'date',
      id: `${idPrefix}-date`,
      class: 'input',
      value: toDateInput(v.date),
      min: minDate ? toDateInput(minDate) : null,
      required: true,
      onchange: (event) => {
        if (!event.target.value) return;
        const date = fromDateInput(event.target.value);
        if (!openingHours(date)) {
          setFieldError(dateField, t('slots.closed'));
          event.target.value = toDateInput(v.date);
          return;
        }
        setFieldError(dateField, null);
        Object.assign(v, fitToOpeningHours({ ...v, date }));
        renderFormulas();
        renderDetails();
        emit();
      },
    }),
  });
  const details = h('div', { class: 'field-row' }, dateField);

  const formulaControl = segmented({
    name: `${idPrefix}-formula`,
    value: v.formula,
    options: FORMULAS.map((formula) => ({ value: formula, label: t(`formulas.${formula}`) })),
    onChange: (formula) => {
      v.formula = formula;
      renderDetails();
      emit();
    },
  });

  // Formulas not offered on the chosen day are disabled.
  function renderFormulas() {
    const offered = formulasOn(v.date);
    formulaControl.querySelectorAll('input').forEach((radio) => {
      radio.disabled = !offered.includes(radio.value);
      radio.checked = radio.value === v.formula;
    });
  }

  function renderDetails() {
    const { open, close } = openingHours(v.date);
    dateField.querySelector('label').textContent = v.formula === 'MONTH' ? t('booking.startDate') : t('booking.date');
    const extra = [];
    if (v.formula === 'HOUR') {
      v.hours = Math.min(v.hours, close - v.startHour);
      extra.push(
        field({
          id: `${idPrefix}-start`,
          label: t('booking.startHour'),
          control: select({
            id: `${idPrefix}-start`,
            value: v.startHour,
            options: Array.from({ length: close - open }, (_, i) => ({ value: open + i, label: formatHour(open + i) })),
            onchange: (event) => {
              v.startHour = Number(event.target.value);
              renderDetails();
              emit();
            },
          }),
        }),
        field({
          id: `${idPrefix}-hours`,
          name: 'endDateTime',
          label: t('booking.duration'),
          control: select({
            id: `${idPrefix}-hours`,
            value: v.hours,
            options: Array.from({ length: close - v.startHour }, (_, i) => ({ value: i + 1, label: t('booking.hours', { n: i + 1 }) })),
            onchange: (event) => {
              v.hours = Number(event.target.value);
              emit();
            },
          }),
        }),
      );
    } else if (v.formula === 'HALF_DAY') {
      extra.push(field({
        id: `${idPrefix}-half`,
        name: 'endDateTime',
        label: t('booking.halfDay'),
        control: select({
          id: `${idPrefix}-half`,
          value: v.halfDay,
          options: halfDaysOn(v.date).map((key) => ({ value: key, label: slotLabel(key, v.date) })),
          onchange: (event) => {
            v.halfDay = event.target.value;
            emit();
          },
        }),
      }));
    }
    // The date field stays in place, so it keeps focus while the other fields change.
    while (dateField.nextSibling) dateField.nextSibling.remove();
    details.append(...extra);
  }

  renderFormulas();
  renderDetails();
  hint.textContent = describeRange(bookingRange(v)); // no onChange on creation: the caller reads the initial values

  const root = h('div', { class: 'form' },
    field({
      id: `${idPrefix}-formula`,
      name: 'formula',
      label: t('booking.formula'),
      group: true,
      control: formulaControl,
    }),
    details,
    hint,
  );

  return {
    node: root,
    getValues: () => ({ ...v }),
    getRange: () => bookingRange(v),
  };
}
