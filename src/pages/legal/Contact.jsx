import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useTranslation } from "react-i18next";
import { FaEnvelope, FaLocationDot, FaClock } from "react-icons/fa6";
import toast from "react-hot-toast";
import { db } from "../../lib/firebase";
import { getContactSchema } from "../../utils/schemas";
import StaticPageHeader from "../../components/common/StaticPageHeader";
import FormField from "../../components/common/FormField";

export default function Contact() {
  const { t } = useTranslation();
  const [submitting, setSubmitting] = useState(false);
  const [lastSubmitAt, setLastSubmitAt] = useState(0);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(getContactSchema(t)) });

  const onSubmit = async (data) => {
    if (Date.now() - lastSubmitAt < 30000) {
      toast.error(t("toast.waitBeforeResending"));
      return;
    }
    setSubmitting(true);
    try {
      await addDoc(collection(db, "contactMessages"), {
        ...data,
        createdAt: serverTimestamp(),
      });
      toast.success(t("toast.messageSent"));
      reset();
      setLastSubmitAt(Date.now());
    } catch (error) {
      toast.error(t("toast.couldNotSendMessage"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <StaticPageHeader title={t("legal.contact")} description={t("legal.contactSubtitle")} />

      <div className="container-boutique grid grid-cols-1 gap-12 py-16 lg:grid-cols-[1fr_1.3fr]">
        <div className="space-y-8">
          <div className="flex gap-4">
            <FaEnvelope className="mt-1 h-4 w-4 shrink-0 text-gold-600 dark:text-gold-400" />
            <div>
              <p className="text-sm font-medium text-charcoal-800 dark:text-ivory-100">
                {t("legal.email")}
              </p>
              <p className="text-sm text-charcoal-500 dark:text-ivory-200">hello@mavero.example</p>
            </div>
          </div>
          <div className="flex gap-4">
            <FaClock className="mt-1 h-4 w-4 shrink-0 text-gold-600 dark:text-gold-400" />
            <div>
              <p className="text-sm font-medium text-charcoal-800 dark:text-ivory-100">
                {t("legal.responseTime")}
              </p>
              <p className="text-sm text-charcoal-500 dark:text-ivory-200">
                {t("legal.responseTimeBody")}
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <FaLocationDot className="mt-1 h-4 w-4 shrink-0 text-gold-600 dark:text-gold-400" />
            <div>
              <p className="text-sm font-medium text-charcoal-800 dark:text-ivory-100">
                {t("legal.studio")}
              </p>
              <p className="text-sm text-charcoal-500 dark:text-ivory-200">
                {t("legal.studioBody")}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <FormField
              id="name"
              label={t("legal.yourName")}
              autoComplete="name"
              required
              error={errors.name?.message}
              {...register("name")}
            />
            <FormField
              id="email"
              label={t("auth.email")}
              type="email"
              autoComplete="email"
              required
              error={errors.email?.message}
              {...register("email")}
            />
          </div>
          <FormField
            id="subject"
            label={t("legal.subject")}
            required
            error={errors.subject?.message}
            {...register("subject")}
          />
          <FormField
            id="message"
            label={t("legal.message")}
            as="textarea"
            rows={6}
            required
            error={errors.message?.message}
            {...register("message")}
          />
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? t("legal.sendingMessage") : t("legal.sendMessage")}
          </button>
        </form>
      </div>
    </div>
  );
}
