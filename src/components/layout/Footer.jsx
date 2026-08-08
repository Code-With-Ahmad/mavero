import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaInstagram, FaFacebookF, FaPinterestP } from "react-icons/fa6";
import NewsletterForm from "../common/NewsletterForm";

export default function Footer() {
  const { t } = useTranslation();

  const SHOP_LINKS = [
    { to: "/shop", label: t("footer.allProducts") },
    { to: "/shop?featured=true", label: t("footer.featured") },
    { to: "/wishlist", label: t("nav.wishlist") },
    { to: "/cart", label: t("nav.cart") },
  ];

  const COMPANY_LINKS = [
    { to: "/about", label: t("footer.aboutUs") },
    { to: "/contact", label: t("footer.contactUs") },
    { to: "/faq", label: t("footer.faq") },
  ];

  const LEGAL_LINKS = [
    { to: "/privacy-policy", label: t("footer.privacyPolicy") },
    { to: "/terms-and-conditions", label: t("footer.termsAndConditions") },
    { to: "/shipping-policy", label: t("footer.shippingPolicy") },
    { to: "/return-policy", label: t("footer.returnPolicy") },
    { to: "/cookie-policy", label: t("footer.cookiePolicy") },
  ];

  return (
    <footer className="border-t border-charcoal-100 bg-ivory-50 dark:border-charcoal-500 dark:bg-charcoal-900">
      <div className="container-boutique grid grid-cols-1 gap-10 py-16 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Link to="/" className="font-serif text-2xl font-semibold tracking-wide">
            {t("common.brand")}
          </Link>
          <p className="mt-4 max-w-xs text-sm text-charcoal-400 dark:text-ivory-300">
            {t("footer.tagline")}
          </p>
          <div className="mt-6 flex gap-4">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Mavero on Instagram"
              className="text-charcoal-400 hover:text-gold-600 dark:text-ivory-300 dark:hover:text-gold-400"
            >
              <FaInstagram className="h-4 w-4" />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Mavero on Facebook"
              className="text-charcoal-400 hover:text-gold-600 dark:text-ivory-300 dark:hover:text-gold-400"
            >
              <FaFacebookF className="h-4 w-4" />
            </a>
            <a
              href="https://pinterest.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Mavero on Pinterest"
              className="text-charcoal-400 hover:text-gold-600 dark:text-ivory-300 dark:hover:text-gold-400"
            >
              <FaPinterestP className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div>
          <h3 className="label-uppercase mb-4">{t("footer.shop")}</h3>
          <ul className="space-y-3">
            {SHOP_LINKS.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="text-sm text-charcoal-500 hover:text-gold-600 dark:text-ivory-200 dark:hover:text-gold-400"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="label-uppercase mb-4">{t("footer.company")}</h3>
          <ul className="space-y-3">
            {COMPANY_LINKS.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="text-sm text-charcoal-500 hover:text-gold-600 dark:text-ivory-200 dark:hover:text-gold-400"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <h3 className="label-uppercase mb-4 mt-8">{t("footer.legal")}</h3>
          <ul className="space-y-3">
            {LEGAL_LINKS.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="text-sm text-charcoal-500 hover:text-gold-600 dark:text-ivory-200 dark:hover:text-gold-400"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="sm:col-span-2 lg:col-span-1">
          <h3 className="label-uppercase mb-4">{t("footer.stayInTouch")}</h3>
          <p className="mb-4 text-sm text-charcoal-400 dark:text-ivory-300">
            {t("footer.newsletterBlurb")}
          </p>
          <NewsletterForm />
        </div>
      </div>

      <div className="border-t border-charcoal-100 py-6 dark:border-charcoal-500">
        <p className="container-boutique text-center text-xs text-charcoal-300 dark:text-ivory-300">
          &copy; {new Date().getFullYear()} {t("common.brand")}. {t("footer.rightsReserved")}
        </p>
      </div>
    </footer>
  );
}
