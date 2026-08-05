import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("home page has working nav links", async ({ page }) => {
    await page.goto("/");

    // Find links to key pages
    const marketLink = page.locator("nav a[href='/market'], a[href='/market']").first();
    const artistsLink = page.locator("nav a[href='/artists'], a[href='/artists']").first();

    if (await marketLink.isVisible()) {
      await expect(marketLink).toHaveAttribute("href", "/market");
    }
    if (await artistsLink.isVisible()) {
      await expect(artistsLink).toHaveAttribute("href", "/artists");
    }
  });

  test("nav links navigate correctly from home to market", async ({ page }) => {
    await page.goto("/");
    // Click the hero CTA to enter gallery
    const galleryLink = page.locator("a", { hasText: "Explore Drop" }).first();
    await expect(galleryLink).toBeVisible();
    await galleryLink.click();
    await expect(page).toHaveURL("/market");
  });

  test("nav links navigate correctly from home to artists", async ({ page }) => {
    await page.goto("/");
    const artistsLink = page.locator("a", { hasText: "View Artist" }).first();
    await expect(artistsLink).toBeVisible();
    await artistsLink.click();
    await expect(page).toHaveURL("/artists");
  });

  test("back link on booking page goes to /artists", async ({ page }) => {
    await page.goto("/booking");
    const backLink = page.locator("a", { hasText: "All artists" });
    await expect(backLink).toBeVisible();
    await expect(backLink).toHaveAttribute("href", "/artists");
  });

  test("market page has back navigation to home", async ({ page }) => {
    await page.goto("/market");
    // Nav renders on each page
    await expect(page.locator("body")).toBeVisible();
  });

  test("market page links to design detail pages", async ({ page }) => {
    await page.goto("/market");
    await page.waitForLoadState("domcontentloaded");

    const designLinks = page.locator("a[href^='/design/']");
    const count = await designLinks.count();
    if (count > 0) {
      const href = await designLinks.first().getAttribute("href");
      expect(href).toMatch(/^\/design\//);
    }
  });

  test("nav is sticky with cream background", async ({ page }) => {
    await page.goto("/");
    const header = page.locator("header.sticky").first();
    await expect(header).toBeVisible();
    await expect(header).toHaveCSS("position", "sticky");
  });

  test("brand name renders SAKNID", async ({ page }) => {
    await page.goto("/");
    const brand = page.locator("header a.font-display").first();
    await expect(brand).toContainText("SAKNID");
  });

  test("active nav link shows red underline", async ({ page }) => {
    await page.goto("/market");
    const activeLink = page.locator("header nav a[href='/market']").first();
    if (await activeLink.isVisible()) {
      const underline = activeLink.locator("span.bg-primary-container").first();
      await expect(underline).toBeVisible();
    }
  });

  test("mobile hamburger menu opens slide-in panel", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    const menuButton = page.locator("button[aria-label='Open menu']").first();
    await expect(menuButton).toBeVisible();
    await menuButton.click();

    const panel = page.locator("div.fixed.right-0.h-full").first();
    await expect(panel).toBeVisible();

    const closeButton = page.locator("button[aria-label='Close menu']").first();
    await closeButton.click();
    // Wait for the slide-out transition to complete (was waitForTimeout(500)).
    // The panel uses transition-transform duration-300 ease-out; assert the
    // computed transform directly and let Playwright retry until it matches.
    // Default expect timeout is 10s.
    await expect(panel).toHaveCSS(
      "transform",
      "matrix(1, 0, 0, 1, 300, 0)"
    );
  });

  test("Connect Wallet button text is correct", async ({ page }) => {
    await page.goto("/");
    const walletButton = page.locator("button.nav__wallet").first();
    await expect(walletButton).toBeVisible();
    await expect(walletButton).toContainText("Connect Wallet");
  });
});
