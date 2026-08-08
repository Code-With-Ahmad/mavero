import { useEffect, useRef, useState } from "react";
import { FaGlobe } from "react-icons/fa6";
import { useLanguage } from "../../context/LanguageContext";

export default function LanguageSwitcher({ dark = false }) {
  const { language, setLanguage, languages } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Language"
        aria-expanded={open}
        className={`flex items-center ${
          dark
            ? "text-ivory-200 hover:text-gold-400"
            : "text-charcoal-600 hover:text-gold-600 dark:text-ivory-200 dark:hover:text-gold-400"
        }`}
      >
        <FaGlobe className="h-[18px] w-[18px]" />
      </button>

      {open && (
        <div className="absolute end-0 z-40 mt-3 w-40 border border-charcoal-100 bg-ivory py-2 shadow-lift dark:border-charcoal-500 dark:bg-charcoal-700">
          {languages.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => {
                setLanguage(lang.code);
                setOpen(false);
              }}
              className={`block w-full px-4 py-2 text-start text-sm hover:bg-ivory-200 dark:hover:bg-charcoal-600 ${
                language === lang.code
                  ? "text-gold-700 dark:text-gold-400"
                  : "text-charcoal-700 dark:text-ivory-100"
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
