import { useMemo, useState } from "react";

// `columns` maps a column key to an accessor function (item) => comparable
// value. Kept as plain strings for the key (not the accessor itself) so
// toggling sort is a simple equality check regardless of whether the
// caller re-creates its columns object each render.
export default function useSortableData(items, columns, initialKey = null) {
  const [sortKey, setSortKey] = useState(initialKey);
  const [direction, setDirection] = useState("asc");

  const sorted = useMemo(() => {
    const accessor = sortKey && columns[sortKey];
    if (!accessor) return items;

    const withIndex = items.map((item, index) => ({ item, index }));
    withIndex.sort((a, b) => {
      const av = accessor(a.item);
      const bv = accessor(b.item);
      if (av == null && bv == null) return a.index - b.index;
      if (av == null) return 1;
      if (bv == null) return -1;

      let cmp;
      if (typeof av === "string" || typeof bv === "string") {
        cmp = String(av).localeCompare(String(bv), undefined, { sensitivity: "base" });
      } else {
        cmp = av < bv ? -1 : av > bv ? 1 : 0;
      }
      if (cmp === 0) return a.index - b.index;
      return direction === "asc" ? cmp : -cmp;
    });
    return withIndex.map((x) => x.item);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, sortKey, direction]);

  const toggleSort = (key) => {
    if (sortKey !== key) {
      setSortKey(key);
      setDirection("asc");
    } else {
      setDirection((d) => (d === "asc" ? "desc" : "asc"));
    }
  };

  return { sorted, sortKey, direction, toggleSort };
}
