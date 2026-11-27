import { useState } from "react";
import { formErrors, NO_ERRORS } from "../lib/forms.js";

// Sends a form: calls send(...args), then onSuccess(result). On failure, keeps the API's errors for the form to show.
// errors: { fields, alert } (see lib/forms.js); submitting: true while the request runs, to disable the button.
// After a success the button stays disabled: the dialog closes or the page changes.
export function useSubmit(send, onSuccess) {
  const [errors, setErrors] = useState(NO_ERRORS);
  const [submitting, setSubmitting] = useState(false);

  async function submit(...args) {
    setErrors(NO_ERRORS);
    setSubmitting(true);
    try {
      const result = await send(...args);
      onSuccess(result);
    } catch (err) {
      setErrors(formErrors(err));
      setSubmitting(false);
    }
  }

  return { submit, errors, submitting };
}
