// Mes réservations (client): upcoming and past bookings, cancel an upcoming one.
import { deleteBooking, getMyBookings } from '../api.js';
import { confirmDialog } from '../components/dialog.js';
import { segmented } from '../components/form.js';
import { describeRange } from '../components/slotFields.js';
import { showToast } from '../components/toast.js';
import { typeChip } from '../components/typeBadge.js';
import { formatMoney, formatMonthShort, parseLocal } from '../dates.js';
import { h, mainElement } from '../dom.js';
import { t } from '../i18n/index.js';
import { mountLayout } from '../layout.js';

await mountLayout({ page: 'mes-reservations', title: 'pages.myBookings', roles: ['CLIENT'] });

let bookings = [];
let tab = 'upcoming';
const list = h('div', { 'aria-live': 'polite' });

const tabs = segmented({
  name: 'bookings-tab',
  value: tab,
  options: [
    { value: 'upcoming', label: t('myBookings.upcoming') },
    { value: 'past', label: t('myBookings.past') },
  ],
  onChange: (value) => {
    tab = value;
    render();
  },
});

mainElement().append(
  h('div', { class: 'inner page' },
    h('div', { class: 'page-head' },
      h('div', { class: 'page-head__text' }, h('h1', {}, t('pages.myBookings'))),
      h('a', { class: 'btn btn--primary', href: 'reserver.html' }, t('myBookings.bookNow'))),
    tabs,
    list),
);

function ticket(booking, upcoming) {
  const start = parseLocal(booking.startDateTime);
  const end = parseLocal(booking.endDateTime);
  const type = booking.spaceType.toLowerCase();
  return h('li', { class: `ticket${upcoming ? '' : ' ticket--past'}` },
    h('div', { class: `ticket__date ticket__date--${type}`, 'aria-hidden': 'true' },
      h('span', { class: 'ticket__day' }, start.getDate()),
      h('span', { class: 'ticket__month' }, formatMonthShort(start))),
    h('div', { class: 'ticket__body' },
      h('h2', { class: 'space-card__name' }, booking.spaceName),
      h('p', {}, describeRange({ start, end })),
      h('div', { class: 'ticket__meta' }, typeChip(booking.spaceType), h('span', {}, t(`formulas.${booking.formula}`)))),
    h('div', { class: 'ticket__side' },
      h('span', { class: 'ticket__price' }, booking.price != null ? formatMoney(booking.price) : '—'),
      upcoming && h('button', { type: 'button', class: 'btn btn--danger btn--small', onclick: () => cancel(booking, { start, end }) },
        t('myBookings.cancel'))));
}

async function cancel(booking, range) {
  const confirmed = await confirmDialog({
    title: t('myBookings.cancelTitle'),
    message: t('myBookings.cancelMessage', { space: booking.spaceName, slot: describeRange(range) }),
    confirmLabel: t('myBookings.cancelConfirm'),
    cancelLabel: t('myBookings.keep'),
    danger: true,
  });
  if (!confirmed) return;
  try {
    await deleteBooking(booking.id);
    showToast(t('myBookings.cancelled'));
    await load();
  } catch (error) {
    showToast(error.detail ?? String(error), 'error');
  }
}

function render() {
  const now = new Date();
  // A booking that has started can no longer be cancelled, so it moves to "past".
  const upcoming = bookings.filter((b) => parseLocal(b.startDateTime) > now);
  const past = bookings.filter((b) => parseLocal(b.startDateTime) <= now).reverse();
  const shown = tab === 'upcoming' ? upcoming : past;
  if (!shown.length) {
    list.replaceChildren(h('div', { class: 'empty' },
      h('p', {}, t(tab === 'upcoming' ? 'myBookings.emptyUpcoming' : 'myBookings.emptyPast')),
      tab === 'upcoming' && h('a', { class: 'btn', href: 'reserver.html' }, t('myBookings.bookNow'))));
    return;
  }
  list.replaceChildren(h('ul', { class: 'ticket-list' }, shown.map((b) => ticket(b, tab === 'upcoming'))));
}

async function load() {
  try {
    bookings = await getMyBookings();
  } catch (error) {
    showToast(t('common.loadError', { detail: error.detail }), 'error');
  }
  render();
}

await load();
