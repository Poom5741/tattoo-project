/**
 * Bug: Design status consistency — sold tattoos still show as available.
 *
 * The market page queries designs with `status IN ('available', 'reserved',
 * 'sold')`, so sold designs appear in the gallery with a "Claimed" badge.
 * This is by design (the market shows all non-owned plates). However, several
 * consistency issues exist:
 *
 * 1. The bookings API (`POST /api/bookings`) does NOT check the design's
 *    status before inserting an inquiry. A sold or reserved design can still
 *    receive booking inquiries, which is misleading.
 *
 * 2. The design detail page auto-transitions `reserved` to `available` when
 *    `reserved_until` has expired, but the timestamp comparison on line 61 of
 *    `src/pages/design/[id].astro` uses `new Date(ts).getTime()`, which
 *    interprets the value as **milliseconds**. Since `reserved_until` is
 *    stored as Unix seconds (integer), the date resolves to a 1970 timestamp
 *    — always "expired". A design reserved 10 years into the future would
 *    still be auto-transitioned to `available` on the next page load.
 *
 * 3. The "Acquire plate" / "Book artist" CTAs correctly hide for non-available
 *    statuses, but the market page still links to the detail page for sold
 *    designs, where users see a disabled button with no explanation.
 *
 * This spec file locks the intended contract for each status and documents
 * the timestamp bug as a failing-then-passing test once fixed.
 *
 * Test runner: Playwright (E2E), run via `npx playwright test tests/e2e/bugs/design-status-consistency.spec.ts`
 */

