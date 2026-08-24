import { useState, useEffect } from "react";
import type { Locale } from "@/lib/i18n/types";
import { localeCookieValue, isSupportedLocale, LOCALE_NAMES } from "@/lib/i18n";

export default function LanguageSwitcher() {
  const [locale, setLocale] = useState<Locale>("en");

  useEffect(() => {
    const el = document.querySelector("html");
    const val = el?.getAttribute("data-locale");
    if (val && isSupportedLocale(val)) setLocale(val);
  }, []);

  function switchTo(next: Locale) {
    setLocale(next);
    document.cookie = localeCookieValue(next);
    window.location.reload();
  }

  return (
    <div className="flex items-center gap-1 border border-outline-variant/40 rounded-full overflow-hidden">
      {(["en", "th"] as Locale[]).map((lang) => (
        <button
          key={lang}
          type="button"
          onClick={() => switchTo(lang)}
          className={`px-3 py-1 text-xs font-semibold font-body uppercase transition-colors duration-150 ${
            locale === lang
              ? "bg-primary-container text-on-primary-container"
              : "text-on-surface-variant hover:text-on-surface"
          }`}
          aria-label={lang === "en" ? "Switch to English" : "เปลี่ยนเป็นภาษาไทย"}
        >
          {LOCALE_NAMES[lang]}
        </button>
      ))}
    </div>
  );
}
