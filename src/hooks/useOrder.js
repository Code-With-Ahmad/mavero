import { useCallback, useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

export default function useOrder(orderId, initialData = null) {
  const [order, setOrder] = useState(initialData);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState(null);

  const fetchOrder = useCallback(async () => {
    if (!orderId) return;
    setLoading(true);
    setError(null);
    try {
      const snap = await getDoc(doc(db, "orders", orderId));
      setOrder(snap.exists() ? { id: snap.id, ...snap.data() } : null);
    } catch (err) {
      console.error("[Mavero] useOrder fetch failed:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (!initialData) fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  return { order, loading, error, refetch: fetchOrder };
}
