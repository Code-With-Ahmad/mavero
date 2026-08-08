import { useTranslation } from "react-i18next";
import { FaTrash } from "react-icons/fa6";
import toast from "react-hot-toast";
import useAdminReviews from "../../hooks/useAdminReviews";
import StarRating from "../../components/product/StarRating";
import Skeleton from "../../components/common/Skeleton";
import EmptyState from "../../components/common/EmptyState";

function formatDate(timestamp) {
  if (!timestamp?.seconds) return "";
  return new Date(timestamp.seconds * 1000).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function AdminReviews() {
  const { t } = useTranslation();
  const { reviews, loading, deleteReview } = useAdminReviews();

  const handleDelete = async (id) => {
    if (!window.confirm(t("admin.reviews.confirmDelete"))) return;
    try {
      await deleteReview(id);
      toast.success(t("admin.reviews.deleted"));
    } catch {
      toast.error(t("admin.reviews.couldNotDelete"));
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <p className="label-uppercase">{t("common.brand")} Admin</p>
        <h1 className="mt-1 text-3xl font-semibold">{t("admin.reviews.title")}</h1>
      </div>

      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      )}

      {!loading && reviews.length === 0 && <EmptyState title={t("admin.reviews.noReviews")} />}

      {!loading && reviews.length > 0 && (
        <ul className="divide-y divide-charcoal-100 dark:divide-charcoal-500">
          {reviews.map((review) => (
            <li key={review.id} className="flex items-start justify-between gap-4 py-4">
              <div>
                <div className="flex items-center gap-3">
                  <p className="text-sm font-medium text-charcoal-800 dark:text-ivory-100">{review.userName}</p>
                  <p className="text-xs text-charcoal-400 dark:text-ivory-300">
                    {review.productId} · {formatDate(review.createdAt)}
                  </p>
                </div>
                <StarRating value={review.rating} />
                {review.comment && (
                  <p className="mt-2 text-sm text-charcoal-500 dark:text-ivory-200">{review.comment}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleDelete(review.id)}
                aria-label={t("common.delete")}
                className="shrink-0 text-charcoal-400 hover:text-burgundy-500 dark:text-ivory-300"
              >
                <FaTrash className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
