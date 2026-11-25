// Translation lookup. Only French exists for now; the language switch is visual only.
import fr from './fr.js';

const dictionaries = { fr };

export const LANGUAGES = ['fr', 'nl', 'en'];
let currentLanguage = 'fr';

export function getLanguage() {
  return currentLanguage;
}

// t('home.spacesCount', { n: 3 }) → '3 espace(s)'. A missing key is returned as is, so it shows up on screen.
export function t(key, params = {}) {
  const text = key.split('.').reduce((node, part) => node?.[part], dictionaries[currentLanguage]);
  if (typeof text !== 'string') return key;
  return text.replace(/\{(\w+)\}/g, (match, name) => (name in params ? String(params[name]) : match));
}
