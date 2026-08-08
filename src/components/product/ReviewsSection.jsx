import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import useReviews from "../../hooks/useReviews";
import StarRating from "./StarRating";
import Skeleton from "../common/Skeleton";
import EmptyState from "../common/EmptyState";

function formatDate(timestamp) {
  if (!timestamp?.seconds) return "";
  return new Date(timestamp.seconds * 1000).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function ReviewsSection({ productId }) {
  const { t } = useTranslation();
  const { user, profile } = useAuth();
  const { reviews, loading, average, count, submitReview } = useReviews(productId);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const alreadyReviewed = user && reviews.some((r) => r.userId === user.uid);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!rating) {
      toast.error(t("toast.pleaseSelectRating"));
      return;
    }
    setSubmitting(true);
    try {
      await submitReview({
        userId: user.uid,
        userName: profile?.name || user.email,
        rating,
        comment: comment.trim(),
      });
      toast.success(t("toast.reviewThanks"));
      setRating(0);
      setComment("");
    } catch (error) {
      toast.error(t("toast.couldNotSubmitReview"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-8 flex items-center gap-4">
        <h2 className="text-2xl font-semibold">{t("product.reviews")}</h2>
        {count > 0 && <StarRating value={average} count={count} size="text-base" />}
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : reviews.length === 0 ? (
        <EmptyState title={t("product.noReviews")} description={t("product.noReviewsBody")} />
      ) : (
        <ul className="space-y-6">
          {reviews.map((review) => (
            <li key={review.id} className="border-b border-charcoal-100 pb-6 dark:border-charcoal-500">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-charcoal-800 dark:text-ivory-100">
                  {review.userName}
                </p>
                <p className="text-xs text-charcoal-300 dark:text-ivory-300">
                  {formatDate(review.createdAt)}
                </p>
              </div>
              <StarRating value={review.rating} />
              {review.comment && (
                <p className="mt-2 text-sm text-charcoal-500 dark:text-ivory-200">
                  {review.comment}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-10 border-t border-charcoal-100 pt-8 dark:border-charcoal-500">
        {!user && (
          <p className="text-sm text-charcoal-400 dark:text-ivory-300">
            <Link to="/login" className="text-gold-700 hover:underline dark:text-gold-400">
              {t("product.loginToReview")}
            </Link>{" "}
            {t("product.loginToReviewBody")}
          </p>
        )}

        {user && alreadyReviewed && (
          <p className="text-sm text-charcoal-400 dark:text-ivory-300">
            {t("product.alreadyReviewed")}
          </p>
        )}

        {user && !alreadyReviewed && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="label-uppercase">{t("product.writeReview")}</h3>
            <StarRating value={rating} interactive onChange={setRating} size="text-2xl" />
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder={t("product.reviewPlaceholder")}
              className="input-field"
            />
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? t("product.submitting") : t("product.submitReview")}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
