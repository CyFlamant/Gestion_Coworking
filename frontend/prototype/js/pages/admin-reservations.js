// Réservations (admin): type + space filters, month calendar and day timeline (as in the mockup), plus a list view.
// Create, update and delete bookings for any client.
import { createBooking, deleteBooking, getBookings, getClients, getSpaces, updateBooking } from '../api.js';
import { bookingForm } from '../components/bookingForm.js';
import { monthCalendar } from '../components/calendar.js';
import { confirmDialog, openDialog } from '../components/dialog.js';
import { field, segmented, select } from '../components/form.js';
import { describeRange } from '../components/slotFields.js';
import { dayTimeline } from '../components/timeline.js';
import { showToast } from '../components/toast.js';
import { shapeIcon } from '../components/typeBadge.js';
import { SPACE_TYPES } from '../config.js';
import {
  addDays, formatDate, formatMoney, formatShortDate, formatTime, overlaps, parseLocal, startOfDay, toDateInput, today,
} from '../dates.js';
import { h, mainElement } from '../dom.js';
import { t } from '../i18n/index.js';
import { mountLayout } from '../layout.js';
import { formValuesFromRange } from '../pricing.js';

await mountLayout({ page: 'admin-reservations', title: 'pages.adminBookings', roles: ['ADMIN'] });

const state = { type: 'ALL', spaceId: 'ALL', date: today(), view: 'calendar', showPast: false };
let spaces = [];
let clients = [];
let bookings = [];

const spaceSelectHolder = h('div');
const dayArea = h('div', { class: 'admin-grid__main', 'aria-live': 'polite' });
const listArea = h('div', { 'aria-live': 'polite' });
const calendar = monthCalendar({
  selected: state.date,
  onSelect: (day) => {
    state.date = day;
    renderDay();
  },
});
const calendarView = h('div', { class: 'admin-grid' }, h('div', { class: 'admin-grid__side' }, calendar.node), dayArea);
const listView = h('div', { class: 'form', hidden: true },
  h('label', { class: 'field__hint' },
    h('input', {
      type: 'checkbox',
      id: 'show-past',
      onchange: (event) => {
        state.showPast = event.target.checked;
        renderList();
      },
    }),
    ` ${t('adminBookings.showPast')}`),
  listArea);

mainElement().append(
  h('div', { class: 'inner page' },
    h('div', { class: 'page-head' },
      h('div', { class: 'page-head__text' },
        h('h1', {}, t('pages.adminBookings')),
        h('p', { class: 'lead' }, t('adminBookings.lead'))),
      h('button', { type: 'button', class: 'btn btn--primary', onclick: () => openBookingDialog(null, defaultPreset()) }, t('adminBookings.add'))),
    h('div', { class: 'toolbar' },
      field({
        id: 'filter-type',
        label: t('adminBookings.filterType'),
        control: select({
          id: 'filter-type',
          value: state.type,
          options: [
            { value: 'ALL', label: t('adminBookings.allTypes') },
            ...SPACE_TYPES.map((type) => ({ value: type, label: t(`types.${type}`) })),
          ],
          onchange: (event) => {
            state.type = event.target.value;
            state.spaceId = 'ALL';
            renderAll();
          },
        }),
      }),
      spaceSelectHolder,
      segmented({
        name: 'view',
        value: state.view,
        options: [
          { value: 'calendar', label: t('adminBookings.viewCalendar') },
          { value: 'list', label: t('adminBookings.viewList') },
        ],
        onChange: (view) => {
          state.view = view;
          calendarView.hidden = view !== 'calendar';
          listView.hidden = view !== 'list';
        },
      })),
    calendarView,
    listView),
);

// ---------- Filters ----------

function visibleSpaces() {
  return spaces
    .filter((space) => state.type === 'ALL' || space.type === state.type)
    .filter((space) => state.spaceId === 'ALL' || space.id === state.spaceId)
    .sort((a, b) => SPACE_TYPES.indexOf(a.type) - SPACE_TYPES.indexOf(b.type) || a.name.localeCompare(b.name, 'fr', { numeric: true }));
}

