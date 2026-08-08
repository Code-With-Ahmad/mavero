import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaHeart, FaRegHeart, FaBagShopping } from "react-icons/fa6";
import toast from "react-hot-toast";
import { formatCurrency } from "../../utils/formatCurrency";
import { useAuth } from "../../context/AuthContext";
import { useWishlist } from "../../context/WishlistContext";
import { useCart } from "../../context/CartContext";
import StarRating from "./StarRating";

export default function ProductCard({ product, rating, view = "grid" }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { addItem } = useCart();
  const navigate = useNavigate();

  const wishlisted = user && isWishlisted(product.sku);
  const outOfStock = product.status === "out_of_stock" || product.stock === 0;
  const hasVariants = product.variants && product.variants.length > 0;

  const handleWishlist = (event) => {
    event.preventDefault();
    if (!user) {
      toast(t("product.loginToWishlist"), { icon: "♡" });
      navigate("/login", { state: { from: { pathname: "/shop" } } });
      return;
    }
    toggleWishlist(product);
  };

  const handleQuickAdd = async (event) => {
    event.preventDefault();
    if (outOfStock) return;
    if (hasVariants) {
      navigate(`/product/${product.sku}`);
      return;
    }
    await addItem(product, null, 1);
    toast.success(t("product.addedToCart", { name: product.name }));
  };

  return (
    <Link
      to={`/product/${product.sku}`}
      className={`group relative flex ${
        view === "list" ? "flex-row gap-6" : "flex-col"
      } border border-transparent transition-colors duration-200 ease-refined hover:border-charcoal-100 dark:hover:border-charcoal-500`}
    >
      <div
        className={`relative overflow-hidden bg-ivory-200 dark:bg-charcoal-600 ${
          view === "list" ? "w-40 shrink-0 sm:w-56" : "aspect-[4/5] w-full"
        }`}
      >
        {product.images?.[0] && (
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 ease-refined group-hover:scale-105"
          />
        )}

        {product.salePrice && (
          <span className="absolute start-3 top-3 bg-burgundy-600 px-2 py-1 text-[11px] font-medium uppercase tracking-wider text-ivory">
            {t("product.sale")}
          </span>
        )}
        {outOfStock && (
          <span className="absolute start-3 top-3 bg-charcoal-600 px-2 py-1 text-[11px] font-medium uppercase tracking-wider text-ivory">
            {t("product.outOfStock")}
          </span>
        )}

        <button
          type="button"
          onClick={handleWishlist}
          aria-label={wishlisted ? t("product.removeFromWishlist") : t("product.addToWishlist")}
          className="absolute end-3 top-3 flex h-8 w-8 items-center justify-center bg-ivory/90 text-charcoal-700 transition-colors duration-200 hover:text-burgundy-500 dark:bg-charcoal-800/90 dark:text-ivory-100"
        >
          {wishlisted ? <FaHeart className="text-burgundy-500" /> : <FaRegHeart />}
        </button>

        {!outOfStock && view === "grid" && (
          <button
            type="button"
            onClick={handleQuickAdd}
            className="absolute inset-x-0 bottom-0 flex translate-y-full items-center justify-center gap-2 bg-charcoal-800 py-3 text-xs font-medium uppercase tracking-wider text-ivory opacity-0 transition-all duration-200 ease-refined group-hover:translate-y-0 group-hover:opacity-100 dark:bg-gold-500 dark:text-charcoal-900"
          >
            <FaBagShopping aria-hidden="true" />
            {hasVariants ? t("product.selectOptions") : t("product.quickAdd")}
          </button>
        )}
      </div>

      <div className={`flex flex-col gap-1.5 ${view === "list" ? "flex-1 py-2" : "pt-4"}`}>
        <p className="label-uppercase text-[11px] text-charcoal-300 dark:text-ivory-300">
          {product.category?.replace(/-/g, " ")}
        </p>
        <h3 className="font-serif text-lg text-charcoal-800 dark:text-ivory-100">
          {product.name}
        </h3>
        {rating?.count > 0 && <StarRating value={rating.average} count={rating.count} />}
        <div className="mt-1 flex items-center gap-2">
          {product.salePrice ? (
            <>
              <span className="font-medium text-burgundy-600 dark:text-gold-400">
                {formatCurrency(product.salePrice)}
              </span>
              <span className="text-sm text-charcoal-300 line-through dark:text-ivory-300">
                {formatCurrency(product.price)}
              </span>
            </>
          ) : (
            <span className="font-medium text-charcoal-800 dark:text-ivory-100">
              {formatCurrency(product.price)}
            </span>
          )}
        </div>
        {view === "list" && (
          <p className="mt-2 line-clamp-2 text-sm text-charcoal-400 dark:text-ivory-300">
            {product.description}
          </p>
        )}
      </div>
    </Link>
  );
}
