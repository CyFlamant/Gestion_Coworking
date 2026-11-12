// Booking ranges and prices. Pure functions: candidates for unit tests once ported (and for the backend price rule).
import { OPENING_HOURS } from './config.js';
import { addDays, addMonths, atHour, sameDay, startOfDay } from './dates.js';

export const FORMULAS = ['HOUR', 'HALF_DAY', 'DAY', 'MONTH'];
export const HALF_DAYS = ['MORNING', 'AFTERNOON'];

// Used for a closed day, so bookingRange always returns a range. The forms never pick a closed day.
const DEFAULT_HOURS = OPENING_HOURS[1];

// null when closed.
export function openingHours(date) {
  return OPENING_HOURS[date.getDay()];
}

const hoursOf = (date) => openingHours(date) ?? DEFAULT_HOURS;

export function halfDaysOn(date) {
  return HALF_DAYS.filter((key) => openingHours(date)?.slots[key]);
}

// Formulas that can start on this date.
export function formulasOn(date) {
  const hours = openingHours(date);
  if (!hours) return [];
  return FORMULAS.filter((formula) => {
    if (formula === 'HALF_DAY') return halfDaysOn(date).length > 0;
    if (formula === 'DAY') return Boolean(hours.slots.DAY);
    return true;
  });
}

// Moves form values into the opening hours: next open day, then a formula, half-day and hours offered that day.
export function fitToOpeningHours(values) {
  const v = { ...values };
  let day = startOfDay(v.date);
  while (!openingHours(day)) day = addDays(day, 1);
  v.date = day;
  const { open, close } = openingHours(day);
  if (!formulasOn(day).includes(v.formula)) [v.formula] = formulasOn(day);
  if (!halfDaysOn(day).includes(v.halfDay)) [v.halfDay] = halfDaysOn(day);
  v.halfDay ??= 'MORNING';
  v.startHour = Math.min(Math.max(v.startHour, open), close - 1);
  v.hours = Math.max(1, Math.min(v.hours, close - v.startHour));
  return v;
}

// A booking starts on an open day, within its opening hours; one that ends the same day must end by closing time.
export function isWithinOpeningHours(start, end) {
  const hours = openingHours(start);
  if (!hours || start < atHour(start, hours.open)) return false;
  return !sameDay(start, end) || end <= atHour(start, hours.close);
}

const RATE_BY_FORMULA = {
  HOUR: 'hourRate',
  HALF_DAY: 'halfDayRate',
  DAY: 'dayRate',
  MONTH: 'monthRate',
};

export function rateKey(formula) {
  return RATE_BY_FORMULA[formula];
}

// Form values → { start, end }. A month runs from the start date to the day before the same date next month.
export function bookingRange({ formula, date, startHour, hours, halfDay }) {
  const day = startOfDay(date);
  switch (formula) {
    case 'HOUR':
      return { start: atHour(day, startHour), end: atHour(day, startHour + hours) };
    case 'HALF_DAY': {
      const slot = hoursOf(day).slots[halfDay] ?? DEFAULT_HOURS.slots[halfDay];
      return { start: atHour(day, slot.start), end: atHour(day, slot.end) };
    }
    case 'DAY': {
      const slot = hoursOf(day).slots.DAY ?? DEFAULT_HOURS.slots.DAY;
      return { start: atHour(day, slot.start), end: atHour(day, slot.end) };
    }
    case 'MONTH': {
      const last = addDays(addMonths(day, 1), -1);
      return { start: atHour(day, hoursOf(day).open), end: atHour(last, hoursOf(last).close) };
    }
    default:
      throw new Error(`Unknown formula: ${formula}`);
  }
}

// { start, end } → the formula it was booked with and how many units.
export function inferFormula(start, end) {
  const days = Math.round((startOfDay(end) - startOfDay(start)) / 86_400_000) + 1;
  if (days >= 28) return { formula: 'MONTH', quantity: Math.max(1, Math.round(days / 30)) };
  if (days > 1) return { formula: 'DAY', quantity: days };

  const from = start.getHours() + start.getMinutes() / 60;
  const to = end.getHours() + end.getMinutes() / 60;
  const { slots } = hoursOf(start);
  if (slots.DAY?.start === from && slots.DAY?.end === to) return { formula: 'DAY', quantity: 1 };
  if (HALF_DAYS.some((key) => slots[key]?.start === from && slots[key]?.end === to)) {
    return { formula: 'HALF_DAY', quantity: 1 };
  }
  return { formula: 'HOUR', quantity: Math.ceil(to - from) };
}

export function computePrice(space, start, end) {
  const { formula, quantity } = inferFormula(start, end);
  const unitPrice = Number(space[RATE_BY_FORMULA[formula]]);
  return {
    formula,
    quantity,
    unitPrice,
    total: Math.round(unitPrice * quantity * 100) / 100,
  };
}

// { start, end } → form values, to edit an existing booking.
export function formValuesFromRange(start, end) {
  const { formula, quantity } = inferFormula(start, end);
  return {
    formula,
    date: startOfDay(start),
    startHour: start.getHours(),
    hours: formula === 'HOUR' ? quantity : 1,
    halfDay: HALF_DAYS.find((key) => hoursOf(start).slots[key]?.start === start.getHours()) ?? 'MORNING',
  };
}
