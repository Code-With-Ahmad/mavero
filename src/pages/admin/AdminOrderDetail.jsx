import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import useOrder from "../../hooks/useOrder";
import useAdminOrders from "../../hooks/useAdminOrders";
import { formatCurrency } from "../../utils/formatCurrency";
import OrderStatusTracker from "../../components/common/OrderStatusTracker";
import Skeleton from "../../components/common/Skeleton";
import ErrorState from "../../components/common/ErrorState";
import EmptyState from "../../components/common/EmptyState";
import Select from "../../components/common/Select";

const STATUS_OPTIONS = ["pending", "processing", "shipped", "delivered", "cancelled"];

function formatDate(timestamp) {
  if (!timestamp?.seconds) return "";
  return new Date(timestamp.seconds * 1000).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminOrderDetail() {
  const { t } = useTranslation();
  const { orderId } = useParams();
  const { order, loading, error, refetch } = useOrder(orderId);
  const { updateStatus } = useAdminOrders();

  const handleStatusChange = async (status) => {
    try {
      await updateStatus(orderId, status);
      toast.success(t("admin.orders.statusUpdated"));
      refetch();
    } catch {
      toast.error(t("admin.orders.couldNotUpdateStatus"));
    }
  };

  if (loading) return <Skeleton className="h-96 w-full max-w-3xl" />;
  if (error) return <ErrorState onRetry={refetch} />;
  if (!order) return <EmptyState title={t("orders.orderNotFound")} />;

  return (
    <div className="max-w-3xl">
      <Link to="/admin/orders" className="text-xs text-charcoal-400 hover:text-gold-600 dark:text-ivory-300">
        <span className="rtl:hidden">&larr; </span>
        {t("orders.backToOrders")}
        <span className="hidden rtl:inline"> &rarr;</span>
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">{order.orderNumber}</h1>
          <p className="mt-1 text-sm text-charcoal-400 dark:text-ivory-300">
            {t("orders.placedOn", { date: formatDate(order.createdAt) })}
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <span className="label-uppercase text-xs">{t("admin.orders.status")}</span>
          <Select
            value={order.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="w-auto"
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {t(`orderStatus.${status}`)}
              </option>
            ))}
          </Select>
        </label>
      </div>

      <div className="card-surface mt-8 p-6">
        <OrderStatusTracker status={order.status} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="card-surface p-5">
          <h2 className="label-uppercase mb-3 text-xs">{t("admin.orders.customer")}</h2>
          <p className="text-sm text-charcoal-700 dark:text-ivory-100">{order.shipping.fullName}</p>
          <p className="text-sm text-charcoal-500 dark:text-ivory-200">{order.customerEmail}</p>
          <p className="text-sm text-charcoal-500 dark:text-ivory-200">{order.shipping.phone}</p>
        </div>
        <div className="card-surface p-5">
          <h2 className="label-uppercase mb-3 text-xs">{t("admin.orders.shippingAddress")}</h2>
          <p className="text-sm text-charcoal-500 dark:text-ivory-200">
            {order.shipping.addressLine1}
            {order.shipping.addressLine2 ? `, ${order.shipping.addressLine2}` : ""}
          </p>
          <p className="text-sm text-charcoal-500 dark:text-ivory-200">
            {order.shipping.city}, {order.shipping.state} {order.shipping.postalCode}
          </p>
          <p className="text-sm text-charcoal-500 dark:text-ivory-200">{order.shipping.country}</p>
          {order.shipping.note && (
            <p className="mt-2 text-xs italic text-charcoal-400 dark:text-ivory-300">
              &ldquo;{order.shipping.note}&rdquo;
            </p>
          )}
        </div>
      </div>

      <div className="card-surface mt-6 p-5">
        <h2 className="label-uppercase mb-3 text-xs">{t("orders.payment")}</h2>
        <p className="text-sm text-charcoal-700 dark:text-ivory-100">{order.paymentSummary}</p>
      </div>

      <div className="mt-8">
        <h2 className="label-uppercase mb-3 text-xs">{t("orders.items")}</h2>
        <ul className="divide-y divide-charcoal-100 dark:divide-charcoal-500">
          {order.items.map((item, index) => (
            <li key={index} className="flex items-center gap-4 py-4">
              <div className="h-16 w-14 shrink-0 overflow-hidden bg-ivory-200 dark:bg-charcoal-600">
                {item.image && <img src={item.image} alt={item.name} className="h-full w-full object-cover" />}
              </div>
              <div className="flex-1">
                <p className="text-sm text-charcoal-800 dark:text-ivory-100">{item.name}</p>
                <p className="text-xs text-charcoal-400 dark:text-ivory-300">
                  {[item.variant?.size, item.variant?.color].filter(Boolean).join(" / ")}
                  {item.variant?.size || item.variant?.color ? " · " : ""}
                  {t("checkout.qty", { count: item.quantity })}
                </p>
              </div>
              <p className="text-sm font-medium">{formatCurrency(item.price * item.quantity)}</p>
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
            <span>{t("cart.discount")} {order.couponCode ? `(${order.couponCode})` : ""}</span>
            <span>-{formatCurrency(order.discount)}</span>
          </div>
        )}
        <div className="flex justify-between border-t border-charcoal-100 pt-2 text-base font-medium dark:border-charcoal-500">
          <span>{t("cart.total")}</span>
          <span>{formatCurrency(order.total)}</span>
        </div>
      </div>
    </div>
  );
}
