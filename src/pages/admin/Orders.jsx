import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaChevronDown } from "react-icons/fa6";
import toast from "react-hot-toast";
import useAdminOrders from "../../hooks/useAdminOrders";
import usePagination from "../../hooks/usePagination";
import useSortableData from "../../hooks/useSortableData";
import { formatCurrency } from "../../utils/formatCurrency";
import OrderStatusBadge from "../../components/common/OrderStatusBadge";
import Skeleton from "../../components/common/Skeleton";
import ErrorState from "../../components/common/ErrorState";
import EmptyState from "../../components/common/EmptyState";
import Pagination from "../../components/admin/Pagination";
import SortableTh from "../../components/admin/SortableTh";
import Select from "../../components/common/Select";

const STATUS_OPTIONS = ["pending", "processing", "shipped", "delivered", "cancelled"];

const SORT_COLUMNS = {
  order: (o) => o.orderNumber,
  customer: (o) => (o.shipping?.fullName || o.customerEmail)?.toLowerCase(),
  date: (o) => o.createdAt?.seconds || 0,
  total: (o) => o.total,
  status: (o) => o.status,
};

function formatDate(timestamp) {
  if (!timestamp?.seconds) return "";
  return new Date(timestamp.seconds * 1000).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function AdminOrders() {
  const { t } = useTranslation();
  const { orders, loading, error, refetch, updateStatus } = useAdminOrders();
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return orders.filter((order) => {
      if (statusFilter !== "all" && order.status !== statusFilter) return false;
      if (search) {
        const q = search.trim().toLowerCase();
        const matches =
          order.orderNumber?.toLowerCase().includes(q) ||
          order.customerEmail?.toLowerCase().includes(q) ||
          order.shipping?.fullName?.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [orders, statusFilter, search]);

  const { sorted, sortKey, direction, toggleSort } = useSortableData(filtered, SORT_COLUMNS);
  const { page, setPage, totalPages, pageItems } = usePagination(sorted, 10);

  const handleStatusChange = async (orderId, status) => {
    try {
      await updateStatus(orderId, status);
      toast.success(t("admin.orders.statusUpdated"));
    } catch {
      toast.error(t("admin.orders.couldNotUpdateStatus"));
    }
  };

  return (
    <div>
      <div className="mb-6">
        <p className="label-uppercase">{t("common.brand")} Admin</p>
        <h1 className="mt-1 text-3xl font-semibold">{t("admin.orders.title")}</h1>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          type="search"
          placeholder={t("admin.orders.searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field max-w-xs"
        />
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-auto"
        >
          <option value="all">{t("admin.orders.allStatuses")}</option>
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {t(`orderStatus.${status}`)}
            </option>
          ))}
        </Select>
      </div>

      {loading && (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      )}

      {!loading && error && <ErrorState onRetry={refetch} />}

      {!loading && !error && filtered.length === 0 && (
        <EmptyState title={t("admin.orders.noOrders")} description={t("admin.orders.noOrdersBody")} />
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-start text-sm">
            <thead>
              <tr className="border-b border-charcoal-100 text-xs uppercase tracking-wider text-charcoal-400 dark:border-charcoal-500 dark:text-ivory-300">
                <SortableTh label={t("admin.orders.order")} sortKey="order" currentKey={sortKey} direction={direction} onSort={toggleSort} />
                <SortableTh label={t("admin.orders.customer")} sortKey="customer" currentKey={sortKey} direction={direction} onSort={toggleSort} />
                <SortableTh label={t("admin.orders.date")} sortKey="date" currentKey={sortKey} direction={direction} onSort={toggleSort} />
                <SortableTh label={t("admin.orders.total")} sortKey="total" currentKey={sortKey} direction={direction} onSort={toggleSort} />
                <SortableTh label={t("admin.orders.status")} sortKey="status" currentKey={sortKey} direction={direction} onSort={toggleSort} />
              </tr>
            </thead>
            <tbody>
              {pageItems.map((order) => (
                <tr key={order.id} className="border-b border-charcoal-100 dark:border-charcoal-600">
                  <td className="py-3 pe-4">
                    <Link to={`/admin/orders/${order.id}`} className="hover:text-gold-600 dark:hover:text-gold-400">
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="py-3 pe-4 text-charcoal-500 dark:text-ivory-200">
                    {order.shipping?.fullName || order.customerEmail}
                  </td>
                  <td className="py-3 pe-4 text-charcoal-400 dark:text-ivory-300">{formatDate(order.createdAt)}</td>
                  <td className="py-3 pe-4 font-medium">{formatCurrency(order.total)}</td>
                  <td className="py-3 pe-4">
                    <div className="flex items-center gap-2">
                      <OrderStatusBadge status={order.status} />
                      <div className="relative">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className="appearance-none border border-charcoal-100 bg-transparent py-1 ps-1.5 pe-5 text-xs dark:border-charcoal-500"
                          aria-label={`Update status for ${order.orderNumber}`}
                        >
                          {STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>
                              {t(`orderStatus.${status}`)}
                            </option>
                          ))}
                        </select>
                        <FaChevronDown
                          aria-hidden="true"
                          className="pointer-events-none absolute end-1.5 top-1/2 h-2.5 w-2.5 -translate-y-1/2 text-charcoal-400 dark:text-ivory-300"
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}
