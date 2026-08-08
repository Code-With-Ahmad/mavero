import { useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { FaXmark, FaChevronLeft, FaChevronRight, FaMagnifyingGlassPlus } from "react-icons/fa6";

export default function ImageGallery({ images, productName }) {
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const safeImages = images && images.length > 0 ? images : [];

  const goPrev = () =>
    setActiveIndex((i) => (i === 0 ? safeImages.length - 1 : i - 1));
  const goNext = () =>
    setActiveIndex((i) => (i === safeImages.length - 1 ? 0 : i + 1));

  return (
    <div>
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-ivory-200 dark:bg-charcoal-600">
        {safeImages[activeIndex] && (
          <img
            src={safeImages[activeIndex]}
            alt={`${productName} — view ${activeIndex + 1}`}
            className="h-full w-full object-cover"
          />
        )}
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          aria-label={t("product.zoomImage")}
          className="absolute bottom-3 end-3 flex h-9 w-9 items-center justify-center bg-ivory/90 text-charcoal-700 dark:bg-charcoal-800/90 dark:text-ivory-100"
        >
          <FaMagnifyingGlassPlus />
        </button>
      </div>

      {safeImages.length > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-3">
          {safeImages.map((image, index) => (
            <button
              key={image + index}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={t("product.viewImage", { n: index + 1 })}
              aria-current={index === activeIndex}
              className={`aspect-square overflow-hidden border-2 transition-colors duration-200 ${
                index === activeIndex
                  ? "border-gold-500"
                  : "border-transparent hover:border-charcoal-200 dark:hover:border-charcoal-400"
              }`}
            >
              <img src={image} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {lightboxOpen &&
        createPortal(
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-charcoal-900/90 p-4">
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              aria-label={t("product.closeZoomedImage")}
              className="absolute end-4 top-4 text-ivory hover:text-gold-400"
            >
              <FaXmark className="h-7 w-7" />
            </button>

            {safeImages.length > 1 && (
              <button
                type="button"
                onClick={goPrev}
                aria-label={t("product.previousImage")}
                className="absolute start-4 text-ivory hover:text-gold-400 rtl:rotate-180"
              >
                <FaChevronLeft className="h-8 w-8" />
              </button>
            )}

            <img
              src={safeImages[activeIndex]}
              alt={`${productName} — zoomed view ${activeIndex + 1}`}
              className="max-h-[85vh] max-w-[85vw] object-contain"
            />

            {safeImages.length > 1 && (
              <button
                type="button"
                onClick={goNext}
                aria-label={t("product.nextImage")}
                className="absolute end-4 text-ivory hover:text-gold-400 rtl:rotate-180"
              >
                <FaChevronRight className="h-8 w-8" />
              </button>
            )}
          </div>,
          document.body
        )}
    </div>
  );
}
