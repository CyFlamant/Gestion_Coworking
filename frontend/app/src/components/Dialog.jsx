import { useEffect, useId, useRef } from "react";
import { t } from "../lib/i18n/index.js";

// Modal window on the native <dialog>: title, content (children) and action buttons.
// The parent shows it when needed and removes it in onClose; Escape and the × button call onClose.
export default function Dialog({ title, children, actions, onClose }) {
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
        onClose();
      }}
    >
      <div className="dialog__head">
        <h2 id={titleId}>{title}</h2>
        <button type="button" className="icon-btn" aria-label={t("common.close")} onClick={onClose}>
          ×
        </button>
      </div>
      <div className="dialog__body">{children}</div>
      <div className="dialog__actions">{actions}</div>
    </dialog>
  );
}
