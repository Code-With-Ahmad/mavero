import { Link, useLocation, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaCircleCheck } from "react-icons/fa6";
import useOrder from "../hooks/useOrder";
import { formatCurrency } from "../utils/formatCurrency";
import OrderStatusTracker from "../components/common/OrderStatusTracker";
import Skeleton from "../components/common/Skeleton";
import ErrorState from "../components/common/ErrorState";
import EmptyState from "../components/common/EmptyState";

export default function OrderConfirmation() {
  const { t } = useTranslation();
  const { orderId } = useParams();
  const location = useLocation();
  const { order, loading, error, refetch } = useOrder(orderId, location.state?.order || null);

  if (loading) {
    return (
      <div className="container-boutique max-w-2xl py-16">
        <Skeleton className="mx-auto h-10 w-10 rounded-full" />
        <Skeleton className="mx-auto mt-4 h-8 w-64" />
        <Skeleton className="mt-8 h-40 w-full" />
      </div>
    );
  }

  if (error) return <ErrorState onRetry={refetch} />;

  if (!order) {
    return (
      <EmptyState
        title={t("orders.orderNotFound")}
        description={t("orders.orderNotFound")}
        action={
          <Link to="/" className="btn-secondary">
            {t("common.backToHome")}
          </Link>
        }
      />
    );
  }

  return (
    <div className="container-boutique max-w-2xl py-16 text-center">
      <FaCircleCheck className="mx-auto h-12 w-12 text-emerald-600 dark:text-emerald-400" />
      <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">{t("orders.thankYou")}</h1>
      <p className="mt-2 text-sm text-charcoal-400 dark:text-ivory-300">
        {t("orders.confirmationBody")}
      </p>

      <div className="card-surface mt-10 p-6 text-start">
        <div className="flex items-center justify-between border-b border-charcoal-100 pb-4 dark:border-charcoal-500">
          <div>
            <p className="label-uppercase text-xs">{t("orders.orderNumber")}</p>
            <p className="font-medium text-charcoal-800 dark:text-ivory-100">{order.orderNumber}</p>
          </div>
          <p className="text-sm font-medium text-charcoal-800 dark:text-ivory-100">
            {formatCurrency(order.total)}
          </p>
        </div>

        <div className="py-6">
          <OrderStatusTracker status={order.status} />
        </div>

        <ul className="divide-y divide-charcoal-100 dark:divide-charcoal-500">
          {order.items.map((item, index) => (
            <li key={index} className="flex items-center gap-4 py-3">
              <div className="h-14 w-12 shrink-0 overflow-hidden bg-ivory-200 dark:bg-charcoal-600">
                {item.image && (
                  <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm text-charcoal-800 dark:text-ivory-100">{item.name}</p>
                <p className="text-xs text-charcoal-400 dark:text-ivory-300">
                  {t("checkout.qty", { count: item.quantity })}
                </p>
              </div>
              <p className="text-sm text-charcoal-700 dark:text-ivory-100">
                {formatCurrency(item.price * item.quantity)}
              </p>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Link to="/orders" className="btn-secondary">
          {t("orders.viewMyOrders")}
        </Link>
        <Link to="/shop" className="btn-primary">
          {t("orders.continueShopping")}
        </Link>
      </div>
    </div>
  );
}
