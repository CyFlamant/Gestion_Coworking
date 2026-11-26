// Carries the slot chosen on "Espaces disponibles" over to "Réserver" (dates are stored as yyyy-mm-dd).
import { fromDateInput, toDateInput } from './dates.js';
import { readSession, writeSession } from './storage.js';

const DRAFT_KEY = 'proto.bookingDraft';

export function saveDraft(values) {
    writeSession(DRAFT_KEY, { ...values, date: toDateInput(values.date) });
}

// Reads the draft without forgetting it (safe to call twice, as React may do in development).
export function readDraft() {
    const draft = readSession(DRAFT_KEY);
    return draft ? { ...draft, date: fromDateInput(draft.date) } : null;
}

export function clearDraft() {
    writeSession(DRAFT_KEY, null);
}

export function takeDraft() {
    const draft = readDraft();
    clearDraft();
    return draft;
}
