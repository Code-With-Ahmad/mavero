import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { FaEnvelopeOpenText } from "react-icons/fa";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { getForgotPasswordSchema } from "../utils/schemas";
import { getAuthErrorMessage } from "../utils/authErrors";
import FormField from "../components/common/FormField";

export default function ForgotPassword() {
  const { t } = useTranslation();
  const { resetPassword } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [sentTo, setSentTo] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(getForgotPasswordSchema(t)) });

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await resetPassword(data.email);
      setSentTo(data.email);
      setSent(true);
    } catch (error) {
      toast.error(getAuthErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4 py-16">
        <div className="w-full max-w-md text-center">
          <FaEnvelopeOpenText className="mx-auto mb-4 h-10 w-10 text-gold-500" aria-hidden="true" />
          <h1 className="text-2xl font-semibold">{t("auth.checkEmail")}</h1>
          <p className="mt-3 text-sm text-charcoal-400 dark:text-ivory-300">
            {t("auth.checkEmailBody", {
              email: sentTo,
              interpolation: { escapeValue: false },
            })}
          </p>
          <Link to="/login" className="btn-secondary mt-8 inline-flex">
            {t("auth.backToLogin")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="label-uppercase">{t("common.brand")}</p>
          <h1 className="mt-2 text-3xl font-semibold">{t("auth.resetTitle")}</h1>
          <p className="mt-2 text-sm text-charcoal-400 dark:text-ivory-300">
            {t("auth.resetSubtitle")}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          <FormField
            id="email"
            label={t("auth.email")}
            type="email"
            autoComplete="email"
            required
            error={errors.email?.message}
            {...register("email")}
          />
          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? t("auth.sending") : t("auth.sendResetLink")}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-charcoal-400 dark:text-ivory-300">
          {t("auth.rememberedPassword")}{" "}
          <Link to="/login" className="text-gold-700 hover:underline dark:text-gold-400">
            {t("nav.login")}
          </Link>
        </p>
      </div>
    </div>
  );
}
