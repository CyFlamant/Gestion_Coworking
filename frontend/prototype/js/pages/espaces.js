// Espaces disponibles: catalogue with rates + availability search (guests and clients).
import { getAvailableSpaces, getSpaces } from '../api.js';
import { roleOf } from '../auth.js';
import { segmented } from '../components/form.js';
import { describeRange, slotFields } from '../components/slotFields.js';
import { showToast } from '../components/toast.js';
import { shapeIcon, typeChip } from '../components/typeBadge.js';
import { RATE_FIELDS, SPACE_TYPES } from '../config.js';
import { addDays, formatMoney, toLocalIso, today } from '../dates.js';
import { h, mainElement } from '../dom.js';
import { t } from '../i18n/index.js';
import { mountLayout } from '../layout.js';
import { computePrice, rateKey } from '../pricing.js';
import { saveDraft } from './draft.js';

const user = await mountLayout({ page: 'espaces', title: 'pages.spaces', roles: ['GUEST', 'CLIENT'] });
const role = roleOf(user);

const typeFromHash = SPACE_TYPES.find((type) => type.toLowerCase() === location.hash.slice(1));
let selectedType = typeFromHash ?? 'ALL';
let spaces = [];
let available = new Set();
let requestCount = 0;

const results = h('div', { class: 'space-grid', 'aria-live': 'polite' });
const resultsHead = h('p', { class: 'muted' });

const slot = slotFields({
  idPrefix: 'search',
  values: { formula: 'DAY', date: addDays(today(), 1), startHour: 9, hours: 2, halfDay: 'MORNING' },
  minDate: today(),
  onChange: () => search(),
});

const typeFilter = segmented({
  name: 'type-filter',
  value: selectedType,
  options: [
    { value: 'ALL', label: t('common.all') },
    ...SPACE_TYPES.map((type) => ({ value: type, label: t(`typesPlural.${type}`), icon: shapeIcon(type) })),
  ],
  onChange: (type) => {
    selectedType = type;
    try {
      history.replaceState(null, '', type === 'ALL' ? location.pathname : `#${type.toLowerCase()}`);
    } catch {
      // Some embedded viewers refuse URL changes; the filter still works.
    }
    render();
  },
});

mainElement().append(
  h('div', { class: 'inner page' },
    h('div', { class: 'page-head' },
      h('div', { class: 'page-head__text' },
        h('h1', {}, t('pages.spaces')),
        h('p', { class: 'lead' }, t('spaces.lead')))),
    h('div', { class: 'card form' },
      h('fieldset', { class: 'field' }, h('legend', { class: 'field__label' }, t('spaces.filterType')), typeFilter),
      slot.node),
    resultsHead,
    results),
);

async function search() {
  const request = ++requestCount;
  const { start, end } = slot.getRange();
  try {
    const free = await getAvailableSpaces({ start: toLocalIso(start), end: toLocalIso(end) });
    if (request !== requestCount) return;
    available = new Set(free.map((space) => space.id));
  } catch (error) {
    showToast(error.detail ?? String(error), 'error');
    available = new Set(spaces.map((space) => space.id)); // real mode: the search endpoint does not exist yet
  }
  render();
}

function spaceCard(space) {
  const { start, end } = slot.getRange();
  const price = computePrice(space, start, end);
  const isFree = available.has(space.id);
  let status = h('span', { class: 'status status--ok' }, t('spaces.available'));
  if (!price.offered) status = h('span', { class: 'status status--off' }, t('spaces.notOffered'));
  else if (!isFree) status = h('span', { class: 'status status--busy' }, t('spaces.busy'));
  const bookable = price.offered && isFree;

  let action = null;
  if (bookable && role === 'CLIENT') {
    action = h('button', {
      type: 'button',
      class: 'btn btn--primary btn--small',
      onclick: () => {
        saveDraft({ spaceId: space.id, type: space.type, ...slot.getValues() });
        location.href = 'reserver.html';
      },
    }, t('spaces.book'));
  } else if (bookable) {
    action = h('a', { class: 'btn btn--small', href: 'connexion.html' }, t('spaces.signInToBook'));
  }

  return h('article', { class: 'card space-card' },
    h('div', { class: 'space-card__head' },
      h('h2', { class: 'space-card__name' }, shapeIcon(space.type), space.name),
      typeChip(space.type)),
    h('dl', { class: 'rate-list' },
      RATE_FIELDS.map((key) => {
        const rate = Number(space[key]);
        const active = key === rateKey(price.formula) ? 'is-active' : null;
        return [
          h('dt', { class: active }, t(`rates.${key}`)),
          h('dd', { class: active }, rate > 0 ? formatMoney(rate) : t('common.notOffered')),
        ];
      })),
    status,
    h('div', { class: 'space-card__foot' },
      h('div', {},
        h('p', { class: 'field__hint' }, t('spaces.priceForSlot')),
        h('p', { class: 'space-card__price' }, price.offered ? formatMoney(price.total) : '—')),
      action));
}

function render() {
  const shown = spaces.filter((space) => selectedType === 'ALL' || space.type === selectedType);
  const freeCount = shown.filter((space) => {
    const { start, end } = slot.getRange();
    return available.has(space.id) && computePrice(space, start, end).offered;
  }).length;
  resultsHead.textContent = `${t('spaces.resultsFor', { slot: describeRange(slot.getRange()) })} · ${t('spaces.resultsCount', { available: freeCount, total: shown.length })}`;
  results.replaceChildren(...(shown.length
    ? shown.map(spaceCard)
    : [h('p', { class: 'empty' }, t('spaces.none'))]));
}

try {
  spaces = await getSpaces();
} catch (error) {
  showToast(t('common.loadError', { detail: error.detail }), 'error');
}
await search();
