import { useTranslation } from "react-i18next";
import { FaTriangleExclamation } from "react-icons/fa6";
import { isFirebaseConfigured } from "../../lib/firebase";

export default function ConfigWarningBanner() {
  const { t } = useTranslation();
  if (isFirebaseConfigured) return null;

  return (
    <div className="flex items-center justify-center gap-2 bg-burgundy-700 px-4 py-2 text-center text-xs font-medium text-ivory">
      <FaTriangleExclamation aria-hidden="true" />
      {t("configBanner")}
    </div>
  );
}
