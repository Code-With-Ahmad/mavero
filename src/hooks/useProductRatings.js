import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";

/**
 * Aggregates every review once into a { [productId]: { average, count } }
 * map, so product grids can show star ratings without one query per card.
 */
export default function useProductRatings() {
  const [ratings, setRatings] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const snapshot = await getDocs(collection(db, "reviews"));
        const totals = {};
        snapshot.docs.forEach((d) => {
          const { productId, rating } = d.data();
          if (!productId || !rating) return;
          if (!totals[productId]) totals[productId] = { sum: 0, count: 0 };
          totals[productId].sum += rating;
          totals[productId].count += 1;
        });
        const result = {};
        Object.entries(totals).forEach(([productId, { sum, count }]) => {
          result[productId] = { average: sum / count, count };
        });
        if (!cancelled) setRatings(result);
      } catch {
        if (!cancelled) setRatings({});
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { ratings, loading };
}
