import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../lib/firebase";

/**
 * Looks up a coupon by code and checks it against the current subtotal.
 * Returns { coupon, discount } on success, or throws an Error with a
 * user-friendly (translated) message on failure. Does not mutate
 * usedCount — that only happens when an order is actually placed (see
 * checkout). `t` is an i18next translation function.
 */
export async function validateCoupon(code, subtotal, t) {
  const normalized = code.trim().toUpperCase();
  if (!normalized) throw new Error(t("cart.coupon.enterCode"));

  const q = query(collection(db, "coupons"), where("code", "==", normalized));
  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    throw new Error(t("cart.coupon.invalid"));
  }

  const docSnap = snapshot.docs[0];
  const coupon = { id: docSnap.id, ...docSnap.data() };

  if (coupon.active === false) {
    throw new Error(t("cart.coupon.inactive"));
  }
  if (coupon.expiresAt?.seconds && coupon.expiresAt.seconds * 1000 < Date.now()) {
    throw new Error(t("cart.coupon.expired"));
  }
  if (
    typeof coupon.usageLimit === "number" &&
    (coupon.usedCount || 0) >= coupon.usageLimit
  ) {
    throw new Error(t("cart.coupon.usageLimitReached"));
  }
  if (coupon.minOrderValue && subtotal < coupon.minOrderValue) {
    throw new Error(
      t("cart.coupon.addMoreToQualify", {
        amount: (coupon.minOrderValue - subtotal).toFixed(2),
      })
    );
  }

  const discount =
    coupon.type === "percentage"
      ? Math.round(subtotal * (coupon.value / 100) * 100) / 100
      : Math.min(coupon.value, subtotal);

  return { coupon, discount };
}
