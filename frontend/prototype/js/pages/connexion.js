// Connexion. Mock: checks the demo accounts; later: auth-service returns a JWT.
import { login } from '../api.js';
import { clearErrors, field, formAlert, input, showErrors } from '../components/form.js';
import { setFlash } from '../components/toast.js';
import { h, mainElement } from '../dom.js';
import { t } from '../i18n/index.js';
import { HOME_BY_ROLE, mountLayout } from '../layout.js';
import { DEMO_PASSWORD, getDb } from '../mock/db.js';

await mountLayout({ page: 'connexion', title: 'pages.signIn', roles: ['GUEST'] });

const alert = formAlert();
const emailInput = input({ id: 'signin-email', type: 'email', autocomplete: 'email' });
const passwordInput = input({ id: 'signin-password', type: 'password', autocomplete: 'current-password' });
const submitButton = h('button', { type: 'submit', class: 'btn btn--primary' }, t('signIn.submit'));

const form = h('form', {
  class: 'form',
  novalidate: true,
  onsubmit: async (event) => {
    event.preventDefault();
    clearErrors(form, alert);
    submitButton.disabled = true;
    try {
      const user = await login({ email: emailInput.value, password: passwordInput.value });
      setFlash(t('signIn.welcome'));
      location.href = HOME_BY_ROLE[user.role];
    } catch (error) {
      showErrors(form, alert, error);
      submitButton.disabled = false;
    }
  },
},
alert,
field({ id: 'signin-email', name: 'email', label: t('signIn.email'), control: emailInput }),
field({ id: 'signin-password', name: 'password', label: t('signIn.password'), control: passwordInput }),
h('div', { class: 'actions' }, submitButton));

const fill = (email) => {
  emailInput.value = email;
  passwordInput.value = DEMO_PASSWORD;
};
const demoEmail = (role) => getDb().users.find((user) => user.role === role)?.email;

mainElement().append(
  h('div', { class: 'inner page' },
    h('div', { class: 'card card--narrow form' },
      h('h1', {}, t('signIn.title')),
      h('p', { class: 'muted' }, t('signIn.lead')),
      form,
      h('p', {}, `${t('signIn.noAccount')} `, h('a', { href: 'inscription.html' }, t('signIn.signUpLink')))),
    h('aside', { class: 'demo-note card--narrow' },
      h('h2', { class: 'field__label' }, t('signIn.demoTitle')),
      h('p', {}, `${demoEmail('CLIENT')} · ${demoEmail('ADMIN')}`),
      h('p', {}, t('signIn.demoText', { password: DEMO_PASSWORD })),
      h('div', { class: 'actions' },
        h('button', { type: 'button', class: 'btn btn--small', onclick: () => fill(demoEmail('CLIENT')) }, t('signIn.demoClient')),
        h('button', { type: 'button', class: 'btn btn--small', onclick: () => fill(demoEmail('ADMIN')) }, t('signIn.demoAdmin'))))),
);
