import { useTranslation } from "react-i18next";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";

export default function Pagination({ page, totalPages, onPageChange }) {
  const { t } = useTranslation();

  if (totalPages <= 1) return null;

  return (
    <div className="mt-4 flex items-center justify-between gap-4">
      <p className="text-xs text-charcoal-400 dark:text-ivory-300">
        {t("admin.pagination.pageOf", { page, totalPages })}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label={t("admin.pagination.previous")}
          className="btn-secondary px-3 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-40"
        >
          <FaChevronLeft className="h-3 w-3 rtl:rotate-180" />
        </button>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label={t("admin.pagination.next")}
          className="btn-secondary px-3 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-40"
        >
          <FaChevronRight className="h-3 w-3 rtl:rotate-180" />
        </button>
      </div>
    </div>
  );
}
