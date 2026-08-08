import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { getSavedAddressSchema } from "../../utils/schemas";
import FormField from "../common/FormField";

export default function AddressForm({ defaultValues, onSave, onCancel, submitting }) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(getSavedAddressSchema(t)), defaultValues });

  return (
    <form onSubmit={handleSubmit(onSave)} noValidate className="space-y-4 border border-charcoal-100 p-5 dark:border-charcoal-500">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField id="fullName" label={t("checkout.fullName")} required error={errors.fullName?.message} {...register("fullName")} />
        <FormField id="phone" label={t("checkout.phone")} type="tel" required error={errors.phone?.message} {...register("phone")} />
      </div>
      <FormField id="addressLine1" label={t("checkout.addressLine1")} required error={errors.addressLine1?.message} {...register("addressLine1")} />
      <FormField id="addressLine2" label={t("checkout.addressLine2")} error={errors.addressLine2?.message} {...register("addressLine2")} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <FormField id="city" label={t("checkout.city")} required error={errors.city?.message} {...register("city")} />
        <FormField id="state" label={t("checkout.state")} required error={errors.state?.message} {...register("state")} />
        <FormField id="postalCode" label={t("checkout.postalCode")} required error={errors.postalCode?.message} {...register("postalCode")} />
      </div>
      <FormField id="country" label={t("checkout.country")} required error={errors.country?.message} {...register("country")} />
      <div className="flex gap-3">
        <button type="button" onClick={onCancel} className="btn-secondary">
          {t("common.cancel")}
        </button>
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? t("common.saving") : t("account.saveAddress")}
        </button>
      </div>
    </form>
  );
}
