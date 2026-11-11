// Modal dialog on the native <dialog> element. The browser's confirm() is not used (blocked in some viewers).
import { h, uid } from '../dom.js';
import { t } from '../i18n/index.js';

// actions: (close) => [buttons]
export function openDialog({ title, body, actions, onClose }) {
  const titleId = uid('dialog-title');
  const dialog = h('dialog', { class: 'dialog', 'aria-labelledby': titleId });
  const close = () => dialog.close();
  dialog.append(
    h('div', { class: 'dialog__head' },
      h('h2', { id: titleId }, title),
      h('button', { type: 'button', class: 'icon-btn', 'aria-label': t('common.close'), onclick: close }, '×'),
    ),
    h('div', { class: 'dialog__body' }, body),
    h('div', { class: 'dialog__actions' }, actions(close)),
  );
  dialog.addEventListener('close', () => {
    dialog.remove();
    onClose?.();
  });
  document.body.append(dialog);
  dialog.showModal();
  return { dialog, close };
}

// Resolves to true when the user confirms.
export function confirmDialog({ title, message, confirmLabel, cancelLabel = t('common.cancel'), danger = false }) {
  return new Promise((resolve) => {
    let confirmed = false;
    openDialog({
      title,
      body: h('p', {}, message),
      actions: (close) => [
        h('button', { type: 'button', class: 'btn btn--ghost', onclick: close }, cancelLabel),
        h('button', {
          type: 'button',
          class: danger ? 'btn btn--danger' : 'btn btn--primary',
          onclick: () => {
            confirmed = true;
            close();
          },
        }, confirmLabel),
      ],
      onClose: () => resolve(confirmed),
    });
  });
}
