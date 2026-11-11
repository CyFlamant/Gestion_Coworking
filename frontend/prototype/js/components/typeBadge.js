// Each space type has a shape and a colour: open space = circle, office = square, meeting room = star.
import { h } from '../dom.js';
import { t } from '../i18n/index.js';

const SHAPES = {
  OPENSPACE: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11"/></svg>',
  OFFICE: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="1" y="1" width="22" height="22"/></svg>',
  ROOM: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 .8l3.1 7.6 8.2.6-6.3 5.3 2 8-7-4.4-7 4.4 2-8L.7 9l8.2-.6z"/></svg>',
};

export function shapeIcon(type) {
  const span = h('span', { class: `shape shape--${type.toLowerCase()}` });
  span.innerHTML = SHAPES[type] ?? '';
  return span;
}

export function typeChip(type) {
  return h('span', { class: 'chip' }, shapeIcon(type), t(`types.${type}`));
}
