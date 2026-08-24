/**
 * I18n utility — unit tests (TDD red phase).
 *
 * Tests locale detection, translation resolution, and cookie helpers.
 *
 * Prerequisites: vitest (pnpm test). No network required.
 */

import { describe, it, expect } from "vitest";
import {
  createT,
  isSupportedLocale,
  detectLocale,
  localeCookieValue,
  localeFromCookie,
} from "@/lib/i18n";

describe("isSupportedLocale", () => {
  it("returns true for 'en'", () => {
    expect(isSupportedLocale("en")).toBe(true);
  });

  it("returns true for 'th'", () => {
    expect(isSupportedLocale("th")).toBe(true);
  });

  it("returns false for unsupported locale", () => {
    expect(isSupportedLocale("jp")).toBe(false);
    expect(isSupportedLocale("fr")).toBe(false);
  });
});

describe("createT", () => {
  it("returns English text for 'en' locale", () => {
    const t = createT("en");
    expect(t("nav.gallery")).toBe("Gallery");
    expect(t("hero.kicker")).toBe("One plate · One owner · One needle");
  });

  it("returns Thai text for 'th' locale", () => {
    const t = createT("th");
    expect(t("nav.gallery")).toBe("แกลเลอรี");
    expect(t("hero.kicker")).toBe("หนึ่งเพลท · เจ้าของเดียว · เข็มเดียว");
  });

  it("returns empty string for unknown key", () => {
    const t = createT("en");
    expect(t("nonexistent.key")).toBe("");
  });

  it("resolves nested keys like 'howItWorks.step1.title'", () => {
    const t = createT("en");
    expect(t("howItWorks.step1.title")).toBe("Claim the plate");
  });
});

describe("detectLocale", () => {
  it("prefers cookie over Accept-Language", () => {
    expect(detectLocale("locale=th", "en-US,en;q=0.9")).toBe("th");
  });

  it("falls back to Accept-Language when no cookie", () => {
    expect(detectLocale("", "th-TH,th;q=0.9,en;q=0.5")).toBe("th");
  });

  it("returns 'en' as default when nothing matches", () => {
    expect(detectLocale("", "")).toBe("en");
  });

  it("returns 'en' for unsupported locale in cookie", () => {
    expect(detectLocale("locale=jp", "en")).toBe("en");
  });
});

describe("localeCookieValue", () => {
  it("produces a cookie string for 'th'", () => {
    const cookie = localeCookieValue("th");
    expect(cookie).toContain("locale=th");
    expect(cookie).toContain("Path=/");
    expect(cookie).toContain("Max-Age=");
    expect(cookie).toContain("SameSite=Lax");
  });
});

describe("localeFromCookie", () => {
  it("parses locale from cookie header", () => {
    expect(localeFromCookie("locale=th; admin_token=xyz")).toBe("th");
  });

  it("returns 'en' when no cookie", () => {
    expect(localeFromCookie("")).toBe("en");
  });
});
