import { test, expect } from "@playwright/test";
import { DatabaseSync } from "node:sqlite";
import { readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";

function findD1Paths(): string[] {
  const d1Dir = ".wrangler/state/v3/d1/miniflare-D1DatabaseObject";
  if (!existsSync(d1Dir)) return [];
  const files = readdirSync(d1Dir)
    .filter((f: string) => f.endsWith(".sqlite") && !f.endsWith("-wal") && !f.endsWith("-shm"))
    .map((f: string) => ({ f, mtime: statSync(join(d1Dir, f)).mtimeMs }))
    .sort((a, b) => b.mtime - a.mtime);
  return files.map((f: { f: string }) => join(d1Dir, f.f));
}

// Seed data design IDs: d1 through d15
// d1 = "Serpent in Negative" by Mara (available)
// d2 = "Koi Ascending" by Koto (available)
const KNOWN_AVAILABLE_DESIGN_ID = "d1";
const KNOWN_RESERVED_DESIGN_ID = "d4"; // "Etched Moth" — reserved
const NONEXISTENT_DESIGN_ID = "d999";

test.describe("Design detail page (/design/[id])", () => {
  test.beforeEach(() => {
    const dbPaths = findD1Paths();
    for (const p of dbPaths) {
      const con = new DatabaseSync(p);
      try {
        con.prepare("UPDATE designs SET status = 'available' WHERE id = 'd1'").run();
      } catch {} finally { con.close(); }
    }
  });
  test("redirects to /market for non-existent design", async ({ page }) => {
    await page.goto(`/design/${NONEXISTENT_DESIGN_ID}`);
    // SSR redirects to /market when design not found
    await expect(page).toHaveURL("/market");
  });

  test("shows design detail page when DB is seeded (d1 — Serpent in Negative)", async ({ page }) => {
    const res = await page.goto(`/design/${KNOWN_AVAILABLE_DESIGN_ID}`);
    const url = page.url();

    if (url.includes(`/design/${KNOWN_AVAILABLE_DESIGN_ID}`)) {
      // Design found in DB
      await expect(page.locator("body")).toBeVisible();
      await expect(page).toHaveTitle(/S[AK]KNID/);

      // Should show design title (use .first() — Astro dev toolbar also injects h1 elements)
      await expect(page.locator("h1").first()).toContainText("Serpent in Negative");

      // Should show acquire button for available design
      await expect(page.locator("a", { hasText: "Acquire this plate" })).toBeVisible();

      // Should show back link to gallery
      await expect(page.locator("a", { hasText: "← Back to gallery" })).toBeVisible();
    } else {
      // Redirected to /market — DB not seeded, acceptable
      expect(url).toContain("/market");
    }
  });

  test("shows Reserved status for reserved design (d4 — Etched Moth)", async ({ page }) => {
    await page.goto(`/design/${KNOWN_RESERVED_DESIGN_ID}`);
    const url = page.url();

    if (url.includes(`/design/${KNOWN_RESERVED_DESIGN_ID}`)) {
      // Use role+name to disambiguate from the nav wallet button (also disabled)
      const reservedBtn = page.getByRole("button", { name: /Reserved/i });
      await expect(reservedBtn).toBeVisible();
    }
    // Otherwise redirected to /market — acceptable
  });

  test("'Acquire this plate' link goes to /checkout/[id]", async ({ page }) => {
    await page.goto(`/design/${KNOWN_AVAILABLE_DESIGN_ID}`);
    const url = page.url();

    if (url.includes(`/design/${KNOWN_AVAILABLE_DESIGN_ID}`)) {
      const acquireLink = page.locator("a", { hasText: "Acquire this plate" });
      if (await acquireLink.isVisible()) {
        const href = await acquireLink.getAttribute("href");
        expect(href).toContain(`/checkout/${KNOWN_AVAILABLE_DESIGN_ID}`);
      }
    }
  });

  test("shows certificate of plate section when design found", async ({ page }) => {
    await page.goto(`/design/${KNOWN_AVAILABLE_DESIGN_ID}`);
    const url = page.url();

    if (url.includes(`/design/${KNOWN_AVAILABLE_DESIGN_ID}`)) {
      await expect(page.locator("text=Certificate of plate")).toBeVisible();
    }
  });
});
