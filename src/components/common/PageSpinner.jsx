import { useTranslation } from "react-i18next";

export default function PageSpinner() {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-screen w-full items-center justify-center">
      <div
        role="status"
        aria-label={t("common.loading")}
        className="h-8 w-8 animate-spin rounded-full border-2 border-charcoal-100 border-t-gold-500 dark:border-charcoal-500 dark:border-t-gold-400"
      />
    </div>
  );
}
