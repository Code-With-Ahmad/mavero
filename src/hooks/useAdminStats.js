import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";

const LOW_STOCK_THRESHOLD = 5;

export default function useAdminStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [ordersSnap, usersSnap, productsSnap] = await Promise.all([
          getDocs(collection(db, "orders")),
          getDocs(collection(db, "users")),
          getDocs(collection(db, "products")),
        ]);

        const orders = ordersSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        const products = productsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

        const totalRevenue = orders
          .filter((o) => o.status !== "cancelled")
          .reduce((sum, o) => sum + (o.total || 0), 0);

        const ordersByStatus = orders.reduce((acc, o) => {
          acc[o.status] = (acc[o.status] || 0) + 1;
          return acc;
        }, {});

        const salesByDay = {};
        orders.forEach((o) => {
          if (!o.createdAt?.seconds) return;
          const date = new Date(o.createdAt.seconds * 1000).toISOString().slice(0, 10);
          salesByDay[date] = (salesByDay[date] || 0) + (o.total || 0);
        });
        const salesOverTime = Object.entries(salesByDay)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([date, total]) => ({ date, total }));

        const productSales = {};
        orders.forEach((o) => {
          o.items?.forEach((item) => {
            productSales[item.name] = (productSales[item.name] || 0) + item.quantity;
          });
        });
        const topProducts = Object.entries(productSales)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([name, quantity]) => ({ name, quantity }));

        const revenueByCategory = {};
        orders.forEach((o) => {
          o.items?.forEach((item) => {
            const product = products.find((p) => p.id === item.sku);
            const category = product?.category || "other";
            revenueByCategory[category] =
              (revenueByCategory[category] || 0) + item.price * item.quantity;
          });
        });
        const categoryRevenue = Object.entries(revenueByCategory).map(([category, revenue]) => ({
          category,
          revenue,
        }));

        const lowStockProducts = products.filter(
          (p) => (p.stock ?? 0) <= LOW_STOCK_THRESHOLD
        );

        const recentOrders = [...orders]
          .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
          .slice(0, 8);

        if (!cancelled) {
          setStats({
            totalRevenue,
            totalOrders: orders.length,
            totalCustomers: usersSnap.size,
            totalProducts: products.length,
            lowStockProducts,
            ordersByStatus,
            salesOverTime,
            topProducts,
            categoryRevenue,
            recentOrders,
          });
        }
      } catch (err) {
        console.error("[Mavero] useAdminStats fetch failed:", err);
        if (!cancelled) setError(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { stats, loading, error };
}
