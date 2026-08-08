import { useEffect, useState } from "react";
import { collection, getDocs, limit, query, where } from "firebase/firestore";
import { db } from "../lib/firebase";

export default function useRelatedProducts(category, excludeId, count = 4) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!category) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const q = query(
          collection(db, "products"),
          where("category", "==", category),
          where("status", "==", "active"),
          limit(count + 1)
        );
        const snapshot = await getDocs(q);
        const results = snapshot.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((p) => p.id !== excludeId)
          .slice(0, count);
        if (!cancelled) setProducts(results);
      } catch {
        if (!cancelled) setProducts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [category, excludeId, count]);

  return { products, loading };
}
