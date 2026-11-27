import { ApiError } from './api.js';

// An API error → what a form shows: one message per field (400 errors map), or one message for the whole form.
export function formErrors(error) {
    const fields = error instanceof ApiError ? error.errors : {};
    const detail = error instanceof ApiError ? error.detail : String(error?.message ?? error);
    return { fields, alert: Object.keys(fields).length ? null : detail };
}

export const NO_ERRORS = { fields: {}, alert: null };

// For forms that show no message next to their fields (the booking forms): the one message to show.
export function errorMessage(errors) {
    return errors.alert ?? Object.values(errors.fields)[0] ?? null;
}
