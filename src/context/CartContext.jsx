import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from "react";
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
  getDocs,
} from "firebase/firestore";
import { useTranslation } from "react-i18next";
import { db } from "../lib/firebase";
import { useAuth } from "./AuthContext";
import { makeCartItemId } from "../utils/cartItemId";
import { validateCoupon } from "../utils/validateCoupon";

const CartContext = createContext(null);
const GUEST_CART_KEY = "mavero-guest-cart";

function readGuestCart() {
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeGuestCart(items) {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
}

export function CartProvider({ children }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [items, setItems] = useState(readGuestCart);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const hasMergedRef = useRef(false);

  // Logged-in: subscribe to Firestore cart subcollection for live cross-device sync.
  useEffect(() => {
    if (!user) {
      hasMergedRef.current = false;
      setItems(readGuestCart());
      return;
    }

    setLoading(true);
    const cartRef = collection(db, "users", user.uid, "cart");

    async function mergeGuestCartOnce() {
      if (hasMergedRef.current) return;
      hasMergedRef.current = true;
      const guestItems = readGuestCart();
      if (guestItems.length === 0) return;

      const existingSnap = await getDocs(cartRef);
      const existingById = new Map(existingSnap.docs.map((d) => [d.id, d.data()]));

      for (const guestItem of guestItems) {
        const existing = existingById.get(guestItem.id);
        const mergedQuantity = existing
          ? existing.quantity + guestItem.quantity
          : guestItem.quantity;
        await setDoc(doc(cartRef, guestItem.id), {
          ...guestItem,
          quantity: mergedQuantity,
        });
      }
      writeGuestCart([]);
    }

    mergeGuestCartOnce();

    const unsubscribe = onSnapshot(cartRef, (snapshot) => {
      setItems(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const persistGuestItems = useCallback((next) => {
    setItems(next);
    writeGuestCart(next);
  }, []);

  const addItem = useCallback(
    async (product, variant, quantity = 1) => {
      const id = makeCartItemId(product.sku, variant);
      const line = {
        id,
        sku: product.sku,
        name: product.name,
        image: product.images?.[0] || "",
        price: product.salePrice || product.price,
        variant: variant ? { size: variant.size, color: variant.color } : null,
        maxStock: variant?.stock ?? product.stock ?? 99,
      };

      if (user) {
        const cartRef = collection(db, "users", user.uid, "cart");
        const existing = items.find((i) => i.id === id);
        const nextQuantity = Math.min(
          (existing?.quantity || 0) + quantity,
          line.maxStock
        );
        await setDoc(doc(cartRef, id), { ...line, quantity: nextQuantity });
      } else {
        const existing = items.find((i) => i.id === id);
        let next;
        if (existing) {
          next = items.map((i) =>
            i.id === id
              ? { ...i, quantity: Math.min(i.quantity + quantity, line.maxStock) }
              : i
          );
        } else {
          next = [...items, { ...line, quantity: Math.min(quantity, line.maxStock) }];
        }
        persistGuestItems(next);
      }
    },
    [user, items, persistGuestItems]
  );

  const updateQuantity = useCallback(
    async (id, quantity) => {
      if (quantity < 1) return;
      if (user) {
        const existing = items.find((i) => i.id === id);
        if (!existing) return;
        const cartRef = doc(db, "users", user.uid, "cart", id);
        await setDoc(
          cartRef,
          { quantity: Math.min(quantity, existing.maxStock || 99) },
          { merge: true }
        );
      } else {
        const next = items.map((i) =>
          i.id === id
            ? { ...i, quantity: Math.min(quantity, i.maxStock || 99) }
            : i
        );
        persistGuestItems(next);
      }
    },
    [user, items, persistGuestItems]
  );

  const removeItem = useCallback(
    async (id) => {
      if (user) {
        await deleteDoc(doc(db, "users", user.uid, "cart", id));
      } else {
        persistGuestItems(items.filter((i) => i.id !== id));
      }
    },
    [user, items, persistGuestItems]
  );

  const clearCart = useCallback(async () => {
    if (user) {
      const cartRef = collection(db, "users", user.uid, "cart");
      const snap = await getDocs(cartRef);
      await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
    } else {
      persistGuestItems([]);
    }
    setAppliedCoupon(null);
    setCouponError(null);
  }, [user, persistGuestItems]);

  const itemCount = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items]
  );
  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity * i.price, 0),
    [items]
  );

  const discount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.minOrderValue && subtotal < appliedCoupon.minOrderValue) return 0;
    return appliedCoupon.type === "percentage"
      ? Math.round(subtotal * (appliedCoupon.value / 100) * 100) / 100
      : Math.min(appliedCoupon.value, subtotal);
  }, [appliedCoupon, subtotal]);

  const total = Math.max(subtotal - discount, 0);

  const applyCoupon = useCallback(
    async (code) => {
      setCouponLoading(true);
      setCouponError(null);
      try {
        const { coupon } = await validateCoupon(code, subtotal, t);
        setAppliedCoupon(coupon);
        return true;
      } catch (error) {
        setCouponError(error.message);
        setAppliedCoupon(null);
        return false;
      } finally {
        setCouponLoading(false);
      }
    },
    [subtotal]
  );

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
    setCouponError(null);
  }, []);

  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const value = {
    items,
    loading,
    itemCount,
    subtotal,
    discount,
    total,
    appliedCoupon,
    couponError,
    couponLoading,
    applyCoupon,
    removeCoupon,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    drawerOpen,
    openDrawer,
    closeDrawer,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
}
