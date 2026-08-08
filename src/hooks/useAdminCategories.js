import { useCallback, useEffect, useState } from "react";
import { collection, deleteDoc, doc, getDocs, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

export default function useAdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, "categories"));
      setCategories(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const saveCategory = useCallback(
    async (slug, data) => {
      await setDoc(doc(db, "categories", slug), data, { merge: true });
      await fetchCategories();
    },
    [fetchCategories]
  );

  const deleteCategory = useCallback(
    async (slug) => {
      await deleteDoc(doc(db, "categories", slug));
      await fetchCategories();
    },
    [fetchCategories]
  );

  return { categories, loading, saveCategory, deleteCategory, refetch: fetchCategories };
}
