import { useTranslation } from "react-i18next";
import StaticPageHeader from "../../components/common/StaticPageHeader";

export default function About() {
  const { t } = useTranslation();

  return (
    <div>
      <StaticPageHeader title={t("legal.about")} description={t("home.heroTitle")} />

      <div className="container-boutique max-w-3xl py-16">
        <div className="space-y-6 text-sm leading-relaxed text-charcoal-600 dark:text-ivory-200">
          <p>{t("pages.about.intro")}</p>

          <h2 className="pt-4 font-serif text-2xl font-semibold text-charcoal-900 dark:text-ivory-100">
            {t("pages.about.lookFor.heading")}
          </h2>
          <p>{t("pages.about.lookFor.body")}</p>

          <h2 className="pt-4 font-serif text-2xl font-semibold text-charcoal-900 dark:text-ivory-100">
            {t("pages.about.howWeWork.heading")}
          </h2>
          <p>{t("pages.about.howWeWork.body")}</p>

          <h2 className="pt-4 font-serif text-2xl font-semibold text-charcoal-900 dark:text-ivory-100">
            {t("pages.about.whereHeaded.heading")}
          </h2>
          <p>{t("pages.about.whereHeaded.body")}</p>
        </div>
      </div>
    </div>
  );
}
