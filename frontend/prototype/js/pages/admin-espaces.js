// Espaces (admin): list, create, update and delete spaces with their rates.
import { createSpace, deleteSpace, getBookings, getSpaces, updateSpace } from '../api.js';
import { confirmDialog, openDialog } from '../components/dialog.js';
import { segmented } from '../components/form.js';
import { spaceForm } from '../components/spaceForm.js';
import { showToast } from '../components/toast.js';
import { shapeIcon, typeChip } from '../components/typeBadge.js';
import { RATE_FIELDS, SPACE_TYPES } from '../config.js';
import { formatMoney } from '../dates.js';
import { h, mainElement } from '../dom.js';
import { t } from '../i18n/index.js';
import { mountLayout } from '../layout.js';

await mountLayout({ page: 'admin-espaces', title: 'pages.adminSpaces', roles: ['ADMIN'] });

let spaces = [];
let bookingCounts = new Map();
let selectedType = 'ALL';
const count = h('p', { class: 'muted' });
const tableArea = h('div', { 'aria-live': 'polite' });

mainElement().append(
  h('div', { class: 'inner page' },
    h('div', { class: 'page-head' },
      h('div', { class: 'page-head__text' },
        h('h1', {}, t('pages.adminSpaces')),
        h('p', { class: 'lead' }, t('adminSpaces.lead'))),
      h('button', { type: 'button', class: 'btn btn--primary', onclick: () => openSpaceDialog(null) }, t('adminSpaces.add'))),
    h('div', { class: 'toolbar' },
      segmented({
        name: 'space-type-filter',
        value: selectedType,
        options: [
          { value: 'ALL', label: t('common.all') },
          ...SPACE_TYPES.map((type) => ({ value: type, label: t(`typesPlural.${type}`), icon: shapeIcon(type) })),
        ],
        onChange: (type) => {
          selectedType = type;
          render();
        },
      }),
      count),
    tableArea),
);

function render() {
  const shown = spaces
    .filter((space) => selectedType === 'ALL' || space.type === selectedType)
    .sort((a, b) => SPACE_TYPES.indexOf(a.type) - SPACE_TYPES.indexOf(b.type) || a.name.localeCompare(b.name, 'fr', { numeric: true }));
  count.textContent = t('adminSpaces.count', { n: shown.length });

  if (!shown.length) {
    tableArea.replaceChildren(h('div', { class: 'empty' },
      h('p', {}, t('adminSpaces.empty')),
      h('button', { type: 'button', class: 'btn', onclick: () => openSpaceDialog(null) }, t('adminSpaces.add'))));
    return;
  }

  tableArea.replaceChildren(h('div', { class: 'table-wrap' },
    h('table', { class: 'table' },
      h('thead', {}, h('tr', {},
        h('th', { scope: 'col' }, t('adminSpaces.colSpace')),
        h('th', { scope: 'col' }, t('adminSpaces.colType')),
        RATE_FIELDS.map((key) => h('th', { scope: 'col', class: 'num' }, t(`rates.${key}`))),
        h('th', { scope: 'col', class: 'num' }, t('adminSpaces.colBookings')),
        h('th', { scope: 'col' }, h('span', { class: 'visually-hidden' }, 'Actions')))),
      h('tbody', {}, shown.map((space) => h('tr', {},
        h('td', {}, h('span', { class: 'table__name' }, shapeIcon(space.type), space.name)),
        h('td', {}, typeChip(space.type)),
        RATE_FIELDS.map((key) => h('td', { class: 'num' }, Number(space[key]) > 0 ? formatMoney(space[key]) : t('common.notOffered'))),
        h('td', { class: 'num' }, bookingCounts.get(space.id) ?? 0),
        h('td', {}, h('div', { class: 'table__actions' },
          h('button', { type: 'button', class: 'btn btn--small', onclick: () => openSpaceDialog(space) }, t('common.edit')),
          h('button', { type: 'button', class: 'btn btn--small btn--danger', onclick: () => removeSpace(space) }, t('common.delete')))))))),
  ));
}

function openSpaceDialog(space) {
  const formId = 'space-form';
  let saveButton;
  const form = spaceForm({
    id: formId,
    space,
    onSubmit: async (values) => {
      form.clearErrors();
      saveButton.disabled = true;
      try {
        const saved = space ? await updateSpace(space.id, values) : await createSpace(values);
        dialog.close();
        showToast(t(space ? 'adminSpaces.updated' : 'adminSpaces.created', { name: saved.name }));
        await load();
      } catch (error) {
        form.showErrors(error);
      } finally {
        saveButton.disabled = false;
      }
    },
  });
  const dialog = openDialog({
    title: t(space ? 'adminSpaces.editTitle' : 'adminSpaces.newTitle'),
    body: form.node,
    actions: (close) => [
      h('button', { type: 'button', class: 'btn btn--ghost', onclick: close }, t('common.cancel')),
      saveButton = h('button', { type: 'submit', class: 'btn btn--primary', form: formId }, t('common.save')),
    ],
  });
  form.node.querySelector('input')?.focus();
}

async function removeSpace(space) {
  const confirmed = await confirmDialog({
    title: t('adminSpaces.deleteTitle', { name: space.name }),
    message: t('adminSpaces.deleteMessage'),
    confirmLabel: t('common.delete'),
    danger: true,
  });
  if (!confirmed) return;
  try {
    await deleteSpace(space.id);
    showToast(t('adminSpaces.deleted', { name: space.name }));
    await load();
  } catch (error) {
    // e.g. 500 "Impossible de supprimer l'espace 3 : il a des réservations"
    showToast(error.detail ?? String(error), 'error');
  }
}

async function load() {
  try {
    spaces = await getSpaces();
  } catch (error) {
    showToast(t('common.loadError', { detail: error.detail }), 'error');
  }
  try {
    const bookings = await getBookings();
    bookingCounts = new Map();
    for (const booking of bookings) bookingCounts.set(booking.spaceId, (bookingCounts.get(booking.spaceId) ?? 0) + 1);
  } catch {
    bookingCounts = new Map(); // real mode: bookings API not available yet
  }
  render();
}

await load();
