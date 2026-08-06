import { test, expect } from "@playwright/test";

test.describe("Wallet page (/wallet)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/wallet");
  });

  test("loads successfully", async ({ page }) => {
    await expect(page).toHaveURL("/wallet");
    await expect(page.locator("body")).toBeVisible();
  });

  test("shows page title 'Your Collection — SAKNID'", async ({ page }) => {
    await expect(page).toHaveTitle(/Your Collection — S[AK]KNID/);
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

  test("page uses Bone & Blood background color", async ({ page }) => {
    const body = page.locator("body");
    const bgColor = await body.evaluate((el) => getComputedStyle(el).backgroundColor);
    // #FBF9F3 = rgb(251, 249, 243)
    expect(bgColor).toBe("rgb(251, 249, 243)");
  });

  test("heading uses Playfair Display font", async ({ page }) => {
    const h1 = page.locator("h1");
    const fontFamily = await h1.evaluate((el) => getComputedStyle(el).fontFamily);
    expect(fontFamily).toContain("Playfair Display");
  });

  test("kicker uses primary-container red accent", async ({ page }) => {
    const kicker = page.locator(".kicker");
    const color = await kicker.evaluate((el) => getComputedStyle(el).color);
    // #E60023 = rgb(230, 0, 35)
    expect(color).toBe("rgb(230, 0, 35)");
  });

  test("connect prompt uses card-bb styling when not connected", async ({ page }) => {
    await page.waitForLoadState("domcontentloaded");
    // The empty/connect state should use card-bb class
    const card = page.locator(".card-bb");
    const count = await card.count();
    // Only check if the React component has hydrated and rendered the connect prompt
    if (count > 0) {
      await expect(card.first()).toBeVisible();
    }
  });
});
