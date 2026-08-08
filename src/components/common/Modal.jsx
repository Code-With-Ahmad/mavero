import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { FaXmark } from "react-icons/fa6";

// Fixed-position overlay, so it's portaled to document.body — see the
// "Fixed-position overlays" note in SKILLS.md (a sticky/backdrop-blur
// ancestor would otherwise become the containing block for position:fixed).
export default function Modal({ open, onClose, title, children, className = "" }) {
  const { t } = useTranslation();
  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-charcoal-900/60" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative max-h-[90vh] w-full max-w-md overflow-y-auto border border-charcoal-100 bg-ivory p-6 shadow-lift dark:border-charcoal-500 dark:bg-charcoal-800 ${className}`}
      >
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="font-serif text-xl font-semibold text-charcoal-900 dark:text-ivory-100">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("common.close")}
            className="shrink-0 text-charcoal-400 hover:text-charcoal-700 dark:text-ivory-300 dark:hover:text-ivory-100"
          >
            <FaXmark className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}
