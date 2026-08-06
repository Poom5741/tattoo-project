/**
 * i18n — language switcher and hreflang SEO tags.
 *
 * Covers closed issues:
 *   #26 (Implement i18n with Thai/English language switcher) - the switcher.
 *   #37 (i18n Foundation - language switcher, home page TH/EN, cookie persistence) - the cookie.
 *   #38 (i18n Full Site - all pages translated, hreflang SEO tags) - the hreflang tags.
 *
 * Source: src/components/LanguageSwitcher.tsx, src/lib/i18n/index.ts,
 * src/layouts/Base.astro, src/locales/{en,th}.json.
 *
 * The switcher sets document.cookie and reloads. The middleware reads
 * the cookie on the next request and sets context.locals.locale. The
 * <html> tag carries lang and data-locale, and the layout renders
 * three hreflang link tags.
 *
 * The expected Thai / English strings are read from src/locales at
 * spec-write time and pinned as literals below. If the source changes,
 * update the literal. This avoids importing from src/ which the rest
 * of the e2e suite does not do.
 */

// Pinned from src/locales/en.json hero.title (read at spec-write time).
const EN_HERO_TITLE = "Ink you can";
// Pinned from src/locales/th.json hero.title (read at spec-write time).
const TH_HERO_TITLE = "รอยสักที่คุณ";

import { test, expect } from "@playwright/test";

test.describe("Language switcher", () => {
  test("the English switcher button has the expected aria-label", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(
      page.locator('button[aria-label="Switch to English"]').first()
    ).toBeVisible();
  });

  test("the Thai switcher button has the expected aria-label", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(
      page.locator('button[aria-label="เปลี่ยนเป็นภาษาไทย"]').first()
    ).toBeVisible();
  });

  test("default locale is English and the <html> tag carries lang=en", async ({
    page,
  }) => {
    await page.goto("/");
    const lang = await page.locator("html").getAttribute("lang");
    const dataLocale = await page.locator("html").getAttribute("data-locale");
    expect(lang).toBe("en");
    expect(dataLocale).toBe("en");
  });

  test("clicking the Thai switcher reloads with <html lang=th>", async ({
    page,
    context,
  }) => {
    await page.goto("/");
    await page.locator('button[aria-label="เปลี่ยนเป็นภาษาไทย"]').first().click();
    await page.waitForTimeout(500);
    await page.waitForLoadState("domcontentloaded");
    const lang = await page.locator("html").getAttribute("lang");
    const dataLocale = await page.locator("html").getAttribute("data-locale");
    expect(lang).toBe("th");
    expect(dataLocale).toBe("th");
    // The cookie should be set on the context. The LanguageSwitcher
    // uses document.cookie = localeCookieValue("th") which produces
    // "locale=th; Path=/; Max-Age=...; SameSite=Lax". Playwright's
    // context cookies reflect document.cookie.
    const cookies = await context.cookies();
    const localeCookie = cookies.find((c) => c.name === "locale");
    expect(localeCookie?.value).toBe("th");
  });

  test("clicking back to English reloads with <html lang=en>", async ({
    page,
  }) => {
    await page.goto("/");
    await page.locator('button[aria-label="เปลี่ยนเป็นภาษาไทย"]').first().click();
    await page.waitForTimeout(500);
    await page.waitForLoadState("domcontentloaded");
    await page.locator('button[aria-label="Switch to English"]').first().click();
    await page.waitForTimeout(500);
    await page.waitForLoadState("domcontentloaded");
    const lang = await page.locator("html").getAttribute("lang");
    expect(lang).toBe("en");
  });

  test("the home page Thai hero title matches src/locales/th.json", async ({
    page,
  }) => {
    await page.goto("/");
    await page.locator('button[aria-label="เปลี่ยนเป็นภาษาไทย"]').first().click();
    await page.waitForTimeout(500);
    await page.waitForLoadState("domcontentloaded");
    await page.waitForLoadState("domcontentloaded");
    // The hero renders a <h1> with the title (or titleHtml) text.
    // The page passes the title into the hero component via the t()
    // function. We assert the pinned literal is present in the body.
    await expect(page.locator("body")).toContainText(TH_HERO_TITLE);
  });

  test("the home page English hero title matches src/locales/en.json", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.locator("body")).toContainText(EN_HERO_TITLE);
  });
});

test.describe("hreflang SEO tags", () => {
  test("the home page has hreflang=en, hreflang=th, and hreflang=x-default", async ({
    page,
  }) => {
    await page.goto("/");
    const enLink = page.locator('link[rel="alternate"][hreflang="en"]');
    const thLink = page.locator('link[rel="alternate"][hreflang="th"]');
    const xdLink = page.locator('link[rel="alternate"][hreflang="x-default"]');
    await expect(enLink).toHaveCount(1);
    await expect(thLink).toHaveCount(1);
    await expect(xdLink).toHaveCount(1);
  });

  test("the hreflang URLs point to the same pathname on the current origin", async ({
    page,
  }) => {
    await page.goto("/");
    const enHref = await page
      .locator('link[rel="alternate"][hreflang="en"]')
      .getAttribute("href");
    const thHref = await page
      .locator('link[rel="alternate"][hreflang="th"]')
      .getAttribute("href");
    const xdHref = await page
      .locator('link[rel="alternate"][hreflang="x-default"]')
      .getAttribute("href");
    // The Base layout renders each href as
    // Astro.url.origin + Astro.url.pathname. Today the three are
    // identical. When the project ships per-locale URLs (e.g. /en/...
    // and /th/...) this test must be updated.
    expect(enHref).toBe(thHref);
    expect(thHref).toBe(xdHref);
  });
});
