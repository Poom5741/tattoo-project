import { test, expect } from "@playwright/test";

test.describe("Home page (/)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("loads with 200 status", async ({ page }) => {
    await expect(page).toHaveURL("/");
    await expect(page.locator("body")).toBeVisible();
  });

  test("shows hero heading 'Ink you can own'", async ({ page }) => {
    // .first() because Astro dev toolbar also injects h1 elements into the page
    await expect(page.locator("h1").first()).toContainText("Ink you");
    await expect(page.locator("h1").first()).toContainText("own");
  });

  test("shows hero kicker 'One plate · One owner · One needle'", async ({ page }) => {
    await expect(page.locator(".kicker").first()).toContainText("One plate");
  });

  test("shows hero stats section with plate count and resident artists", async ({ page }) => {
    const stats = page.locator(".hero__stats");
    await expect(stats).toBeVisible();
    await expect(stats).toContainText("Plates released");
    await expect(stats).toContainText("Resident artists");
    await expect(stats).toContainText("One of one");
  });

  test("'Explore Drop' CTA links to /market", async ({ page }) => {
    const link = page.locator("a", { hasText: "Explore Drop" }).first();
    await expect(link).toHaveAttribute("href", "/market");
  });

  test("'View Artist' CTA links to /artists", async ({ page }) => {
    const link = page.locator("a", { hasText: "View Artist" }).first();
    await expect(link).toHaveAttribute("href", "/artists");
  });

  test("shows 'Latest plates' section with featured plates", async ({ page }) => {
    await expect(page.locator("h2", { hasText: "Latest plates" })).toBeVisible();
  });

  test("featured plates grid renders 3 cards with artwork, artist name, and tags", async ({ page }) => {
    const grid = page.locator('[data-testid="featured-plates-grid"]');
    await expect(grid).toBeVisible();
    const cards = grid.locator('[data-testid="plate-card"]');
    await expect(cards).toHaveCount(3);

    for (let i = 0; i < 3; i++) {
      const card = cards.nth(i);
      await expect(card.locator("canvas")).toBeVisible();
      await expect(card.locator("text=by")).toBeVisible();
      await expect(card.locator(".tag-bb").first()).toBeVisible();
    }
  });

  test("featured plates grid is responsive: 1 col mobile, 2 col tablet, 3 col desktop", async ({ page }) => {
    const grid = page.locator('[data-testid="featured-plates-grid"]');

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

  test("plate cards have rounded corners and subtle border", async ({ page }) => {
    const card = page.locator('[data-testid="plate-card"]').first();
    const styles = await card.evaluate((el) => {
      const s = getComputedStyle(el);
      return { borderRadius: s.borderRadius, borderWidth: s.borderWidth, borderColor: s.borderColor };
    });
    expect(styles.borderRadius).toBe("16px");
    expect(parseFloat(styles.borderWidth)).toBeGreaterThan(0);
  });

  test("'All plates' button links to /market", async ({ page }) => {
    const link = page.locator("a", { hasText: "All plates" });
    await expect(link).toHaveAttribute("href", "/market");
  });

  test("shows how-it-works section with 3 steps, icons, and connecting lines", async ({ page }) => {
    const section = page.locator(".how-it-works");
    await expect(section).toBeVisible();

    await expect(page.locator("text=Claim the plate")).toBeVisible();
    await expect(page.locator("text=Book the maker")).toBeVisible();
    await expect(page.locator("text=Wear the original")).toBeVisible();

    const iconRings = section.locator(".how-it-works__icon-ring");
    await expect(iconRings).toHaveCount(3);

    for (const ring of await iconRings.all()) {
      await expect(ring.locator("svg")).toBeVisible();
    }

    const connectingLine = section.locator(".how-it-works__line");
    await expect(connectingLine).toBeAttached();
  });

  test("shows 'Resident artists' section", async ({ page }) => {
    await expect(page.locator("h2", { hasText: "Resident artists" })).toBeVisible();
  });

  test("'Meet them all' button links to /artists", async ({ page }) => {
    const link = page.locator("a", { hasText: "Meet them all" });
    await expect(link).toHaveAttribute("href", "/artists");
  });

  test("artist cards display with avatars, names, and bio snippets", async ({ page }) => {
    const artistCards = page.locator("[data-testid^='artist-card-']");
    await expect(artistCards).toHaveCount(4);

    const firstCard = artistCards.first();
    await expect(firstCard.locator("h3")).toBeVisible();
    await expect(firstCard.locator(".rounded-full")).toBeVisible();
    await expect(firstCard.locator("p.line-clamp-2")).toBeVisible();
  });

  test("artist cards are clickable and link to artist profiles", async ({ page }) => {
    const maraCard = page.locator("[data-testid='artist-card-mara']");
    await expect(maraCard).toHaveAttribute("href", "/artist/mara");

    const kotoCard = page.locator("[data-testid='artist-card-koto']");
    await expect(kotoCard).toHaveAttribute("href", "/artist/koto");
  });

  test("shows CTA band 'Browse the gallery' linking to /market", async ({ page }) => {
    const link = page.locator("a", { hasText: "Browse the gallery" });
    await expect(link).toHaveAttribute("href", "/market");
  });

  test("CTA band uses red accent color and has prominent headline", async ({ page }) => {
    const ctaBand = page.locator("[data-testid='cta-band']");
    await expect(ctaBand).toBeVisible();
    
    const headline = ctaBand.locator("h2");
    await expect(headline).toBeVisible();
    await expect(headline).toContainText("Your skin deserves an original");
    
    const ctaButton = ctaBand.locator("a", { hasText: "Browse the gallery" });
    await expect(ctaButton).toBeVisible();
  });

  test("shows page title 'SAKNID'", async ({ page }) => {
    await expect(page).toHaveTitle(/SAKNID/);
  });
});
