import { useTranslation } from "react-i18next";
import { FaTriangleExclamation, FaRotateRight } from "react-icons/fa6";

// A missing Firestore composite index throws failed-precondition, not a
// network error — it looks identical to a connectivity problem to a user
// unless we specifically call it out. This only ever happens during setup
// (firestore.indexes.json wasn't deployed to the live project yet), so it
// gets its own message instead of the generic "check your connection" one.
function isMissingIndexError(error) {
  return error?.code === "failed-precondition" && /index/i.test(error?.message || "");
}

export default function ErrorState({ title, description, error, onRetry }) {
  const { t } = useTranslation();
  const missingIndex = isMissingIndexError(error);

  return (
    <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
      <FaTriangleExclamation
        className="mb-4 h-8 w-8 text-burgundy-400 dark:text-burgundy-300"
        aria-hidden="true"
      />
      <h2 className="text-xl font-semibold text-charcoal-800 dark:text-ivory-100">
        {title || (missingIndex ? t("common.setupNeeded") : t("common.somethingWentWrong"))}
      </h2>
      <p className="mt-2 max-w-sm text-sm text-charcoal-400 dark:text-ivory-300">
        {description || (missingIndex ? t("common.missingIndex") : t("common.couldNotLoad"))}
      </p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn-secondary mt-6">
          <FaRotateRight aria-hidden="true" />
          {t("common.tryAgain")}
        </button>
      )}
    </div>
  );
}
