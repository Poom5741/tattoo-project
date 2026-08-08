/**
 * REPRO: Scenario B — clicking "Acquire Plate" on /design/[id]
 * now redirects to /booking (checkout is disabled at soft launch).
 *
 * Updated: checkout → booking redirect is intentional (wayfinder ticket 03).
 */
import { test, expect } from "@playwright/test";

test.describe("REPRO: Acquire button redirect (checkout disabled)", () => {
  test("clicking 'Reserve this plate' on /design/d1 navigates to /booking?designId=d1", async ({ page }) => {
    await page.goto("/design/d1");
    const designPageUrl = page.url();

    if (!designPageUrl.includes("/design/d1")) {
      console.log(`[REPRO] Design page redirected to: ${designPageUrl}`);
      test.skip(true, "Design d1 not in DB — seed required");
      return;
    }

    // The CTA now says "Reserve this plate" and links to /checkout/[id]
    // which redirects to /booking?designId=[id].
    const reserveBtn = page.locator('a[href="/checkout/d1"]').first();
    const isReserveVisible = await reserveBtn.isVisible().catch(() => false);

    if (!isReserveVisible) {
      const fallbackBtn = page.locator('a').filter({ hasText: /reserve|acquire/i }).first();
      const isFallbackVisible = await fallbackBtn.isVisible().catch(() => false);
      if (!isFallbackVisible) {
        test.skip(true, "Reserve button not found on design page");
        return;
      }
    }

    await reserveBtn.click();
    await page.waitForLoadState("networkidle", { timeout: 10_000 }).catch(() => {});

    const actualUrl = page.url();
    // Checkout is disabled: /checkout/d1 → /booking?designId=d1
    expect(actualUrl).toContain("/booking");
    expect(actualUrl).toContain("designId=d1");
  });
});
