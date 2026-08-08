import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaHeart, FaRegHeart, FaMinus, FaPlus } from "react-icons/fa6";
import toast from "react-hot-toast";
import useProduct from "../hooks/useProduct";
import useRelatedProducts from "../hooks/useRelatedProducts";
import useRecentlyViewedProducts from "../hooks/useRecentlyViewedProducts";
import useReviews from "../hooks/useReviews";
import { addRecentlyViewed } from "../utils/recentlyViewed";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { formatCurrency } from "../utils/formatCurrency";
import ImageGallery from "../components/product/ImageGallery";
import StarRating from "../components/product/StarRating";
import ReviewsSection from "../components/product/ReviewsSection";
import ProductCard from "../components/product/ProductCard";
import ProductCardSkeleton from "../components/product/ProductCardSkeleton";
import useProductRatings from "../hooks/useProductRatings";
import Skeleton from "../components/common/Skeleton";
import ErrorState from "../components/common/ErrorState";
import EmptyState from "../components/common/EmptyState";

export default function ProductDetail() {
  const { t } = useTranslation();
  const { sku } = useParams();
  const navigate = useNavigate();
  const { product, loading, error, refetch } = useProduct(sku);
  const { user } = useAuth();
  const { addItem } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { average, count } = useReviews(sku);
  const { ratings } = useProductRatings();

  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const sizes = useMemo(() => {
    if (!product?.variants) return [];
    return Array.from(new Set(product.variants.map((v) => v.size).filter(Boolean)));
  }, [product]);

  const colors = useMemo(() => {
    if (!product?.variants) return [];
    return Array.from(new Set(product.variants.map((v) => v.color).filter(Boolean)));
  }, [product]);

  useEffect(() => {
    if (!product) return;
    if (sizes.length && !selectedSize) setSelectedSize(sizes[0]);
    if (colors.length && !selectedColor) setSelectedColor(colors[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product]);

  useEffect(() => {
    if (product) addRecentlyViewed(product.id);
  }, [product]);

  const selectedVariant = useMemo(() => {
    if (!product?.variants?.length) return null;
    return (
      product.variants.find(
        (v) =>
          (sizes.length === 0 || v.size === selectedSize) &&
          (colors.length === 0 || v.color === selectedColor)
      ) || null
    );
  }, [product, sizes, colors, selectedSize, selectedColor]);

  const hasVariants = product?.variants?.length > 0;
  const stock = hasVariants ? selectedVariant?.stock ?? 0 : product?.stock ?? 0;
  const outOfStock = product?.status === "out_of_stock" || stock === 0;

  useEffect(() => {
    setQuantity(1);
  }, [selectedVariant]);

  const { products: related, loading: relatedLoading } = useRelatedProducts(
    product?.category,
    product?.id
  );
  const { products: recentlyViewed } = useRecentlyViewedProducts(product?.id);

  if (loading) {
    return (
      <div className="container-boutique grid grid-cols-1 gap-10 py-14 lg:grid-cols-2">
        <Skeleton className="aspect-[4/5] w-full" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorState onRetry={refetch} />;
  }

  if (!product) {
    return (
      <EmptyState
        title={t("product.productNotFound")}
        description={t("product.productNotFoundBody")}
        action={
          <Link to="/shop" className="btn-secondary">
            {t("product.backToShop")}
          </Link>
        }
      />
    );
  }

  const wishlisted = user && isWishlisted(product.id);

  const handleWishlist = () => {
    if (!user) {
      toast(t("product.loginToWishlist"), { icon: "♡" });
      navigate("/login");
      return;
    }
    toggleWishlist(product);
  };

  const handleAddToCart = async () => {
    if (outOfStock) return;
    if (hasVariants && !selectedVariant) {
      toast.error(t("product.selectOptionsFirst"));
      return;
    }
    await addItem(product, selectedVariant, quantity);
    toast.success(t("product.addedToCart", { name: product.name }));
  };

  const handleBuyNow = async () => {
    if (outOfStock) return;
    if (hasVariants && !selectedVariant) {
      toast.error(t("product.selectOptionsFirst"));
      return;
    }
    await addItem(product, selectedVariant, quantity);
    navigate("/cart");
  };

  return (
    <div className="container-boutique py-10 sm:py-14">
      <nav className="mb-6 text-xs text-charcoal-300 dark:text-ivory-300" aria-label="Breadcrumb">
        <Link to="/shop" className="hover:text-gold-600 dark:hover:text-gold-400">
          {t("nav.shop")}
        </Link>{" "}
        / <span className="text-charcoal-500 dark:text-ivory-100">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        <ImageGallery images={product.images} productName={product.name} />

        <div>
          <p className="label-uppercase">{product.category?.replace(/-/g, " ")}</p>
          <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">{product.name}</h1>

          {count > 0 && (
            <div className="mt-3">
              <StarRating value={average} count={count} />
            </div>
          )}

          <div className="mt-4 flex items-center gap-3">
            {product.salePrice ? (
              <>
                <span className="text-2xl font-medium text-burgundy-600 dark:text-gold-400">
                  {formatCurrency(product.salePrice)}
                </span>
                <span className="text-lg text-charcoal-300 line-through dark:text-ivory-300">
                  {formatCurrency(product.price)}
                </span>
              </>
            ) : (
              <span className="text-2xl font-medium text-charcoal-800 dark:text-ivory-100">
                {formatCurrency(product.price)}
              </span>
            )}
          </div>

          <p className="mt-6 text-sm leading-relaxed text-charcoal-500 dark:text-ivory-200">
            {product.description}
          </p>

          {sizes.length > 0 && (
            <div className="mt-6">
              <p className="label-uppercase mb-2 text-xs">{t("product.size")}</p>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => {
                  const stockForSize = product.variants
                    .filter((v) => v.size === size && (colors.length === 0 || v.color === selectedColor))
                    .reduce((sum, v) => sum + v.stock, 0);
                  const disabled = stockForSize === 0;
                  return (
                    <button
                      key={size}
                      type="button"
                      disabled={disabled}
                      onClick={() => setSelectedSize(size)}
                      aria-pressed={selectedSize === size}
                      className={`border px-4 py-2 text-sm transition-colors duration-200 ${
                        disabled
                          ? "cursor-not-allowed border-charcoal-100 text-charcoal-200 line-through dark:border-charcoal-600 dark:text-charcoal-400"
                          : selectedSize === size
                          ? "border-charcoal-800 bg-charcoal-800 text-ivory dark:border-gold-500 dark:bg-gold-500 dark:text-charcoal-900"
                          : "border-charcoal-200 text-charcoal-600 hover:border-charcoal-400 dark:border-charcoal-500 dark:text-ivory-200"
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {colors.length > 0 && (
            <div className="mt-6">
              <p className="label-uppercase mb-2 text-xs">{t("product.color")}</p>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => {
                  const stockForColor = product.variants
                    .filter((v) => v.color === color && (sizes.length === 0 || v.size === selectedSize))
                    .reduce((sum, v) => sum + v.stock, 0);
                  const disabled = stockForColor === 0;
                  return (
                    <button
                      key={color}
                      type="button"
                      disabled={disabled}
                      onClick={() => setSelectedColor(color)}
                      aria-pressed={selectedColor === color}
                      className={`border px-4 py-2 text-sm transition-colors duration-200 ${
                        disabled
                          ? "cursor-not-allowed border-charcoal-100 text-charcoal-200 line-through dark:border-charcoal-600 dark:text-charcoal-400"
                          : selectedColor === color
                          ? "border-charcoal-800 bg-charcoal-800 text-ivory dark:border-gold-500 dark:bg-gold-500 dark:text-charcoal-900"
                          : "border-charcoal-200 text-charcoal-600 hover:border-charcoal-400 dark:border-charcoal-500 dark:text-ivory-200"
                      }`}
                    >
                      {color}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <p className="mt-6 text-sm">
            {outOfStock ? (
              <span className="font-medium text-burgundy-500 dark:text-burgundy-300">
                {t("product.outOfStock")}
              </span>
            ) : stock <= 5 ? (
              <span className="font-medium text-gold-700 dark:text-gold-400">
                {t("product.onlyLeftInStock", { count: stock })}
              </span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400">{t("product.inStock")}</span>
            )}
          </p>

          <div className="mt-4 flex items-center gap-4">
            <div className="flex items-center border border-charcoal-200 dark:border-charcoal-500">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                aria-label="Decrease quantity"
                className="p-3 text-charcoal-500 disabled:opacity-30 dark:text-ivory-200"
              >
                <FaMinus className="h-3 w-3" />
              </button>
              <span className="w-10 text-center text-sm">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
                disabled={quantity >= stock}
                aria-label="Increase quantity"
                className="p-3 text-charcoal-500 disabled:opacity-30 dark:text-ivory-200"
              >
                <FaPlus className="h-3 w-3" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleWishlist}
              aria-label={wishlisted ? t("product.removeFromWishlist") : t("product.addToWishlist")}
              className="flex h-11 w-11 items-center justify-center border border-charcoal-200 text-charcoal-600 hover:text-burgundy-500 dark:border-charcoal-500 dark:text-ivory-200"
            >
              {wishlisted ? <FaHeart className="text-burgundy-500" /> : <FaRegHeart />}
            </button>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={outOfStock}
              className="btn-primary flex-1"
            >
              {t("product.addToCart")}
            </button>
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={outOfStock}
              className="btn-secondary flex-1"
            >
              {t("product.buyNow")}
            </button>
          </div>

          {product.sku && (
            <p className="mt-6 text-xs text-charcoal-300 dark:text-ivory-300">
              {t("product.sku", { sku: product.sku })}
            </p>
          )}
        </div>
      </div>

      <div className="mt-20 border-t border-charcoal-100 pt-14 dark:border-charcoal-500">
        <ReviewsSection productId={product.id} />
      </div>

      {(related.length > 0 || relatedLoading) && (
        <div className="mt-20 border-t border-charcoal-100 pt-14 dark:border-charcoal-500">
          <h2 className="mb-8 text-2xl font-semibold">{t("product.youMayAlsoLike")}</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 xl:grid-cols-4">
            {relatedLoading
              ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : related.map((item) => (
                  <ProductCard key={item.id} product={item} rating={ratings[item.id]} />
                ))}
          </div>
        </div>
      )}

      {recentlyViewed.length > 0 && (
        <div className="mt-20 border-t border-charcoal-100 pt-14 dark:border-charcoal-500">
          <h2 className="mb-8 text-2xl font-semibold">{t("product.recentlyViewed")}</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 xl:grid-cols-4">
            {recentlyViewed.map((item) => (
              <ProductCard key={item.id} product={item} rating={ratings[item.id]} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
