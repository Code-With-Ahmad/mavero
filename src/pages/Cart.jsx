import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaBagShopping, FaMinus, FaPlus, FaTrash, FaTag } from "react-icons/fa6";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { formatCurrency } from "../utils/formatCurrency";
import EmptyState from "../components/common/EmptyState";

export default function Cart() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    items,
    updateQuantity,
    removeItem,
    subtotal,
    discount,
    total,
    appliedCoupon,
    couponError,
    couponLoading,
    applyCoupon,
    removeCoupon,
  } = useCart();
  const [couponInput, setCouponInput] = useState("");

  const handleApplyCoupon = async (event) => {
    event.preventDefault();
    if (!couponInput.trim()) return;
    const success = await applyCoupon(couponInput);
    if (success) {
      toast.success(t("cart.couponAppliedToast"));
      setCouponInput("");
    }
  };

  const handleCheckout = () => {
    if (!user) {
      navigate("/login", { state: { from: { pathname: "/checkout" } } });
      return;
    }
    navigate("/checkout");
  };

  if (items.length === 0) {
    return (
      <div className="container-boutique py-14">
        <EmptyState
          icon={<FaBagShopping />}
          title={t("cart.empty")}
          description={t("cart.emptyBody")}
          action={
            <Link to="/shop" className="btn-primary">
              {t("cart.shopNow")}
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="container-boutique py-10 sm:py-14">
      <div className="mb-8">
        <p className="label-uppercase">{t("common.brand")}</p>
        <h1 className="mt-2 text-4xl font-semibold">{t("cart.yourCart")}</h1>
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_360px]">
        <ul className="divide-y divide-charcoal-100 dark:divide-charcoal-500">
          {items.map((item) => (
            <li key={item.id} className="flex gap-5 py-6">
              <Link
                to={`/product/${item.sku}`}
                className="h-32 w-24 shrink-0 overflow-hidden bg-ivory-200 dark:bg-charcoal-600"
              >
                {item.image && (
                  <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                )}
              </Link>
              <div className="flex flex-1 flex-col justify-between">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Link
                      to={`/product/${item.sku}`}
                      className="font-serif text-lg text-charcoal-800 hover:text-gold-700 dark:text-ivory-100 dark:hover:text-gold-400"
                    >
                      {item.name}
                    </Link>
                    {item.variant && (item.variant.size || item.variant.color) && (
                      <p className="mt-1 text-xs text-charcoal-400 dark:text-ivory-300">
                        {[item.variant.size, item.variant.color].filter(Boolean).join(" / ")}
                      </p>
                    )}
                  </div>
                  <p className="font-medium text-charcoal-800 dark:text-ivory-100">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center border border-charcoal-200 dark:border-charcoal-500">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      aria-label="Decrease quantity"
                      className="p-2.5 text-charcoal-500 disabled:opacity-30 dark:text-ivory-200"
                    >
                      <FaMinus className="h-3 w-3" />
                    </button>
                    <span className="w-10 text-center text-sm">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={item.quantity >= (item.maxStock || 99)}
                      aria-label="Increase quantity"
                      className="p-2.5 text-charcoal-500 disabled:opacity-30 dark:text-ivory-200"
                    >
                      <FaPlus className="h-3 w-3" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-charcoal-400 hover:text-burgundy-500 dark:text-ivory-300"
                  >
                    <FaTrash className="h-3 w-3" /> {t("common.remove")}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="card-surface h-fit space-y-6 p-6">
          <h2 className="label-uppercase">{t("cart.orderSummary")}</h2>

          <form onSubmit={handleApplyCoupon} className="space-y-2">
            <label htmlFor="coupon" className="label-uppercase text-xs">
              {t("cart.couponCode")}
            </label>
            <div className="flex gap-2">
              <input
                id="coupon"
                type="text"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                placeholder={t("cart.couponPlaceholder")}
                className="input-field flex-1"
                disabled={!!appliedCoupon}
              />
              {appliedCoupon ? (
                <button type="button" onClick={removeCoupon} className="btn-secondary shrink-0">
                  {t("cart.removeCoupon")}
                </button>
              ) : (
                <button type="submit" disabled={couponLoading} className="btn-secondary shrink-0">
                  {couponLoading ? t("cart.applying") : t("cart.apply")}
                </button>
              )}
            </div>
            {couponError && (
              <p role="alert" className="text-xs text-burgundy-400 dark:text-burgundy-300">
                {couponError}
              </p>
            )}
            {appliedCoupon && (
              <p className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                <FaTag /> {t("cart.couponApplied", { code: appliedCoupon.code })}
              </p>
            )}
          </form>

          <div className="space-y-3 border-t border-charcoal-100 pt-4 text-sm dark:border-charcoal-500">
            <div className="flex justify-between text-charcoal-500 dark:text-ivory-200">
              <span>{t("cart.subtotal")}</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                <span>{t("cart.discount")}</span>
                <span>-{formatCurrency(discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-charcoal-500 dark:text-ivory-200">
              <span>{t("cart.shipping")}</span>
              <span>{t("cart.shippingAtCheckout")}</span>
            </div>
            <div className="flex justify-between border-t border-charcoal-100 pt-3 text-base font-medium text-charcoal-900 dark:border-charcoal-500 dark:text-ivory-100">
              <span>{t("cart.total")}</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>

          <button type="button" onClick={handleCheckout} className="btn-primary w-full">
            {t("cart.proceedToCheckout")}
          </button>
        </div>
      </div>
    </div>
  );
}
