import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FaStar, FaRegStar } from "react-icons/fa6";

export default function StarRating({
  value = 0,
  count,
  size = "text-sm",
  interactive = false,
  onChange,
}) {
  const { t } = useTranslation();
  const [hovered, setHovered] = useState(0);
  const display = interactive && hovered ? hovered : value;

  return (
    <div className="flex items-center gap-1">
      <div
        className={`flex items-center gap-0.5 text-gold-500 ${size}`}
        role={interactive ? "radiogroup" : "img"}
        aria-label={interactive ? t("product.rating") : t("product.ratedOutOf5", { value: value.toFixed(1) })}
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= Math.round(display);
          const Icon = filled ? FaStar : FaRegStar;
          if (!interactive) {
            return <Icon key={star} aria-hidden="true" />;
          }
          return (
            <button
              key={star}
              type="button"
              onClick={() => onChange?.(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              aria-label={t("product.starsLabel", { count: star })}
              className="cursor-pointer"
            >
              <Icon />
            </button>
          );
        })}
      </div>
      {typeof count === "number" && (
        <span className="text-xs text-charcoal-300 dark:text-ivory-300">
          ({count})
        </span>
      )}
    </div>
  );
}
