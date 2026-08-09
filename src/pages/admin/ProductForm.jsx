import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { FaPlus, FaTrash } from "react-icons/fa6";
import toast from "react-hot-toast";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import useAdminProducts from "../../hooks/useAdminProducts";
import useCategories from "../../hooks/useCategories";
import ImageUploader from "../../components/admin/ImageUploader";
import FormField from "../../components/common/FormField";
import Skeleton from "../../components/common/Skeleton";
import Checkbox from "../../components/common/Checkbox";
import generateProductId from "../../utils/generateProductId";

const emptyVariant = { size: "", color: "", stock: 0 };

export default function ProductForm() {
  const { t } = useTranslation();
  const { sku } = useParams();
  const isEditing = !!sku;
  const navigate = useNavigate();
  const { saveProduct } = useAdminProducts();
  const { categories } = useCategories();

  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [images, setImages] = useState([]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      description: "",
      price: "",
      salePrice: "",
      category: "",
      tags: "",
      stock: 0,
      featured: false,
      status: "active",
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "variants" });
  const hasVariants = fields.length > 0;

  useEffect(() => {
    if (!isEditing) return;
    (async () => {
      const snap = await getDoc(doc(db, "products", sku));
      if (snap.exists()) {
        const data = snap.data();
        reset({
          name: data.name,
          description: data.description,
          price: data.price,
          salePrice: data.salePrice || "",
          category: data.category,
          tags: (data.tags || []).join(", "),
          stock: data.stock || 0,
          featured: !!data.featured,
          status: data.status || "active",
          variants: data.variants || [],
        });
        setImages(data.images || []);
      }
      setLoading(false);
    })();
  }, [isEditing, sku, reset]);

  const onSubmit = async (data) => {
    if (images.length === 0) {
      toast.error(t("admin.productForm.imageRequired"));
      return;
    }

    setSubmitting(true);
    try {
      const productId = isEditing ? sku : generateProductId();
      const variants = (data.variants || []).map((v) => ({
        size: v.size || null,
        color: v.color || null,
        stock: Number(v.stock) || 0,
        sku: `${productId}-${v.color || "one"}-${v.size || "os"}`
          .toUpperCase()
          .replace(/[\s/]+/g, ""),
      }));
      const computedStock = variants.length
        ? variants.reduce((sum, v) => sum + v.stock, 0)
        : Number(data.stock) || 0;

      const payload = {
        sku: productId,
        name: data.name.trim(),
        description: data.description.trim(),
        price: Number(data.price),
        salePrice: data.salePrice ? Number(data.salePrice) : null,
        category: data.category,
        tags: data.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
        images,
        variants,
        stock: computedStock,
        featured: !!data.featured,
        status: data.status,
      };

      await saveProduct(productId, payload);
      toast.success(isEditing ? t("admin.productForm.updated") : t("admin.productForm.created"));
      navigate("/admin/products");
    } catch (error) {
      toast.error(t("admin.productForm.couldNotSave"));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <Link to="/admin/products" className="text-xs text-charcoal-400 hover:text-gold-600 dark:text-ivory-300">
        <span className="rtl:hidden">&larr; </span>
        {t("admin.productForm.backToProducts")}
        <span className="hidden rtl:inline"> &rarr;</span>
      </Link>
      <h1 className="mt-3 mb-8 text-3xl font-semibold">
        {isEditing ? t("admin.productForm.editTitle") : t("admin.productForm.newTitle")}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <p className="label-uppercase mb-2">{t("admin.productForm.images")}</p>
          <ImageUploader images={images} onChange={setImages} />
        </div>

        {isEditing && (
          <div>
            <p className="label-uppercase mb-2">{t("admin.productForm.productId")}</p>
            <p className="text-sm text-charcoal-500 dark:text-ivory-200">{sku}</p>
          </div>
        )}

        <FormField
          id="name"
          label={t("admin.productForm.name")}
          required
          error={errors.name?.message}
          {...register("name", { required: true })}
        />

        <FormField
          id="description"
          label={t("admin.productForm.description")}
          as="textarea"
          rows={4}
          required
          {...register("description", { required: true })}
        />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <FormField id="price" label={t("admin.productForm.price")} type="number" step="0.01" required {...register("price", { required: true, min: 0 })} />
          <FormField id="salePrice" label={t("admin.productForm.salePrice")} type="number" step="0.01" {...register("salePrice")} />
          <FormField
            id="category"
            label={t("admin.productForm.category")}
            as="select"
            required
            {...register("category", { required: true })}
          >
            <option value="">{t("admin.productForm.selectEllipsis")}</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </FormField>
        </div>

        <FormField id="tags" label={t("admin.productForm.tags")} {...register("tags")} />

        {!hasVariants && (
          <FormField id="stock" label={t("admin.productForm.stockQuantity")} type="number" required {...register("stock", { required: true, min: 0 })} />
        )}

        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="label-uppercase">{t("admin.productForm.variants")}</p>
            <button
              type="button"
              onClick={() => append(emptyVariant)}
              className="text-xs font-medium uppercase tracking-wider text-gold-700 hover:underline dark:text-gold-400"
            >
              <FaPlus className="me-1 inline h-3 w-3" /> {t("admin.productForm.addVariant")}
            </button>
          </div>
          {fields.length === 0 && (
            <p className="text-xs text-charcoal-400 dark:text-ivory-300">
              {t("admin.productForm.noVariants")}
            </p>
          )}
          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-[1fr_1fr_1fr_auto] items-end gap-3">
                <FormField id={`variants.${index}.size`} label={t("admin.productForm.size")} {...register(`variants.${index}.size`)} />
                <FormField id={`variants.${index}.color`} label={t("admin.productForm.color")} {...register(`variants.${index}.color`)} />
                <FormField
                  id={`variants.${index}.stock`}
                  label={t("admin.productForm.stock")}
                  type="number"
                  required
                  {...register(`variants.${index}.stock`, { required: true, min: 0 })}
                />
                <button
                  type="button"
                  onClick={() => remove(index)}
                  aria-label={t("common.remove")}
                  className="mb-1 text-charcoal-400 hover:text-burgundy-500 dark:text-ivory-300"
                >
                  <FaTrash className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField id="status" label={t("admin.productForm.status")} as="select" {...register("status")}>
            <option value="active">{t("admin.productForm.statusActive")}</option>
            <option value="draft">{t("admin.productForm.statusDraft")}</option>
            <option value="out_of_stock">{t("admin.productForm.statusOutOfStock")}</option>
          </FormField>
          <div className="flex items-center pt-8">
            <Checkbox label={t("admin.productForm.featuredProduct")} {...register("featured")} />
          </div>
        </div>

        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? t("common.saving") : isEditing ? t("admin.productForm.saveChanges") : t("admin.productForm.createProduct")}
        </button>
      </form>
    </div>
  );
}
