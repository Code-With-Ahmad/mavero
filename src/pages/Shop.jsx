import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  FaMagnifyingGlass,
  FaGrip,
  FaList,
  FaSliders,
  FaXmark,
} from "react-icons/fa6";
import useProducts from "../hooks/useProducts";
import useCategories from "../hooks/useCategories";
import useProductRatings from "../hooks/useProductRatings";
import useDebouncedValue from "../hooks/useDebouncedValue";
import ProductCard from "../components/product/ProductCard";
import ProductCardSkeleton from "../components/product/ProductCardSkeleton";
import ProductFilters from "../components/product/ProductFilters";
import EmptyState from "../components/common/EmptyState";
import ErrorState from "../components/common/ErrorState";
import Select from "../components/common/Select";

const PAGE_SIZE = 12;

const EMPTY_FILTERS = {
  categories: new Set(),
  priceMin: null,
  priceMax: null,
  sizes: new Set(),
  colors: new Set(),
  minRating: 0,
  inStockOnly: false,
  onSaleOnly: false,
};

function effectivePrice(product) {
  return product.salePrice ?? product.price;
}

export default function Shop() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, loading, error, refetch } = useProducts();
  const { categories } = useCategories();
  const { ratings } = useProductRatings();

  const SORT_OPTIONS = [
    { value: "newest", label: t("product.sortNewest") },
    { value: "price-asc", label: t("product.sortPriceAsc") },
    { value: "price-desc", label: t("product.sortPriceDesc") },
    { value: "best-selling", label: t("product.sortBestSelling") },
    { value: "rating", label: t("product.sortRating") },
  ];

  const [searchInput, setSearchInput] = useState(searchParams.get("q") || "");
  const debouncedSearch = useDebouncedValue(searchInput, 300);
  const [sort, setSort] = useState("newest");
  const [view, setView] = useState("grid");
  const [filters, setFilters] = useState(() => {
    const categoryParam = searchParams.get("category");
    return categoryParam
      ? { ...EMPTY_FILTERS, categories: new Set([categoryParam]) }
      : EMPTY_FILTERS;
  });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    if (debouncedSearch) next.set("q", debouncedSearch);
    else next.delete("q");
    setSearchParams(next, { replace: true });
    setVisibleCount(PAGE_SIZE);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const priceBounds = useMemo(() => {
    if (products.length === 0) return { min: 0, max: 1000 };
    const prices = products.map(effectivePrice);
    return { min: Math.floor(Math.min(...prices)), max: Math.ceil(Math.max(...prices)) };
  }, [products]);

  const availableSizes = useMemo(() => {
    const set = new Set();
    products.forEach((p) => p.variants?.forEach((v) => v.size && set.add(v.size)));
    return Array.from(set).sort();
  }, [products]);

  const availableColors = useMemo(() => {
    const set = new Set();
    products.forEach((p) => p.variants?.forEach((v) => v.color && set.add(v.color)));
    return Array.from(set).sort();
  }, [products]);

  const featuredOnly = searchParams.get("featured") === "true";

  const filteredProducts = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    let result = products.filter((product) => {
      if (featuredOnly && !product.featured) return false;

      if (query) {
        const haystack = [
          product.name,
          product.description,
          product.category,
          ...(product.tags || []),
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(query)) return false;
      }

      if (filters.categories.size > 0 && !filters.categories.has(product.category)) {
        return false;
      }

      const price = effectivePrice(product);
      if (filters.priceMin !== null && price < filters.priceMin) return false;
      if (filters.priceMax !== null && price > filters.priceMax) return false;

      if (filters.sizes.size > 0) {
        const sizes = product.variants?.map((v) => v.size) || [];
        if (!sizes.some((s) => filters.sizes.has(s))) return false;
      }

      if (filters.colors.size > 0) {
        const colors = product.variants?.map((v) => v.color) || [];
        if (!colors.some((c) => filters.colors.has(c))) return false;
      }

      if (filters.minRating > 0) {
        const rating = ratings[product.id]?.average || 0;
        if (rating < filters.minRating) return false;
      }

      if (filters.inStockOnly && (product.stock === 0 || product.status === "out_of_stock")) {
        return false;
      }

      if (filters.onSaleOnly && !product.salePrice) return false;

      return true;
    });

    result = [...result].sort((a, b) => {
      switch (sort) {
        case "price-asc":
          return effectivePrice(a) - effectivePrice(b);
        case "price-desc":
          return effectivePrice(b) - effectivePrice(a);
        case "best-selling":
          return (b.soldCount || 0) - (a.soldCount || 0);
        case "rating":
          return (ratings[b.id]?.average || 0) - (ratings[a.id]?.average || 0);
        case "newest":
        default:
          return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
      }
    });

    return result;
  }, [products, debouncedSearch, featuredOnly, filters, ratings, sort]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  const resetFilters = () => setFilters(EMPTY_FILTERS);

  return (
    <div className="container-boutique py-10 sm:py-14">
      <div className="mb-8 text-center">
        <p className="label-uppercase">{t("common.brand")}</p>
        <h1 className="mt-2 text-4xl font-semibold">
          {featuredOnly ? t("product.featured") : t("product.shopAll")}
        </h1>
      </div>

      <div className="mb-8 flex flex-col gap-4 border-y border-charcoal-100 py-4 dark:border-charcoal-500 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <FaMagnifyingGlass className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-charcoal-300 dark:text-ivory-300" />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={t("product.searchPlaceholder")}
            aria-label={t("product.searchPlaceholder")}
            className="input-field ps-10"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className="btn-secondary lg:hidden"
          >
            <FaSliders aria-hidden="true" />
            {t("product.filters")}
          </button>

          <label className="sr-only" htmlFor="sort">
            {t("product.sortBy")}
          </label>
          <Select
            id="sort"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="w-auto"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>

          <div className="hidden items-center gap-1 border border-charcoal-100 dark:border-charcoal-500 sm:flex">
            <button
              type="button"
              onClick={() => setView("grid")}
              aria-label={t("product.gridView")}
              aria-pressed={view === "grid"}
              className={`p-2 ${view === "grid" ? "bg-charcoal-800 text-ivory dark:bg-gold-500 dark:text-charcoal-900" : "text-charcoal-400 dark:text-ivory-300"}`}
            >
              <FaGrip />
            </button>
            <button
              type="button"
              onClick={() => setView("list")}
              aria-label={t("product.listView")}
              aria-pressed={view === "list"}
              className={`p-2 ${view === "list" ? "bg-charcoal-800 text-ivory dark:bg-gold-500 dark:text-charcoal-900" : "text-charcoal-400 dark:text-ivory-300"}`}
            >
              <FaList />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[240px_1fr]">
        <aside className="hidden self-start lg:sticky lg:top-24 lg:block">
          <ProductFilters
            categories={categories}
            availableSizes={availableSizes}
            availableColors={availableColors}
            priceBounds={priceBounds}
            filters={filters}
            onChange={setFilters}
            onReset={resetFilters}
          />
        </aside>

        {filtersOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-charcoal-900/60"
              onClick={() => setFiltersOpen(false)}
              aria-hidden="true"
            />
            <div className="absolute inset-y-0 end-0 w-full max-w-xs overflow-y-auto bg-ivory p-6 dark:bg-charcoal-800">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="label-uppercase">{t("product.filters")}</h2>
                <button
                  type="button"
                  onClick={() => setFiltersOpen(false)}
                  aria-label={t("common.close")}
                  className="text-charcoal-600 dark:text-ivory-200"
                >
                  <FaXmark className="h-5 w-5" />
                </button>
              </div>
              <ProductFilters
                categories={categories}
                availableSizes={availableSizes}
                availableColors={availableColors}
                priceBounds={priceBounds}
                filters={filters}
                onChange={setFilters}
                onReset={resetFilters}
              />
            </div>
          </div>
        )}

        <div>
          {error && <ErrorState onRetry={refetch} />}

          {!error && loading && (
            <div
              className={
                view === "grid"
                  ? "grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 xl:grid-cols-4"
                  : "flex flex-col gap-8"
              }
            >
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} view={view} />
              ))}
            </div>
          )}

          {!error && !loading && filteredProducts.length === 0 && (
            <EmptyState
              title={t("product.noProducts")}
              description={t("product.noProductsBody")}
              action={
                <button type="button" onClick={resetFilters} className="btn-secondary">
                  {t("product.clearFilters")}
                </button>
              }
            />
          )}

          {!error && !loading && filteredProducts.length > 0 && (
            <>
              <p className="mb-4 text-xs text-charcoal-300 dark:text-ivory-300">
                {t("product.productsCount", { count: filteredProducts.length })}
              </p>
              <div
                className={
                  view === "grid"
                    ? "grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 xl:grid-cols-4"
                    : "flex flex-col gap-8"
                }
              >
                {visibleProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    rating={ratings[product.id]}
                    view={view}
                  />
                ))}
              </div>

              {hasMore && (
                <div className="mt-12 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                    className="btn-secondary"
                  >
                    {t("product.loadMore")}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
