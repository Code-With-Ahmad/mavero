import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { getAddressSchema } from "../../utils/schemas";
import FormField from "../common/FormField";
import Select from "../common/Select";

export default function ShippingStep({ defaultValues, savedAddresses = [], onNext }) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(getAddressSchema(t)), defaultValues });

  const handleSelectSaved = (event) => {
    const address = savedAddresses.find((a) => a.id === event.target.value);
    if (address) reset({ ...defaultValues, ...address, note: "" });
  };

  return (
    <form onSubmit={handleSubmit(onNext)} noValidate className="space-y-5">
      <h2 className="font-serif text-2xl font-semibold">{t("checkout.shippingDetails")}</h2>

      {savedAddresses.length > 0 && (
        <div>
          <label htmlFor="savedAddress" className="label-uppercase mb-2 block">
            {t("checkout.useSavedAddress")}
          </label>
          <Select id="savedAddress" onChange={handleSelectSaved} defaultValue="">
            <option value="">{t("checkout.enterNewAddress")}</option>
            {savedAddresses.map((address) => (
              <option key={address.id} value={address.id}>
                {address.fullName} — {address.addressLine1}, {address.city}
              </option>
            ))}
          </Select>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField
          id="fullName"
          label={t("checkout.fullName")}
          autoComplete="name"
          required
          error={errors.fullName?.message}
          {...register("fullName")}
        />
        <FormField
          id="phone"
          label={t("checkout.phone")}
          type="tel"
          autoComplete="tel"
          required
          error={errors.phone?.message}
          {...register("phone")}
        />
      </div>

      <FormField
        id="addressLine1"
        label={t("checkout.addressLine1")}
        autoComplete="address-line1"
        required
        error={errors.addressLine1?.message}
        {...register("addressLine1")}
      />
      <FormField
        id="addressLine2"
        label={t("checkout.addressLine2")}
        autoComplete="address-line2"
        error={errors.addressLine2?.message}
        {...register("addressLine2")}
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <FormField
          id="city"
          label={t("checkout.city")}
          autoComplete="address-level2"
          required
          error={errors.city?.message}
          {...register("city")}
        />
        <FormField
          id="state"
          label={t("checkout.state")}
          autoComplete="address-level1"
          required
          error={errors.state?.message}
          {...register("state")}
        />
        <FormField
          id="postalCode"
          label={t("checkout.postalCode")}
          autoComplete="postal-code"
          required
          error={errors.postalCode?.message}
          {...register("postalCode")}
        />
      </div>

      <FormField
        id="country"
        label={t("checkout.country")}
        autoComplete="country-name"
        required
        error={errors.country?.message}
        {...register("country")}
      />

      <FormField
        id="note"
        label={t("checkout.orderNote")}
        as="textarea"
        rows={3}
        error={errors.note?.message}
        {...register("note")}
      />

      <button type="submit" className="btn-primary w-full sm:w-auto">
        {t("checkout.continueToPayment")}
      </button>
    </form>
  );
}
