import { test, expect } from "@playwright/test";

test.describe("Login page (/auth/login)", () => {
  test("loads and shows Google sign-in button", async ({ page }) => {
    await page.goto("/auth/login");
    await expect(page.locator("h1", { hasText: /sign in/i })).toBeVisible({ timeout: 10_000 });
    await expect(page.locator("button", { hasText: /google/i })).toBeVisible();
  });
});
