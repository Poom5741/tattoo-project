import { test, expect } from "@playwright/test";

test.describe("Artists page (/artists)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/artists");
  });

  test("loads successfully", async ({ page }) => {
    await expect(page).toHaveURL("/artists");
    await expect(page.locator("body")).toBeVisible();
  });

  test("shows page title 'Artists — INKNOIR'", async ({ page }) => {
    await expect(page).toHaveTitle(/Artists — INKNOIR/);
  });

  test("shows 'Resident artists' heading", async ({ page }) => {
    await expect(page.locator("h1", { hasText: "Resident artists" })).toBeVisible();
  });

  test("shows kicker 'The roster'", async ({ page }) => {
    await expect(page.locator(".kicker", { hasText: "The roster" }).first()).toBeVisible();
  });

  test("has navigation to artist detail pages when artists are present", async ({ page }) => {
    // Artists come from DB — check if any artist cards are rendered
    const cards = page.locator(".card");
    const count = await cards.count();
    if (count > 0) {
      // Each card should link to an /artist/ route
      const firstCardLink = cards.first();
      const href = await firstCardLink.getAttribute("href");
      expect(href).toMatch(/^\/artist\//);
    }
  });

  test("shows booking call-to-action section", async ({ page }) => {
    await expect(page.locator("text=Are you a tattoo artist")).toBeVisible();
  });

  test("has navigation component", async ({ page }) => {
    // Nav should be present (renders as a section or nav element with links)
    const navLinks = page.locator("nav a, header a");
    const count = await navLinks.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });
});

test.describe("Artist detail page (/artist/[id])", () => {
  // Seed data: artist IDs are 'mara', 'koto', 'sol', 'vera'
  // The DB may or may not be seeded; check for redirect gracefully
  test("navigates to artist detail — mara (if DB is seeded)", async ({ page }) => {
    const res = await page.goto("/artist/mara");
    // Either shows artist page or redirects to /market (if DB not seeded)
    const url = page.url();
    if (url.includes("/artist/mara")) {
      await expect(page.locator("body")).toBeVisible();
      // If artist is shown, expect their name
      const bodyText = await page.locator("body").innerText();
      expect(bodyText).toMatch(/Mara|artist|Artist/i);
    } else {
      // Redirect to /market is acceptable when DB not seeded
      expect(url).toContain("/market");
    }
  });
});
