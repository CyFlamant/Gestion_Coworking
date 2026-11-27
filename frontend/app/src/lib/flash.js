// A message saved before a page change and shown once on the next page (e.g. "Réservation confirmée.").
// Kept in sessionStorage, so it also survives a full page load (sign-in, sign-out).
import { readSession, writeSession } from './storage.js';

const FLASH_KEY = 'proto.flash';

export function setFlash(message) {
    writeSession(FLASH_KEY, message);
}

// Reads the message without forgetting it (safe to call twice, as React may do in development).
export function readFlash() {
    return readSession(FLASH_KEY);
}

export function clearFlash() {
    writeSession(FLASH_KEY, null);
}
