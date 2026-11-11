// Inscription. Mock: creates a CLIENT account and signs it in; later: auth-service (with e-mail confirmation).
import { register } from '../api.js';
import { clearErrors, field, formAlert, input, showErrors } from '../components/form.js';
import { setFlash } from '../components/toast.js';
import { h, mainElement } from '../dom.js';
import { t } from '../i18n/index.js';
import { mountLayout } from '../layout.js';

await mountLayout({ page: 'inscription', title: 'pages.signUp', roles: ['GUEST'] });

const alert = formAlert();
const inputs = {
  firstName: input({ id: 'signup-firstName', type: 'text', autocomplete: 'given-name' }),
  lastName: input({ id: 'signup-lastName', type: 'text', autocomplete: 'family-name' }),
  email: input({ id: 'signup-email', type: 'email', autocomplete: 'email' }),
  password: input({ id: 'signup-password', type: 'password', autocomplete: 'new-password' }),
  passwordConfirm: input({ id: 'signup-passwordConfirm', type: 'password', autocomplete: 'new-password' }),
};
const submitButton = h('button', { type: 'submit', class: 'btn btn--primary' }, t('signUp.submit'));
const fieldFor = (name, extra = {}) => field({ id: `signup-${name}`, name, label: t(`signUp.${name}`), control: inputs[name], ...extra });

const form = h('form', {
  class: 'form',
  novalidate: true,
  onsubmit: async (event) => {
    event.preventDefault();
    clearErrors(form, alert);
    submitButton.disabled = true;
    try {
      await register(Object.fromEntries(Object.entries(inputs).map(([name, element]) => [name, element.value])));
      setFlash(t('signUp.created'));
      location.href = 'index.html';
    } catch (error) {
      showErrors(form, alert, error);
      submitButton.disabled = false;
    }
  },
},
alert,
h('div', { class: 'field-row' }, fieldFor('firstName'), fieldFor('lastName')),
fieldFor('email'),
fieldFor('password', { hint: t('signUp.passwordHint') }),
fieldFor('passwordConfirm'),
h('div', { class: 'actions' }, submitButton));

mainElement().append(
  h('div', { class: 'inner page' },
    h('div', { class: 'card card--narrow form' },
      h('h1', {}, t('signUp.title')),
      h('p', { class: 'muted' }, t('signUp.lead')),
      form,
      h('p', {}, `${t('signUp.hasAccount')} `, h('a', { href: 'connexion.html' }, t('signUp.signInLink'))))),
);
