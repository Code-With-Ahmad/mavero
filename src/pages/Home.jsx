import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaArrowRight, FaQuoteLeft } from "react-icons/fa6";
import useProducts from "../hooks/useProducts";
import useCategories from "../hooks/useCategories";
import useProductRatings from "../hooks/useProductRatings";
import ProductCard from "../components/product/ProductCard";
import ProductCardSkeleton from "../components/product/ProductCardSkeleton";
import NewsletterForm from "../components/common/NewsletterForm";
import EmptyState from "../components/common/EmptyState";

export default function Home() {
  const { t } = useTranslation();
  const { products, loading } = useProducts();
  const { categories, loading: categoriesLoading } = useCategories();
  const { ratings } = useProductRatings();

  const testimonials = t("home.testimonials", { returnObjects: true });

  const featured = products.filter((p) => p.featured).slice(0, 4);
  const newArrivals = [...products]
    .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
    .slice(0, 4);

  return (
    <div>
      <section className="bg-charcoal-800 text-ivory">
        <div className="container-boutique grid grid-cols-1 items-center gap-10 pb-20 pt-10 sm:pb-28 sm:pt-14 lg:grid-cols-2">
          <div>
            <p className="label-uppercase text-gold-400">{t("home.eyebrow")}</p>
            <h1 className="mt-4 text-5xl font-semibold leading-tight text-ivory sm:text-6xl">
              {t("home.heroTitle")}
            </h1>
            <p className="mt-6 max-w-md text-ivory-200">{t("home.heroBody")}</p>
            <Link
              to="/shop"
              className="btn-primary mt-8 !bg-gold-500 !text-charcoal-900 hover:!bg-gold-400"
            >
              {t("home.shopCollection")}
              <FaArrowRight className="rtl:rotate-180" aria-hidden="true" />
            </Link>
          </div>
          <div className="aspect-[4/5] w-full overflow-hidden bg-charcoal-600">
            {featured[0]?.images?.[0] && (
              <img
                src={featured[0].images[0]}
                alt={featured[0].name}
                className="h-full w-full object-cover"
              />
            )}
          </div>
        </div>
      </section>

      <section className="container-boutique py-16 sm:py-20">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="label-uppercase">{t("home.curated")}</p>
            <h2 className="mt-2 text-3xl font-semibold">{t("home.featuredPieces")}</h2>
          </div>
          <Link
            to="/shop?featured=true"
            className="hidden text-sm text-gold-700 hover:underline dark:text-gold-400 sm:block"
          >
            {t("common.viewAll")}
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : featured.length === 0 ? (
          <EmptyState
            title={t("home.noFeatured")}
            description={t("home.noFeaturedBody")}
            action={
              <Link to="/shop" className="btn-secondary">
                {t("home.browseShop")}
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} rating={ratings[product.id]} />
            ))}
          </div>
        )}
      </section>

      <section className="border-y border-charcoal-100 bg-ivory-50 py-16 dark:border-charcoal-500 dark:bg-charcoal-900 sm:py-20">
        <div className="container-boutique">
          <div className="mb-10 text-center">
            <p className="label-uppercase">{t("home.explore")}</p>
            <h2 className="mt-2 text-3xl font-semibold">{t("home.shopByCategory")}</h2>
          </div>

          {categoriesLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-square animate-pulse bg-charcoal-100 dark:bg-charcoal-600" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/shop?category=${category.slug}`}
                  className="group relative aspect-square overflow-hidden bg-charcoal-600"
                >
                  {category.image && (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="h-full w-full object-cover transition-transform duration-500 ease-refined group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-charcoal-900/40" />
                  <span className="absolute inset-x-0 bottom-4 text-center text-sm font-medium uppercase tracking-wider text-ivory">
                    {category.name}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="container-boutique py-16 sm:py-20">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="label-uppercase">{t("home.justIn")}</p>
            <h2 className="mt-2 text-3xl font-semibold">{t("home.newArrivals")}</h2>
          </div>
          <Link
            to="/shop"
            className="hidden text-sm text-gold-700 hover:underline dark:text-gold-400 sm:block"
          >
            {t("common.viewAll")}
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-4">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} rating={ratings[product.id]} />
            ))}
          </div>
        )}
      </section>

      <section className="bg-charcoal-800 py-16 text-ivory sm:py-20">
        <div className="container-boutique">
          <div className="mb-10 text-center">
            <p className="label-uppercase text-gold-400">{t("home.trusted")}</p>
            <h2 className="mt-2 text-3xl font-semibold text-ivory">{t("home.testimonialsTitle")}</h2>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {Array.isArray(testimonials) &&
              testimonials.map((testimonial) => (
                <div key={testimonial.name} className="border border-charcoal-500 p-6">
                  <FaQuoteLeft className="mb-4 h-5 w-5 text-gold-400 rtl:-scale-x-100" aria-hidden="true" />
                  <p className="text-sm leading-relaxed text-ivory-200">{testimonial.quote}</p>
                  <p className="mt-4 text-sm font-medium">{testimonial.name}</p>
                  <p className="text-xs text-ivory-300">{testimonial.location}</p>
                </div>
              ))}
          </div>
        </div>
      </section>

      <section className="container-boutique py-16 text-center sm:py-20">
        <p className="label-uppercase">{t("home.stayInTouch")}</p>
        <h2 className="mx-auto mt-2 max-w-lg text-3xl font-semibold">{t("home.newsletterTitle")}</h2>
        <div className="mx-auto mt-6 max-w-sm">
          <NewsletterForm />
        </div>
      </section>
    </div>
  );
}
