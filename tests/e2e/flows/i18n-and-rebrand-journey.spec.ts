/**
 * i18n + SAKNID rename — full-journey user flow.
 *
 * Drives the multi-page journey: home (EN) -> switch to TH ->
 * market -> design -> booking -> switch back to EN. Asserts that
 * the i18n system propagates the locale to the home, market,
 * design, and booking pages, and that the SAKNID brand renders on
 * the footer regardless of locale.
 *
 * **Nav localization (fixed in #80):** `src/components/Nav.tsx`
 * previously hardcoded the nav labels in English. They now use
 * `t("nav.*")`, so after a TH switch the nav renders Thai. The spec
 * asserts the Thai labels are present (and the English are gone).
 *
 * Covers closed issues:
 *   #24 (Rename SUKNID to SAKNID across codebase) - the footer
 *        brand is asserted.
 *   #26 (Implement i18n with Thai/English language switcher) - the
 *        switcher and the propagation.
 *   #37 (i18n Foundation - language switcher, home page TH/EN, cookie
 *        persistence) - the cookie persistence is part of the flow.
 *   #38 (i18n Full Site - all pages translated, hreflang SEO tags) -
 *        partially covered; the SEO tags are tested elsewhere.
 *
 * Prerequisite: `pnpm db:seed:dev` must have run (so d1 is available
 * and the plate card renders).
 *
 * Env: real Playwright UI spec. On this dev box the chromium binary
 * cannot find its system libraries (see #67). Runs on a working
 * env or in CI (#70).
 */

import { test, expect, type Page } from "@playwright/test";
import { readFileSync, existsSync } from "node:fs";

// Thai strings pinned at spec-write time. Read from src/locales/th.json
// at the time the spec was written. If the source changes, update
// these literals.
const TH_HERO_TITLE = "รอยสักที่คุณเป็นเจ้าของ";
const TH_HERO_KICKER = "หนึ่งเพลท · เจ้าของเดียว · เข็มเดียว";
const TH_MARKET_KICKER = "แกลเลอรี";
const TH_MARKET_TITLE = "เพลทสำหรับสะสม";
const TH_BOOKING_TITLE = "ขอจองคิว";
const TH_BOOKING_KICKER = "จองคิวสัก";
const TH_BOOKING_BACK = "← ศิลปินทั้งหมด";
const TH_DESIGN_BACK = "← กลับไปแกลเลอรี";
const TH_DESIGN_CERTIFICATE = "ใบรับรองเพลท";
const TH_DESIGN_AVAILABLE = "พร้อมขาย";
// Nav labels (src/locales/th.json#nav.*) — pinned at spec-write time.
const TH_NAV_GALLERY = "แกลเลอรี";
const EN_HERO_TITLE = "Ink you can own.";

/** Switch the locale by clicking the appropriate switcher button. */
async function switchLocale(page: Page, target: "th" | "en"): Promise<void> {
  if (target === "th") {
    const thButton = page.locator('button[aria-label="เปลี่ยนเป็นภาษาไทย"]').first();
    await expect(thButton).toBeVisible();
    await thButton.click();
  } else {
    const enButton = page.locator('button[aria-label="Switch to English"]').first();
    await expect(enButton).toBeVisible();
    await enButton.click();
  }
  // The switcher does `window.location.reload()` after setting the
  // cookie. Wait for the reload to land.
  await page.waitForLoadState("domcontentloaded");
  await expect(page.locator("html")).toHaveAttribute(
    "lang",
    target === "th" ? "th" : "en",
  );
}

