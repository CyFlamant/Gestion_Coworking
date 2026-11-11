// Formula + date + time fields. Shared by the availability search, the client booking form and the admin dialog.
import { OPENING_HOURS, SLOTS } from '../config.js';
import { formatDate, formatHour, formatTime, fromDateInput, sameDay, toDateInput } from '../dates.js';
import { h } from '../dom.js';
import { t } from '../i18n/index.js';
import { bookingRange, FORMULAS } from '../pricing.js';
import { field, segmented, select } from './form.js';

export function describeRange({ start, end }) {
  return sameDay(start, end)
    ? t('slots.range', { date: formatDate(start), start: formatTime(start), end: formatTime(end) })
    : t('slots.multiDay', { start: formatDate(start), end: formatDate(end) });
}

export function slotLabel(halfDay) {
  const slot = SLOTS[halfDay];
  return t(`slots.${halfDay}`, { start: formatHour(slot.start), end: formatHour(slot.end) });
}

// values: { formula, date, startHour, hours, halfDay }
export function slotFields({ idPrefix, values, minDate, onChange }) {
  const v = { ...values };
  const { open, close } = OPENING_HOURS;
  const hint = h('p', { class: 'field__hint', 'aria-live': 'polite' });
  const details = h('div', { class: 'field-row' });

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
        v.date = fromDateInput(event.target.value);
        emit();
      },
    }),
  });

  function renderDetails() {
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
          options: ['MORNING', 'AFTERNOON'].map((key) => ({ value: key, label: slotLabel(key) })),
          onchange: (event) => {
            v.halfDay = event.target.value;
            emit();
          },
        }),
      }));
    }
    details.replaceChildren(dateField, ...extra);
  }

  renderDetails();
  hint.textContent = describeRange(bookingRange(v)); // no onChange on creation: the caller reads the initial values

  const root = h('div', { class: 'form' },
    field({
      id: `${idPrefix}-formula`,
      name: 'formula',
      label: t('booking.formula'),
      group: true,
      control: segmented({
        name: `${idPrefix}-formula`,
        value: v.formula,
        options: FORMULAS.map((formula) => ({ value: formula, label: t(`formulas.${formula}`) })),
        onChange: (formula) => {
          v.formula = formula;
          renderDetails();
          emit();
        },
      }),
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
