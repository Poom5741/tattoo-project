import { test, expect } from "@playwright/test";

test.describe("Login page (/auth/login)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth/login");
  });

  test("page has correct title", async ({ page }) => {
    await expect(page).toHaveTitle(/Sign In — SAKNID/);
  });

  test("page has correct heading", async ({ page }) => {
    const heading = page.locator("h1", { hasText: /Sign in to SAKNID/i });
    await expect(heading).toBeVisible();
  });

  test("page shows description text", async ({ page }) => {
    const description = page.locator("text=Sign in with Google to manage your collection and wallet");
    await expect(description).toBeVisible();
  });

  test("Google sign-in button is visible and enabled", async ({ page }) => {
    const button = page.locator("#google-signin");
    await expect(button).toBeVisible();
    await expect(button).not.toBeDisabled();
  });

  test("Google sign-in button has correct text", async ({ page }) => {
    const button = page.locator("#google-signin");
    await expect(button).toContainText("Sign in with Google");
  });

  test("Google sign-in button has Google icon", async ({ page }) => {
    const button = page.locator("#google-signin");
    const svg = button.locator("svg");
    await expect(svg).toBeVisible();
  });

  test("page layout has correct structure", async ({ page }) => {
    // Check main container
    const main = page.locator("main");
    await expect(main).toBeVisible();

    // Check card container
    const card = page.locator(".card-bb");
    await expect(card).toBeVisible();

    // Check icon container
    const icon = page.locator("div").filter({ has: page.locator("text=⬡") });
    await expect(icon).toBeVisible();
  });
});
