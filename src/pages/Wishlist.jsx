import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaHeart, FaTrash, FaBagShopping } from "react-icons/fa6";
import toast from "react-hot-toast";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { formatCurrency } from "../utils/formatCurrency";
import EmptyState from "../components/common/EmptyState";
import Skeleton from "../components/common/Skeleton";

export default function Wishlist() {
  const { t } = useTranslation();
  const { items, loading, toggleWishlist } = useWishlist();
  const { addItem } = useCart();

  const handleMoveToCart = async (item) => {
    await addItem(
      { sku: item.sku, name: item.name, images: [item.image], price: item.price, salePrice: item.salePrice, stock: 99 },
      null,
      1
    );
    await toggleWishlist({ sku: item.sku });
    toast.success(t("wishlist.movedToCart", { name: item.name }));
  };

  if (loading) {
    return (
      <div className="container-boutique py-14">
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/5] w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-boutique py-14">
        <EmptyState
          icon={<FaHeart />}
          title={t("wishlist.empty")}
          description={t("wishlist.emptyBody")}
          action={
            <Link to="/shop" className="btn-primary">
              {t("wishlist.browseShop")}
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="container-boutique py-10 sm:py-14">
      <div className="mb-8">
        <p className="label-uppercase">{t("common.brand")}</p>
        <h1 className="mt-2 text-4xl font-semibold">{t("wishlist.title")}</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div key={item.id} className="card-surface flex gap-4 p-4">
            <Link to={`/product/${item.sku}`} className="h-24 w-20 shrink-0 overflow-hidden bg-ivory-200 dark:bg-charcoal-600">
              {item.image && (
                <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
              )}
            </Link>
            <div className="flex flex-1 flex-col justify-between">
              <div>
                <Link
                  to={`/product/${item.sku}`}
                  className="font-serif text-base text-charcoal-800 hover:text-gold-700 dark:text-ivory-100 dark:hover:text-gold-400"
                >
                  {item.name}
                </Link>
                <p className="mt-1 text-sm text-charcoal-500 dark:text-ivory-200">
                  {formatCurrency(item.salePrice || item.price)}
                </p>
              </div>
              <div className="mt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleMoveToCart(item)}
                  className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-charcoal-700 hover:text-gold-700 dark:text-ivory-100 dark:hover:text-gold-400"
                >
                  <FaBagShopping /> {t("wishlist.moveToCart")}
                </button>
                <button
                  type="button"
                  onClick={() => toggleWishlist({ sku: item.sku })}
                  aria-label={t("product.removeFromWishlist")}
                  className="text-charcoal-300 hover:text-burgundy-500 dark:text-ivory-300"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
