// Month calendar (admin bookings). Weeks start on Monday; days in `marked` (yyyy-mm-dd) get a dot.
import { addDays, addMonths, formatDate, formatMonth, formatWeekdayShort, sameDay, startOfMonth, toDateInput, today } from '../dates.js';
import { h } from '../dom.js';
import { t } from '../i18n/index.js';

const MONDAY = new Date(2024, 0, 1);
const WEEKDAYS = Array.from({ length: 7 }, (_, i) => formatWeekdayShort(addDays(MONDAY, i)));

export function monthCalendar({ selected, marked = new Set(), onSelect, onMonthChange }) {
  let current = selected;
  let view = startOfMonth(selected);
  let markedDays = marked;
  const root = h('div', { class: 'calendar' });

  function changeMonth(months) {
    view = addMonths(view, months);
    render();
    onMonthChange?.(view);
  }

  function render() {
    const firstWeekday = (view.getDay() + 6) % 7; // Monday = 0
    const gridStart = addDays(view, -firstWeekday);
    const now = today();
    const days = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));

    root.replaceChildren(
      h('div', { class: 'calendar__head' },
        h('button', { type: 'button', class: 'icon-btn', 'aria-label': t('calendar.previous'), onclick: () => changeMonth(-1) }, '‹'),
        h('span', { class: 'calendar__title', 'aria-live': 'polite' }, formatMonth(view)),
        h('button', { type: 'button', class: 'icon-btn', 'aria-label': t('calendar.next'), onclick: () => changeMonth(1) }, '›'),
      ),
      h('div', { class: 'calendar__grid' },
        WEEKDAYS.map((day) => h('span', { class: 'calendar__weekday', 'aria-hidden': 'true' }, day)),
        days.map((day) => {
          const classes = ['calendar__day'];
          if (day.getMonth() !== view.getMonth()) classes.push('calendar__day--outside');
          if (sameDay(day, now)) classes.push('calendar__day--today');
          if (markedDays.has(toDateInput(day))) classes.push('calendar__day--marked');
          return h('button', {
            type: 'button',
            class: classes.join(' '),
            'aria-pressed': sameDay(day, current) ? 'true' : 'false',
            'aria-label': formatDate(day),
            onclick: () => {
              current = day;
              if (day.getMonth() !== view.getMonth()) {
                view = startOfMonth(day);
                onMonthChange?.(view);
              }
              render();
              onSelect(day);
            },
          }, day.getDate());
        }),
      ),
    );
  }

  render();
  return {
    node: root,
    setMarked(days) {
      markedDays = days;
      render();
    },
    setSelected(day) {
      current = day;
      view = startOfMonth(day);
      render();
    },
  };
}
