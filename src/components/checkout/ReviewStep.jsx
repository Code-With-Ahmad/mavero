import { useTranslation } from "react-i18next";
import { formatCurrency } from "../../utils/formatCurrency";

export default function ReviewStep({
  shipping,
  payment,
  items,
  subtotal,
  discount,
  total,
  couponCode,
  onBack,
  onPlaceOrder,
  submitting,
}) {
  const { t } = useTranslation();
  return (
    <div className="space-y-8">
      <h2 className="font-serif text-2xl font-semibold">{t("checkout.reviewYourOrder")}</h2>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="card-surface p-5">
          <h3 className="label-uppercase mb-3 text-xs">{t("checkout.shippingTo")}</h3>
          <p className="text-sm text-charcoal-700 dark:text-ivory-100">{shipping.fullName}</p>
          <p className="text-sm text-charcoal-500 dark:text-ivory-200">
            {shipping.addressLine1}
            {shipping.addressLine2 ? `, ${shipping.addressLine2}` : ""}
          </p>
          <p className="text-sm text-charcoal-500 dark:text-ivory-200">
            {shipping.city}, {shipping.state} {shipping.postalCode}
          </p>
          <p className="text-sm text-charcoal-500 dark:text-ivory-200">{shipping.country}</p>
          <p className="mt-2 text-sm text-charcoal-500 dark:text-ivory-200">{shipping.phone}</p>
          {shipping.note && (
            <p className="mt-2 text-xs italic text-charcoal-400 dark:text-ivory-300">
              &ldquo;{shipping.note}&rdquo;
            </p>
          )}
        </div>

        <div className="card-surface p-5">
          <h3 className="label-uppercase mb-3 text-xs">{t("checkout.paymentMethod")}</h3>
          <p className="text-sm text-charcoal-700 dark:text-ivory-100">{payment.summary}</p>
        </div>
      </div>

      <div>
        <h3 className="label-uppercase mb-3 text-xs">{t("checkout.items")}</h3>
        <ul className="divide-y divide-charcoal-100 dark:divide-charcoal-500">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-4 py-3">
              <div className="h-16 w-14 shrink-0 overflow-hidden bg-ivory-200 dark:bg-charcoal-600">
                {item.image && (
                  <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm text-charcoal-800 dark:text-ivory-100">{item.name}</p>
                {item.variant && (item.variant.size || item.variant.color) && (
                  <p className="text-xs text-charcoal-400 dark:text-ivory-300">
                    {[item.variant.size, item.variant.color].filter(Boolean).join(" / ")} ·{" "}
                    {t("checkout.qty", { count: item.quantity })}
                  </p>
                )}
                {!item.variant && (
                  <p className="text-xs text-charcoal-400 dark:text-ivory-300">
                    {t("checkout.qty", { count: item.quantity })}
                  </p>
                )}
              </div>
              <p className="text-sm font-medium text-charcoal-800 dark:text-ivory-100">
                {formatCurrency(item.price * item.quantity)}
              </p>
            </li>
          ))}
        </ul>
      </div>

      <div className="ms-auto max-w-xs space-y-2 text-sm">
        <div className="flex justify-between text-charcoal-500 dark:text-ivory-200">
          <span>{t("cart.subtotal")}</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
            <span>{t("cart.discount")} ({couponCode})</span>
            <span>-{formatCurrency(discount)}</span>
          </div>
        )}
        <div className="flex justify-between border-t border-charcoal-100 pt-2 text-base font-medium text-charcoal-900 dark:border-charcoal-500 dark:text-ivory-100">
          <span>{t("cart.total")}</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={onBack} disabled={submitting} className="btn-secondary">
          {t("common.back")}
        </button>
        <button
          type="button"
          onClick={onPlaceOrder}
          disabled={submitting}
          className="btn-primary flex-1"
        >
          {submitting ? t("checkout.placingOrder") : t("checkout.placeOrder")}
        </button>
      </div>
    </div>
  );
}
