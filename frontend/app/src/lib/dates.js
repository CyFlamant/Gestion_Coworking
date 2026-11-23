// Date helpers. The backend uses LocalDateTime, so dates travel as local ISO strings without a time zone.

const LOCALE = 'fr-BE';
const pad = (n) => String(n).padStart(2, '0');

export function toLocalIso(date) {
  return `${toDateInput(date)}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
}

export function parseLocal(iso) {
  const [datePart, timePart = '00:00'] = iso.split('T');
  const [y, m, d] = datePart.split('-').map(Number);
  const [hh, mm] = timePart.split(':').map(Number);
  return new Date(y, m - 1, d, hh, mm);
}

export function toDateInput(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function fromDateInput(value) {
  return parseLocal(value);
}

export function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function today() {
  return startOfDay(new Date());
}

export function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function addMonths(date, months) {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

export function atHour(date, hour) {
  const result = startOfDay(date);
  result.setHours(hour);
  return result;
}

export function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function overlaps(startA, endA, startB, endB) {
  return startA < endB && startB < endA;
}

const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);

export function formatDate(date) {
  return capitalize(date.toLocaleDateString(LOCALE, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));
}

export function formatShortDate(date) {
  return date.toLocaleDateString(LOCALE, { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatMonth(date) {
  return capitalize(date.toLocaleDateString(LOCALE, { month: 'long', year: 'numeric' }));
}

export function formatMonthShort(date) {
  return date.toLocaleDateString(LOCALE, { month: 'short' }).replace('.', '');
}

export function formatWeekdayShort(date) {
  return capitalize(date.toLocaleDateString(LOCALE, { weekday: 'short' }).replace('.', ''));
}

export function formatTime(date) {
  return `${date.getHours()}:${pad(date.getMinutes())}`;
}

export function formatHour(hour) {
  return `${hour}:00`;
}

export function formatMoney(amount) {
  return new Intl.NumberFormat(LOCALE, { style: 'currency', currency: 'EUR' }).format(amount);
}
