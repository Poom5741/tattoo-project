import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { Locale } from "@/lib/i18n/types";
import { createT, localeCookieValue, isSupportedLocale } from "@/lib/i18n";

interface I18nContextValue {
  locale: Locale;
  t: ReturnType<typeof createT>;
  setLocale: (locale: Locale) => void;
}

const I18nContext = createContext<I18nContextValue | null>(null);

/** Read the initial locale from <html data-locale> (set by Astro SSR). */
function readInitialLocale(): Locale {
  if (typeof document === "undefined") return "en";
  const el = document.querySelector("html");
  const val = el?.getAttribute("data-locale");
  if (val && isSupportedLocale(val)) return val;
  return "en";
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(readInitialLocale);

  // Re-read after SSR hydration (Astro may swap the data-locale attribute)
  useEffect(() => {
    const el = document.querySelector("html");
    const val = el?.getAttribute("data-locale");
    if (val && isSupportedLocale(val)) setLocaleState(val);
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    document.cookie = localeCookieValue(next);
    // Reload so SSR re-renders with the new locale
    window.location.reload();
  }, []);

  const t = createT(locale);

  return (
    <I18nContext.Provider value={{ locale, t, setLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    return { locale: "en", t: createT("en"), setLocale: () => {} };
  }
  return ctx;
}
