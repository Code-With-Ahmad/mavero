import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { FaGoogle, FaEye, FaEyeSlash } from "react-icons/fa";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { getSignupSchema } from "../utils/schemas";
import { getAuthErrorMessage } from "../utils/authErrors";
import FormField from "../components/common/FormField";
import PasswordStrengthMeter from "../components/common/PasswordStrengthMeter";

export default function Signup() {
  const { t } = useTranslation();
  const { signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ resolver: zodResolver(getSignupSchema(t)) });

  const password = watch("password");

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await signup(data.name, data.email, data.password);
      toast.success(t("toast.welcomeToMavero"));
      navigate("/");
    } catch (error) {
      toast.error(getAuthErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleSubmitting(true);
    try {
      await loginWithGoogle();
      toast.success(t("toast.welcomeBack"));
      navigate("/");
    } catch (error) {
      toast.error(getAuthErrorMessage(error));
    } finally {
      setGoogleSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="label-uppercase">{t("common.brand")}</p>
          <h1 className="mt-2 text-3xl font-semibold">{t("auth.createAccount")}</h1>
          <p className="mt-2 text-sm text-charcoal-400 dark:text-ivory-300">
            {t("auth.signupSubtitle")}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          <FormField
            id="name"
            label={t("auth.fullName")}
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
          <div>
            <div className="relative">
              <FormField
                id="password"
                label={t("auth.password")}
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                error={errors.password?.message}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute end-3 top-[42px] text-charcoal-300 hover:text-charcoal-600 dark:text-ivory-300 dark:hover:text-ivory-100"
                aria-label={showPassword ? t("auth.hidePassword") : t("auth.showPassword")}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            <PasswordStrengthMeter password={password} />
          </div>
          <FormField
            id="confirmPassword"
            label={t("auth.confirmPassword")}
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? t("auth.creatingAccount") : t("auth.createAccountButton")}
          </button>
        </form>

        <div className="my-6 flex items-center gap-4">
          <div className="h-px flex-1 bg-charcoal-100 dark:bg-charcoal-500" />
          <span className="label-uppercase">{t("auth.or")}</span>
          <div className="h-px flex-1 bg-charcoal-100 dark:bg-charcoal-500" />
        </div>

        <button
          type="button"
          onClick={handleGoogle}
          disabled={googleSubmitting}
          className="btn-secondary w-full"
        >
          <FaGoogle aria-hidden="true" />
          {googleSubmitting ? t("auth.pleaseWait") : t("auth.continueWithGoogle")}
        </button>

        <p className="mt-8 text-center text-sm text-charcoal-400 dark:text-ivory-300">
          {t("auth.haveAccount")}{" "}
          <Link to="/login" className="text-gold-700 hover:underline dark:text-gold-400">
            {t("nav.login")}
          </Link>
        </p>
      </div>
    </div>
  );
}
