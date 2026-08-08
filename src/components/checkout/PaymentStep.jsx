import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { IMaskInput } from "react-imask";
import { FaCreditCard, FaMoneyBillWave } from "react-icons/fa6";
import { getCardPaymentSchema } from "../../utils/schemas";
import { detectCardBrand } from "../../utils/cardValidation";
import FormField from "../common/FormField";

export default function PaymentStep({ onNext, onBack }) {
  const { t } = useTranslation();
  const [method, setMethod] = useState("card");
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({ resolver: zodResolver(getCardPaymentSchema(t)) });

  const handleCardSubmit = (data) => {
    const brand = detectCardBrand(data.cardNumber);
    const last4 = data.cardNumber.replace(/\D/g, "").slice(-4);
    onNext({
      method: "card",
      summary: `${brand} •••• ${last4}`,
    });
  };

  const handleCodSubmit = () => {
    onNext({ method: "cod", summary: t("checkout.cashOnDelivery") });
  };

  return (
    <div className="space-y-6">
      <h2 className="font-serif text-2xl font-semibold">{t("checkout.payment")}</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setMethod("card")}
          aria-pressed={method === "card"}
          className={`flex items-center gap-3 border p-4 text-start transition-colors duration-200 ${
            method === "card"
              ? "border-charcoal-800 bg-ivory-100 dark:border-gold-500 dark:bg-charcoal-600"
              : "border-charcoal-200 dark:border-charcoal-500"
          }`}
        >
          <FaCreditCard className="h-5 w-5 text-charcoal-600 dark:text-ivory-200" />
          <div>
            <p className="text-sm font-medium text-charcoal-800 dark:text-ivory-100">
              {t("checkout.creditDebitCard")}
            </p>
            <p className="text-xs text-charcoal-400 dark:text-ivory-300">
              {t("checkout.cardDemoNotice")}
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setMethod("cod")}
          aria-pressed={method === "cod"}
          className={`flex items-center gap-3 border p-4 text-start transition-colors duration-200 ${
            method === "cod"
              ? "border-charcoal-800 bg-ivory-100 dark:border-gold-500 dark:bg-charcoal-600"
              : "border-charcoal-200 dark:border-charcoal-500"
          }`}
        >
          <FaMoneyBillWave className="h-5 w-5 text-charcoal-600 dark:text-ivory-200" />
          <div>
            <p className="text-sm font-medium text-charcoal-800 dark:text-ivory-100">
              {t("checkout.cashOnDelivery")}
            </p>
            <p className="text-xs text-charcoal-400 dark:text-ivory-300">{t("checkout.codBody")}</p>
          </div>
        </button>
      </div>

      {method === "card" ? (
        <form onSubmit={handleSubmit(handleCardSubmit)} noValidate className="space-y-5">
          <FormField
            id="cardholderName"
            label={t("checkout.cardholderName")}
            autoComplete="cc-name"
            required
            error={errors.cardholderName?.message}
            {...register("cardholderName")}
          />

          <div>
            <label htmlFor="cardNumber" className="label-uppercase mb-2 block">
              {t("checkout.cardNumber")}
              <span className="text-burgundy-500 dark:text-burgundy-300" aria-hidden="true"> *</span>
            </label>
            <Controller
              name="cardNumber"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <IMaskInput
                  id="cardNumber"
                  dir="ltr"
                  mask="0000 0000 0000 0000"
                  autoComplete="cc-number"
                  inputMode="numeric"
                  placeholder="4242 4242 4242 4242"
                  className="input-field text-start"
                  value={field.value}
                  onAccept={(value) => field.onChange(value)}
                />
              )}
            />
            {errors.cardNumber && (
              <p role="alert" className="mt-1.5 text-xs text-burgundy-400 dark:text-burgundy-300">
                {errors.cardNumber.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label htmlFor="expiry" className="label-uppercase mb-2 block">
                {t("checkout.expiry")}
                <span className="text-burgundy-500 dark:text-burgundy-300" aria-hidden="true"> *</span>
              </label>
              <Controller
                name="expiry"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <IMaskInput
                    id="expiry"
                    dir="ltr"
                    mask="00/00"
                    autoComplete="cc-exp"
                    inputMode="numeric"
                    placeholder="12/28"
                    className="input-field text-start"
                    value={field.value}
                    onAccept={(value) => field.onChange(value)}
                  />
                )}
              />
              {errors.expiry && (
                <p role="alert" className="mt-1.5 text-xs text-burgundy-400 dark:text-burgundy-300">
                  {errors.expiry.message}
                </p>
              )}
            </div>
            <FormField
              id="cvv"
              label={t("checkout.cvv")}
              dir="ltr"
              inputMode="numeric"
              autoComplete="cc-csc"
              maxLength={4}
              placeholder="123"
              required
              error={errors.cvv?.message}
              {...register("cvv")}
            />
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={onBack} className="btn-secondary">
              {t("common.back")}
            </button>
            <button type="submit" className="btn-primary flex-1">
              {t("checkout.reviewOrder")}
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-5">
          <p className="text-sm text-charcoal-500 dark:text-ivory-200">{t("checkout.codConfirm")}</p>
          <div className="flex gap-3">
            <button type="button" onClick={onBack} className="btn-secondary">
              {t("common.back")}
            </button>
            <button type="button" onClick={handleCodSubmit} className="btn-primary flex-1">
              {t("checkout.reviewOrder")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
