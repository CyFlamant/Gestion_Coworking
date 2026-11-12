// Placeholder pages (Mentions légales, Contact, Horaires). The page key comes from <body data-page>.
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

// Mentions légales: one heading and text per section (stubs.legal in fr.js).
const LEGAL_SECTIONS = ['editor', 'host', 'data', 'student'];

const content = key === 'legal'
  ? LEGAL_SECTIONS.map((section) => h('section', { class: 'stub__section' },
    h('h2', {}, t(`stubs.legal.${section}Title`)),
    h('p', { class: 'stub__text' }, t(`stubs.legal.${section}`))))
  // The contact text is a postal address; \n in the text starts a new line (.stub__text).
  : h(key === 'contact' ? 'address' : 'p', { class: 'lead stub__text' }, t(`stubs.${key}`));

mainElement().append(
  h('div', { class: 'inner page' },
    h('div', { class: 'page-head__text' },
      h('h1', {}, t(`pages.${key}`)),
      key !== 'legal' && content),
    key === 'legal' && content),
);
