import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaBoxOpen } from "react-icons/fa6";
import { useAuth } from "../context/AuthContext";
import useUserOrders from "../hooks/useUserOrders";
import { formatCurrency } from "../utils/formatCurrency";
import OrderStatusBadge from "../components/common/OrderStatusBadge";
import Skeleton from "../components/common/Skeleton";
import EmptyState from "../components/common/EmptyState";
import ErrorState from "../components/common/ErrorState";

function formatDate(timestamp) {
  if (!timestamp?.seconds) return "";
  return new Date(timestamp.seconds * 1000).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function Orders() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { orders, loading, error, refetch } = useUserOrders(user?.uid);

  return (
    <div className="container-boutique py-10 sm:py-14">
      <div className="mb-8">
        <p className="label-uppercase">{t("common.brand")}</p>
        <h1 className="mt-2 text-4xl font-semibold">{t("orders.myOrders")}</h1>
      </div>

      {loading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      )}

      {!loading && error && <ErrorState error={error} onRetry={refetch} />}

      {!loading && !error && orders.length === 0 && (
        <EmptyState
          icon={<FaBoxOpen />}
          title={t("orders.noOrders")}
          description={t("orders.noOrdersBody")}
          action={
            <Link to="/shop" className="btn-primary">
              {t("orders.startShopping")}
            </Link>
          }
        />
      )}

      {!loading && !error && orders.length > 0 && (
        <ul className="space-y-4">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                to={`/orders/${order.id}`}
                className="card-surface flex flex-col gap-4 p-5 transition-colors duration-200 hover:border-gold-400 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-charcoal-800 dark:text-ivory-100">
                    {order.orderNumber}
                  </p>
                  <p className="text-xs text-charcoal-400 dark:text-ivory-300">
                    {formatDate(order.createdAt)} · {t("orders.itemsCount", { count: order.items.length })}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <OrderStatusBadge status={order.status} />
                  <p className="text-sm font-medium text-charcoal-800 dark:text-ivory-100">
                    {formatCurrency(order.total)}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
