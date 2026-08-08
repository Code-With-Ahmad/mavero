import { useEffect, useMemo, useState } from "react";

// Admin tables fetch their whole collection in one shot (see SKILLS.md —
// the catalog is small enough that a full refetch is simpler than server
// pagination), so pagination here just slices an already-loaded array.
export default function usePagination(items, pageSize = 10) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const clampedPage = Math.min(page, totalPages);

  // Keeps internal state in sync after a filter shrinks the result set out
  // from under the current page, without ever rendering a stale/empty slice.
  useEffect(() => {
    if (page !== clampedPage) setPage(clampedPage);
  }, [page, clampedPage]);

  const pageItems = useMemo(() => {
    const start = (clampedPage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, clampedPage, pageSize]);

  return { page: clampedPage, setPage, totalPages, pageItems };
}
