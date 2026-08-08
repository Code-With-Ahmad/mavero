import { useCallback, useEffect, useState } from "react";
import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

export default function useAdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [usersSnap, ordersSnap] = await Promise.all([
        getDocs(collection(db, "users")),
        getDocs(collection(db, "orders")),
      ]);
      const orders = ordersSnap.docs.map((d) => d.data());

      const enriched = usersSnap.docs.map((d) => {
        const userOrders = orders.filter((o) => o.userId === d.id);
        const totalSpent = userOrders
          .filter((o) => o.status !== "cancelled")
          .reduce((sum, o) => sum + (o.total || 0), 0);
        return {
          id: d.id,
          ...d.data(),
          orderCount: userOrders.length,
          totalSpent,
        };
      });
      setUsers(enriched);
    } catch (err) {
      console.error("[Mavero] useAdminUsers fetch failed:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const setRole = useCallback(async (userId, role) => {
    await updateDoc(doc(db, "users", userId), { role });
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)));
  }, []);

  const setDisabled = useCallback(async (userId, disabled) => {
    await updateDoc(doc(db, "users", userId), { disabled });
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, disabled } : u)));
  }, []);

  const bulkSetDisabled = useCallback(async (userIds, disabled) => {
    await Promise.all(userIds.map((id) => updateDoc(doc(db, "users", id), { disabled })));
    setUsers((prev) => prev.map((u) => (userIds.includes(u.id) ? { ...u, disabled } : u)));
  }, []);

  const updateFields = useCallback(async (userId, fields) => {
    await updateDoc(doc(db, "users", userId), fields);
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, ...fields } : u)));
  }, []);

  return {
    users,
    loading,
    error,
    refetch: fetchUsers,
    setRole,
    setDisabled,
    bulkSetDisabled,
    updateFields,
  };
}
