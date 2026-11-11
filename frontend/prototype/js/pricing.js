// Booking ranges and prices. Pure functions: candidates for unit tests once ported (and for the backend price rule).
import { OPENING_HOURS, SLOTS } from './config.js';
import { addDays, addMonths, atHour, startOfDay } from './dates.js';

export const FORMULAS = ['HOUR', 'HALF_DAY', 'DAY', 'MONTH'];

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
      const slot = SLOTS[halfDay];
      return { start: atHour(day, slot.start), end: atHour(day, slot.end) };
    }
    case 'DAY':
      return { start: atHour(day, SLOTS.DAY.start), end: atHour(day, SLOTS.DAY.end) };
    case 'MONTH':
      return {
        start: atHour(day, OPENING_HOURS.open),
        end: atHour(addDays(addMonths(day, 1), -1), OPENING_HOURS.close),
      };
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
  if (from === SLOTS.DAY.start && to === SLOTS.DAY.end) return { formula: 'DAY', quantity: 1 };
  if ([SLOTS.MORNING, SLOTS.AFTERNOON].some((slot) => slot.start === from && slot.end === to)) {
    return { formula: 'HALF_DAY', quantity: 1 };
  }
  return { formula: 'HOUR', quantity: Math.ceil(to - from) };
}

// A rate of 0 means the space is not offered with that formula.
export function computePrice(space, start, end) {
  const { formula, quantity } = inferFormula(start, end);
  const unitPrice = Number(space[RATE_BY_FORMULA[formula]]);
  return {
    formula,
    quantity,
    unitPrice,
    total: Math.round(unitPrice * quantity * 100) / 100,
    offered: unitPrice > 0,
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
    halfDay: start.getHours() < SLOTS.AFTERNOON.start ? 'MORNING' : 'AFTERNOON',
  };
}
