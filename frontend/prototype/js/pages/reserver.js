// Réserver (client): booking form on the left, rates and price summary on the right.
import { createBooking, getAvailableSpaces, getSpaces } from '../api.js';
import { bookingForm } from '../components/bookingForm.js';
import { describeRange } from '../components/slotFields.js';
import { setFlash, showToast } from '../components/toast.js';
import { typeChip } from '../components/typeBadge.js';
import { RATE_FIELDS } from '../config.js';
import { addDays, formatMoney, toLocalIso, today } from '../dates.js';
import { h, mainElement } from '../dom.js';
import { t } from '../i18n/index.js';
import { mountLayout } from '../layout.js';
import { rateKey } from '../pricing.js';
import { takeDraft } from './draft.js';

await mountLayout({ page: 'reserver', title: 'pages.book', roles: ['CLIENT'] });

let spaces = [];
try {
  spaces = await getSpaces();
} catch (error) {
  showToast(t('common.loadError', { detail: error.detail }), 'error');
}

const initial = takeDraft() ?? { formula: 'HOUR', date: addDays(today(), 1), startHour: 9, hours: 2, halfDay: 'MORNING' };
const summary = h('aside', { class: 'card summary', 'aria-live': 'polite' });
const submitButton = h('button', { type: 'submit', class: 'btn btn--primary', form: 'booking-form' }, t('booking.confirm'));

const form = bookingForm({
  idPrefix: 'booking',
  spaces,
  initial,
  minDate: today(),
  checkAvailability: async ({ start, end }) => {
    try {
      const free = await getAvailableSpaces({ start: toLocalIso(start), end: toLocalIso(end) });
      return new Set(free.map((space) => space.id));
    } catch {
      return new Set(spaces.map((space) => space.id)); // unknown: let the API decide on submit
    }
  },
  onChange: renderSummary,
});

function renderSummary(state) {
  const { space, price, range, available } = state;
  submitButton.disabled = !space || available === false;
  summary.replaceChildren(
    h('h2', {}, t('booking.summary')),
    space && h('div', { class: 'space-card__head' }, h('h3', {}, space.name), typeChip(space.type)),
    h('p', { class: 'muted' }, describeRange(range)),
    space && h('dl', { class: 'rate-list' },
      RATE_FIELDS.map((key) => {
        const active = key === rateKey(price.formula) ? 'is-active' : null;
        return [h('dt', { class: active }, t(`rates.${key}`)), h('dd', { class: active }, formatMoney(space[key]))];
      })),
    price && h('div', { class: 'summary__line' },
      h('span', {}, t(`formulaUnits.${price.formula}`, { n: price.quantity })),
      h('span', {}, `× ${formatMoney(price.unitPrice)}`)),
    h('div', { class: 'summary__total' },
      h('span', { class: 'field__label' }, t('booking.total')),
      h('span', { class: 'summary__amount' }, price ? formatMoney(price.total) : '—')),
    submitButton,
    h('p', { class: 'field__hint' }, t('booking.payOnSite')),
  );
}

mainElement().append(
  h('div', { class: 'inner page' },
    h('div', { class: 'page-head' },
      h('div', { class: 'page-head__text' }, h('h1', {}, t('pages.book')))),
    h('div', { class: 'split' },
      h('form', {
        id: 'booking-form',
        class: 'card',
        novalidate: true,
        onsubmit: async (event) => {
          event.preventDefault();
          form.clearErrors();
          submitButton.disabled = true;
          try {
            await createBooking(form.toRequest());
            setFlash(t('booking.created'));
            location.href = 'mes-reservations.html';
          } catch (error) {
            form.showErrors(error);
            submitButton.disabled = false;
          }
        },
      }, form.node),
      summary)),
);

form.refresh();
