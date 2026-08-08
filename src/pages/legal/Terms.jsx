import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import StaticPageHeader from "../../components/common/StaticPageHeader";

export default function Terms() {
  const { t } = useTranslation();

  return (
    <div>
      <StaticPageHeader title={t("legal.terms")} description={t("legal.lastUpdated")} />

      <div className="container-boutique max-w-3xl py-16">
        <div className="space-y-8 text-sm leading-relaxed text-charcoal-600 dark:text-ivory-200">
          <p>{t("pages.terms.intro")}</p>

          <section>
            <h2 className="mb-3 font-serif text-xl font-semibold text-charcoal-900 dark:text-ivory-100">
              {t("pages.terms.accounts.heading")}
            </h2>
            <p>{t("pages.terms.accounts.body")}</p>
          </section>

          <section>
            <h2 className="mb-3 font-serif text-xl font-semibold text-charcoal-900 dark:text-ivory-100">
              {t("pages.terms.ordersPricing.heading")}
            </h2>
            <p>{t("pages.terms.ordersPricing.body")}</p>
          </section>

          <section>
            <h2 className="mb-3 font-serif text-xl font-semibold text-charcoal-900 dark:text-ivory-100">
              {t("pages.terms.payment.heading")}
            </h2>
            <p>{t("pages.terms.payment.body")}</p>
          </section>

          <section>
            <h2 className="mb-3 font-serif text-xl font-semibold text-charcoal-900 dark:text-ivory-100">
              {t("pages.terms.productDescriptions.heading")}
            </h2>
            <p>{t("pages.terms.productDescriptions.body")}</p>
          </section>

          <section>
            <h2 className="mb-3 font-serif text-xl font-semibold text-charcoal-900 dark:text-ivory-100">
              {t("pages.terms.intellectualProperty.heading")}
            </h2>
            <p>{t("pages.terms.intellectualProperty.body")}</p>
          </section>

          <section>
            <h2 className="mb-3 font-serif text-xl font-semibold text-charcoal-900 dark:text-ivory-100">
              {t("pages.terms.liability.heading")}
            </h2>
            <p>{t("pages.terms.liability.body")}</p>
          </section>

          <section>
            <h2 className="mb-3 font-serif text-xl font-semibold text-charcoal-900 dark:text-ivory-100">
              {t("pages.terms.governingLaw.heading")}
            </h2>
            <p>{t("pages.terms.governingLaw.body")}</p>
          </section>

          <section>
            <h2 className="mb-3 font-serif text-xl font-semibold text-charcoal-900 dark:text-ivory-100">
              {t("pages.terms.relatedPolicies.heading")}
            </h2>
            <p>{t("pages.terms.relatedPolicies.body")}</p>
            <ul className="mt-3 list-disc space-y-2 ps-5">
              <li>
                <Link to="/privacy-policy" className="text-gold-700 underline hover:no-underline dark:text-gold-400">
                  {t("footer.privacyPolicy")}
                </Link>
              </li>
              <li>
                <Link to="/shipping-policy" className="text-gold-700 underline hover:no-underline dark:text-gold-400">
                  {t("footer.shippingPolicy")}
                </Link>
              </li>
              <li>
                <Link to="/return-policy" className="text-gold-700 underline hover:no-underline dark:text-gold-400">
                  {t("footer.returnPolicy")}
                </Link>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
