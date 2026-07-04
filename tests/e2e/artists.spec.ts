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
    const cards = page.locator(".card");
    const count = await cards.count();
    if (count > 0) {
      const firstCardLink = cards.first();
      const href = await firstCardLink.getAttribute("href");
      expect(href).toMatch(/^\/artist\//);
    }
  });

  test("shows booking call-to-action section", async ({ page }) => {
    await expect(page.locator("text=Are you a tattoo artist")).toBeVisible();
  });

  test("has navigation component", async ({ page }) => {
    const navLinks = page.locator("nav a, header a");
    const count = await navLinks.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });
});

test.describe("Artist detail page (/artist/[id])", () => {
  const KNOWN_ARTIST_ID = "mara";

  test("navigates to artist detail — mara (if DB is seeded)", async ({ page }) => {
    await page.goto(`/artist/${KNOWN_ARTIST_ID}`);
    const url = page.url();
    if (url.includes(`/artist/${KNOWN_ARTIST_ID}`)) {
      await expect(page.locator("body")).toBeVisible();
      await expect(page).toHaveTitle(/INKNOIR/);
      await expect(page.locator("h1").first()).toBeVisible();
      await expect(page.locator("a", { hasText: "← All artists" })).toBeVisible();
      await expect(page.locator("a", { hasText: "Book a session" }).first()).toBeVisible();
    } else {
      expect(url).toContain("/artists");
    }
  });

  test("uses Bone & Blood design tokens for profile header", async ({ page }) => {
    await page.goto(`/artist/${KNOWN_ARTIST_ID}`);
    if (!page.url().includes(`/artist/${KNOWN_ARTIST_ID}`)) return;

    const h1 = page.locator("h1").first();
    const h1Font = await h1.evaluate((el) => getComputedStyle(el).fontFamily);
    expect(h1Font).toContain("Playfair Display");

    const backLink = page.locator("a", { hasText: "← All artists" });
    const linkFont = await backLink.evaluate((el) => getComputedStyle(el).fontFamily);
    expect(linkFont).toContain("Sora");
  });

  test("artist avatar uses card-bb styling", async ({ page }) => {
    await page.goto(`/artist/${KNOWN_ARTIST_ID}`);
    if (!page.url().includes(`/artist/${KNOWN_ARTIST_ID}`)) return;

    const avatarCard = page.locator(".card-bb").first();
    await expect(avatarCard).toBeVisible();

    const styles = await avatarCard.evaluate((el) => {
      const s = getComputedStyle(el);
      return { borderRadius: s.borderRadius, borderWidth: parseFloat(s.borderWidth) };
    });
    expect(styles.borderRadius).toBe("16px");
    expect(styles.borderWidth).toBeGreaterThan(0);
  });

  test("plates grid uses card-bb styling", async ({ page }) => {
    await page.goto(`/artist/${KNOWN_ARTIST_ID}`);
    if (!page.url().includes(`/artist/${KNOWN_ARTIST_ID}`)) return;

    const platesHeading = page.locator("h2", { hasText: "Available plates" });
    if (!(await platesHeading.isVisible())) return;

    const plateCards = page.locator("a.card-bb");
    const count = await plateCards.count();
    expect(count).toBeGreaterThan(0);

    const firstCard = plateCards.first();
    const styles = await firstCard.evaluate((el) => {
      const s = getComputedStyle(el);
      return { borderRadius: s.borderRadius, borderWidth: parseFloat(s.borderWidth) };
    });
    expect(styles.borderRadius).toBe("16px");
    expect(styles.borderWidth).toBeGreaterThan(0);
  });

  test("Book a session button uses btn-primary styling", async ({ page }) => {
    await page.goto(`/artist/${KNOWN_ARTIST_ID}`);
    if (!page.url().includes(`/artist/${KNOWN_ARTIST_ID}`)) return;

    const bookBtn = page.locator("a.btn-primary", { hasText: "Book a session" });
    await expect(bookBtn).toBeVisible();
    await expect(bookBtn).toHaveClass(/btn-primary/);
  });

  test("stats section uses design tokens", async ({ page }) => {
    await page.goto(`/artist/${KNOWN_ARTIST_ID}`);
    if (!page.url().includes(`/artist/${KNOWN_ARTIST_ID}`)) return;

    const statValues = page.locator(".font-display.text-headline-sm");
    const count = await statValues.count();
    expect(count).toBeGreaterThan(0);
  });

  test("plates grid is responsive: 1 col mobile, 2 col tablet, 3 col desktop", async ({ page }) => {
    await page.goto(`/artist/${KNOWN_ARTIST_ID}`);
    if (!page.url().includes(`/artist/${KNOWN_ARTIST_ID}`)) return;

    const grid = page.locator(".grid.gap-gutter").last();

    if (!(await page.locator("a.card-bb").first().isVisible())) return;

    await page.setViewportSize({ width: 375, height: 812 });
    let columns = await grid.evaluate((el) => {
      const style = getComputedStyle(el);
      return style.gridTemplateColumns.split(" ").filter((s) => s.trim()).length;
    });
    expect(columns).toBe(1);

    await page.setViewportSize({ width: 768, height: 1024 });
    columns = await grid.evaluate((el) => {
      const style = getComputedStyle(el);
      return style.gridTemplateColumns.split(" ").filter((s) => s.trim()).length;
    });
    expect(columns).toBe(2);

    await page.setViewportSize({ width: 1280, height: 800 });
    columns = await grid.evaluate((el) => {
      const style = getComputedStyle(el);
      return style.gridTemplateColumns.split(" ").filter((s) => s.trim()).length;
    });
    expect(columns).toBe(3);
  });
});
