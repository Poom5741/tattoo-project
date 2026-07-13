import { test, expect } from "./fixtures/index";

test.describe("Admin page (/admin) — unauthenticated", () => {
  test("shows login form when not authenticated", async ({ page }) => {
    await page.goto("/admin");
    // Should show Sign in heading
    await expect(page.locator("h1", { hasText: "Sign in" })).toBeVisible({ timeout: 10_000 });
    // Should show password input
    await expect(page.locator("#pw, input[type='password']")).toBeVisible();
    // Should show submit button
    await expect(page.locator("button", { hasText: "Enter dashboard" })).toBeVisible();
  });

  test("shows SUKNID / Admin kicker", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.locator(".kicker", { hasText: "SUKNID / Admin" })).toBeVisible();
  });

  test("shows error message on wrong password submission", async ({ page }) => {
    await page.goto("/admin");
    await page.fill("#pw", "wrongpass");
    await page.click("button[type='submit']");
    // Error message should appear
    await expect(page.locator("#login-err")).toBeVisible({ timeout: 5_000 });
  });

  test("page title is 'Admin — SUKNID'", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveTitle(/Admin — SUKNID/);
  });
});

test.describe("Admin page (/admin) — authenticated", () => {
  test("shows dashboard after successful login", async ({ adminPage }) => {
    await adminPage.goto("/admin");
    // Should show Dashboard heading (not login form)
    await expect(adminPage.locator("h1", { hasText: "Dashboard" })).toBeVisible({ timeout: 10_000 });
  });

  test("shows dashboard stats section", async ({ adminPage }) => {
    await adminPage.goto("/admin");
    const stats = adminPage.locator(".stats");
    await expect(stats).toBeVisible({ timeout: 10_000 });
    // Stats labels — scoped to .stats to avoid ambiguity with page-wide text matches
    await expect(stats).toContainText("Bookings");
    await expect(stats).toContainText("Pending review");
    await expect(stats).toContainText("Available");
    await expect(stats).toContainText("Reserved");
    await expect(stats).toContainText("Sold");
  });

  test("shows 'Sign out' button", async ({ adminPage }) => {
    await adminPage.goto("/admin");
    await expect(adminPage.locator("button", { hasText: "Sign out" })).toBeVisible({ timeout: 10_000 });
  });

  test("shows 'Pending design review' section", async ({ adminPage }) => {
    await adminPage.goto("/admin");
    await expect(adminPage.locator("text=Pending design review")).toBeVisible({ timeout: 10_000 });
  });

  test("shows 'Booking inquiries' section", async ({ adminPage }) => {
    await adminPage.goto("/admin");
    await expect(adminPage.locator("text=Booking inquiries")).toBeVisible({ timeout: 10_000 });
  });

  test("shows 'Register new artist' form", async ({ adminPage }) => {
    await adminPage.goto("/admin");
    await expect(adminPage.locator("text=Register new artist")).toBeVisible({ timeout: 10_000 });
  });

  test("shows 'All plates' section", async ({ adminPage }) => {
    await adminPage.goto("/admin");
    await expect(adminPage.locator("text=All plates")).toBeVisible({ timeout: 10_000 });
  });

  test("shows SUKNID / Admin kicker in dashboard", async ({ adminPage }) => {
    await adminPage.goto("/admin");
    await expect(adminPage.locator(".kicker", { hasText: "SUKNID / Admin" })).toBeVisible({ timeout: 10_000 });
  });
});
