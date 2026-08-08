import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaPlus, FaPen, FaTrash, FaTriangleExclamation } from "react-icons/fa6";
import toast from "react-hot-toast";
import useAdminProducts from "../../hooks/useAdminProducts";
import usePagination from "../../hooks/usePagination";
import useSortableData from "../../hooks/useSortableData";
import { formatCurrency } from "../../utils/formatCurrency";
import Skeleton from "../../components/common/Skeleton";
import ErrorState from "../../components/common/ErrorState";
import EmptyState from "../../components/common/EmptyState";
import Pagination from "../../components/admin/Pagination";
import SortableTh from "../../components/admin/SortableTh";
import Checkbox from "../../components/common/Checkbox";

const SORT_COLUMNS = {
  name: (p) => p.name?.toLowerCase(),
  category: (p) => p.category?.toLowerCase(),
  price: (p) => p.salePrice ?? p.price,
  stock: (p) => p.stock,
  status: (p) => p.status,
};

const LOW_STOCK_THRESHOLD = 5;

export default function AdminProducts() {
  const { t } = useTranslation();
  const { products, loading, error, refetch, deleteProduct, updateProductFields } = useAdminProducts();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(new Set());

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
    );
  }, [products, search]);

  const { sorted, sortKey, direction, toggleSort } = useSortableData(filtered, SORT_COLUMNS);
  const { page, setPage, totalPages, pageItems } = usePagination(sorted, 10);

  const toggleSelected = (sku) => {
    const next = new Set(selected);
    if (next.has(sku)) next.delete(sku);
    else next.add(sku);
    setSelected(next);
  };

  const handleDelete = async (sku) => {
    if (!window.confirm(t("admin.products.confirmDelete"))) return;
    try {
      await deleteProduct(sku);
      toast.success(t("admin.products.deleted"));
    } catch {
      toast.error(t("admin.products.couldNotDelete"));
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(t("admin.products.confirmBulkDelete", { count: selected.size }))) return;
    try {
      await Promise.all(Array.from(selected).map((sku) => deleteProduct(sku)));
      setSelected(new Set());
      toast.success(t("admin.products.deleted"));
    } catch {
      toast.error(t("admin.products.couldNotDelete"));
    }
  };

  const handleBulkStatus = async (status) => {
    try {
      await Promise.all(Array.from(selected).map((sku) => updateProductFields(sku, { status })));
      setSelected(new Set());
      toast.success(t("admin.orders.statusUpdated"));
    } catch {
      toast.error(t("admin.products.couldNotDelete"));
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="label-uppercase">{t("common.brand")} Admin</p>
          <h1 className="mt-1 text-3xl font-semibold">{t("admin.products.title")}</h1>
        </div>
        <Link to="/admin/products/new" className="btn-primary">
          <FaPlus className="h-3.5 w-3.5" /> {t("admin.products.addProduct")}
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          type="search"
          placeholder={t("admin.products.searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field max-w-xs"
        />
        {selected.size > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-charcoal-400 dark:text-ivory-300">
              {t("admin.products.selected", { count: selected.size })}
            </span>
            <button type="button" onClick={() => handleBulkStatus("active")} className="btn-secondary py-1.5 text-xs">
              {t("admin.products.setActive")}
            </button>
            <button type="button" onClick={() => handleBulkStatus("draft")} className="btn-secondary py-1.5 text-xs">
              {t("admin.products.setDraft")}
            </button>
            <button
              type="button"
              onClick={handleBulkDelete}
              className="text-xs font-medium uppercase tracking-wider text-burgundy-500 hover:underline dark:text-burgundy-300"
            >
              {t("common.delete")}
            </button>
          </div>
        )}
      </div>

      {loading && (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      )}

      {!loading && error && <ErrorState onRetry={refetch} />}

      {!loading && !error && filtered.length === 0 && (
        <EmptyState title={t("admin.products.noProducts")} description={t("admin.products.noProductsBody")} />
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-start text-sm">
            <thead>
              <tr className="border-b border-charcoal-100 text-xs uppercase tracking-wider text-charcoal-400 dark:border-charcoal-500 dark:text-ivory-300">
                <th className="w-8 py-2"></th>
                <SortableTh label={t("admin.products.product")} sortKey="name" currentKey={sortKey} direction={direction} onSort={toggleSort} />
                <SortableTh label={t("admin.products.category")} sortKey="category" currentKey={sortKey} direction={direction} onSort={toggleSort} />
                <SortableTh label={t("admin.products.price")} sortKey="price" currentKey={sortKey} direction={direction} onSort={toggleSort} />
                <SortableTh label={t("admin.products.stock")} sortKey="stock" currentKey={sortKey} direction={direction} onSort={toggleSort} />
                <SortableTh label={t("admin.products.status")} sortKey="status" currentKey={sortKey} direction={direction} onSort={toggleSort} />
                <th className="py-2 pe-4"></th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((product) => (
                <tr key={product.id} className="border-b border-charcoal-100 dark:border-charcoal-600">
                  <td className="py-3 pe-4">
                    <Checkbox
                      checked={selected.has(product.id)}
                      onChange={() => toggleSelected(product.id)}
                      aria-label={product.name}
                    />
                  </td>
                  <td className="py-3 pe-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 shrink-0 overflow-hidden bg-ivory-200 dark:bg-charcoal-600">
                        {product.images?.[0] && (
                          <img src={product.images[0]} alt="" className="h-full w-full object-cover" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-charcoal-800 dark:text-ivory-100">
                          {product.name}
                          {product.featured && (
                            <span className="ms-2 text-[10px] uppercase tracking-wider text-gold-600 dark:text-gold-400">
                              {t("admin.products.featured")}
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-charcoal-400 dark:text-ivory-300">{product.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pe-4 text-charcoal-500 dark:text-ivory-200">
                    {product.category?.replace(/-/g, " ")}
                  </td>
                  <td className="py-3 pe-4">
                    {product.salePrice ? (
                      <>
                        <span className="text-burgundy-600 dark:text-gold-400">{formatCurrency(product.salePrice)}</span>{" "}
                        <span className="text-xs text-charcoal-300 line-through dark:text-ivory-300">{formatCurrency(product.price)}</span>
                      </>
                    ) : (
                      formatCurrency(product.price)
                    )}
                  </td>
                  <td className="py-3 pe-4">
                    <span className={product.stock <= LOW_STOCK_THRESHOLD ? "flex items-center gap-1 text-burgundy-500 dark:text-burgundy-300" : ""}>
                      {product.stock <= LOW_STOCK_THRESHOLD && <FaTriangleExclamation className="h-3 w-3" />}
                      {product.stock}
                    </span>
                  </td>
                  <td className="py-3 pe-4">
                    <span className="text-xs uppercase tracking-wider text-charcoal-500 dark:text-ivory-200">
                      {product.status}
                    </span>
                  </td>
                  <td className="py-3 pe-4">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        to={`/admin/products/${product.id}`}
                        aria-label={t("common.edit")}
                        className="text-charcoal-400 hover:text-gold-600 dark:text-ivory-300"
                      >
                        <FaPen className="h-3.5 w-3.5" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(product.id)}
                        aria-label={t("common.delete")}
                        className="text-charcoal-400 hover:text-burgundy-500 dark:text-ivory-300"
                      >
                        <FaTrash className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}
