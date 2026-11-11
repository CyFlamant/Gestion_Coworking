// Short confirmation or error messages. A "flash" survives one page change (e.g. after a redirect).
import { h } from '../dom.js';
import { readSession, writeSession } from '../storage.js';

const FLASH_KEY = 'proto.flash';

function container() {
  let element = document.querySelector('.toasts');
  if (!element) {
    element = h('div', { class: 'toasts', role: 'status', 'aria-live': 'polite' });
    document.body.append(element);
  }
  return element;
}

export function showToast(message, kind = 'info') {
  const toast = h('div', { class: `toast toast--${kind}` }, message);
  container().append(toast);
  setTimeout(() => toast.remove(), kind === 'error' ? 7000 : 3500);
}

export function setFlash(message, kind = 'info') {
  writeSession(FLASH_KEY, { message, kind });
}

export function showFlash() {
  const flash = readSession(FLASH_KEY);
  if (flash) {
    writeSession(FLASH_KEY, null);
    showToast(flash.message, flash.kind);
  }
}
