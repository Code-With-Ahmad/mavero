import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { collection, doc, onSnapshot, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "./AuthContext";

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setItems([]);
      return;
    }
    setLoading(true);
    const wishlistRef = collection(db, "users", user.uid, "wishlist");
    const unsubscribe = onSnapshot(wishlistRef, (snapshot) => {
      setItems(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsubscribe;
  }, [user]);

  const isWishlisted = useCallback(
    (sku) => items.some((i) => i.id === sku),
    [items]
  );

  const toggleWishlist = useCallback(
    async (product) => {
      if (!user) return;
      const ref = doc(db, "users", user.uid, "wishlist", product.sku);
      if (isWishlisted(product.sku)) {
        await deleteDoc(ref);
      } else {
        await setDoc(ref, {
          sku: product.sku,
          name: product.name,
          image: product.images?.[0] || "",
          price: product.price,
          salePrice: product.salePrice || null,
        });
      }
    },
    [user, isWishlisted]
  );

  const value = { items, loading, isWishlisted, toggleWishlist };

  return (
    <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
