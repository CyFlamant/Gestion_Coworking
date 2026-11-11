// Carries the slot chosen on "Espaces disponibles" over to "Réserver" (dates are stored as yyyy-mm-dd).
import { fromDateInput, toDateInput } from '../dates.js';
import { readSession, writeSession } from '../storage.js';

const DRAFT_KEY = 'proto.bookingDraft';

export function saveDraft(values) {
  writeSession(DRAFT_KEY, { ...values, date: toDateInput(values.date) });
}

export function takeDraft() {
  const draft = readSession(DRAFT_KEY);
  writeSession(DRAFT_KEY, null);
  return draft ? { ...draft, date: fromDateInput(draft.date) } : null;
}
