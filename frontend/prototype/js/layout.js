// Page shell: header with role-based navigation, language switch, footer and the prototype dev bar.
// Future React <Layout> + route guard.
import { logout } from './api.js';
import { getCurrentUser, roleOf } from './auth.js';
import { brand } from './brand.js';
import { showFlash, setFlash, showToast } from './components/toast.js';
import { getApiMode, setApiMode } from './config.js';
import { h } from './dom.js';
import { getLanguage, LANGUAGES, t } from './i18n/index.js';
import { DEMO_ADMIN_ID, DEMO_CLIENT_ID, getDb, resetDb, setSessionUserId } from './mock/db.js';

const NAV = {
  GUEST: [
    { page: 'espaces', href: 'espaces.html', label: 'nav.spaces' },
    { page: 'connexion', href: 'connexion.html', label: 'nav.signIn', also: ['inscription'] },
  ],
  CLIENT: [
    { page: 'reserver', href: 'reserver.html', label: 'nav.book' },
    { page: 'mes-reservations', href: 'mes-reservations.html', label: 'nav.myBookings' },
  ],
  ADMIN: [
    { page: 'admin-reservations', href: 'admin-reservations.html', label: 'nav.adminBookings' },
    { page: 'admin-espaces', href: 'admin-espaces.html', label: 'nav.adminSpaces' },
  ],
};

export const HOME_BY_ROLE = {
  GUEST: 'index.html',
  CLIENT: 'index.html',
  ADMIN: 'admin-reservations.html',
};

/*
 * page:  key of the current page (highlights the nav item)
 * title: i18n key for the document title
 * roles: roles allowed on this page (null = everyone); others are sent to their home page
 * Returns the current user ({ id, role, firstName }) or null for a guest.
 */
export async function mountLayout({ page, title, roles = null }) {
  let user = null;
  let loadError = null;
  try {
    user = await getCurrentUser();
  } catch (error) {
    loadError = error; // backend unreachable in real mode: carry on as a guest
  }
  const role = roleOf(user);
  if (roles && !roles.includes(role)) {
    location.replace(HOME_BY_ROLE[role]);
    return new Promise(() => {}); // stop the page script while the browser navigates
  }

  document.title = `${t(title)} · ${brand.name}`;
  document.body.prepend(header(user, page));
  document.body.append(footer(), devBar(role));
  showFlash();
  if (loadError) showToast(loadError.detail ?? loadError.message, 'error');
  return user;
}

const USER_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>';

// Icon + first name of the signed-in user. The real /api/me has no firstName yet: icon only.
function userBadge(user) {
  const icon = h('span', { class: 'user-badge__icon' });
  icon.innerHTML = USER_ICON;
  return h('span', { class: 'user-badge' }, icon, user.firstName);
}

function header(user, page) {
  const role = roleOf(user);
  const nav = h('nav', { class: 'site-nav', id: 'site-nav', 'aria-label': t('nav.main') },
    h('ul', { class: 'site-nav__list' },
      NAV[role].map((item) => h('li', {},
        h('a', {
          class: 'site-nav__link',
          href: item.href,
          'aria-current': item.page === page || item.also?.includes(page) ? 'page' : null,
        }, t(item.label)))),
      user && h('li', {}, userBadge(user)),
      role !== 'GUEST' && h('li', {},
        h('button', { type: 'button', class: 'site-nav__link', onclick: signOut }, t('nav.logout'))),
    ),
  );

  const toggle = h('button', {
    type: 'button',
    class: 'btn btn--small nav-toggle',
    'aria-expanded': 'false',
    'aria-controls': 'site-nav',
    onclick: () => {
      const open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    },
  }, t('nav.menu'));

  return h('header', { class: 'site-header' },
    h('div', { class: 'inner site-header__inner' },
      h('a', { class: 'brand', href: 'index.html' },
        brand.logo
          ? h('img', { class: 'brand__logo', src: brand.logo, alt: brand.name })
          : h('span', { class: 'brand__wordmark' }, brand.name),
        h('span', { class: 'brand__tagline' }, brand.tagline)),
      toggle,
      nav,
      languageSwitch()));
}

// Visual only for now: French is the only language.
function languageSwitch() {
  return h('div', { class: 'lang-switch', role: 'group', 'aria-label': t('nav.language') },
    LANGUAGES.map((lang) => h('button', {
      type: 'button',
      class: 'lang-switch__btn',
      lang,
      'aria-pressed': lang === getLanguage() ? 'true' : 'false',
      title: lang === getLanguage() ? null : t('nav.languageSoon'),
    }, lang.toUpperCase())));
}

async function signOut() {
  try {
    await logout();
  } catch {
    // No auth-service yet in real mode: nothing to sign out from.
  }
  setFlash(t('logout.done'));
  location.href = 'index.html';
}

function footer() {
  return h('footer', { class: 'site-footer' },
    h('div', { class: 'inner site-footer__inner' },
      h('ul', { class: 'site-footer__links' },
        h('li', {}, h('a', { href: 'mentions-legales.html' }, t('footer.legal'))),
        h('li', {}, h('a', { href: 'contact.html' }, t('footer.contact'))),
        h('li', {}, h('a', { href: 'horaires.html' }, t('footer.hours')))),
      h('p', { class: 'muted' }, `© ${new Date().getFullYear()} ${brand.name}`)));
}

// Prototype-only panel: switch the simulated role and data source. Not part of the future app.
function devBar(role) {
  const mock = getApiMode() === 'mock';
  const users = getDb().users;
  const nameOf = (id) => users.find((u) => u.id === id)?.firstName ?? '';
  const sessionByRole = { GUEST: null, CLIENT: DEMO_CLIENT_ID, ADMIN: DEMO_ADMIN_ID };

  const roleSelect = h('select', {
    class: 'select',
    id: 'devbar-role',
    disabled: !mock,
    onchange: (event) => {
      setSessionUserId(sessionByRole[event.target.value]);
      location.href = HOME_BY_ROLE[event.target.value];
    },
  },
  h('option', { value: 'GUEST', selected: role === 'GUEST' }, t('devbar.roleGuest')),
  h('option', { value: 'CLIENT', selected: role === 'CLIENT' }, t('devbar.roleClient', { name: nameOf(DEMO_CLIENT_ID) })),
  h('option', { value: 'ADMIN', selected: role === 'ADMIN' }, t('devbar.roleAdmin', { name: nameOf(DEMO_ADMIN_ID) })));

  const modeSelect = h('select', {
    class: 'select',
    id: 'devbar-mode',
    onchange: (event) => {
      setApiMode(event.target.value);
      location.reload();
    },
  },
  h('option', { value: 'mock', selected: mock }, t('devbar.modeMock')),
  h('option', { value: 'real', selected: !mock }, t('devbar.modeReal')));

  return h('details', { class: 'devbar' },
    h('summary', {}, `${t('devbar.title')} · ${t(`devbar.short.${role}`)}`),
    h('div', { class: 'devbar__body' },
      h('div', { class: 'field' }, h('label', { class: 'field__label', htmlFor: 'devbar-role' }, t('devbar.role')), roleSelect),
      h('div', { class: 'field' }, h('label', { class: 'field__label', htmlFor: 'devbar-mode' }, t('devbar.mode')), modeSelect),
      !mock && h('p', { class: 'devbar__note' }, t('devbar.realNote')),
      mock && h('button', {
        type: 'button',
        class: 'btn btn--small',
        onclick: () => {
          resetDb();
          location.href = 'index.html';
        },
      }, t('devbar.reset'))));
}
