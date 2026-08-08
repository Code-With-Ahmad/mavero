import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { db } from "../lib/firebase";
import useOrder from "../hooks/useOrder";
import { useCart } from "../context/CartContext";
import { formatCurrency } from "../utils/formatCurrency";
import OrderStatusTracker from "../components/common/OrderStatusTracker";
import OrderStatusBadge from "../components/common/OrderStatusBadge";
import Skeleton from "../components/common/Skeleton";
import ErrorState from "../components/common/ErrorState";
import EmptyState from "../components/common/EmptyState";

function formatDate(timestamp) {
  if (!timestamp?.seconds) return "";
  return new Date(timestamp.seconds * 1000).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function OrderDetail() {
  const { t } = useTranslation();
  const { orderId } = useParams();
  const { order, loading, error, refetch } = useOrder(orderId);
  const { addItem } = useCart();
  const [reordering, setReordering] = useState(false);

  const handleReorder = async () => {
    setReordering(true);
    let added = 0;
    let skipped = 0;
    try {
      for (const item of order.items) {
        const snap = await getDoc(doc(db, "products", item.sku));
        if (!snap.exists()) {
          skipped++;
          continue;
        }
        const product = { id: snap.id, ...snap.data() };
        const variant = item.variant
          ? product.variants?.find(
              (v) => v.size === item.variant.size && v.color === item.variant.color
            )
          : null;
        const availableStock = variant ? variant.stock : product.stock;
        if (!availableStock || availableStock === 0) {
          skipped++;
          continue;
        }
        await addItem(product, variant, Math.min(item.quantity, availableStock));
        added++;
      }
      if (added > 0) toast.success(t("toast.itemsAddedToCart", { count: added }));
      if (skipped > 0) toast(t("toast.itemsUnavailable", { count: skipped }), { icon: "ℹ️" });
    } catch {
      toast.error(t("toast.couldNotReorder"));
    } finally {
      setReordering(false);
    }
  };

  if (loading) {
    return (
      <div className="container-boutique py-14">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-6 h-64 w-full" />
      </div>
    );
  }

  if (error) return <ErrorState onRetry={refetch} />;

  if (!order) {
    return (
      <EmptyState
        title={t("orders.orderNotFound")}
        action={
          <Link to="/orders" className="btn-secondary">
            {t("orders.backToOrders")}
          </Link>
        }
      />
    );
  }

  return (
    <div className="container-boutique max-w-3xl py-10 sm:py-14">
      <Link to="/orders" className="text-xs text-charcoal-400 hover:text-gold-600 dark:text-ivory-300 dark:hover:text-gold-400">
        <span className="rtl:hidden">&larr; </span>
        {t("orders.backToOrders")}
        <span className="hidden rtl:inline"> &rarr;</span>
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold">{order.orderNumber}</h1>
          <p className="mt-1 text-sm text-charcoal-400 dark:text-ivory-300">
            {t("orders.placedOn", { date: formatDate(order.createdAt) })}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="card-surface mt-8 p-6">
        <OrderStatusTracker status={order.status} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="card-surface p-5">
          <h2 className="label-uppercase mb-3 text-xs">{t("orders.shippingTo")}</h2>
          <p className="text-sm text-charcoal-700 dark:text-ivory-100">{order.shipping.fullName}</p>
          <p className="text-sm text-charcoal-500 dark:text-ivory-200">
            {order.shipping.addressLine1}
            {order.shipping.addressLine2 ? `, ${order.shipping.addressLine2}` : ""}
          </p>
          <p className="text-sm text-charcoal-500 dark:text-ivory-200">
            {order.shipping.city}, {order.shipping.state} {order.shipping.postalCode}
          </p>
          <p className="text-sm text-charcoal-500 dark:text-ivory-200">{order.shipping.country}</p>
        </div>
        <div className="card-surface p-5">
          <h2 className="label-uppercase mb-3 text-xs">{t("orders.payment")}</h2>
          <p className="text-sm text-charcoal-700 dark:text-ivory-100">{order.paymentSummary}</p>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="label-uppercase mb-3 text-xs">{t("orders.items")}</h2>
        <ul className="divide-y divide-charcoal-100 dark:divide-charcoal-500">
          {order.items.map((item, index) => (
            <li key={index} className="flex items-center gap-4 py-4">
              <div className="h-16 w-14 shrink-0 overflow-hidden bg-ivory-200 dark:bg-charcoal-600">
                {item.image && (
                  <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm text-charcoal-800 dark:text-ivory-100">{item.name}</p>
                <p className="text-xs text-charcoal-400 dark:text-ivory-300">
                  {[item.variant?.size, item.variant?.color].filter(Boolean).join(" / ")}
                  {item.variant?.size || item.variant?.color ? " · " : ""}
                  {t("checkout.qty", { count: item.quantity })}
                </p>
              </div>
              <p className="text-sm font-medium text-charcoal-800 dark:text-ivory-100">
                {formatCurrency(item.price * item.quantity)}
              </p>
            </li>
          ))}
        </ul>
      </div>

      <div className="ms-auto mt-6 max-w-xs space-y-2 text-sm">
        <div className="flex justify-between text-charcoal-500 dark:text-ivory-200">
          <span>{t("cart.subtotal")}</span>
          <span>{formatCurrency(order.subtotal)}</span>
        </div>
        {order.discount > 0 && (
          <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
            <span>{t("cart.discount")}</span>
            <span>-{formatCurrency(order.discount)}</span>
          </div>
        )}
        <div className="flex justify-between border-t border-charcoal-100 pt-2 text-base font-medium text-charcoal-900 dark:border-charcoal-500 dark:text-ivory-100">
          <span>{t("cart.total")}</span>
          <span>{formatCurrency(order.total)}</span>
        </div>
      </div>

      <div className="mt-8">
        <button type="button" onClick={handleReorder} disabled={reordering} className="btn-primary">
          {reordering ? t("orders.addingToCart") : t("orders.reorder")}
        </button>
      </div>
    </div>
  );
}
