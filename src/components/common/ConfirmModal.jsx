import { useTranslation } from "react-i18next";
import Modal from "./Modal";

export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel,
  danger = false,
  submitting = false,
}) {
  const { t } = useTranslation();

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="text-sm text-charcoal-600 dark:text-ivory-200">{message}</p>
      <div className="mt-6 flex justify-end gap-3">
        <button type="button" onClick={onClose} className="btn-secondary">
          {t("common.cancel")}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={submitting}
          className={
            danger
              ? "inline-flex items-center justify-center gap-2 bg-burgundy-500 px-6 py-3 text-sm font-medium uppercase tracking-wider text-ivory transition-colors duration-200 ease-refined hover:bg-burgundy-600 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-burgundy-500 dark:hover:bg-burgundy-400"
              : "btn-primary"
          }
        >
          {submitting ? t("common.saving") : confirmLabel || t("common.continue")}
        </button>
      </div>
    </Modal>
  );
}
