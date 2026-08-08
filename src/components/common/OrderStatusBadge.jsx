import { useTranslation } from "react-i18next";

const STYLES = {
  pending: "bg-gold-100 text-gold-800 dark:bg-gold-500/20 dark:text-gold-300",
  processing: "bg-navy-100 text-navy-700 dark:bg-navy-500/20 dark:text-navy-200",
  shipped: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
  delivered: "bg-emerald-600 text-ivory dark:bg-emerald-500 dark:text-charcoal-900",
  cancelled: "bg-burgundy-100 text-burgundy-600 dark:bg-burgundy-500/20 dark:text-burgundy-300",
};

export default function OrderStatusBadge({ status }) {
  const { t } = useTranslation();
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider ${
        STYLES[status] || STYLES.pending
      }`}
    >
      {t(`orderStatus.${status}`, { defaultValue: status })}
    </span>
  );
}
