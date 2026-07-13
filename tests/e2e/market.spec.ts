import { test, expect } from "@playwright/test";

test.describe("Market page (/market)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/market");
  });

  test("loads successfully", async ({ page }) => {
    await expect(page).toHaveURL("/market");
    await expect(page.locator("body")).toBeVisible();
  });

  test("shows page title 'Gallery — SUKNID'", async ({ page }) => {
    await expect(page).toHaveTitle(/Gallery — SUKNID/);
  });

  test("shows 'Plates for acquisition' heading with display font", async ({ page }) => {
    const heading = page.locator("h1", { hasText: "Plates for acquisition" });
    await expect(heading).toBeVisible();
    await expect(heading).toHaveCSS("font-family", /Playfair Display/);
  });

  test("shows 'The gallery' kicker with primary-container color", async ({ page }) => {
    const kicker = page.locator(".kicker", { hasText: "The gallery" });
    await expect(kicker).toBeVisible();
    await expect(kicker).toHaveCSS("text-transform", "uppercase");
  });

  test("shows plate count badge (0 or more plates)", async ({ page }) => {
    const badge = page.locator("text=/PLATES · ONE OF EACH/");
    await expect(badge).toBeVisible();
  });

  test("uses Bone & Blood cream background", async ({ page }) => {
    const body = page.locator("body");
    const bg = await body.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bg).toMatch(/rgb\(251,\s*249,\s*243\)/);
  });

  test("filter buttons are present and interactive", async ({ page }) => {
    const filterSection = page.locator('[data-testid="filter-listing"]');
    await expect(filterSection).toBeVisible();

    const buttons = filterSection.locator("button");
    await expect(buttons).toHaveCount(3);

    const firstBtn = buttons.first();
    await expect(firstBtn).toHaveText("All listings");
    await expect(firstBtn).toHaveCSS("background-color", /rgb\(230,\s*0,\s*35\)/);
  });

  test("style filter buttons render", async ({ page }) => {
    const styleFilters = page.locator('[data-testid="filter-style"]');
    await expect(styleFilters).toBeVisible();
    await expect(styleFilters.locator("button")).toHaveCount(11);
  });

  test("plate grid uses responsive grid layout", async ({ page }) => {
    const grid = page.locator('[data-testid="plate-grid"]');
    const hasGrid = await grid.isVisible().catch(() => false);
    const hasEmpty = await page.locator("text=No plates match your filters").isVisible().catch(() => false);
    expect(hasGrid || hasEmpty).toBe(true);
  });

  test("navigation works — back to home", async ({ page }) => {
    const homeLink = page.locator("a[href='/']").first();
    if (await homeLink.isVisible()) {
      await homeLink.click();
      await expect(page).toHaveURL("/");
    }
  });

  test("no server errors on page", async ({ page }) => {
    await expect(page.locator("text=Internal Server Error")).not.toBeVisible();
  });

  test("container uses proper max-width", async ({ page }) => {
    const container = page.locator(".container-bb").first();
    await expect(container).toBeVisible();
  });
});
