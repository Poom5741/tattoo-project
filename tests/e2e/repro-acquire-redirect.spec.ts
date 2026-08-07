/**
 * REPRO: Scenario B — clicking "Acquire Plate" on /design/[id]
 * redirects back to /market instead of going to /checkout/[id].
 *
 * Phase 1 feedback loop for the diagnosing-bugs skill.
 */
import { test, expect } from "@playwright/test";

test.describe("REPRO: Acquire button redirect bug", () => {
  test("clicking 'Acquire Plate' on /design/d1 should navigate to /checkout/d1, not /market", async ({ page }) => {
    // Step 1: Go to the design page
    await page.goto("/design/d1");
    const designPageUrl = page.url();

    // If we were redirected to /market here, the design doesn't exist in DB
    // (seed must have run). Log it so we know.
    if (!designPageUrl.includes("/design/d1")) {
      console.log(`[REPRO] Design page redirected to: ${designPageUrl}`);
      console.log("[REPRO] Design d1 not found in DB — run 'pnpm db:seed:dev' first");
      test.skip(true, "Design d1 not in DB — seed required");
      return;
    }

    console.log(`[REPRO] On design page: ${designPageUrl}`);

    // Step 2: Find and verify the acquire button exists
    const acquireBtn = page.locator('a[href="/checkout/d1"]').first();
    const isAcquireVisible = await acquireBtn.isVisible().catch(() => false);

    if (!isAcquireVisible) {
      // The button might have different text depending on i18n
      const fallbackBtn = page.locator('a').filter({ hasText: /acquire|get this|buy/i }).first();
      const isFallbackVisible = await fallbackBtn.isVisible().catch(() => false);
      console.log(`[REPRO] Primary acquire button not visible. Fallback visible: ${isFallbackVisible}`);
      
      if (!isFallbackVisible) {
        // Check what buttons/links ARE on the page
        const allLinks = await page.locator('a').allInnerTexts();
        console.log(`[REPRO] All links on page: ${JSON.stringify(allLinks.slice(0, 20))}`);
        test.skip(true, "Acquire button not found on design page");
        return;
      }
    }

    // Step 3: Click the acquire button and track where we end up
    console.log("[REPRO] Clicking acquire button...");
    
    // Listen for navigation
    let finalUrl = "";
    page.on("framenavigated", (frame) => {
      if (frame === page.mainFrame()) {
        finalUrl = frame.url();
        console.log(`[REPRO] Navigated to: ${finalUrl}`);
      }
    });

    await acquireBtn.click();

    // Wait for navigation to settle
    await page.waitForLoadState("networkidle", { timeout: 10_000 }).catch(() => {});
    
    const actualUrl = page.url();
    console.log(`[REPRO] Final URL after click: ${actualUrl}`);

    // THE BUG: We should be on /checkout/d1, not /market
    if (actualUrl.includes("/market")) {
      console.log("[REPRO] ❌ BUG CONFIRMED: Redirected to /market instead of /checkout/d1");
      
      // Extra diagnostics: check if the design page SSR redirected us
      // by checking the navigation chain
      const entries = page.context().pages();
      console.log(`[REPRO] Open pages: ${entries.map(p => p.url())}`);
    }

    // This assertion should FAIL if the bug exists, PASS once fixed
    expect(actualUrl).toContain("/checkout/d1");
  });
});