function visibleBookings() {
  const ids = new Set(visibleSpaces().map((space) => space.id));
  return bookings.filter((booking) => ids.has(booking.spaceId));
}

function renderSpaceSelect() {
  const ofType = spaces.filter((space) => state.type === 'ALL' || space.type === state.type);
  spaceSelectHolder.replaceChildren(field({
    id: 'filter-space',
    label: t('adminBookings.filterSpace'),
    control: select({
      id: 'filter-space',
      value: state.spaceId,
      options: [{ value: 'ALL', label: t('adminBookings.allSpaces') }, ...ofType.map((space) => ({ value: space.id, label: space.name }))],
      onchange: (event) => {
        state.spaceId = event.target.value === 'ALL' ? 'ALL' : Number(event.target.value);
        renderAll();
      },
    }),
  }));
}

// ---------- Calendar + day timeline ----------

function markedDays() {
  const days = new Set();
  for (const booking of visibleBookings()) {
    const last = startOfDay(parseLocal(booking.endDateTime));
    for (let day = startOfDay(parseLocal(booking.startDateTime)); day <= last; day = addDays(day, 1)) days.add(toDateInput(day));
  }
  return days;
}

function renderDay() {
  const dayStart = state.date;
  const dayEnd = addDays(dayStart, 1);
  const ofDay = visibleBookings().filter((b) => overlaps(dayStart, dayEnd, parseLocal(b.startDateTime), parseLocal(b.endDateTime)));
  const shownSpaces = visibleSpaces();
  dayArea.replaceChildren(
    h('div', { class: 'day-head' },
      h('div', {}, h('h2', {}, formatDate(state.date)), h('p', { class: 'muted' }, t('adminBookings.dayCount', { n: ofDay.length })))),
    shownSpaces.length
      ? dayTimeline({
        date: state.date,
        spaces: shownSpaces,
        bookings: ofDay,
        onSlot: (space, hour) => openBookingDialog(null, {
          type: space.type, spaceId: space.id, formula: 'HOUR', date: state.date, startHour: hour, hours: 1, halfDay: 'MORNING',
        }),
        onBooking: (booking) => openBookingDialog(booking),
      })
      : h('p', { class: 'empty' }, t('adminBookings.empty')),
  );
}

// ---------- List ----------

function renderList() {
  const now = new Date();
  const rows = visibleBookings().filter((b) => state.showPast || parseLocal(b.endDateTime) >= now);
  if (!rows.length) {
    listArea.replaceChildren(h('p', { class: 'empty' }, t('adminBookings.empty')));
    return;
  }
  listArea.replaceChildren(h('div', { class: 'table-wrap' },
    h('table', { class: 'table' },
      h('thead', {}, h('tr', {},
        ['colDate', 'colTime', 'colSpace', 'colClient', 'colFormula'].map((key) => h('th', { scope: 'col' }, t(`adminBookings.${key}`))),
        h('th', { scope: 'col', class: 'num' }, t('adminBookings.colPrice')),
        h('th', { scope: 'col' }, h('span', { class: 'visually-hidden' }, 'Actions')))),
      h('tbody', {}, rows.map((booking) => {
        const start = parseLocal(booking.startDateTime);
        const end = parseLocal(booking.endDateTime);
        const multiDay = startOfDay(start).getTime() !== startOfDay(end).getTime();
        return h('tr', {},
          h('td', {}, multiDay ? `${formatShortDate(start)} → ${formatShortDate(end)}` : formatShortDate(start)),
          h('td', {}, `${formatTime(start)} – ${formatTime(end)}`),
          h('td', {}, h('span', { class: 'table__name' }, shapeIcon(booking.spaceType), booking.spaceName)),
          h('td', {}, booking.userName),
          h('td', {}, t(`formulas.${booking.formula}`)),
          h('td', { class: 'num' }, booking.price != null ? formatMoney(booking.price) : '—'),
          h('td', {}, h('div', { class: 'table__actions' },
            h('button', { type: 'button', class: 'btn btn--small', onclick: () => openBookingDialog(booking) }, t('common.edit')),
            h('button', { type: 'button', class: 'btn btn--small btn--danger', onclick: () => removeBooking(booking) }, t('common.delete')))));
      })))));
}

