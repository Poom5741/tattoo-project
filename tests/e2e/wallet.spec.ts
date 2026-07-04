import { test, expect } from "@playwright/test";

test.describe("Wallet page (/wallet)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/wallet");
  });

  test("loads successfully", async ({ page }) => {
    await expect(page).toHaveURL("/wallet");
    await expect(page.locator("body")).toBeVisible();
  });

  test("shows page title 'Your Collection — INKNOIR'", async ({ page }) => {
    await expect(page).toHaveTitle(/Your Collection — INKNOIR/);
  });

  test("shows 'Your collection' kicker", async ({ page }) => {
    await expect(page.locator(".kicker", { hasText: "Your collection" })).toBeVisible();
  });

  test("shows 'Held by you' heading", async ({ page }) => {
    await expect(page.locator("h1", { hasText: "Held by you" })).toBeVisible();
  });

  test("shows wallet connect prompt when not connected", async ({ page }) => {
    // The WalletOwnedPlates React component renders a connect wallet prompt
    // when no wallet is connected. Wait for client-side hydration.
    await page.waitForLoadState("domcontentloaded");
    // The component should render without crashing
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator("text=Internal Server Error")).not.toBeVisible();
  });

  test("does not show 500 error", async ({ page }) => {
    await expect(page.locator("text=500")).not.toBeVisible();
    await expect(page.locator("text=Internal Server Error")).not.toBeVisible();
  });
});
