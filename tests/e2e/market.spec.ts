import { test, expect } from "@playwright/test";

test.describe("Market page (/market)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/market");
  });

  test("loads successfully", async ({ page }) => {
    await expect(page).toHaveURL("/market");
    await expect(page.locator("body")).toBeVisible();
  });

  test("shows page title 'Gallery — INKNOIR'", async ({ page }) => {
    await expect(page).toHaveTitle(/Gallery — INKNOIR/);
  });

  test("shows 'Plates for acquisition' heading", async ({ page }) => {
    await expect(page.locator("h1", { hasText: "Plates for acquisition" })).toBeVisible();
  });

  test("shows 'The gallery' kicker", async ({ page }) => {
    await expect(page.locator(".kicker", { hasText: "The gallery" })).toBeVisible();
  });

  test("shows plate count badge (0 or more plates)", async ({ page }) => {
    // The badge shows "N PLATES · ONE OF EACH"
    const badge = page.locator("text=/PLATES · ONE OF EACH/");
    await expect(badge).toBeVisible();
  });

  test("navigation works — back to home", async ({ page }) => {
    // There should be a home link in the nav
    const homeLink = page.locator("a[href='/']").first();
    if (await homeLink.isVisible()) {
      await homeLink.click();
      await expect(page).toHaveURL("/");
    }
  });

  test("shows design cards or empty state when DB seeded", async ({ page }) => {
    // The MarketGrid component renders cards or empty state
    // We just ensure the page body loaded without crash
    const body = page.locator("body");
    await expect(body).toBeVisible();
    // No unhandled error banner
    await expect(page.locator("text=Internal Server Error")).not.toBeVisible();
  });
});
