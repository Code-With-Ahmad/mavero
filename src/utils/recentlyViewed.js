const STORAGE_KEY = "mavero-recently-viewed";
const MAX_ITEMS = 8;

export function getRecentlyViewed() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addRecentlyViewed(sku) {
  const current = getRecentlyViewed().filter((id) => id !== sku);
  current.unshift(sku);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(current.slice(0, MAX_ITEMS)));
}