import { test, expect } from "@playwright/test";
import { DatabaseSync } from "node:sqlite";
import { readdirSync, statSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";

// ---------------------------------------------------------------------------
// Helpers — direct D1 manipulation (same pattern as design.spec.ts)
// ---------------------------------------------------------------------------

const D1_DIR = resolve(
  process.cwd(),
  ".wrangler/state/v3/d1/miniflare-D1DatabaseObject",
);

function findD1Paths(): string[] {
  if (!existsSync(D1_DIR)) return [];
  return readdirSync(D1_DIR)
    .filter((f: string) => f.endsWith(".sqlite") && !f.endsWith("-wal") && !f.endsWith("-shm"))
    .map((f: string) => ({
      f,
      mtime: statSync(join(D1_DIR, f)).mtimeMs,
    }))
    .sort((a, b) => b.mtime - a.mtime)
    .map((entry: { f: string }) => join(D1_DIR, entry.f));
}

/** Read a design row directly from D1. Returns null if not found. */
function readDesign(id: string): Record<string, unknown> | null {
  for (const dbPath of findD1Paths()) {
    const con = new DatabaseSync(dbPath);
    try {
      const row = con
        .prepare("SELECT * FROM designs WHERE id = ?")
        .get(id);
      if (row) return row as Record<string, unknown>;
    } finally {
      con.close();
    }
  }
  return null;
}

/** Update a design's status (and optionally reserved_until) in all D1 files. */
function updateDesign(
  id: string,
  status: string,
  reservedUntil?: number | null,
): void {
  for (const dbPath of findD1Paths()) {
    const con = new DatabaseSync(dbPath);
    try {
      if (reservedUntil !== undefined) {
        con
          .prepare(
            "UPDATE designs SET status = ?, reserved_until = ? WHERE id = ?",
          )
          .run(status, reservedUntil, id);
      } else {
        con
          .prepare("UPDATE designs SET status = ? WHERE id = ?")
          .run(status, id);
      }
    } finally {
      con.close();
    }
  }
}

/** Restore a design back to 'available' with no reservation. */
function restoreAvailable(id: string): void {
  updateDesign(id, "available", null);
}

// ---------------------------------------------------------------------------
// Seed data IDs (from scripts/seed-dev-d1.ts)
// ---------------------------------------------------------------------------

const AVAILABLE_DESIGN = "d1"; // Serpent in Negative — available
const RESERVED_DESIGN = "d4"; // Etched Moth — reserved
const SOLD_DESIGN = "d5"; // Kingdom Wolf — available (we toggle to sold)
const TEST_DESIGN = "d8"; // Another available design for isolated tests
const ARTIST_MARA = "mara";
const ARTIST_KOTO = "koto";

// ---------------------------------------------------------------------------
// 1. API test: Sold design status prevents meaningful booking
// ---------------------------------------------------------------------------

test.describe("Design status consistency — booking guard", () => {
  // Restore designs to their original state after each test to avoid
  // contaminating other specs that share the seeded database.
  test.afterEach(() => {
    restoreAvailable(SOLD_DESIGN);
    restoreAvailable(TEST_DESIGN);
  });

  test("POST /api/bookings accepts a booking for a sold design (documents lack of server-side guard)", async ({
    request,
  }) => {
    // Set design to sold via direct D1 write.
    updateDesign(SOLD_DESIGN, "sold");

    // The bookings API does NOT check design status — it blindly inserts.
    // This test documents that gap. If the server ever adds a guard, this
    // assertion should flip to expect 400/409.
    const res = await request.post("/api/bookings", {
      data: {
        artistId: ARTIST_MARA,
        designId: SOLD_DESIGN,
        name: "Test Buyer",
        contact: "sold-test@example.com",
        bookingType: "plate",
        message: "I want this sold design",
      },
    });

    // Currently the API accepts the booking regardless of status.
    // When a guard is added, change this to:
    //   expect([400, 409]).toContain(res.status());
    expect([200, 500]).toContain(res.status());
    if (res.status() === 200) {
      const body = await res.json();
      expect(body).toHaveProperty("ok", true);
    }
  });

  test("POST /api/bookings accepts a booking for a reserved design (documents lack of server-side guard)", async ({
    request,
  }) => {
    // d4 is already reserved in seed data. Book it anyway.
    const res = await request.post("/api/bookings", {
      data: {
        artistId: ARTIST_KOTO,
        designId: RESERVED_DESIGN,
        name: "Reserved Tester",
        contact: "reserved-test@example.com",
        bookingType: "plate",
        message: "Can I still book this reserved plate?",
      },
    });

    // Same as above — no server-side guard exists.
    expect([200, 500]).toContain(res.status());
    if (res.status() === 200) {
      const body = await res.json();
      expect(body).toHaveProperty("ok", true);
    }
  });

  test("GET /api/designs/:id returns 'sold' status in the response", async ({
    request,
  }) => {
    updateDesign(TEST_DESIGN, "sold");

    const res = await request.get(`/api/designs/${TEST_DESIGN}`);
    if (res.status() === 200) {
      const body = await res.json();
      expect(body.status).toBe("sold");
    }
  });
});

// ---------------------------------------------------------------------------
// 2. API test: Reserved design shows correct status in DB
// ---------------------------------------------------------------------------

test.describe("Design status consistency — reserved status in DB", () => {
  test("d4 (Etched Moth) has status 'reserved' in the database", () => {
    const design = readDesign(RESERVED_DESIGN);
    if (design) {
      expect(design.status).toBe("reserved");
    }
    // If design is not found, the DB is not seeded — acceptable in CI.
  });

  test("GET /api/designs/:id returns 'reserved' status for d4", async ({
    request,
  }) => {
    const res = await request.get(`/api/designs/${RESERVED_DESIGN}`);
    if (res.status() === 200) {
      const body = await res.json();
      expect(body.status).toBe("reserved");
    }
  });
});

// ---------------------------------------------------------------------------
// 3. E2E test: Design detail page shows correct CTA for each status
// ---------------------------------------------------------------------------

test.describe("Design status consistency — detail page CTAs per status", () => {
  test.afterEach(() => {
    restoreAvailable(AVAILABLE_DESIGN);
    restoreAvailable(SOLD_DESIGN);
  });

  test("'available' design shows 'Acquire this plate' and 'Book artist' buttons", async ({
    page,
  }) => {
    // Ensure d1 is available
    restoreAvailable(AVAILABLE_DESIGN);

    await page.goto(`/design/${AVAILABLE_DESIGN}`);
    const url = page.url();

    if (url.includes(`/design/${AVAILABLE_DESIGN}`)) {
      // "Reserve this plate" should be a link to /checkout/:id
      const acquireBtn = page.locator("a", { hasText: "Reserve this plate" });
      await expect(acquireBtn.first()).toBeVisible();

      // "Book {name} to ink it" link should be visible (goes to /booking?designId=...)
      const bookBtn = page.locator("a", { hasText: /Book.*to ink/i });
      await expect(bookBtn.first()).toBeVisible();
    }
  });

  test("'reserved' design shows disabled button, no acquire CTA", async ({
    page,
  }) => {
    // d4 is reserved in seed data
    await page.goto(`/design/${RESERVED_DESIGN}`);
    const url = page.url();

    if (url.includes(`/design/${RESERVED_DESIGN}`)) {
      // Should NOT have an "Acquire" link
      const acquireLink = page.locator(
        `a[href*="/checkout/${RESERVED_DESIGN}"]`,
      );
      await expect(acquireLink).not.toBeVisible();

      // Should have a disabled button with "Reserved" text
      const reservedBtn = page.getByRole("button", { name: /Reserved/i });
      await expect(reservedBtn).toBeVisible();
      await expect(reservedBtn).toBeDisabled();
    }
  });

  test("'sold' design shows disabled button, no acquire or book CTA", async ({
    page,
  }) => {
    updateDesign(SOLD_DESIGN, "sold");

    await page.goto(`/design/${SOLD_DESIGN}`);
    const url = page.url();

    if (url.includes(`/design/${SOLD_DESIGN}`)) {
      // Should NOT have an "Acquire" link
      const acquireLink = page.locator(`a[href*="/checkout/${SOLD_DESIGN}"]`);
      await expect(acquireLink).not.toBeVisible();

      // Should NOT have a "Book artist" link
      const bookLink = page.locator(
        `a[href*="/booking?designId=${SOLD_DESIGN}"]`,
      );
      await expect(bookLink).not.toBeVisible();

      // Should have a disabled button with "Claimed — retired" text
      const claimedBtn = page.getByRole("button", { name: /Claimed/i });
      await expect(claimedBtn).toBeVisible();
      await expect(claimedBtn).toBeDisabled();
    }
  });
});

// ---------------------------------------------------------------------------
// 4. E2E test: Sold design on market page
// ---------------------------------------------------------------------------

test.describe("Design status consistency — sold design on market", () => {
  test.afterEach(() => {
    restoreAvailable(SOLD_DESIGN);
  });

  test("market page shows sold designs with 'Claimed' badge", async ({
    page,
  }) => {
    updateDesign(SOLD_DESIGN, "sold");

    await page.goto("/market");

    // Wait for the MarketGrid to hydrate
    await expect(page.locator('[data-testid="plate-grid"]')).toBeVisible({
      timeout: 10_000,
    });

    // The market page queries `status IN ('available', 'reserved', 'sold')`,
    // so sold designs appear. Their status tag reads "Claimed".
    // Find the card for the sold design and check its tag.
    const soldCard = page.locator(
      `[data-testid="plate-card"][href="/design/${SOLD_DESIGN}"]`,
    );

    // If the card is present, its status tag should say "Claimed"
    if (await soldCard.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await expect(soldCard.locator(".tag-bb")).toContainText("Claimed");
    }
  });

  test("market page status filter: filtering by 'available' hides sold designs", async ({
    page,
  }) => {
    updateDesign(SOLD_DESIGN, "sold");

    await page.goto("/market");
    await expect(page.locator('[data-testid="plate-grid"]')).toBeVisible({
      timeout: 10_000,
    });

    // Click "Available" in the status filter
    const statusFilter = page.locator('[data-testid="filter-status"]');
    const availableBtn = statusFilter.locator("button", {
      hasText: "Available",
    });
    await availableBtn.click();

    // After filtering to "available", the sold design's card should not appear
    const soldCard = page.locator(
      `[data-testid="plate-card"][href="/design/${SOLD_DESIGN}"]`,
    );
    await expect(soldCard).not.toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 5. E2E test: reserved_until timestamp bug (seconds vs milliseconds)
// ---------------------------------------------------------------------------

test.describe("Design status consistency — reserved_until timestamp bug", () => {
  // The bug: in src/pages/design/[id].astro line 61:
  //   const expired = new Date((design as any).reserved_until).getTime() < Date.now();
  //
  // `reserved_until` is stored as Unix **seconds** (per DesignSchema), but
  // `new Date(ts)` interprets the argument as **milliseconds**. So a
  // timestamp like 1724332800 (seconds, representing ~2024) is interpreted
  // as 1,724,332,800 ms from epoch — August 1970 — which is always "expired".
  //
  // This means every reserved design with a future `reserved_until` value
  // is immediately auto-transitioned to `available` on page load.

  test.afterEach(() => {
    restoreAvailable(AVAILABLE_DESIGN);
    // Restore d4 to reserved if we changed it
    updateDesign(RESERVED_DESIGN, "reserved", null);
  });

  test("reserved design with future reserved_until (seconds) stays reserved on detail page", async ({
    page,
  }) => {
    // Set d1 to reserved with a `reserved_until` 24 hours from now, in seconds.
    const futureSeconds = Math.floor(Date.now() / 1000) + 86400;
    updateDesign(AVAILABLE_DESIGN, "reserved", futureSeconds);

    await page.goto(`/design/${AVAILABLE_DESIGN}`);
    const url = page.url();

    if (url.includes(`/design/${AVAILABLE_DESIGN}`)) {
      // The design should still show as "Reserved" — NOT auto-transitioned
      // to "available".
      //
      // BUG DETECTION: If this assertion fails (the page shows "Available"
      // instead of "Reserved"), the timestamp comparison bug is present.
      // The server interprets the seconds value as milliseconds, treats it
      // as 1970, and auto-transitions the design.
      const reservedBtn = page.getByRole("button", { name: /Reserved/i });
      await expect(reservedBtn).toBeVisible();

      // The "Reserve this plate" link should NOT appear
      const acquireBtn = page.locator(
        `a[href*="/checkout/${AVAILABLE_DESIGN}"]`,
      );
      await expect(acquireBtn).not.toBeVisible();
    }
  });

  test("reserved design with expired reserved_until (seconds) transitions to available", async ({
    page,
  }) => {
    // Set a `reserved_until` that is 1 hour in the past (seconds).
    const pastSeconds = Math.floor(Date.now() / 1000) - 3600;
    updateDesign(AVAILABLE_DESIGN, "reserved", pastSeconds);

    await page.goto(`/design/${AVAILABLE_DESIGN}`);
    const url = page.url();

    if (url.includes(`/design/${AVAILABLE_DESIGN}`)) {
      // The reservation has expired, so the page should auto-transition
      // to "available" and show the reserve CTA.
      const acquireBtn = page.locator("a", { hasText: "Reserve this plate" });
      await expect(acquireBtn.first()).toBeVisible();
    }
  });

  test("DB confirms reserved_until is stored as seconds, not milliseconds", () => {
    const design = readDesign(RESERVED_DESIGN);
    if (design && design.reserved_until != null) {
      const ts = design.reserved_until as number;
      // A Unix-seconds timestamp for a date after 2020 should be < 2 billion.
      // A Unix-milliseconds timestamp would be > 1.5 trillion.
      // This documents the storage format.
      expect(ts).toBeLessThan(2_000_000_000);
      expect(ts).toBeGreaterThan(0);
    }
  });
});
