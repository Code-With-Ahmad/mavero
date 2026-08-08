import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { FaPlus, FaPen, FaTrash } from "react-icons/fa6";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import useAddresses from "../hooks/useAddresses";
import { getProfileSchema, getChangePasswordSchema } from "../utils/schemas";
import { getAuthErrorMessage } from "../utils/authErrors";
import FormField from "../components/common/FormField";
import AddressForm from "../components/account/AddressForm";
import Skeleton from "../components/common/Skeleton";

function ProfileInfoSection() {
  const { t } = useTranslation();
  const { profile, updateUserProfile } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(getProfileSchema(t)),
    defaultValues: { name: profile?.name || "", phone: profile?.phone || "" },
  });

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await updateUserProfile(data);
      toast.success(t("toast.profileUpdated"));
    } catch {
      toast.error(t("toast.couldNotUpdateProfile"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField id="name" label={t("auth.fullName")} required error={errors.name?.message} {...register("name")} />
        <FormField id="phone" label={t("checkout.phone")} type="tel" error={errors.phone?.message} {...register("phone")} />
      </div>
      <button type="submit" disabled={submitting} className="btn-primary">
        {submitting ? t("common.saving") : t("common.save")}
      </button>
    </form>
  );
}

function PasswordSection() {
  const { t } = useTranslation();
  const { changeUserPassword } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(getChangePasswordSchema(t)) });

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await changeUserPassword(data.currentPassword, data.newPassword);
      toast.success(t("toast.passwordUpdated"));
      reset();
    } catch (error) {
      toast.error(getAuthErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <FormField
        id="currentPassword"
        label={t("account.currentPassword")}
        type="password"
        autoComplete="current-password"
        required
        error={errors.currentPassword?.message}
        {...register("currentPassword")}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          id="newPassword"
          label={t("account.newPassword")}
          type="password"
          autoComplete="new-password"
          required
          error={errors.newPassword?.message}
          {...register("newPassword")}
        />
        <FormField
          id="confirmNewPassword"
          label={t("account.confirmNewPassword")}
          type="password"
          autoComplete="new-password"
          required
          error={errors.confirmNewPassword?.message}
          {...register("confirmNewPassword")}
        />
      </div>
      <button type="submit" disabled={submitting} className="btn-primary">
        {submitting ? t("account.updating") : t("account.updatePassword")}
      </button>
    </form>
  );
}

function AddressesSection() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { addresses, loading, addAddress, updateAddress, removeAddress } = useAddresses(user.uid);
  const [editingId, setEditingId] = useState(null);
  const [adding, setAdding] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSave = async (data) => {
    setSubmitting(true);
    try {
      if (editingId) {
        await updateAddress(editingId, data);
        toast.success(t("toast.addressUpdated"));
      } else {
        await addAddress(data);
        toast.success(t("toast.addressSaved"));
      }
      setEditingId(null);
      setAdding(false);
    } catch {
      toast.error(t("toast.couldNotSaveAddress"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await removeAddress(id);
      toast.success(t("toast.addressRemoved"));
    } catch {
      toast.error(t("toast.couldNotRemoveAddress"));
    }
  };

  if (loading) return <Skeleton className="h-24 w-full" />;

  return (
    <div className="space-y-4">
      {addresses.map((address) =>
        editingId === address.id ? (
          <AddressForm
            key={address.id}
            defaultValues={address}
            onSave={handleSave}
            onCancel={() => setEditingId(null)}
            submitting={submitting}
          />
        ) : (
          <div key={address.id} className="flex items-start justify-between border border-charcoal-100 p-4 dark:border-charcoal-500">
            <div className="text-sm text-charcoal-600 dark:text-ivory-200">
              <p className="font-medium text-charcoal-800 dark:text-ivory-100">{address.fullName}</p>
              <p>{address.addressLine1}{address.addressLine2 ? `, ${address.addressLine2}` : ""}</p>
              <p>{address.city}, {address.state} {address.postalCode}</p>
              <p>{address.country}</p>
              <p>{address.phone}</p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setEditingId(address.id)}
                aria-label={t("common.edit")}
                className="text-charcoal-400 hover:text-gold-600 dark:text-ivory-300"
              >
                <FaPen className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(address.id)}
                aria-label={t("common.delete")}
                className="text-charcoal-400 hover:text-burgundy-500 dark:text-ivory-300"
              >
                <FaTrash className="h-4 w-4" />
              </button>
            </div>
          </div>
        )
      )}

      {adding ? (
        <AddressForm onSave={handleSave} onCancel={() => setAdding(false)} submitting={submitting} />
      ) : (
        <button type="button" onClick={() => setAdding(true)} className="btn-secondary">
          <FaPlus className="h-3.5 w-3.5" /> {t("account.addAddress")}
        </button>
      )}
    </div>
  );
}

export default function Account() {
  const { t } = useTranslation();
  const { user, profile } = useAuth();
  const { items } = useCart();

  if (!profile) {
    return (
      <div className="container-boutique py-14">
        <Skeleton className="h-8 w-48" />
      </div>
    );
  }

  return (
    <div className="container-boutique max-w-3xl py-10 sm:py-14">
      <div className="mb-10">
        <p className="label-uppercase">{t("common.brand")}</p>
        <h1 className="mt-2 text-4xl font-semibold">{t("account.myAccount")}</h1>
        <p className="mt-2 text-sm text-charcoal-400 dark:text-ivory-300">{user.email}</p>
      </div>

      <section className="mb-12">
        <h2 className="mb-4 font-serif text-xl font-semibold">{t("account.profileInformation")}</h2>
        <ProfileInfoSection />
      </section>

      <section className="mb-12 border-t border-charcoal-100 pt-10 dark:border-charcoal-500">
        <h2 className="mb-4 font-serif text-xl font-semibold">{t("account.changePassword")}</h2>
        <PasswordSection />
      </section>

      <section className="mb-12 border-t border-charcoal-100 pt-10 dark:border-charcoal-500">
        <h2 className="mb-4 font-serif text-xl font-semibold">{t("account.savedAddresses")}</h2>
        <AddressesSection />
      </section>

      <section className="border-t border-charcoal-100 pt-10 dark:border-charcoal-500">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-semibold">{t("account.orderHistory")}</h2>
          <Link to="/orders" className="text-sm text-gold-700 hover:underline dark:text-gold-400">
            {t("account.viewAllOrders")}
          </Link>
        </div>
        {items.length > 0 && (
          <p className="mt-2 text-sm text-charcoal-400 dark:text-ivory-300">
            {t("account.itemsInCart", { count: items.length })}
          </p>
        )}
      </section>
    </div>
  );
}
