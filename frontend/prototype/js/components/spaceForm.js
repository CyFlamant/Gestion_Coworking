// Create / edit form for a space. Fields match SpaceRequest; validation is left to the API (400 + errors map).
import { RATE_FIELDS, SPACE_TYPES } from '../config.js';
import { h } from '../dom.js';
import { t } from '../i18n/index.js';
import { clearErrors, field, formAlert, input, moneyInput, numberOrNull, select, showErrors } from './form.js';

export function spaceForm({ id, space, onSubmit }) {
  const alert = formAlert();
  const nameInput = input({ id: 'space-name', type: 'text', value: space?.name ?? '', placeholder: t('adminSpaces.namePlaceholder'), autocomplete: 'off' });
  const typeSelect = select({
    id: 'space-type',
    value: space?.type ?? '',
    placeholder: t('adminSpaces.chooseType'),
    options: SPACE_TYPES.map((type) => ({ value: type, label: t(`types.${type}`) })),
  });
  const rateInputs = Object.fromEntries(RATE_FIELDS.map((key) => [key, moneyInput({ id: `space-${key}`, value: space?.[key] ?? '' })]));

  const form = h('form', {
    id,
    class: 'form',
    novalidate: true,
    onsubmit: (event) => {
      event.preventDefault();
      onSubmit(getValues());
    },
  },
  alert,
  field({ id: 'space-name', name: 'name', label: t('adminSpaces.name'), control: nameInput }),
  field({ id: 'space-type', name: 'type', label: t('adminSpaces.type'), control: typeSelect }),
  h('div', { class: 'field-row' },
    RATE_FIELDS.map((key) => field({ id: `space-${key}`, name: key, label: t(`rates.${key}`), control: rateInputs[key] }))),
  h('p', { class: 'field__hint' }, t('rates.zeroHint')));

  function getValues() {
    const values = { name: nameInput.value, type: typeSelect.value || null };
    for (const key of RATE_FIELDS) values[key] = numberOrNull(rateInputs[key].querySelector('input').value);
    return values;
  }

  return {
    node: form,
    showErrors: (error) => showErrors(form, alert, error),
    clearErrors: () => clearErrors(form, alert),
  };
}
