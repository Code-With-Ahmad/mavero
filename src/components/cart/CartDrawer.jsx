import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaXmark, FaMinus, FaPlus, FaTrash, FaBagShopping } from "react-icons/fa6";
import { useCart } from "../../context/CartContext";
import { formatCurrency } from "../../utils/formatCurrency";
import EmptyState from "../common/EmptyState";

export default function CartDrawer() {
  const { t } = useTranslation();
  const { items, drawerOpen, closeDrawer, updateQuantity, removeItem, subtotal } = useCart();

  if (!drawerOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-charcoal-900/60"
        onClick={closeDrawer}
        aria-hidden="true"
      />
      <div className="absolute inset-y-0 end-0 flex w-full max-w-md flex-col bg-ivory dark:bg-charcoal-800">
        <div className="flex items-center justify-between border-b border-charcoal-100 px-6 py-5 dark:border-charcoal-500">
          <h2 className="font-serif text-xl font-semibold">{t("cart.yourCart")}</h2>
          <button
            type="button"
            onClick={closeDrawer}
            aria-label={t("common.close")}
            className="text-charcoal-600 dark:text-ivory-200"
          >
            <FaXmark className="h-5 w-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1">
            <EmptyState
              icon={<FaBagShopping />}
              title={t("cart.empty")}
              description={t("cart.emptyBodyDrawer")}
              action={
                <Link to="/shop" onClick={closeDrawer} className="btn-primary">
                  {t("cart.shopNow")}
                </Link>
              }
            />
          </div>
        ) : (
          <>
            <ul className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
              {items.map((item) => (
                <li key={item.id} className="flex gap-4">
                  <Link
                    to={`/product/${item.sku}`}
                    onClick={closeDrawer}
                    className="h-24 w-20 shrink-0 overflow-hidden bg-ivory-200 dark:bg-charcoal-600"
                  >
                    {item.image && (
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    )}
                  </Link>
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <Link
                        to={`/product/${item.sku}`}
                        onClick={closeDrawer}
                        className="text-sm font-medium text-charcoal-800 hover:text-gold-700 dark:text-ivory-100 dark:hover:text-gold-400"
                      >
                        {item.name}
                      </Link>
                      {item.variant && (item.variant.size || item.variant.color) && (
                        <p className="mt-0.5 text-xs text-charcoal-400 dark:text-ivory-300">
                          {[item.variant.size, item.variant.color].filter(Boolean).join(" / ")}
                        </p>
                      )}
                      <p className="mt-1 text-sm text-charcoal-600 dark:text-ivory-200">
                        {formatCurrency(item.price)}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center border border-charcoal-200 dark:border-charcoal-500">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          aria-label="Decrease quantity"
                          className="p-2 text-charcoal-500 disabled:opacity-30 dark:text-ivory-200"
                        >
                          <FaMinus className="h-2.5 w-2.5" />
                        </button>
                        <span className="w-8 text-center text-xs">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= (item.maxStock || 99)}
                          aria-label="Increase quantity"
                          className="p-2 text-charcoal-500 disabled:opacity-30 dark:text-ivory-200"
                        >
                          <FaPlus className="h-2.5 w-2.5" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        aria-label={`${t("common.remove")} ${item.name}`}
                        className="text-charcoal-300 hover:text-burgundy-500 dark:text-ivory-300"
                      >
                        <FaTrash className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-charcoal-100 px-6 py-6 dark:border-charcoal-500">
              <div className="mb-4 flex items-center justify-between text-sm">
                <span className="text-charcoal-500 dark:text-ivory-200">{t("cart.subtotal")}</span>
                <span className="font-medium text-charcoal-800 dark:text-ivory-100">
                  {formatCurrency(subtotal)}
                </span>
              </div>
              <div className="flex flex-col gap-3">
                <Link to="/cart" onClick={closeDrawer} className="btn-secondary w-full">
                  {t("cart.viewCart")}
                </Link>
                <Link to="/checkout" onClick={closeDrawer} className="btn-primary w-full">
                  {t("cart.checkout")}
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
