// Placeholder pages (Mentions légales, Contact, Horaires). The page key comes from <body data-page>.
import { OPENING_HOURS, SLOTS } from '../config.js';
import { formatHour } from '../dates.js';
import { h, mainElement } from '../dom.js';
import { t } from '../i18n/index.js';
import { mountLayout } from '../layout.js';

const PAGES = {
  'mentions-legales': 'legal',
  contact: 'contact',
  horaires: 'hours',
};

const page = document.body.dataset.page;
const key = PAGES[page];
await mountLayout({ page, title: `pages.${key}` });

const range = ({ start, end }) => `${formatHour(start)} – ${formatHour(end)}`;

mainElement().append(
  h('div', { class: 'inner page' },
    h('div', { class: 'page-head__text' },
      h('p', { class: 'eyebrow' }, t('stubs.soon')),
      h('h1', {}, t(`pages.${key}`)),
      h('p', { class: 'lead' }, t(`stubs.${key}`))),
    key === 'hours' && h('p', { class: 'demo-note' }, t('stubs.hoursPrototype', {
      open: formatHour(OPENING_HOURS.open),
      close: formatHour(OPENING_HOURS.close),
      morning: range(SLOTS.MORNING),
      afternoon: range(SLOTS.AFTERNOON),
      day: range(SLOTS.DAY),
    }))),
);
