import {
  addDoc,
  collection,
  doc,
  increment,
  runTransaction,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../lib/firebase";

function generateOrderNumber() {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `MAV-${datePart}-${randomPart}`;
}

async function decrementStockForItems(items) {
  const bySku = {};
  items.forEach((item) => {
    if (!bySku[item.sku]) bySku[item.sku] = [];
    bySku[item.sku].push(item);
  });

  await Promise.all(
    Object.entries(bySku).map(([sku, lineItems]) => {
      const productRef = doc(db, "products", sku);
      return runTransaction(db, async (tx) => {
        const snap = await tx.get(productRef);
        if (!snap.exists()) return;
        const data = snap.data();

        const quantityBySize = {};
        let totalQuantity = 0;
        lineItems.forEach((item) => {
          totalQuantity += item.quantity;
          const key = `${item.variant?.size || ""}__${item.variant?.color || ""}`;
          quantityBySize[key] = (quantityBySize[key] || 0) + item.quantity;
        });

        const newStock = Math.max(0, (data.stock || 0) - totalQuantity);
        const newVariants = (data.variants || []).map((variant) => {
          const key = `${variant.size || ""}__${variant.color || ""}`;
          const qty = quantityBySize[key];
          if (!qty) return variant;
          return { ...variant, stock: Math.max(0, variant.stock - qty) };
        });

        tx.update(productRef, {
          stock: newStock,
          variants: newVariants,
          soldCount: (data.soldCount || 0) + totalQuantity,
        });
      });
    })
  );
}

/**
 * Places an order: decrements stock, redeems the coupon (if any), and
 * writes the order document. Cart clearing is the caller's responsibility
 * (only clear after this resolves successfully).
 */
export async function placeOrder({
  user,
  items,
  shipping,
  paymentMethod,
  paymentSummary,
  subtotal,
  discount,
  total,
  appliedCoupon,
}) {
  await decrementStockForItems(items);

  if (appliedCoupon) {
    await updateDoc(doc(db, "coupons", appliedCoupon.id), {
      usedCount: increment(1),
    });
  }

  const orderNumber = generateOrderNumber();
  const orderData = {
    orderNumber,
    userId: user.uid,
    customerEmail: user.email,
    items: items.map((item) => ({
      sku: item.sku,
      name: item.name,
      image: item.image,
      price: item.price,
      quantity: item.quantity,
      variant: item.variant || null,
    })),
    shipping,
    paymentMethod,
    paymentSummary,
    subtotal,
    discount,
    total,
    couponCode: appliedCoupon?.code || null,
    status: "pending",
    createdAt: serverTimestamp(),
  };

  const orderRef = await addDoc(collection(db, "orders"), orderData);

  return { id: orderRef.id, ...orderData };
}
