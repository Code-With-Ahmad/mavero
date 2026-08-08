import { useCallback, useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

export default function useProduct(sku) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProduct = useCallback(async () => {
    if (!sku) return;
    setLoading(true);
    setError(null);
    try {
      const snap = await getDoc(doc(db, "products", sku));
      setProduct(snap.exists() ? { id: snap.id, ...snap.data() } : null);
    } catch (err) {
      console.error("[Mavero] useProduct fetch failed:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [sku]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  return { product, loading, error, refetch: fetchProduct };
}
