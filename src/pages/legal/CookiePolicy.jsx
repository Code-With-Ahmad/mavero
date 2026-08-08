import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import StaticPageHeader from "../../components/common/StaticPageHeader";

export default function CookiePolicy() {
  const { t } = useTranslation();

  return (
    <div>
      <StaticPageHeader title={t("legal.cookies")} description={t("legal.lastUpdated")} />

      <div className="container-boutique max-w-3xl py-16">
        <div className="space-y-8 text-sm leading-relaxed text-charcoal-600 dark:text-ivory-200">
          <section>
            <h2 className="mb-3 font-serif text-xl font-semibold text-charcoal-900 dark:text-ivory-100">
              {t("pages.cookies.whatCovers.heading")}
            </h2>
            <p>{t("pages.cookies.whatCovers.body")}</p>
          </section>

          <section>
            <h2 className="mb-3 font-serif text-xl font-semibold text-charcoal-900 dark:text-ivory-100">
              {t("pages.cookies.whatWeStore.heading")}
            </h2>
            <ul className="list-disc space-y-2 ps-5">
              <li>{t("pages.cookies.whatWeStore.session")}</li>
              <li>{t("pages.cookies.whatWeStore.theme")}</li>
              <li>{t("pages.cookies.whatWeStore.language")}</li>
              <li>{t("pages.cookies.whatWeStore.guestCart")}</li>
              <li>{t("pages.cookies.whatWeStore.recentlyViewed")}</li>
              <li>{t("pages.cookies.whatWeStore.consent")}</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 font-serif text-xl font-semibold text-charcoal-900 dark:text-ivory-100">
              {t("pages.cookies.whatWeDont.heading")}
            </h2>
            <p>{t("pages.cookies.whatWeDont.body")}</p>
          </section>

          <section>
            <h2 className="mb-3 font-serif text-xl font-semibold text-charcoal-900 dark:text-ivory-100">
              {t("pages.cookies.managing.heading")}
            </h2>
            <p>
              {t("pages.cookies.managing.body")}{" "}
              <Link to="/privacy-policy" className="text-gold-700 underline hover:no-underline dark:text-gold-400">
                {t("footer.privacyPolicy")}
              </Link>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
