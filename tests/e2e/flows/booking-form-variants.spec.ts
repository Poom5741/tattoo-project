/**
 * Booking form variants (plate vs custom consultation) — end-to-end user flow.
 *
 * Drives the booking form's two-mode toggle: submit a plate booking,
 * reset, switch to custom, submit a custom consultation. Asserts the
 * D1 booking_inquiries table has both rows with the right shape.
 *
 * This is the booking-form-only flow. The market -> design -> booking
 * navigation is F1's concern (#73); this spec assumes the user is
 * already on /booking.
 *
 * Covers closed issue:
 *   #11 (Bone & Blood: Booking Page Migration) - the deeper
 *        plate-vs-consultation flow.
 *
 * Prerequisite: `pnpm db:seed:dev` must have run so the dev D1 has
 * the booking_inquiries table.
 *
 * Env: real Playwright UI spec. On this dev box the chromium binary
 * cannot find its system libraries (see #67). Runs on a working
 * env or in CI (#70).
 */

import { test, expect, type Page } from "@playwright/test";
import { DatabaseSync } from "node:sqlite";
import { readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";

/** Locate all local wrangler D1 files. Same logic as the seed script. */
function findD1Paths(): string[] {
  const d1Dir = ".wrangler/state/v3/d1/miniflare-D1DatabaseObject";
  if (!existsSync(d1Dir)) return [];
  const files = readdirSync(d1Dir)
    .filter((f: string) => f.endsWith(".sqlite") && !f.endsWith("-wal") && !f.endsWith("-shm"))
    .map((f: string) => ({ f, mtime: statSync(join(d1Dir, f)).mtimeMs }))
    .sort((a, b) => b.mtime - a.mtime);
  return files.map((f: { f: string }) => join(d1Dir, f.f));
}

interface BookingRow {
  id: string;
  artist_id: string;
  design_id: string | null;
  name: string;
  contact: string;
  message: string | null;
  booking_type: string | null;
  custom_style: string | null;
  custom_size: string | null;
  custom_placement: string | null;
  custom_budget: string | null;
}

function readBookingsForContact(contact: string): BookingRow[] {
  const dbPaths = findD1Paths();
  const allRows: BookingRow[] = [];
  for (const dbPath of dbPaths) {
    const con = new DatabaseSync(dbPath, { readOnly: true });
    try {
      const rows = con
        .prepare(
          `SELECT id, artist_id, design_id, name, contact, message, booking_type,
                  custom_style, custom_size, custom_placement, custom_budget
           FROM booking_inquiries
           WHERE contact = ?`,
        )
        .all(contact) as unknown as BookingRow[];
      allRows.push(...rows);
    } catch {
      // ignore
    } finally {
      con.close();
    }
  }
  return allRows;
}

/** Remove test rows so the spec is repeatable. */
function cleanTestRows(names: string[]): void {
  const dbPaths = findD1Paths();
  for (const dbPath of dbPaths) {
    const con = new DatabaseSync(dbPath);
    try {
      for (const n of names) {
        con
          .prepare("DELETE FROM booking_inquiries WHERE name = ? OR contact = ?")
          .run(n, n);
      }
    } catch {
      // ignore
    } finally {
      con.close();
    }
  }
}

/** Wait for the React BookingForm to hydrate by checking the artist select. */
async function waitForForm(page: Page): Promise<void> {
  await page.waitForSelector("#bf-artist", { timeout: 10_000 });
}

test.describe("Booking form variants - end-to-end user flow", () => {
  const PLATE_NAME = "Plate Variant Buyer";
  const PLATE_CONTACT = "plate-variant@example.com";
  const CUSTOM_NAME = "Custom Variant Buyer";
  const CUSTOM_CONTACT = "custom-variant@example.com";

  test.beforeEach(() => {
    // Clean any leftover rows from a prior run. The names are unique
    // to this spec (F1 uses 'Smoke Buyer').
    cleanTestRows([PLATE_NAME, PLATE_CONTACT, CUSTOM_NAME, CUSTOM_CONTACT]);
  });

  test("plate mode -> submit -> reset -> custom mode -> submit -> 2 D1 rows", async ({ page }) => {
    const dbPaths = findD1Paths();
    if (dbPaths.length === 0) {
      test.skip(
        true,
        "Local D1 not found. Run `pnpm dev` once and then `pnpm db:seed:dev`.",
      );
    }

    // 1. Land on /booking.
    await page.goto("/booking");
    await waitForForm(page);

    // 2. Assert: default mode is "plate" - the designId select is
    //    visible, the custom fields are not.
    await expect(page.locator("#bf-design")).toBeVisible();
    await expect(page.locator("#bf-style")).toHaveCount(0);
    await expect(page.locator("#bf-size")).toHaveCount(0);
    await expect(page.locator("#bf-placement")).toHaveCount(0);
    await expect(page.locator("#bf-budget")).toHaveCount(0);

    // 3. Fill the plate form. The default artist is artists[0] = 'mara'.
    await page.selectOption("#bf-design", "d1");
    await page.fill("#bf-name", PLATE_NAME);
    await page.fill("#bf-contact", PLATE_CONTACT);
    await page.fill("#bf-message", "plate variant smoke");
    // Submit. Button text is "Send booking request" in plate mode.
    const plateSubmit = page.locator('button[type="submit"]', {
      hasText: /Send booking request/,
    });
    await expect(plateSubmit).toBeVisible();
    await plateSubmit.click();
    // 4. Success state visible.
    await expect(page.locator("text=Request sent").first()).toBeVisible({ timeout: 10_000 });
    await expect(
      page.locator("button", { hasText: /Send another request/ }),
    ).toBeVisible();

    // 5. Click "Send another request" -> form re-renders in plate mode.
    await page.locator("button", { hasText: /Send another request/ }).click();
    await waitForForm(page);
    // Plate mode by default after reset.
    await expect(page.locator("#bf-design")).toBeVisible();

    // 6. Click the "Custom consultation" toggle button.
    const customToggle = page.locator("button", { hasText: /Custom consultation/ }).first();
    await expect(customToggle).toBeVisible();
    await customToggle.click();

    // 7. Assert: designId select is NOT visible, custom fields ARE visible.
    await expect(page.locator("#bf-design")).toHaveCount(0);
    await expect(page.locator("#bf-style")).toBeVisible();
    await expect(page.locator("#bf-size")).toBeVisible();
    await expect(page.locator("#bf-placement")).toBeVisible();
    await expect(page.locator("#bf-budget")).toBeVisible();

    // 8. Fill the custom form. The artist defaults to 'mara' from the
    //    previous state. We can leave it or re-select; leaving as is.
    await page.selectOption("#bf-style", "Fine Line");
    await page.selectOption("#bf-size", "medium");
    await page.fill("#bf-placement", "left forearm");
    await page.selectOption("#bf-budget", "฿5,000–10,000");
    await page.fill("#bf-name", CUSTOM_NAME);
    await page.fill("#bf-contact", CUSTOM_CONTACT);
    await page.fill("#bf-message", "custom variant smoke");
    // Submit. Button text is "Request consultation" in custom mode.
    const customSubmit = page.locator('button[type="submit"]', {
      hasText: /Request consultation/,
    });
    await expect(customSubmit).toBeVisible();
    await customSubmit.click();
    // 9. Success state visible.
    await expect(page.locator("text=Request sent").first()).toBeVisible({ timeout: 10_000 });

    // 10. D1 assertion: 2 rows total, one per contact.
    const plateRows = readBookingsForContact(PLATE_CONTACT);
    const customRows = readBookingsForContact(CUSTOM_CONTACT);
    expect(plateRows).toHaveLength(1);
    expect(customRows).toHaveLength(1);

    // 11. The plate row has booking_type='plate' and design_id='d1'.
    const plateRow = plateRows[0]!;
    expect(plateRow.booking_type).toBe("plate");
    expect(plateRow.design_id).toBe("d1");
    expect(plateRow.name).toBe(PLATE_NAME);
    expect(plateRow.contact).toBe(PLATE_CONTACT);
    expect(plateRow.message).toBe("plate variant smoke");
    // The custom fields should be NULL for the plate row.
    expect(plateRow.custom_style).toBeNull();
    expect(plateRow.custom_size).toBeNull();
    expect(plateRow.custom_placement).toBeNull();
    expect(plateRow.custom_budget).toBeNull();

    // 12. The custom row has booking_type='custom' and the right custom fields.
    const customRow = customRows[0]!;
    expect(customRow.booking_type).toBe("custom");
    expect(customRow.name).toBe(CUSTOM_NAME);
    expect(customRow.contact).toBe(CUSTOM_CONTACT);
    expect(customRow.message).toBe("custom variant smoke");
    // The custom fields are populated.
    expect(customRow.custom_style).toBe("Fine Line");
    expect(customRow.custom_size).toBe("medium");
    expect(customRow.custom_placement).toBe("left forearm");
    expect(customRow.custom_budget).toBe("฿5,000–10,000");
    // design_id is NULL for the custom row.
    expect(customRow.design_id).toBeNull();
  });
});
