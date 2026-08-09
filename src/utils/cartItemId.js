// Firestore document IDs can never contain a literal "/" (it's the path
// delimiter) — a two-tone color like "Silver/Black" would otherwise split
// the cart doc's path into extra segments and throw "Invalid document
// reference" the moment you tried to add it to cart.
function sanitizeIdSegment(value) {
  return value.replace(/[\s/]+/g, "-");
}

export function makeCartItemId(sku, variant) {
  const size = sanitizeIdSegment(variant?.size || "none");
  const color = sanitizeIdSegment(variant?.color || "none");
  return `${sanitizeIdSegment(sku)}__${size}__${color}`;
}
