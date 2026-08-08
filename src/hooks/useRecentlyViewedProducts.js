import { useEffect, useState } from "react";
import { collection, documentId, getDocs, query, where } from "firebase/firestore";
import { db } from "../lib/firebase";
import { getRecentlyViewed } from "../utils/recentlyViewed";

export default function useRecentlyViewedProducts(excludeId) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const ids = getRecentlyViewed().filter((id) => id !== excludeId);
      if (ids.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }
      try {
        const q = query(collection(db, "products"), where(documentId(), "in", ids.slice(0, 10)));
        const snapshot = await getDocs(q);
        const byId = new Map(snapshot.docs.map((d) => [d.id, { id: d.id, ...d.data() }]));
        const ordered = ids.map((id) => byId.get(id)).filter(Boolean);
        if (!cancelled) setProducts(ordered);
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
  }, [excludeId]);

  return { products, loading };
}
