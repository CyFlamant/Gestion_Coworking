// Day view for the admin: one column per space, one row per half hour from opening to closing time.
import { formatHour, formatTime, parseLocal, startOfDay } from '../dates.js';
import { h } from '../dom.js';
import { t } from '../i18n/index.js';
import { openingHours } from '../pricing.js';
import { shapeIcon } from './typeBadge.js';

const ROW_MINUTES = 30;

export function dayTimeline({ date, spaces, bookings, onSlot, onBooking }) {
  const hoursOfDay = openingHours(date);
  if (!hoursOfDay) return h('p', { class: 'empty' }, t('slots.closed'));
  const { open, close } = hoursOfDay;
  const rows = ((close - open) * 60) / ROW_MINUTES;
  const dayStart = startOfDay(date);
  const minutesOf = (d) => Math.round((d - dayStart) / 60000);
  const row = (minutes) => `calc(${(minutes - open * 60) / ROW_MINUTES} * var(--timeline-row-h))`;

  const hours = Array.from({ length: close - open }, (_, i) => open + i);

  const timeColumn = h('div', { class: 'timeline__times', 'aria-hidden': 'true' },
    hours.slice(1).map((hour) => h('span', { class: 'timeline__time', style: `top: ${row(hour * 60)}` }, formatHour(hour))),
  );

  const columns = spaces.map((space) => {
    const slots = hours.map((hour) => h('button', {
      type: 'button',
      class: 'timeline__slot',
      style: `top: ${row(hour * 60)}`,
      'aria-label': t('adminBookings.slotLabel', { space: space.name, hour: formatHour(hour) }),
      onclick: () => onSlot(space, hour),
    }));

    const blocks = bookings
      .filter((booking) => booking.spaceId === space.id)
      .map((booking) => {
        const start = parseLocal(booking.startDateTime);
        const end = parseLocal(booking.endDateTime);
        // A booking that spans several days (month) is clipped to the opening hours of this day.
        const from = Math.max(minutesOf(start), open * 60);
        const to = Math.min(minutesOf(end), close * 60);
        if (to <= from) return null;
        const multiDay = minutesOf(start) < 0 || minutesOf(end) > 24 * 60;
        const time = multiDay ? t(`formulas.${booking.formula}`) : `${formatTime(start)} – ${formatTime(end)}`;
        return h('button', {
          type: 'button',
          class: `timeline__booking timeline__booking--${(booking.spaceType ?? space.type).toLowerCase()}`,
          style: `top: ${row(from)}; height: calc(${(to - from) / ROW_MINUTES} * var(--timeline-row-h) - 2px)`,
          onclick: () => onBooking(booking),
        }, h('strong', {}, booking.userName), h('span', {}, time));
      });

    return h('div', { class: 'timeline__col', style: `--rows: ${rows}` }, slots, blocks);
  });

  return h('div', { class: 'timeline' },
    h('div', {
      class: 'timeline__grid',
      style: `grid-template-columns: 52px repeat(${spaces.length}, minmax(var(--timeline-col-min), 1fr))`,
    },
    h('div', { class: 'timeline__corner' }),
    spaces.map((space) => h('div', { class: 'timeline__colhead' }, shapeIcon(space.type), space.name)),
    h('div', { class: 'timeline__timecol', style: `--rows: ${rows}` }, timeColumn),
    columns),
  );
}
