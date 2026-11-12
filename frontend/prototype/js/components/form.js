// Form building blocks. A field's `name` matches the API field, so server errors land on the right field.
import { ApiError } from '../api.js';
import { h } from '../dom.js';

export function field({ id, name = id, label, control, hint, group = false }) {
  // A group of radios gets a fieldset/legend instead of a label.
  const labelElement = group
    ? h('legend', { class: 'field__label' }, label)
    : h('label', { class: 'field__label', htmlFor: id }, label);
  return h(group ? 'fieldset' : 'div', { class: 'field', dataset: { field: name } },
    labelElement,
    control,
    hint && h('p', { class: 'field__hint' }, hint),
    h('p', { class: 'field__error', id: `${id}-error`, hidden: true }),
  );
}

export function input(props) {
  return h('input', { class: 'input', ...props });
}

export function select({ options, value, placeholder, ...props }) {
  return h('select', { class: 'select', ...props },
    placeholder != null && h('option', { value: '', selected: value == null || value === '' }, placeholder),
    options.map((option) => h('option', {
      value: option.value,
      selected: String(option.value) === String(value ?? ''),
      disabled: option.disabled,
    }, option.label)),
  );
}

export function moneyInput(props) {
  return h('div', { class: 'input-suffix' },
    input({ type: 'number', inputMode: 'decimal', min: '0', step: 'any', ...props }),
    h('span', { class: 'input-suffix__text', 'aria-hidden': 'true' }, '€'),
  );
}

export function segmented({ name, options, value, onChange }) {
  return h('div', { class: 'segmented' },
    options.map((option) => h('label', { class: 'segmented__option' },
      h('input', {
        type: 'radio',
        name,
        value: option.value,
        checked: option.value === value,
        onchange: () => onChange(option.value),
      }),
      h('span', {}, option.icon, option.label),
    )),
  );
}

export function formAlert() {
  return h('div', { class: 'alert alert--error', role: 'alert', hidden: true });
}

// Shows field errors from a 400 (ProblemDetail.errors) and the detail in the form alert otherwise.
export function showErrors(root, alertElement, error) {
  const errors = error instanceof ApiError ? error.errors : {};
  let shown = 0;
  root.querySelectorAll('.field[data-field]').forEach((fieldElement) => {
    const message = errors[fieldElement.dataset.field];
    setFieldError(fieldElement, message);
    if (message) shown += 1;
  });
  const detail = error instanceof ApiError ? error.detail : String(error?.message ?? error);
  if (alertElement) {
    alertElement.textContent = shown ? '' : detail;
    alertElement.hidden = shown > 0;
  }
  root.querySelector('.field--invalid input, .field--invalid select')?.focus();
}

export function clearErrors(root, alertElement) {
  root.querySelectorAll('.field[data-field]').forEach((fieldElement) => setFieldError(fieldElement, null));
  if (alertElement) alertElement.hidden = true;
}

export function setFieldError(fieldElement, message) {
  const errorElement = fieldElement.querySelector(':scope > .field__error');
  const control = fieldElement.querySelector('input, select');
  errorElement.textContent = message ?? '';
  errorElement.hidden = !message;
  fieldElement.classList.toggle('field--invalid', Boolean(message));
  if (control) {
    control.setAttribute('aria-invalid', message ? 'true' : 'false');
    if (message) control.setAttribute('aria-describedby', errorElement.id);
    else control.removeAttribute('aria-describedby');
  }
}

export function numberOrNull(value) {
  return value === '' ? null : Number(value);
}
