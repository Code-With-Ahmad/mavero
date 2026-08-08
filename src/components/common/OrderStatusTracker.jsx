import { useTranslation } from "react-i18next";
import { FaCheck } from "react-icons/fa6";

const STEPS = ["pending", "processing", "shipped", "delivered"];

export default function OrderStatusTracker({ status }) {
  const { t } = useTranslation();

  if (status === "cancelled") {
    return (
      <p className="text-sm font-medium text-burgundy-500 dark:text-burgundy-300">
        {t("orderStatus.cancelledBody")}
      </p>
    );
  }

  const currentIndex = STEPS.indexOf(status);

  return (
    <ol className="flex items-center">
      {STEPS.map((step, index) => {
        const done = index <= currentIndex;
        const isLast = index === STEPS.length - 1;
        return (
          <li key={step} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-2">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs ${
                  done
                    ? "border-emerald-600 bg-emerald-600 text-ivory dark:border-emerald-400 dark:bg-emerald-400 dark:text-charcoal-900"
                    : "border-charcoal-200 text-charcoal-300 dark:border-charcoal-500 dark:text-ivory-300"
                }`}
              >
                {done ? <FaCheck className="h-3 w-3" /> : index + 1}
              </span>
              <span
                className={`text-[11px] uppercase tracking-wider ${
                  done ? "text-charcoal-700 dark:text-ivory-100" : "text-charcoal-300 dark:text-ivory-300"
                }`}
              >
                {t(`orderStatus.${step}`)}
              </span>
            </div>
            {!isLast && (
              <div
                className={`mx-2 h-px flex-1 ${
                  index < currentIndex
                    ? "bg-emerald-600 dark:bg-emerald-400"
                    : "bg-charcoal-100 dark:bg-charcoal-500"
                }`}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
