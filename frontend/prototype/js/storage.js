// Browser storage can be missing or throw (private mode, blocked site data); never let that break a page.
// `area` is 'localStorage' or 'sessionStorage'; it is looked up inside the try because the lookup itself can throw.

function read(area, key) {
  try {
    const raw = window[area].getItem(key);
    return raw == null ? null : JSON.parse(raw);
  } catch {
    return null;
  }
}

function write(area, key, value) {
  try {
    if (value == null) window[area].removeItem(key);
    else window[area].setItem(key, JSON.stringify(value));
  } catch {
    // Ignored: the prototype still works for the current page.
  }
}

export const readLocal = (key) => read('localStorage', key);
export const writeLocal = (key, value) => write('localStorage', key, value);
export const readSession = (key) => read('sessionStorage', key);
export const writeSession = (key, value) => write('sessionStorage', key, value);
