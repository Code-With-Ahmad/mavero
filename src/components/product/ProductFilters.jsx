import { useTranslation } from "react-i18next";
import { formatCurrency } from "../../utils/formatCurrency";
import Checkbox from "../common/Checkbox";

export default function ProductFilters({
  categories,
  availableSizes,
  availableColors,
  priceBounds,
  filters,
  onChange,
  onReset,
}) {
  const { t } = useTranslation();

  const toggleSetValue = (key, value) => {
    const current = new Set(filters[key]);
    if (current.has(value)) {
      current.delete(value);
    } else {
      current.add(value);
    }
    onChange({ ...filters, [key]: current });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="label-uppercase">{t("product.filters")}</h2>
        <button
          type="button"
          onClick={onReset}
          className="text-xs text-charcoal-400 underline hover:text-gold-600 dark:text-ivory-300 dark:hover:text-gold-400"
        >
          {t("product.reset")}
        </button>
      </div>

      <fieldset>
        <legend className="label-uppercase mb-3 text-xs">{t("product.category")}</legend>
        <div className="space-y-2">
          {categories.map((category) => (
            <Checkbox
              key={category.slug}
              checked={filters.categories.has(category.slug)}
              onChange={() => toggleSetValue("categories", category.slug)}
              label={category.name}
            />
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="label-uppercase mb-3 text-xs">{t("product.price")}</legend>
        <div className="flex items-center justify-between text-xs text-charcoal-400 dark:text-ivory-300">
          <span>{formatCurrency(filters.priceMin ?? priceBounds.min)}</span>
          <span>{formatCurrency(filters.priceMax ?? priceBounds.max)}</span>
        </div>
        <div className="mt-2 space-y-2">
          <input
            type="range"
            min={priceBounds.min}
            max={priceBounds.max}
            value={filters.priceMin ?? priceBounds.min}
            onChange={(e) => {
              const next = Math.min(Number(e.target.value), filters.priceMax ?? priceBounds.max);
              onChange({ ...filters, priceMin: next });
            }}
            className="w-full accent-gold-600"
            aria-label="Minimum price"
          />
          <input
            type="range"
            min={priceBounds.min}
            max={priceBounds.max}
            value={filters.priceMax ?? priceBounds.max}
            onChange={(e) => {
              const next = Math.max(Number(e.target.value), filters.priceMin ?? priceBounds.min);
              onChange({ ...filters, priceMax: next });
            }}
            className="w-full accent-gold-600"
            aria-label="Maximum price"
          />
        </div>
      </fieldset>

      {availableSizes.length > 0 && (
        <fieldset>
          <legend className="label-uppercase mb-3 text-xs">{t("product.size")}</legend>
          <div className="flex flex-wrap gap-2">
            {availableSizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => toggleSetValue("sizes", size)}
                aria-pressed={filters.sizes.has(size)}
                className={`border px-3 py-1.5 text-xs transition-colors duration-200 ${
                  filters.sizes.has(size)
                    ? "border-charcoal-800 bg-charcoal-800 text-ivory dark:border-gold-500 dark:bg-gold-500 dark:text-charcoal-900"
                    : "border-charcoal-100 text-charcoal-500 hover:border-charcoal-400 dark:border-charcoal-500 dark:text-ivory-200"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {availableColors.length > 0 && (
        <fieldset>
          <legend className="label-uppercase mb-3 text-xs">{t("product.color")}</legend>
          <div className="flex flex-wrap gap-2">
            {availableColors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => toggleSetValue("colors", color)}
                aria-pressed={filters.colors.has(color)}
                className={`border px-3 py-1.5 text-xs transition-colors duration-200 ${
                  filters.colors.has(color)
                    ? "border-charcoal-800 bg-charcoal-800 text-ivory dark:border-gold-500 dark:bg-gold-500 dark:text-charcoal-900"
                    : "border-charcoal-100 text-charcoal-500 hover:border-charcoal-400 dark:border-charcoal-500 dark:text-ivory-200"
                }`}
              >
                {color}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <fieldset>
        <legend className="label-uppercase mb-3 text-xs">{t("product.rating")}</legend>
        <div className="space-y-2">
          {[4, 3, 2, 1].map((stars) => (
            <label
              key={stars}
              className="flex cursor-pointer items-center gap-2 text-sm text-charcoal-600 dark:text-ivory-200"
            >
              <input
                type="radio"
                name="minRating"
                checked={filters.minRating === stars}
                onChange={() => onChange({ ...filters, minRating: stars })}
                className="h-4 w-4 accent-gold-600"
              />
              {t("product.starsAndUp", { count: stars })}
            </label>
          ))}
          <label className="flex cursor-pointer items-center gap-2 text-sm text-charcoal-600 dark:text-ivory-200">
            <input
              type="radio"
              name="minRating"
              checked={filters.minRating === 0}
              onChange={() => onChange({ ...filters, minRating: 0 })}
              className="h-4 w-4 accent-gold-600"
            />
            {t("product.anyRating")}
          </label>
        </div>
      </fieldset>

      <fieldset className="space-y-2">
        <Checkbox
          checked={filters.inStockOnly}
          onChange={() => onChange({ ...filters, inStockOnly: !filters.inStockOnly })}
          label={t("product.inStockOnly")}
        />
        <Checkbox
          checked={filters.onSaleOnly}
          onChange={() => onChange({ ...filters, onSaleOnly: !filters.onSaleOnly })}
          label={t("product.onSale")}
        />
      </fieldset>
    </div>
  );
}
