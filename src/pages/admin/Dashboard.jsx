import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  FaSackDollar,
  FaClipboardList,
  FaUsers,
  FaBoxOpen,
  FaTriangleExclamation,
} from "react-icons/fa6";
import useAdminStats from "../../hooks/useAdminStats";
import { useTheme } from "../../context/ThemeContext";
import { CATEGORICAL, SEQUENTIAL_HUE, getChartChrome } from "../../lib/chartColors";
import { formatCurrency } from "../../utils/formatCurrency";
import StatCard from "../../components/admin/StatCard";
import ChartEmptyState from "../../components/admin/ChartEmptyState";
import OrderStatusBadge from "../../components/common/OrderStatusBadge";
import Skeleton from "../../components/common/Skeleton";
import ErrorState from "../../components/common/ErrorState";

function formatDate(timestamp) {
  if (!timestamp?.seconds) return "";
  return new Date(timestamp.seconds * 1000).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export default function Dashboard() {
  const { t } = useTranslation();
  const { stats, loading, error } = useAdminStats();
  const { theme } = useTheme();
  const chrome = getChartChrome(theme);
  const categorical = CATEGORICAL[theme] || CATEGORICAL.light;
  const sequentialHue = SEQUENTIAL_HUE[theme] || SEQUENTIAL_HUE.light;

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  if (error || !stats) return <ErrorState />;

  const tooltipStyle = {
    background: chrome.tooltipBg,
    border: `1px solid ${chrome.tooltipBorder}`,
    borderRadius: 0,
    fontSize: 12,
    color: chrome.textPrimary,
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="label-uppercase">{t("common.brand")} Admin</p>
        <h1 className="mt-1 text-3xl font-semibold">{t("admin.dashboard.title")}</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={t("admin.dashboard.totalRevenue")} value={formatCurrency(stats.totalRevenue)} icon={FaSackDollar} />
        <StatCard label={t("admin.dashboard.totalOrders")} value={stats.totalOrders} icon={FaClipboardList} />
        <StatCard label={t("admin.dashboard.totalCustomers")} value={stats.totalCustomers} icon={FaUsers} />
        <StatCard label={t("admin.dashboard.totalProducts")} value={stats.totalProducts} icon={FaBoxOpen} />
      </div>

      {stats.lowStockProducts.length > 0 && (
        <div className="flex items-start gap-3 border border-burgundy-300 bg-burgundy-50 p-4 text-sm dark:border-burgundy-500 dark:bg-burgundy-900/30">
          <FaTriangleExclamation className="mt-0.5 h-4 w-4 shrink-0 text-burgundy-500 dark:text-burgundy-300" />
          <div>
            <p className="font-medium text-burgundy-700 dark:text-burgundy-200">
              {t("admin.dashboard.lowStock", { count: stats.lowStockProducts.length })}
            </p>
            <p className="mt-1 text-burgundy-600 dark:text-burgundy-300">
              {stats.lowStockProducts.map((p) => p.name).join(", ")}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card-surface p-5">
          <h2 className="label-uppercase mb-4 text-xs">{t("admin.dashboard.salesOverTime")}</h2>
          {stats.salesOverTime.length === 0 ? (
            <ChartEmptyState message={t("admin.dashboard.noChartData")} />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={stats.salesOverTime}>
                <CartesianGrid stroke={chrome.grid} vertical={false} />
                <XAxis dataKey="date" stroke={chrome.axis} tick={{ fontSize: 11, fill: chrome.muted }} />
                <YAxis stroke={chrome.axis} tick={{ fontSize: 11, fill: chrome.muted }} width={50} />
                <Tooltip contentStyle={tooltipStyle} formatter={(value) => formatCurrency(value)} />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke={sequentialHue}
                  strokeWidth={2}
                  dot={{ r: 3, fill: sequentialHue }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card-surface p-5">
          <h2 className="label-uppercase mb-4 text-xs">{t("admin.dashboard.ordersByStatus")}</h2>
          {Object.keys(stats.ordersByStatus).length === 0 ? (
            <ChartEmptyState message={t("admin.dashboard.noChartData")} />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={Object.entries(stats.ordersByStatus).map(([status, count]) => ({
                    status: t(`orderStatus.${status}`, { defaultValue: status }),
                    count,
                  }))}
                  dataKey="count"
                  nameKey="status"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {Object.keys(stats.ordersByStatus).map((_, index) => (
                    <Cell key={index} fill={categorical[index % categorical.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12, color: chrome.textSecondary }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card-surface p-5">
          <h2 className="label-uppercase mb-4 text-xs">{t("admin.dashboard.topSelling")}</h2>
          {stats.topProducts.length === 0 ? (
            <ChartEmptyState message={t("admin.dashboard.noChartData")} />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={stats.topProducts} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid stroke={chrome.grid} horizontal={false} />
                <XAxis type="number" stroke={chrome.axis} tick={{ fontSize: 11, fill: chrome.muted }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke={chrome.axis}
                  tick={{ fontSize: 11, fill: chrome.muted }}
                  width={110}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="quantity" fill={sequentialHue} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card-surface p-5">
          <h2 className="label-uppercase mb-4 text-xs">{t("admin.dashboard.revenueByCategory")}</h2>
          {stats.categoryRevenue.length === 0 ? (
            <ChartEmptyState message={t("admin.dashboard.noChartData")} />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={stats.categoryRevenue}>
                <CartesianGrid stroke={chrome.grid} vertical={false} />
                <XAxis dataKey="category" stroke={chrome.axis} tick={{ fontSize: 11, fill: chrome.muted }} />
                <YAxis stroke={chrome.axis} tick={{ fontSize: 11, fill: chrome.muted }} width={50} />
                <Tooltip contentStyle={tooltipStyle} formatter={(value) => formatCurrency(value)} />
                <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                  {stats.categoryRevenue.map((_, index) => (
                    <Cell key={index} fill={categorical[index % categorical.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="label-uppercase text-xs">{t("admin.dashboard.recentOrders")}</h2>
          <Link to="/admin/orders" className="text-sm text-gold-700 hover:underline dark:text-gold-400">
            {t("common.viewAll")}
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-start text-sm">
            <thead>
              <tr className="border-b border-charcoal-100 text-xs uppercase tracking-wider text-charcoal-400 dark:border-charcoal-500 dark:text-ivory-300">
                <th className="py-2 pe-4">{t("admin.orders.order")}</th>
                <th className="py-2 pe-4">{t("admin.orders.date")}</th>
                <th className="py-2 pe-4">{t("admin.orders.status")}</th>
                <th className="py-2 pe-4 text-end">{t("admin.orders.total")}</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.map((order) => (
                <tr key={order.id} className="border-b border-charcoal-100 dark:border-charcoal-600">
                  <td className="py-3 pe-4">
                    <Link to={`/admin/orders/${order.id}`} className="hover:text-gold-600 dark:hover:text-gold-400">
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="py-3 pe-4 text-charcoal-400 dark:text-ivory-300">{formatDate(order.createdAt)}</td>
                  <td className="py-3 pe-4">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="py-3 pe-4 text-end font-medium">{formatCurrency(order.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
