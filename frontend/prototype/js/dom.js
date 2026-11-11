// h('button', { class: 'btn', onclick }, 'Label') builds a DOM element. It plays the role JSX will play in React.
export function h(tag, props = {}, ...children) {
  const element = document.createElement(tag);
  for (const [key, value] of Object.entries(props ?? {})) {
    if (value == null || value === false) continue;
    if (key === 'class') element.className = value;
    else if (key === 'dataset') Object.assign(element.dataset, value);
    else if (key.startsWith('on') && typeof value === 'function') element.addEventListener(key.slice(2), value);
    else if (key.includes('-') || key === 'form' || key === 'list' || !(key in element)) {
      element.setAttribute(key, value === true ? '' : value);
    } else element[key] = value;
  }
  append(element, children);
  return element;
}

export function append(element, children) {
  for (const child of [children].flat(Infinity)) {
    if (child == null || child === false) continue;
    element.append(child instanceof Node ? child : String(child));
  }
  return element;
}

// Mount point for a page: <main id="main">.
export function mainElement() {
  return document.getElementById('main');
}

let idCounter = 0;
export function uid(prefix) {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}
