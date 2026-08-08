import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const STORAGE_KEY = "mavero-cookie-consent";

export default function CookieConsentBanner() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setVisible(true);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-charcoal-100 bg-ivory px-4 py-4 shadow-lift dark:border-charcoal-500 dark:bg-charcoal-700">
      <div className="container-boutique flex flex-col items-center justify-between gap-4 sm:flex-row">
        <p className="text-sm text-charcoal-500 dark:text-ivory-200">
          {t("cookieBanner.textBefore")}{" "}
          <Link to="/cookie-policy" className="underline hover:text-gold-600 dark:hover:text-gold-400">
            {t("footer.cookiePolicy")}
          </Link>{" "}
          {t("cookieBanner.textAfter")}
        </p>
        <button type="button" onClick={accept} className="btn-primary shrink-0">
          {t("cookieBanner.accept")}
        </button>
      </div>
    </div>
  );
}
