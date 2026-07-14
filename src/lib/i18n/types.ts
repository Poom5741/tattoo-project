/**
 * I18n type definitions.
 *
 * Translation key type derived manually from locale structure.
 * Every key in en.json must have a matching key in th.json.
 */
export type Locale = "en" | "th";

export const SUPPORTED_LOCALES: Locale[] = ["en", "th"];
export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_NAMES: Record<Locale, string> = {
  en: "EN",
  th: "TH",
};

/**
 * Translation key paths.
 *
 * Created as a recursive mapped type so nested keys like "nav.gallery"
 * or "howItWorks.step1.title" are valid.
 */
export interface TranslationKeys {
  nav: {
    gallery: string;
    artists: string;
    book: string;
    myWallet: string;
    artistPortal: string;
    howItWorks: string;
  };
  hero: {
    kicker: string;
    title: string;
    titleHtml: string;
    description: string;
    exploreDrop: string;
    viewArtists: string;
    platesReleased: string;
    residentArtists: string;
    oneOfOne: string;
  };
  featured: {
    availableNow: string;
    latestPlates: string;
    allPlates: string;
    ofOne: string;
    featuredDrop: string;
  };
  howItWorks: {
    housePrinciple: string;
    title: string;
    subtitle: string;
    step1: { title: string; description: string };
    step2: { title: string; description: string };
    step3: { title: string; description: string };
  };
  artists: {
    roster: string;
    residentArtists: string;
    meetThemAll: string;
  };
  cta: {
    title: string;
    description: string;
    browseGallery: string;
  };
  common: {
    by: string;
    loading: string;
    error: string;
  };
}
