import { useTranslation } from "react-i18next";
import StaticPageHeader from "../../components/common/StaticPageHeader";

export default function ReturnPolicy() {
  const { t } = useTranslation();

  return (
    <div>
      <StaticPageHeader title={t("legal.returns")} description={t("legal.lastUpdated")} />

      <div className="container-boutique max-w-3xl py-16">
        <div className="space-y-8 text-sm leading-relaxed text-charcoal-600 dark:text-ivory-200">
          <section>
            <h2 className="mb-3 font-serif text-xl font-semibold text-charcoal-900 dark:text-ivory-100">
              {t("pages.returns.thirtyDay.heading")}
            </h2>
            <p>{t("pages.returns.thirtyDay.body")}</p>
          </section>

          <section>
            <h2 className="mb-3 font-serif text-xl font-semibold text-charcoal-900 dark:text-ivory-100">
              {t("pages.returns.howToStart.heading")}
            </h2>
            <ol className="list-decimal space-y-2 ps-5">
              <li>{t("pages.returns.howToStart.step1")}</li>
              <li>{t("pages.returns.howToStart.step2")}</li>
              <li>{t("pages.returns.howToStart.step3")}</li>
            </ol>
          </section>

          <section>
            <h2 className="mb-3 font-serif text-xl font-semibold text-charcoal-900 dark:text-ivory-100">
              {t("pages.returns.refunds.heading")}
            </h2>
            <p>{t("pages.returns.refunds.body")}</p>
          </section>

          <section>
            <h2 className="mb-3 font-serif text-xl font-semibold text-charcoal-900 dark:text-ivory-100">
              {t("pages.returns.exchanges.heading")}
            </h2>
            <p>{t("pages.returns.exchanges.body")}</p>
          </section>

          <section>
            <h2 className="mb-3 font-serif text-xl font-semibold text-charcoal-900 dark:text-ivory-100">
              {t("pages.returns.nonReturnable.heading")}
            </h2>
            <p>{t("pages.returns.nonReturnable.body")}</p>
          </section>

          <section>
            <h2 className="mb-3 font-serif text-xl font-semibold text-charcoal-900 dark:text-ivory-100">
              {t("pages.returns.damaged.heading")}
            </h2>
            <p>{t("pages.returns.damaged.body")}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