function renderAll() {
  renderSpaceSelect();
  calendar.setMarked(markedDays());
  renderDay();
  renderList();
}

// ---------- Create / update / delete ----------

function defaultPreset() {
  const first = visibleSpaces()[0] ?? spaces[0];
  const date = state.date < today() ? today() : state.date;
  return { type: first?.type, spaceId: first?.id, formula: 'HOUR', date, startHour: 9, hours: 1, halfDay: 'MORNING' };
}

function openBookingDialog(booking, preset) {
  const formId = 'admin-booking-form';
  const initial = booking
    ? {
      type: booking.spaceType,
      spaceId: booking.spaceId,
      userId: booking.userId,
      ...formValuesFromRange(parseLocal(booking.startDateTime), parseLocal(booking.endDateTime)),
    }
    : preset;
  let saveButton;

  const form = bookingForm({
    idPrefix: 'admin-booking',
    spaces,
    clients,
    initial,
    // Free spaces computed from the loaded bookings, ignoring the booking being edited.
    checkAvailability: async ({ start, end }) => {
      const busy = new Set(bookings
        .filter((b) => b.id !== booking?.id && overlaps(start, end, parseLocal(b.startDateTime), parseLocal(b.endDateTime)))
        .map((b) => b.spaceId));
      return new Set(spaces.filter((space) => !busy.has(space.id)).map((space) => space.id));
    },
  });

  const formElement = h('form', {
    id: formId,
    novalidate: true,
    onsubmit: async (event) => {
      event.preventDefault();
      form.clearErrors();
      saveButton.disabled = true;
      try {
        if (booking) await updateBooking(booking.id, form.toRequest());
        else await createBooking(form.toRequest());
        dialog.close();
        showToast(t(booking ? 'adminBookings.updated' : 'adminBookings.created'));
        state.date = startOfDay(form.getState().range.start);
        calendar.setSelected(state.date);
        await load();
      } catch (error) {
        form.showErrors(error);
      } finally {
        saveButton.disabled = false;
      }
    },
  }, form.node);

  const dialog = openDialog({
    title: t(booking ? 'adminBookings.editTitle' : 'adminBookings.newTitle'),
    body: formElement,
    actions: (close) => [
      booking && h('button', {
        type: 'button',
        class: 'btn btn--danger push-left',
        onclick: () => {
          close();
          removeBooking(booking);
        },
      }, t('common.delete')),
      h('button', { type: 'button', class: 'btn btn--ghost', onclick: close }, t('common.cancel')),
      saveButton = h('button', { type: 'submit', class: 'btn btn--primary', form: formId }, t('common.save')),
    ],
  });
  form.refresh();
}

async function removeBooking(booking) {
  const range = { start: parseLocal(booking.startDateTime), end: parseLocal(booking.endDateTime) };
  const confirmed = await confirmDialog({
    title: t('adminBookings.deleteTitle'),
    message: t('adminBookings.deleteMessage', { client: booking.userName, space: booking.spaceName, slot: describeRange(range) }),
    confirmLabel: t('common.delete'),
    danger: true,
  });
  if (!confirmed) return;
  try {
    await deleteBooking(booking.id);
    showToast(t('adminBookings.deleted'));
    await load();
  } catch (error) {
    showToast(error.detail ?? String(error), 'error');
  }
}

async function load() {
  try {
    spaces = await getSpaces();
    [bookings, clients] = await Promise.all([getBookings(), getClients()]);
  } catch (error) {
    showToast(t('common.loadError', { detail: error.detail }), 'error');
  }
  renderAll();
}

await load();
