// Booking form: (client, for admins) + space type + space + slot. Used by "Réserver" and the admin booking dialog.
// checkAvailability(range) → Promise<Set<spaceId>> of free spaces; the page decides where that comes from.
import { SPACE_TYPES } from '../config.js';
import { toLocalIso } from '../dates.js';
import { h } from '../dom.js';
import { t } from '../i18n/index.js';
import { computePrice } from '../pricing.js';
import { clearErrors, field, formAlert, segmented, select, setFieldError, showErrors } from './form.js';
import { slotFields } from './slotFields.js';
import { shapeIcon } from './typeBadge.js';

export function bookingForm({ idPrefix, spaces, clients = null, initial, minDate, checkAvailability, onChange }) {
  const state = {
    type: initial.type ?? spaces.find((s) => s.id === initial.spaceId)?.type ?? SPACE_TYPES[0],
    spaceId: initial.spaceId ?? null,
    userId: initial.userId ?? '',
  };
  let available = null;
  let requestCount = 0;
  // Until the user picks a space, a busy one is swapped for the first free one of the same type.
  let spaceChosen = initial.spaceId != null;
  const alert = formAlert();

  const slot = slotFields({ idPrefix, values: initial, minDate, onChange: () => refresh() });

  const spaceSelect = h('select', {
    class: 'select',
    id: `${idPrefix}-space`,
    onchange: (event) => {
      state.spaceId = Number(event.target.value);
      spaceChosen = true;
      notify();
    },
  });
  const spaceField = field({ id: `${idPrefix}-space`, name: 'spaceId', label: t('booking.space'), control: spaceSelect });

  function renderSpaceOptions() {
    const ofType = spaces.filter((space) => space.type === state.type);
    if (!ofType.some((space) => space.id === state.spaceId)) state.spaceId = ofType[0]?.id ?? null;
    spaceSelect.replaceChildren(...ofType.map((space) => {
      let label = space.name;
      if (available && !available.has(space.id)) label = t('booking.optionBusy', { name: space.name });
      return h('option', { value: space.id, selected: space.id === state.spaceId }, label);
    }));
    if (!ofType.length) spaceSelect.append(h('option', { value: '' }, t('booking.noSpace')));
    spaceSelect.disabled = !ofType.length;
  }

  function getState() {
    const space = spaces.find((s) => s.id === state.spaceId) ?? null;
    const range = slot.getRange();
    return {
      space,
      userId: state.userId,
      range,
      price: space ? computePrice(space, range.start, range.end) : null,
      available: space && available ? available.has(space.id) : null,
      values: slot.getValues(),
    };
  }

  function notify() {
    const current = getState();
    let warning = null;
    if (current.available === false) warning = t('booking.spaceBusy');
    setFieldError(spaceField, warning);
    onChange?.(current);
  }

  async function refresh() {
    renderSpaceOptions();
    notify();
    const request = ++requestCount;
    const result = await checkAvailability(slot.getRange());
    if (request !== requestCount) return; // a newer change is already being checked
    available = result;
    if (!spaceChosen && !available.has(state.spaceId)) {
      const free = spaces.find((s) => s.type === state.type && available.has(s.id));
      if (free) state.spaceId = free.id;
    }
    renderSpaceOptions();
    notify();
  }

  const node = h('div', { class: 'form' },
    alert,
    clients && field({
      id: `${idPrefix}-client`,
      name: 'userId',
      label: t('booking.client'),
      control: select({
        id: `${idPrefix}-client`,
        value: state.userId,
        placeholder: t('booking.chooseClient'),
        options: clients.map((c) => ({ value: c.id, label: `${c.firstName} ${c.lastName} (${c.email})` })),
        onchange: (event) => {
          state.userId = event.target.value;
        },
      }),
    }),
    field({
      id: `${idPrefix}-type`,
      name: 'type',
      label: t('booking.type'),
      group: true,
      control: segmented({
        name: `${idPrefix}-type`,
        value: state.type,
        options: SPACE_TYPES.map((type) => ({ value: type, label: t(`types.${type}`), icon: shapeIcon(type) })),
        onChange: (type) => {
          state.type = type;
          refresh();
        },
      }),
    }),
    spaceField,
    slot.node,
  );

  return {
    node,
    refresh,
    getState,
    toRequest() {
      const { range } = getState();
      return {
        spaceId: state.spaceId,
        ...(clients ? { userId: state.userId || null } : {}),
        startDateTime: toLocalIso(range.start),
        endDateTime: toLocalIso(range.end),
      };
    },
    showErrors: (error) => showErrors(node, alert, error),
    clearErrors: () => clearErrors(node, alert),
  };
}
