import { useTranslation } from "react-i18next";

export default function StaticPageHeader({ eyebrow, title, description }) {
  const { t } = useTranslation();
  return (
    <div className="border-b border-charcoal-100 bg-ivory-50 py-16 dark:border-charcoal-500 dark:bg-charcoal-900">
      <div className="container-boutique text-center">
        <p className="label-uppercase">{eyebrow || t("common.brand")}</p>
        <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">{title}</h1>
        {description && (
          <p className="mx-auto mt-4 max-w-2xl text-sm text-charcoal-400 dark:text-ivory-300">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
