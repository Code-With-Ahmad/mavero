import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { FaPaperPlane } from "react-icons/fa6";
import { db } from "../../lib/firebase";
import { getNewsletterSchema } from "../../utils/schemas";

export default function NewsletterForm() {
  const { t } = useTranslation();
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(getNewsletterSchema(t)) });

  const onSubmit = async ({ email }) => {
    setSubmitting(true);
    try {
      const normalized = email.trim().toLowerCase();
      const subscribersRef = collection(db, "subscribers");
      const existing = await getDocs(
        query(subscribersRef, where("email", "==", normalized))
      );
      if (!existing.empty) {
        toast(t("toast.alreadySubscribed"), { icon: "✓" });
      } else {
        await addDoc(subscribersRef, {
          email: normalized,
          createdAt: serverTimestamp(),
        });
        toast.success(t("toast.subscribed"));
      }
      reset();
    } catch (error) {
      toast.error(t("toast.couldNotSubscribe"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-2">
      <div className="flex">
        <input
          type="email"
          placeholder={t("footer.emailPlaceholder")}
          aria-label={t("auth.email")}
          aria-invalid={!!errors.email}
          className="input-field flex-1"
          {...register("email")}
        />
        <button
          type="submit"
          disabled={submitting}
          aria-label={t("footer.subscribe")}
          className="flex items-center justify-center border border-s-0 border-charcoal-800 bg-charcoal-800 px-4 text-ivory transition-colors duration-200 ease-refined hover:bg-gold-600 disabled:opacity-60 dark:border-gold-500 dark:bg-gold-500 dark:text-charcoal-900 dark:hover:bg-gold-400"
        >
          <FaPaperPlane className="h-4 w-4 rtl:-scale-x-100" />
        </button>
      </div>
      {errors.email && (
        <p role="alert" className="text-xs text-burgundy-400 dark:text-burgundy-300">
          {errors.email.message}
        </p>
      )}
    </form>
  );
}
