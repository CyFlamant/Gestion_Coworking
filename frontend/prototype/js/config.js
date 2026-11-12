import { readLocal, writeLocal } from './storage.js';

// 'mock' answers every request in the browser (js/mock/); 'real' calls the Spring Boot services.
export const API_MODE = 'mock';
export const BASE_URL = 'http://localhost:8080'; // app-service
export const AUTH_BASE_URL = 'http://localhost:8081'; // auth-service (planned)

const API_MODE_KEY = 'proto.apiMode';

// The prototype dev bar can override API_MODE without editing this file.
export function getApiMode() {
  return readLocal(API_MODE_KEY) ?? API_MODE;
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
