import { useTranslation } from "react-i18next";

function scorePassword(password) {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return Math.min(score, 4);
}

const LABEL_KEYS = ["veryWeak", "weak", "fair", "strong", "veryStrong"];
const COLORS = [
  "bg-burgundy-400",
  "bg-burgundy-300",
  "bg-gold-400",
  "bg-emerald-400",
  "bg-emerald-500",
];

export default function PasswordStrengthMeter({ password }) {
  const { t } = useTranslation();
  const score = scorePassword(password);
  if (!password) return null;

  return (
    <div className="mt-2" aria-live="polite">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className={`h-1 flex-1 rounded-full transition-colors duration-200 ${
              index <= score - 1
                ? COLORS[score]
                : "bg-charcoal-100 dark:bg-charcoal-500"
            }`}
          />
        ))}
      </div>
      <p className="mt-1 text-xs text-charcoal-400 dark:text-ivory-300">
        {t(`auth.passwordStrength.${LABEL_KEYS[score]}`)}
      </p>
    </div>
  );
}
