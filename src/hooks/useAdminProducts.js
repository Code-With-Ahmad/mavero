import { useCallback, useEffect, useState } from "react";
import { collection, deleteDoc, doc, getDocs, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

export default function useAdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const snapshot = await getDocs(collection(db, "products"));
      setProducts(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error("[Mavero] useAdminProducts fetch failed:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const saveProduct = useCallback(async (sku, data) => {
    await setDoc(doc(db, "products", sku), data, { merge: true });
    await fetchProducts();
  }, [fetchProducts]);

  const deleteProduct = useCallback(async (sku) => {
    await deleteDoc(doc(db, "products", sku));
    await fetchProducts();
  }, [fetchProducts]);

  const updateProductFields = useCallback(async (sku, fields) => {
    await updateDoc(doc(db, "products", sku), fields);
    await fetchProducts();
  }, [fetchProducts]);

  return { products, loading, error, refetch: fetchProducts, saveProduct, deleteProduct, updateProductFields };
}
