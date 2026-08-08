import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { LANGUAGES, getLanguageMeta } from "../lib/i18n";

const LanguageContext = createContext(null);
const STORAGE_KEY = "mavero-language";

export function LanguageProvider({ children }) {
  const { i18n } = useTranslation();
  const [language, setLanguageState] = useState(i18n.language || "en");

  useEffect(() => {
    const meta = getLanguageMeta(language);
    document.documentElement.lang = language;
    document.documentElement.dir = meta.dir;
  }, [language]);

  const setLanguage = useCallback(
    (code) => {
      i18n.changeLanguage(code);
      localStorage.setItem(STORAGE_KEY, code);
      setLanguageState(code);
    },
    [i18n]
  );

  const value = { language, setLanguage, languages: LANGUAGES, meta: getLanguageMeta(language) };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within a LanguageProvider");
  return context;
}
