import { useCallback, useEffect, useState } from "react";
import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

export default function useAdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, "coupons"));
      setCoupons(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const createCoupon = useCallback(
    async (data) => {
      await addDoc(collection(db, "coupons"), { ...data, usedCount: 0 });
      await fetchCoupons();
    },
    [fetchCoupons]
  );

  const updateCoupon = useCallback(
    async (id, data) => {
      await updateDoc(doc(db, "coupons", id), data);
      await fetchCoupons();
    },
    [fetchCoupons]
  );

  const deleteCoupon = useCallback(
    async (id) => {
      await deleteDoc(doc(db, "coupons", id));
      await fetchCoupons();
    },
    [fetchCoupons]
  );

  return { coupons, loading, createCoupon, updateCoupon, deleteCoupon, refetch: fetchCoupons };
}
