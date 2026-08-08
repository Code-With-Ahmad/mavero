import { useTranslation } from "react-i18next";

const STEP_KEYS = ["shipping", "payment", "review"];

export default function CheckoutSteps({ currentStep }) {
  const { t } = useTranslation();
  return (
    <ol className="mb-10 flex items-center justify-center gap-4 sm:gap-8">
      {STEP_KEYS.map((key, index) => {
        const stepNumber = index + 1;
        const active = stepNumber === currentStep;
        const complete = stepNumber < currentStep;
        return (
          <li key={key} className="flex items-center gap-2">
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-medium ${
                active || complete
                  ? "border-charcoal-800 bg-charcoal-800 text-ivory dark:border-gold-500 dark:bg-gold-500 dark:text-charcoal-900"
                  : "border-charcoal-200 text-charcoal-400 dark:border-charcoal-500 dark:text-ivory-300"
              }`}
            >
              {stepNumber}
            </span>
            <span
              className={`hidden text-xs uppercase tracking-wider sm:inline ${
                active ? "text-charcoal-800 dark:text-ivory-100" : "text-charcoal-400 dark:text-ivory-300"
              }`}
            >
              {t(`checkout.steps.${key}`)}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
