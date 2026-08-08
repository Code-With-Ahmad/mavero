import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FaPlus, FaPen, FaTrash } from "react-icons/fa6";
import toast from "react-hot-toast";
import useAdminCategories from "../../hooks/useAdminCategories";
import ImageUploader from "../../components/admin/ImageUploader";
import FormField from "../../components/common/FormField";
import Skeleton from "../../components/common/Skeleton";

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function CategoryFormRow({ initial, onSave, onCancel }) {
  const { t } = useTranslation();
  const [name, setName] = useState(initial?.name || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [images, setImages] = useState(initial?.image ? [initial.image] : []);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!name.trim()) {
      toast.error(t("admin.categories.nameRequired"));
      return;
    }
    if (images.length === 0) {
      toast.error(t("admin.categories.imageRequired"));
      return;
    }
    setSubmitting(true);
    try {
      const slug = initial?.slug || slugify(name);
      await onSave(slug, { name: name.trim(), slug, description: description.trim(), image: images[0] });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border border-charcoal-100 p-5 dark:border-charcoal-500">
      <ImageUploader images={images} onChange={setImages} multiple={false} />
      <FormField id="catName" label={t("admin.categories.name")} required value={name} onChange={(e) => setName(e.target.value)} />
      <FormField
        id="catDescription"
        label={t("admin.categories.description")}
        as="textarea"
        rows={2}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <div className="flex gap-3">
        <button type="button" onClick={onCancel} className="btn-secondary">
          {t("common.cancel")}
        </button>
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? t("common.saving") : t("admin.categories.saveCategory")}
        </button>
      </div>
    </form>
  );
}

export default function AdminCategories() {
  const { t } = useTranslation();
  const { categories, loading, saveCategory, deleteCategory } = useAdminCategories();
  const [editingSlug, setEditingSlug] = useState(null);
  const [adding, setAdding] = useState(false);

  const handleSave = async (slug, data) => {
    try {
      await saveCategory(slug, data);
      toast.success(t("admin.categories.saved"));
      setEditingSlug(null);
      setAdding(false);
    } catch {
      toast.error(t("admin.categories.couldNotSave"));
    }
  };

  const handleDelete = async (slug) => {
    if (!window.confirm(t("admin.categories.confirmDelete"))) return;
    try {
      await deleteCategory(slug);
      toast.success(t("admin.categories.deleted"));
    } catch {
      toast.error(t("admin.categories.couldNotDelete"));
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="label-uppercase">{t("common.brand")} Admin</p>
          <h1 className="mt-1 text-3xl font-semibold">{t("admin.categories.title")}</h1>
        </div>
        {!adding && (
          <button type="button" onClick={() => setAdding(true)} className="btn-primary">
            <FaPlus className="h-3.5 w-3.5" /> {t("admin.categories.addCategory")}
          </button>
        )}
      </div>

      {loading ? (
        <Skeleton className="h-40 w-full" />
      ) : (
        <div className="space-y-4">
          {adding && (
            <CategoryFormRow onSave={handleSave} onCancel={() => setAdding(false)} />
          )}
          {categories.map((category) =>
            editingSlug === category.slug ? (
              <CategoryFormRow
                key={category.id}
                initial={category}
                onSave={handleSave}
                onCancel={() => setEditingSlug(null)}
              />
            ) : (
              <div
                key={category.id}
                className="flex items-center justify-between border border-charcoal-100 p-4 dark:border-charcoal-500"
              >
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 shrink-0 overflow-hidden bg-ivory-200 dark:bg-charcoal-600">
                    {category.image && <img src={category.image} alt="" className="h-full w-full object-cover" />}
                  </div>
                  <div>
                    <p className="font-medium text-charcoal-800 dark:text-ivory-100">{category.name}</p>
                    <p className="text-xs text-charcoal-400 dark:text-ivory-300">{category.description}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingSlug(category.slug)}
                    aria-label={t("common.edit")}
                    className="text-charcoal-400 hover:text-gold-600 dark:text-ivory-300"
                  >
                    <FaPen className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(category.slug)}
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
