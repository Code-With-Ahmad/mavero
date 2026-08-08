import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaChevronDown } from "react-icons/fa6";
import StaticPageHeader from "../../components/common/StaticPageHeader";

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-charcoal-100 py-4 dark:border-charcoal-500">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 text-start"
      >
        <span className="text-sm font-medium text-charcoal-800 dark:text-ivory-100">{q}</span>
        <FaChevronDown
          className={`h-3.5 w-3.5 shrink-0 text-charcoal-400 transition-transform duration-200 dark:text-ivory-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <p className="mt-3 text-sm leading-relaxed text-charcoal-500 dark:text-ivory-200">{a}</p>
      )}
    </div>
  );
}

export default function Faq() {
  const { t } = useTranslation();
  const sections = t("pages.faq.sections", { returnObjects: true });

  return (
    <div>
      <StaticPageHeader title={t("legal.faq")} description={t("legal.stillHaveQuestion")} />
      <div className="container-boutique max-w-3xl py-16">
        {Array.isArray(sections) &&
          sections.map((section) => (
            <div key={section.heading} className="mb-10">
              <h2 className="mb-2 font-serif text-xl font-semibold">{section.heading}</h2>
              {section.items.map((item) => (
                <FaqItem key={item.q} {...item} />
              ))}
            </div>
          ))}
        <p className="text-sm text-charcoal-400 dark:text-ivory-300">
          {t("legal.stillHaveQuestion")}{" "}
          <Link to="/contact" className="text-gold-700 underline hover:no-underline dark:text-gold-400">
            {t("legal.getInTouch")}
          </Link>
        </p>
      </div>
    </div>
  );
}
