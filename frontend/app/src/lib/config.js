import { readLocal, writeLocal } from './storage.js';

// Set per environment in frontend/app/.env.development, .env.production and .env.test ('mock' or 'real').
export const API_MODE = import.meta.env.VITE_API_MODE;
export const APP_SERVICE_URL = import.meta.env.VITE_APP_SERVICE_URL; // app-service
export const AUTH_SERVICE_URL = import.meta.env.VITE_AUTH_SERVICE_URL; // auth-service (planned)

const API_MODE_KEY = 'proto.apiMode';

// The dev bar (development only) can override API_MODE; a production build always uses API_MODE.
export function getApiMode() {
  return (import.meta.env.DEV && readLocal(API_MODE_KEY)) || API_MODE;
}

export function setApiMode(mode) {
  writeLocal(API_MODE_KEY, mode);
}

// Opening hours in whole hours, and the half-day and day slots offered that day.
const WEEKDAY = {
  open: 8,
  close: 19,
  slots: { MORNING: { start: 8, end: 13 }, AFTERNOON: { start: 13, end: 19 }, DAY: { start: 8, end: 19 } },
};
const SATURDAY = { open: 9, close: 13, slots: { MORNING: { start: 9, end: 13 } } };

// Indexed by Date.getDay() (0 = Sunday). null = closed.
export const OPENING_HOURS = [null, WEEKDAY, WEEKDAY, WEEKDAY, WEEKDAY, WEEKDAY, SATURDAY];

export const SPACE_TYPES = ['OPENSPACE', 'OFFICE', 'ROOM'];
export const RATE_FIELDS = ['hourRate', 'halfDayRate', 'dayRate', 'monthRate'];
