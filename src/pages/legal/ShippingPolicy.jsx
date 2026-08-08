import { useTranslation } from "react-i18next";
import StaticPageHeader from "../../components/common/StaticPageHeader";

export default function ShippingPolicy() {
  const { t } = useTranslation();

  return (
    <div>
      <StaticPageHeader title={t("legal.shipping")} description={t("legal.lastUpdated")} />

      <div className="container-boutique max-w-3xl py-16">
        <div className="space-y-8 text-sm leading-relaxed text-charcoal-600 dark:text-ivory-200">
          <section>
            <h2 className="mb-3 font-serif text-xl font-semibold text-charcoal-900 dark:text-ivory-100">
              {t("pages.shipping.processingTime.heading")}
            </h2>
            <p>{t("pages.shipping.processingTime.body")}</p>
          </section>

          <section>
            <h2 className="mb-3 font-serif text-xl font-semibold text-charcoal-900 dark:text-ivory-100">
              {t("pages.shipping.shippingTimes.heading")}
            </h2>
            <ul className="list-disc space-y-2 ps-5">
              <li>{t("pages.shipping.shippingTimes.standard")}</li>
              <li>{t("pages.shipping.shippingTimes.expedited")}</li>
              <li>{t("pages.shipping.shippingTimes.international")}</li>
            </ul>
            <p className="mt-3">{t("pages.shipping.shippingTimes.note")}</p>
          </section>

          <section>
            <h2 className="mb-3 font-serif text-xl font-semibold text-charcoal-900 dark:text-ivory-100">
              {t("pages.shipping.shippingCosts.heading")}
            </h2>
            <p>{t("pages.shipping.shippingCosts.body")}</p>
          </section>

          <section>
            <h2 className="mb-3 font-serif text-xl font-semibold text-charcoal-900 dark:text-ivory-100">
              {t("pages.shipping.internationalOrders.heading")}
            </h2>
            <p>{t("pages.shipping.internationalOrders.body")}</p>
          </section>

          <section>
            <h2 className="mb-3 font-serif text-xl font-semibold text-charcoal-900 dark:text-ivory-100">
              {t("pages.shipping.orderTracking.heading")}
            </h2>
            <p>{t("pages.shipping.orderTracking.body")}</p>
          </section>

          <section>
            <h2 className="mb-3 font-serif text-xl font-semibold text-charcoal-900 dark:text-ivory-100">
              {t("pages.shipping.questions.heading")}
            </h2>
            <p>{t("pages.shipping.questions.body")}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
