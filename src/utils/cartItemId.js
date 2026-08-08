export function makeCartItemId(sku, variant) {
  const size = variant?.size || "none";
  const color = variant?.color || "none";
  return `${sku}__${size}__${color}`.replace(/\s+/g, "-");
}
