import { formatDate, formatTime, sameDay } from './dates.js';
import { t } from './i18n/index.js';

// { start, end } → "Mardi 17 novembre 2026, de 8:00 à 19:00", or "Du … au …" over several days.
export function describeRange({ start, end }) {
    return sameDay(start, end)
        ? t('slots.range', { date: formatDate(start), start: formatTime(start), end: formatTime(end) })
        : t('slots.multiDay', { start: formatDate(start), end: formatDate(end) });
}
