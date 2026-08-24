/**
 * I18n utility — type-safe translations.
 *
 * Usage:
 *   const t = createT("th");
 *   t("nav.gallery") // => "แกลเลอรี"
 *   t("hero.titleHtml") // => "รอยสักที่คุณ<br />สามารถ <em>เป็นเจ้าของ</em>"
 */

import type { Locale, TranslationKeys } from "./types";
import en from "../../locales/en.json";
export type { Locale, TranslationKeys } from "./types";
export { SUPPORTED_LOCALES, DEFAULT_LOCALE, LOCALE_NAMES } from "./types";
import th from "../../locales/th.json";

const STORE: Record<Locale, TranslationKeys> = { en, th };

/**
 * Resolve a dot-separated path into a nested object value.
 * Falls back to English if the key is missing in the target locale.
 */
function resolve(obj: unknown, path: string): string {
  const parts = path.split(".");
  let current: unknown = obj;
  for (const part of parts) {
    if (current == null || typeof current !== "object") return "";
    current = (current as Record<string, unknown>)[part];
  }
  return typeof current === "string" ? current : "";
}

/** Type guard for supported locales. */
export function isSupportedLocale(s: string): s is Locale {
  return s === "en" || s === "th";
}

/**
 * Create a translation function for the given locale.
 * Falls back silently to English for any missing key.
 */
export function createT(locale: Locale): (path: string) => string {
  const data = STORE[locale] ?? STORE.en;
  const fallback = STORE.en;

  return (path: string): string => {
    const result = resolve(data, path);
    if (result) return result;
    return resolve(fallback, path);
  };
}

/** Parses the user's preferred locale from cookie or Accept-Language header. */
export function detectLocale(
  cookieHeader: string,
  acceptLanguage: string
): Locale {
  // 1. Cookie takes priority
  const match = cookieHeader.match(/locale=([a-z]{2})/);
  if (match && isSupportedLocale(match[1])) return match[1];

  // 2. Accept-Language header
  if (acceptLanguage) {
    const preferred = acceptLanguage.split(",")[0]?.split("-")[0]?.trim().toLowerCase();
    if (preferred && isSupportedLocale(preferred)) return preferred;
  }

  // 3. Default
  return "en";
}

/** Cookie value for persisting locale preference. */
export function localeCookieValue(locale: Locale): string {
  return `locale=${locale}; Path=/; Max-Age=${365 * 24 * 60 * 60}; SameSite=Lax`;
}

/** Inverse mapping — locale name to cookie value. */
export function localeFromCookie(cookieHeader: string): Locale {
  const match = cookieHeader.match(/locale=([a-z]{2})/);
  if (match && isSupportedLocale(match[1])) return match[1];
  return "en";
}
