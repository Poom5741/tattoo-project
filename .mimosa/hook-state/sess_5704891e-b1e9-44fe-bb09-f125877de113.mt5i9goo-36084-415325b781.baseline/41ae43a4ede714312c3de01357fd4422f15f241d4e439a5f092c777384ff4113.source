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
  bookingForm: {
    bookingType: string;
    bookPlate: string;
    choosePlate: string;
    customConsult: string;
    describeIdea: string;
    artist: string;
    design: string;
    noDesignSelected: string;
    noPlates: string;
    stylePref: string;
    selectStyle: string;
    approxSize: string;
    selectSize: string;
    placement: string;
    budgetRange: string;
    selectBudget: string;
    fullName: string;
    contact: string;
    contactPlaceholder: string;
    customDesc: string;
    customPlaceholder: string;
    message: string;
    messagePlaceholder: string;
    requiredFields: string;
    requiredPlacement: string;
    sending: string;
    requestConsult: string;
    sendRequest: string;
    replyNotice: string;
    requestSent: string;
    
    // sizes
    sizeSmall: string;
    sizeMedium: string;
    sizeLarge: string;
    sizeExtraLarge: string;
    
    // budgets
    budgetUnder5k: string;
    budget5kTo10k: string;
    budget10kTo20k: string;
    budget20kTo40k: string;
    budget40kPlus: string;
    budgetFlexible: string;
    
    // styles
    styleBlackwork: string;
    styleFineLine: string;
    styleGeometric: string;
    styleIrezumi: string;
    styleNeoTraditional: string;
    styleRealism: string;
    styleLettering: string;
    styleWatercolor: string;
    styleMinimalist: string;
    styleTraditional: string;
    styleNotSure: string;
  };
  wallet: {
    connectTitle: string;
    connectDesc: string;
    loadingCollection: string;
    nothingHeld: string;
    nothingHeldDesc: string;
    enterGallery: string;
    plates: string;
    value: string;
    viewPlate: string;
    inCollection: string;
  };
  chat: {
    inbox: string;
    loadingConversations: string;
    noActiveConversations: string;
    selectConversation: string;
    chat: string;
    sendBooking: string;
    noMessages: string;
    client: string;
    admin: string;
    artist: string;
    booking: string;
    typeMessage: string;
  };
}
