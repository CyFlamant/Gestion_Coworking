import { useEffect, useId, useRef } from "react";
import { t } from "../lib/i18n/index.js";

// Modal confirmation on the native <dialog>. The parent shows it when needed and removes it in onConfirm / onCancel.
// Escape, the × button and the cancel button all call onCancel.
export default function ConfirmDialog({
  title,
  message,
  confirmLabel,
  cancelLabel = t("common.cancel"),
  danger = false,
  onConfirm,
  onCancel,
}) {
  const ref = useRef(null);
  const titleId = useId();

  // A <dialog> becomes modal through its showModal() method, called once it is on the page.
  useEffect(() => {
    ref.current.showModal();
  }, []);

  return (
    <dialog
      ref={ref}
      className="dialog"
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault(); // Escape: let the parent remove the dialog
        onCancel();
      }}
    >
      <div className="dialog__head">
        <h2 id={titleId}>{title}</h2>
        <button
          type="button"
          className="icon-btn"
          aria-label={t("common.close")}
          onClick={onCancel}
        >
          ×
        </button>
      </div>
      <div className="dialog__body">
        <p>{message}</p>
      </div>
      <div className="dialog__actions">
        <button type="button" className="btn btn--ghost" onClick={onCancel}>
          {cancelLabel}
        </button>
        <button
          type="button"
          className={danger ? "btn btn--danger" : "btn btn--primary"}
          onClick={onConfirm}
        >
          {confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
