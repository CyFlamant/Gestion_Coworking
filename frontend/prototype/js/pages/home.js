// Accueil: guests and clients (the admin home is the bookings page, as in the mockup).
import { getSpaces } from '../api.js';
import { roleOf } from '../auth.js';
import { brand } from '../brand.js';
import { showToast } from '../components/toast.js';
import { shapeIcon } from '../components/typeBadge.js';
import { SPACE_TYPES } from '../config.js';
import { formatMoney } from '../dates.js';
import { h, mainElement } from '../dom.js';
import { t } from '../i18n/index.js';
import { mountLayout } from '../layout.js';

const user = await mountLayout({ page: 'home', title: 'pages.home', roles: ['GUEST', 'CLIENT'] });
const role = roleOf(user);

let spaces = [];
try {
  spaces = await getSpaces();
} catch (error) {
  showToast(t('common.loadError', { detail: error.detail }), 'error');
}

const ctas = role === 'CLIENT'
  ? [
    h('a', { class: 'btn btn--primary', href: 'reserver.html' }, t('home.ctaBook')),
    h('a', { class: 'btn', href: 'mes-reservations.html' }, t('home.ctaMyBookings')),
  ]
  : [
    h('a', { class: 'btn btn--primary', href: 'espaces.html' }, t('home.ctaSpaces')),
    h('a', { class: 'btn', href: 'inscription.html' }, t('home.ctaSignUp')),
  ];

function typePanel(type) {
  const ofType = spaces.filter((space) => space.type === type);
  const hourly = ofType.map((space) => Number(space.hourRate)).filter((rate) => rate > 0);
  return h('a', { class: `type-panel type-panel--${type.toLowerCase()}`, href: `espaces.html#${type.toLowerCase()}` },
    shapeIcon(type),
    h('h3', {}, t(`typesPlural.${type}`)),
    h('p', {}, t(`typesDesc.${type}`)),
    h('p', { class: 'type-panel__meta' },
      t('home.spacesCount', { n: ofType.length }),
      hourly.length ? ` · ${t('home.fromPrice', { price: formatMoney(Math.min(...hourly)) })}` : ''),
    h('span', { class: 'link-arrow' }, t('home.seeAvailability')));
}

mainElement().append(
  h('section', { class: 'hero' },
    h('div', { class: 'inner hero__inner' },
      h('p', { class: 'eyebrow' }, brand.name),
      h('h1', { class: 'hero__title' }, t('home.title')),
      h('p', { class: 'lead' }, t('home.lead')),
      h('div', { class: 'actions' }, ctas))),
  h('section', { class: 'inner section' },
    h('h2', {}, t('home.spacesTitle')),
    h('div', { class: 'type-panels' }, SPACE_TYPES.map(typePanel))),
  h('section', { class: 'inner section' },
    h('h2', {}, t('home.howTitle')),
    h('ol', { class: 'steps' },
      [1, 2, 3].map((n) => h('li', {}, h('h3', {}, t(`home.step${n}Title`)), h('p', {}, t(`home.step${n}`)))))),
);
