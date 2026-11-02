import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

/** Accessible modal: focus moves in on open, Tab stays inside, Escape closes,
 *  and focus returns to whatever opened it. */
export default function AdminDialog({ labelledBy, label, onClose, children }) {
  const cardRef = useRef(null);
  const closeRef = useRef(null);
  // Captured on first render, before any child effect can move focus into the dialog.
  const [opener] = useState(() => document.activeElement);
  // Read through a ref so the effect below runs once, not on every parent render.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    // A child that focused its own first field (e.g. a form) keeps it.
    if (!cardRef.current?.contains(document.activeElement)) closeRef.current?.focus();
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        onCloseRef.current();
        return;
      }
      if (e.key !== "Tab" || !cardRef.current) return;
      const focusable = cardRef.current.querySelectorAll(
        'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      opener?.focus?.();
    };
  }, [opener]);

  return (
    <div className="admin-modal" onClick={onClose}>
      <div
        ref={cardRef}
        className="admin-modal__card"
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-label={labelledBy ? undefined : label}
        onClick={(e) => e.stopPropagation()}
      >
        <button ref={closeRef} type="button" className="admin-modal__close" onClick={onClose} aria-label="Close">
          <X size={18} strokeWidth={2.2} aria-hidden="true" />
        </button>
        {children}
      </div>
    </div>
  );
}
