import { useState } from "react";
import { Timestamp } from "firebase/firestore";
import { useTranslation } from "react-i18next";
import { FaPlus, FaPen, FaTrash } from "react-icons/fa6";
import toast from "react-hot-toast";
import useAdminCoupons from "../../hooks/useAdminCoupons";
import FormField from "../../components/common/FormField";
import Skeleton from "../../components/common/Skeleton";
import Checkbox from "../../components/common/Checkbox";

function dateInputValue(timestamp) {
  if (!timestamp?.seconds) return "";
  return new Date(timestamp.seconds * 1000).toISOString().slice(0, 10);
}

function CouponFormRow({ initial, onSave, onCancel }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    code: initial?.code || "",
    type: initial?.type || "percentage",
    value: initial?.value ?? "",
    minOrderValue: initial?.minOrderValue ?? "",
    usageLimit: initial?.usageLimit ?? "",
    expiresAt: dateInputValue(initial?.expiresAt),
    active: initial?.active ?? true,
  });
  const [submitting, setSubmitting] = useState(false);

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.code.trim() || !form.value) {
      toast.error(t("admin.coupons.codeValueRequired"));
      return;
    }
    setSubmitting(true);
    try {
      await onSave({
        code: form.code.trim().toUpperCase(),
        type: form.type,
        value: Number(form.value),
        minOrderValue: form.minOrderValue ? Number(form.minOrderValue) : 0,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
        expiresAt: form.expiresAt ? Timestamp.fromDate(new Date(form.expiresAt)) : null,
        active: form.active,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border border-charcoal-100 p-5 dark:border-charcoal-500">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField id="code" label={t("admin.coupons.code")} required value={form.code} onChange={(e) => update("code", e.target.value)} />
        <FormField id="type" label={t("admin.coupons.type")} as="select" value={form.type} onChange={(e) => update("type", e.target.value)}>
          <option value="percentage">{t("admin.coupons.percentageOff")}</option>
          <option value="flat">{t("admin.coupons.flatOff")}</option>
        </FormField>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <FormField
          id="value"
          label={form.type === "percentage" ? t("admin.coupons.percentOff") : t("admin.coupons.amountOff")}
          type="number"
          required
          value={form.value}
          onChange={(e) => update("value", e.target.value)}
        />
        <FormField
          id="minOrderValue"
          label={t("admin.coupons.minOrderValue")}
          type="number"
          value={form.minOrderValue}
          onChange={(e) => update("minOrderValue", e.target.value)}
        />
        <FormField
          id="usageLimit"
          label={t("admin.coupons.usageLimit")}
          type="number"
          value={form.usageLimit}
          onChange={(e) => update("usageLimit", e.target.value)}
        />
      </div>
      <FormField
        id="expiresAt"
        label={t("admin.coupons.expiryDate")}
        type="date"
        value={form.expiresAt}
        onChange={(e) => update("expiresAt", e.target.value)}
      />
      <Checkbox
        checked={form.active}
        onChange={(e) => update("active", e.target.checked)}
        label={t("admin.coupons.active")}
      />
      <div className="flex gap-3">
        <button type="button" onClick={onCancel} className="btn-secondary">
          {t("common.cancel")}
        </button>
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? t("common.saving") : t("admin.coupons.saveCoupon")}
        </button>
      </div>
    </form>
  );
}

export default function AdminCoupons() {
  const { t } = useTranslation();
  const { coupons, loading, createCoupon, updateCoupon, deleteCoupon } = useAdminCoupons();
  const [editingId, setEditingId] = useState(null);
  const [adding, setAdding] = useState(false);

  const handleCreate = async (data) => {
    try {
      await createCoupon(data);
      toast.success(t("admin.coupons.created"));
      setAdding(false);
    } catch {
      toast.error(t("admin.coupons.couldNotCreate"));
    }
  };

  const handleUpdate = async (id, data) => {
    try {
      await updateCoupon(id, data);
      toast.success(t("admin.coupons.updated"));
      setEditingId(null);
    } catch {
      toast.error(t("admin.coupons.couldNotUpdate"));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t("admin.coupons.confirmDelete"))) return;
    try {
      await deleteCoupon(id);
      toast.success(t("admin.coupons.deleted"));
    } catch {
      toast.error(t("admin.coupons.couldNotDelete"));
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="label-uppercase">{t("common.brand")} Admin</p>
          <h1 className="mt-1 text-3xl font-semibold">{t("admin.coupons.title")}</h1>
        </div>
        {!adding && (
          <button type="button" onClick={() => setAdding(true)} className="btn-primary">
            <FaPlus className="h-3.5 w-3.5" /> {t("admin.coupons.addCoupon")}
          </button>
        )}
      </div>

      {loading ? (
        <Skeleton className="h-40 w-full" />
      ) : (
        <div className="space-y-4">
          {adding && <CouponFormRow onSave={handleCreate} onCancel={() => setAdding(false)} />}
          {coupons.map((coupon) =>
            editingId === coupon.id ? (
              <CouponFormRow
                key={coupon.id}
                initial={coupon}
                onSave={(data) => handleUpdate(coupon.id, data)}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div
                key={coupon.id}
                className="flex items-center justify-between border border-charcoal-100 p-4 dark:border-charcoal-500"
              >
                <div>
                  <p className="font-medium text-charcoal-800 dark:text-ivory-100">
                    {coupon.code}{" "}
                    <span className="text-xs font-normal text-charcoal-400 dark:text-ivory-300">
                      {coupon.type === "percentage"
                        ? `${coupon.value}% ${t("admin.coupons.off")}`
                        : `$${coupon.value} ${t("admin.coupons.off")}`}
                    </span>
                  </p>
                  <p className="text-xs text-charcoal-400 dark:text-ivory-300">
                    {t("admin.coupons.used", { count: coupon.usedCount || 0 })}
                    {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""} ·{" "}
                    {coupon.active ? t("admin.coupons.active") : t("admin.coupons.inactive")}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingId(coupon.id)}
                    aria-label={t("common.edit")}
                    className="text-charcoal-400 hover:text-gold-600 dark:text-ivory-300"
                  >
                    <FaPen className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(coupon.id)}
                    aria-label={t("common.delete")}
                    className="text-charcoal-400 hover:text-burgundy-500 dark:text-ivory-300"
                  >
                    <FaTrash className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
