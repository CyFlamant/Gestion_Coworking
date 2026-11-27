import { t } from "../lib/i18n/index.js";
import Dialog from "./Dialog.jsx";

// A dialog that asks to confirm an action. The cancel button, Escape and × all call onCancel.
export default function ConfirmDialog({
  title,
  message,
  confirmLabel,
  cancelLabel = t("common.cancel"),
  danger = false,
  onConfirm,
  onCancel,
}) {
  return (
    <Dialog
      title={title}
      onClose={onCancel}
      actions={
        <>
          <button type="button" className="btn btn--ghost" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button type="button" className={danger ? "btn btn--danger" : "btn btn--primary"} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </>
      }
    >
      <p>{message}</p>
    </Dialog>
  );
}
