import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaArrowLeft } from "react-icons/fa";

export default function NotFound() {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
      <p className="label-uppercase text-gold-600 dark:text-gold-400">
        {t("notFound.eyebrow")}
      </p>
      <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">
        {t("notFound.title")}
      </h1>
      <p className="mt-4 max-w-md text-sm text-charcoal-400 dark:text-ivory-300">
        {t("notFound.body")}
      </p>
      <Link to="/" className="btn-primary mt-8">
        <FaArrowLeft className="rtl:rotate-180" aria-hidden="true" />
        {t("common.backToHome")}
      </Link>
    </div>
  );
}