test.describe("i18n + SAKNID rename - full-journey user flow", () => {
  test("home EN -> switch TH -> market -> design -> booking -> switch back EN", async ({ page }) => {
    // 1. Land on / in EN.
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator("body")).toContainText(EN_HERO_TITLE);
    // Footer brand is SAKNID regardless of locale (#24).
    await expect(page.locator("footer")).toContainText("SAKNID");

    // 2. Switch to Thai.
    await switchLocale(page, "th");
    // Hero title is now Thai.
    await expect(page.locator("body")).toContainText(TH_HERO_TITLE);
    await expect(page.locator("body")).toContainText(TH_HERO_KICKER);
    // The footer brand is still SAKNID.
    await expect(page.locator("footer")).toContainText("SAKNID");

    // 3. **Nav is localized (fixed in #80):** the nav links now use
    //    t("nav.*"), so after the TH switch the desktop nav shows the
    //    Thai labels. Assert the Thai gallery label is present and
    //    the English "Gallery" is gone.
    const desktopNav = page.locator("header nav").first();
    const navText = await desktopNav.innerText();
    expect(navText).toContain(TH_NAV_GALLERY); // Thai nav label
    expect(navText).not.toContain("Gallery"); // English no longer hardcoded

    // 4. Click the localized "Gallery" / "แกลเลอรี" nav link (not the
    //    hero CTA) and land on /market.
    const marketLink = page.locator("header nav a", { hasText: TH_NAV_GALLERY }).first();
    await marketLink.click();
    await page.waitForURL("**/market");
    await expect(page.locator("html")).toHaveAttribute("lang", "th");
    // Thai page content.
    await expect(page.locator("body")).toContainText(TH_MARKET_KICKER);
    await expect(page.locator("body")).toContainText(TH_MARKET_TITLE);

    // 5. Click the d1 plate card -> /design/d1.
    const d1Card = page.locator('[data-testid="plate-card"]', {
      hasText: /Serpent in Negative/,
    });
    await expect(d1Card).toBeVisible({ timeout: 10_000 });
    await d1Card.click();
    await page.waitForURL("**/design/d1");
    await expect(page.locator("html")).toHaveAttribute("lang", "th");
    // The design page has Thai strings for the back link, the
    // certificate label, and the available badge.
    await expect(page.locator("body")).toContainText(TH_DESIGN_BACK);
    await expect(page.locator("body")).toContainText(TH_DESIGN_CERTIFICATE);
    await expect(page.locator("body")).toContainText(TH_DESIGN_AVAILABLE);

    // 6. Click the "Acquire Plate" / "Request appointment" CTA.
    //    Both the text and the href should be in place; the TH
    //    version uses t("artistDetail.bookArtist") which contains
    //    the artist name.
    const cta = page.locator('a[href*="/booking"]').first();
    await expect(cta).toBeVisible();
    await cta.click();
    await page.waitForURL(/\/booking/);
    await expect(page.locator("html")).toHaveAttribute("lang", "th");
    // The booking page's title, kicker, and back link should be in
    // Thai.
    await expect(page.locator("body")).toContainText(TH_BOOKING_TITLE);
    await expect(page.locator("body")).toContainText(TH_BOOKING_KICKER);
    await expect(page.locator("body")).toContainText(TH_BOOKING_BACK);

    // 7. Switch back to English.
    await switchLocale(page, "en");
    // The booking page now shows English content.
    await expect(page.locator("body")).not.toContainText(TH_BOOKING_TITLE);
    // Hero title is back in English. The hero isn't on /booking but
    // we navigate back to / and assert.
    await page.goto("/");
    await expect(page.locator("body")).toContainText(EN_HERO_TITLE);
  });

  test("CONTEXT.md references SAKNID, not SUKNID (file-system check)", () => {
    // The SAKNID rename (#24) touched every file in the repo. The
    // most public artifact is CONTEXT.md, which sets the brand
    // vocabulary. This is a one-time static check; the spec
    // doesn't drive the browser for it.
    const contextPath = "CONTEXT.md";
    if (!existsSync(contextPath)) {
      test.skip(true, "CONTEXT.md not found; this is a sanity check");
    }
    const content = readFileSync(contextPath, "utf8");
    expect(content).toContain("SAKNID");
    expect(content).not.toMatch(/\bSUKNID\b/);
  });
});
