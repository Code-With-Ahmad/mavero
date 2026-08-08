import { useCallback, useEffect, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { db } from "../lib/firebase";

export default function useAddresses(userId) {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAddresses = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, "users", userId, "addresses"));
      setAddresses(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const addAddress = useCallback(
    async (data) => {
      await addDoc(collection(db, "users", userId, "addresses"), data);
      await fetchAddresses();
    },
    [userId, fetchAddresses]
  );

  const updateAddress = useCallback(
    async (id, data) => {
      await updateDoc(doc(db, "users", userId, "addresses", id), data);
      await fetchAddresses();
    },
    [userId, fetchAddresses]
  );

  const removeAddress = useCallback(
    async (id) => {
      await deleteDoc(doc(db, "users", userId, "addresses", id));
      await fetchAddresses();
    },
    [userId, fetchAddresses]
  );

  return { addresses, loading, addAddress, updateAddress, removeAddress, refetch: fetchAddresses };
}
