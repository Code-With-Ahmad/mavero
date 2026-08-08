// Admins used to type a SKU by hand on every new product — easy to
// mistype or collide. Auto-generating removes that step entirely; the
// timestamp (to the millisecond, base36) plus a random suffix makes a
// collision effectively impossible at this catalog's scale.
export default function generateProductId() {
  const stamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `MAV-${stamp}${random}`;
}
