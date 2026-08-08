import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import StaticPageHeader from "../../components/common/StaticPageHeader";

export default function PrivacyPolicy() {
  const { t } = useTranslation();

  return (
    <div>
      <StaticPageHeader title={t("legal.privacy")} description={t("legal.lastUpdated")} />

      <div className="container-boutique max-w-3xl py-16">
        <div className="space-y-8 text-sm leading-relaxed text-charcoal-600 dark:text-ivory-200">
          <p>{t("pages.privacy.intro")}</p>

          <section>
            <h2 className="mb-3 font-serif text-xl font-semibold text-charcoal-900 dark:text-ivory-100">
              {t("pages.privacy.collect.heading")}
            </h2>
            <ul className="list-disc space-y-2 ps-5">
              <li>{t("pages.privacy.collect.accountInfo")}</li>
              <li>{t("pages.privacy.collect.orderInfo")}</li>
              <li>{t("pages.privacy.collect.contentSubmitted")}</li>
              <li>
                {t("pages.privacy.collect.usageInfo")}{" "}
                <Link to="/cookie-policy" className="text-gold-700 underline hover:no-underline dark:text-gold-400">
                  {t("footer.cookiePolicy")}
                </Link>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 font-serif text-xl font-semibold text-charcoal-900 dark:text-ivory-100">
              {t("pages.privacy.howWeUse.heading")}
            </h2>
            <p>{t("pages.privacy.howWeUse.body")}</p>
          </section>

          <section>
            <h2 className="mb-3 font-serif text-xl font-semibold text-charcoal-900 dark:text-ivory-100">
              {t("pages.privacy.thirdParty.heading")}
            </h2>
            <p className="mb-3">{t("pages.privacy.thirdParty.intro")}</p>
            <ul className="list-disc space-y-2 ps-5">
              <li>{t("pages.privacy.thirdParty.firebase")}</li>
              <li>{t("pages.privacy.thirdParty.cloudinary")}</li>
            </ul>
            <p className="mt-3">{t("pages.privacy.thirdParty.closing")}</p>
          </section>

          <section>
            <h2 className="mb-3 font-serif text-xl font-semibold text-charcoal-900 dark:text-ivory-100">
              {t("pages.privacy.rights.heading")}
            </h2>
            <p>{t("pages.privacy.rights.body")}</p>
          </section>

          <section>
            <h2 className="mb-3 font-serif text-xl font-semibold text-charcoal-900 dark:text-ivory-100">
              {t("pages.privacy.retention.heading")}
            </h2>
            <p>{t("pages.privacy.retention.body")}</p>
          </section>

          <section>
            <h2 className="mb-3 font-serif text-xl font-semibold text-charcoal-900 dark:text-ivory-100">
              {t("pages.privacy.changes.heading")}
            </h2>
            <p>{t("pages.privacy.changes.body")}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
