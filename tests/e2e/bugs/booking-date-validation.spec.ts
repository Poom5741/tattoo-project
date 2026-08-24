/**
 * Bug test: Booking appointment date validation
 *
 * BUG DESCRIPTION:
 * The booking accept API (PUT /api/bookings/[id]/accept) validates
 * `appointmentDate` with `z.number().int().positive()` but NEVER checks
 * that the date is in the future. This means an artist can accept a
 * booking with an appointment date in the past (e.g., a timestamp from
 * 2020), which is invalid business logic.
 *
 * The AcceptSchema in src/pages/api/bookings/[id]/accept.ts:
 *   const AcceptSchema = z.object({
 *     appointmentDate: z.number().int().positive(),
 *   });
 *
 * A past Unix timestamp (e.g., 1577836800 = Jan 1, 2020) passes this
 * validation because it IS a positive integer. The schema lacks a
 * `.refine()` or `.superRefine()` to check `value > Date.now() / 1000`.
 *
 * CORRECT BEHAVIOR (expected after fix):
 * - Past timestamps should return 400 "Validation failed"
 * - Today's timestamp (edge case) should return 400
 * - Future timestamps should return 200
 *
 * CURRENT BROKEN BEHAVIOR:
 * - Past timestamps return 200 and are stored in the database
 * - This test suite documents both the bug and the expected fix
 *
 * Coverage:
 *   - API: PUT /api/bookings/[id]/accept with past/future appointmentDate
 *   - E2E: Booking form has no date picker (users cannot select dates)
 *   - Schema: Static check that AcceptSchema lacks a future-date guard
 *
 * Prerequisite: `pnpm db:seed:dev` must have run so D1 is available.
 * Run: pnpm test:e2e -- tests/e2e/bugs/booking-date-validation.spec.ts
 */

import { test, expect, type APIRequestContext } from "@playwright/test";
import { DatabaseSync } from "node:sqlite";
import { readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Locate all local wrangler D1 SQLite files. */
function findD1Paths(): string[] {
  const d1Dir = ".wrangler/state/v3/d1/miniflare-D1DatabaseObject";
  if (!existsSync(d1Dir)) return [];
  return readdirSync(d1Dir)
    .filter(
      (f: string) =>
        f.endsWith(".sqlite") && !f.endsWith("-wal") && !f.endsWith("-shm"),
    )
    .map((f: string) => ({
      f,
      mtime: statSync(join(d1Dir, f)).mtimeMs,
    }))
    .sort((a, b) => b.mtime - a.mtime)
    .map(({ f }) => join(d1Dir, f));
}

/**
 * Insert a booking_inquiries row into D1 and return its id.
 * Only writes to the hash-named D1 file (the one the dev server uses),
 * not dev.sqlite which is created by the seed script.
 */
function createTestBooking(
  dbPaths: string[],
  artistId: string,
  name: string,
  contact: string,
): number {
  // Prefer the hash-named file (the main D1 used by the dev server)
  const hashFile = dbPaths.find((p) => !p.endsWith("/dev.sqlite"));
  const target = hashFile ?? dbPaths[0];
  if (!target) return -1;

  const con = new DatabaseSync(target);
  try {
    const info = con
      .prepare(
        `INSERT INTO booking_inquiries (artist_id, name, contact, status)
         VALUES (?, ?, ?, 'pending')`,
      )
      .run(artistId, name, contact);
    return Number((info as { lastInsertRowid: bigint }).lastInsertRowid);
  } catch (err) {
    console.error("createTestBooking failed:", err);
    return -1;
  } finally {
    con.close();
  }
}

/** Read a single booking row by id from the hash-named D1 file. */
function readBooking(
  dbPaths: string[],
  bookingId: number,
): { status: string | null; appointment_date: number | null } | null {
  const hashFile = dbPaths.find((p) => !p.endsWith("/dev.sqlite"));
  const target = hashFile ?? dbPaths[0];
  if (!target) return null;

  const con = new DatabaseSync(target, { readOnly: true });
  try {
    const row = con
      .prepare(
        "SELECT status, appointment_date FROM booking_inquiries WHERE id = ?",
      )
      .get(bookingId) as
      | { status: string | null; appointment_date: number | null }
      | undefined;
    return row ?? null;
  } catch {
    return null;
  } finally {
    con.close();
  }
}

/** Delete test booking rows by id from all D1 files. */
function cleanTestBooking(dbPaths: string[], bookingId: number): void {
  for (const p of dbPaths) {
    const con = new DatabaseSync(p);
    try {
      con
        .prepare("DELETE FROM booking_inquiries WHERE id = ?")
        .run(bookingId);
    } catch {
      // ignore
    } finally {
      con.close();
    }
  }
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const NOW_SECONDS = Math.floor(Date.now() / 1000);
const ONE_DAY = 86400;

/** Timestamp from the year 2020 — clearly in the past. */
const PAST_TIMESTAMP = 1577836800; // 2020-01-01T00:00:00Z

/** Yesterday — also in the past. */
const YESTERDAY = NOW_SECONDS - ONE_DAY;

/** Right now minus 1 second — edge case, still in the past. */
const ALMOST_NOW = NOW_SECONDS - 1;

/** Tomorrow — in the future. */
const TOMORROW = NOW_SECONDS + ONE_DAY;

/** One week from now — safely in the future. */
const NEXT_WEEK = NOW_SECONDS + 7 * ONE_DAY;

/** 30 minutes from now — less than the required 1-hour minimum. */
const THIRTY_MIN_FROM_NOW = NOW_SECONDS + 1800;

/** 3 years from now — exceeds the 2-year maximum. */
const THREE_YEARS_FROM_NOW = NOW_SECONDS + 3 * 365 * 24 * 60 * 60;

/** 1 year from now — safely within the 2-year maximum. */
const ONE_YEAR_FROM_NOW = NOW_SECONDS + 365 * 24 * 60 * 60;

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

test.describe("Bug: booking accept API accepts past appointment dates", () => {
  const createdBookingIds: number[] = [];
  let dbPaths: string[] = [];
  let artistRequest: APIRequestContext;

  test.beforeAll(async ({ playwright }) => {
    dbPaths = findD1Paths();
    if (dbPaths.length === 0) {
      test.skip(
        true,
        "Local D1 not found. Run `pnpm dev` once and then `pnpm db:seed:dev`.",
      );
    }

    // Create a request context with dev_role=artist cookie.
    // The getArtistSession function in src/lib/artist/auth.ts checks for
    // dev_role=artist cookie and returns artistId='mara' in dev mode.
    artistRequest = await playwright.request.newContext({
      baseURL: "http://localhost:4321",
      extraHTTPHeaders: {
        Cookie: "dev_role=artist",
      },
    });
  });

  test.afterAll(async () => {
    await artistRequest?.dispose();
  });

  test.afterEach(() => {
    // Clean up all bookings created during the test
    for (const id of createdBookingIds) {
      cleanTestBooking(dbPaths, id);
    }
    createdBookingIds.length = 0;
  });

  test("POST creates a pending booking for artist 'mara'", () => {
    const bookingId = createTestBooking(
      dbPaths,
      "mara",
      "Bug Tester",
      "bug@test.com",
    );
    createdBookingIds.push(bookingId);
    expect(bookingId).toBeGreaterThan(0);

    const booking = readBooking(dbPaths, bookingId);
    expect(booking).not.toBeNull();
    expect(booking!.status).toBe("pending");
  });

  test("BUG: accept endpoint accepts a timestamp from 2020 (should reject)", async () => {
    // Arrange: create a pending booking for 'mara'
    const bookingId = createTestBooking(
      dbPaths,
      "mara",
      "Past Date Tester",
      "past@test.com",
    );
    createdBookingIds.push(bookingId);
    expect(bookingId).toBeGreaterThan(0);

    // Act: artist accepts with a past appointment date (Jan 1, 2020)
    const res = await artistRequest.put(`/api/bookings/${bookingId}/accept`, {
      data: { appointmentDate: PAST_TIMESTAMP },
    });

    // Assert: The API SHOULD return 400 (past date rejected)
    // BUG: The API currently returns 200 because AcceptSchema only checks
    // z.number().int().positive() and a 2019 timestamp IS a positive int.
    //
    // This test documents the CORRECT expected behavior. When the bug is
    // fixed, this assertion will pass. Currently it fails, proving the bug.
    expect(
      res.status(),
      `Expected 400 for past date ${PAST_TIMESTAMP}, got ${res.status()} — BUG: accept endpoint allows past dates`,
    ).toBe(400);
  });

  test("BUG: accept endpoint accepts yesterday's timestamp (should reject)", async () => {
    const bookingId = createTestBooking(
      dbPaths,
      "mara",
      "Yesterday Tester",
      "yesterday@test.com",
    );
    createdBookingIds.push(bookingId);
    expect(bookingId).toBeGreaterThan(0);

    const res = await artistRequest.put(`/api/bookings/${bookingId}/accept`, {
      data: { appointmentDate: YESTERDAY },
    });

    expect(
      res.status(),
      `Expected 400 for yesterday timestamp ${YESTERDAY}, got ${res.status()} — BUG: accept endpoint allows past dates`,
    ).toBe(400);
  });

  test("BUG: accept endpoint accepts timestamp from 1 second ago (should reject)", async () => {
    const bookingId = createTestBooking(
      dbPaths,
      "mara",
      "Edge Case Tester",
      "edge@test.com",
    );
    createdBookingIds.push(bookingId);
    expect(bookingId).toBeGreaterThan(0);

    const res = await artistRequest.put(`/api/bookings/${bookingId}/accept`, {
      data: { appointmentDate: ALMOST_NOW },
    });

    expect(
      res.status(),
      `Expected 400 for near-past timestamp ${ALMOST_NOW}, got ${res.status()} — BUG: accept endpoint allows past dates`,
    ).toBe(400);
  });

  test("accept endpoint accepts a future timestamp (correct behavior)", async () => {
    const bookingId = createTestBooking(
      dbPaths,
      "mara",
      "Future Tester",
      "future@test.com",
    );
    createdBookingIds.push(bookingId);
    expect(bookingId).toBeGreaterThan(0);

    const res = await artistRequest.put(`/api/bookings/${bookingId}/accept`, {
      data: { appointmentDate: TOMORROW },
    });

    // Future date should be accepted with 200
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("accepted");
    expect(body.appointmentDate).toBe(TOMORROW);
  });

  test("accept endpoint accepts a date one week from now", async () => {
    const bookingId = createTestBooking(
      dbPaths,
      "mara",
      "Next Week Tester",
      "nextweek@test.com",
    );
    createdBookingIds.push(bookingId);
    expect(bookingId).toBeGreaterThan(0);

    const res = await artistRequest.put(`/api/bookings/${bookingId}/accept`, {
      data: { appointmentDate: NEXT_WEEK },
    });

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.appointmentDate).toBe(NEXT_WEEK);
  });

  test("rejects appointment date less than 1 hour in the future", async () => {
    const bookingId = createTestBooking(
      dbPaths,
      "mara",
      "Too Soon Tester",
      "toosoon@test.com",
    );
    createdBookingIds.push(bookingId);
    expect(bookingId).toBeGreaterThan(0);

    const res = await artistRequest.put(`/api/bookings/${bookingId}/accept`, {
      data: { appointmentDate: THIRTY_MIN_FROM_NOW },
    });

    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Validation failed");
  });

  test("rejects appointment date more than 2 years in the future", async () => {
    const bookingId = createTestBooking(
      dbPaths,
      "mara",
      "Too Far Tester",
      "toofar@test.com",
    );
    createdBookingIds.push(bookingId);
    expect(bookingId).toBeGreaterThan(0);

    const res = await artistRequest.put(`/api/bookings/${bookingId}/accept`, {
      data: { appointmentDate: THREE_YEARS_FROM_NOW },
    });

    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Validation failed");
  });

  test("accepts appointment date 1 year in the future (within 2-year max)", async () => {
    const bookingId = createTestBooking(
      dbPaths,
      "mara",
      "One Year Tester",
      "oneyear@test.com",
    );
    createdBookingIds.push(bookingId);
    expect(bookingId).toBeGreaterThan(0);

    const res = await artistRequest.put(`/api/bookings/${bookingId}/accept`, {
      data: { appointmentDate: ONE_YEAR_FROM_NOW },
    });

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("accepted");
    expect(body.appointmentDate).toBe(ONE_YEAR_FROM_NOW);
  });

  test("past date is rejected and NOT written to D1 database", async () => {
    // Verifies that the server-side guard prevents past dates from being
    // persisted. The API must return 400 and the DB row must remain untouched.
    const bookingId = createTestBooking(
      dbPaths,
      "mara",
      "DB Verify Tester",
      "dbverify@test.com",
    );
    createdBookingIds.push(bookingId);
    expect(bookingId).toBeGreaterThan(0);

    // Read the booking before accepting — appointment_date should be NULL
    const before = readBooking(dbPaths, bookingId);
    expect(before).not.toBeNull();
    expect(before!.appointment_date).toBeNull();

    // Attempt to accept with a past date
    const res = await artistRequest.put(`/api/bookings/${bookingId}/accept`, {
      data: { appointmentDate: PAST_TIMESTAMP },
    });

    // The API must reject the past date with 400
    expect(
      res.status(),
      `Expected 400 for past date ${PAST_TIMESTAMP}, got ${res.status()}`,
    ).toBe(400);

    // The DB row must remain untouched: appointment_date still NULL
    const after = readBooking(dbPaths, bookingId);
    expect(after).not.toBeNull();
    expect(after!.status).toBe("pending");
    expect(after!.appointment_date).toBeNull();
  });

  test("rejects non-numeric appointmentDate", async () => {
    const bookingId = createTestBooking(
      dbPaths,
      "mara",
      "Invalid Type Tester",
      "invalidtype@test.com",
    );
    createdBookingIds.push(bookingId);
    expect(bookingId).toBeGreaterThan(0);

    const res = await artistRequest.put(`/api/bookings/${bookingId}/accept`, {
      data: { appointmentDate: "not-a-number" },
    });

    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Validation failed");
  });

  test("rejects negative appointmentDate", async () => {
    const bookingId = createTestBooking(
      dbPaths,
      "mara",
      "Negative Tester",
      "negative@test.com",
    );
    createdBookingIds.push(bookingId);
    expect(bookingId).toBeGreaterThan(0);

    const res = await artistRequest.put(`/api/bookings/${bookingId}/accept`, {
      data: { appointmentDate: -1000 },
    });

    expect(res.status()).toBe(400);
  });

  test("rejects zero appointmentDate", async () => {
    const bookingId = createTestBooking(
      dbPaths,
      "mara",
      "Zero Tester",
      "zero@test.com",
    );
    createdBookingIds.push(bookingId);
    expect(bookingId).toBeGreaterThan(0);

    const res = await artistRequest.put(`/api/bookings/${bookingId}/accept`, {
      data: { appointmentDate: 0 },
    });

    expect(res.status()).toBe(400);
  });

  test("rejects floating point appointmentDate", async () => {
    const bookingId = createTestBooking(
      dbPaths,
      "mara",
      "Float Tester",
      "float@test.com",
    );
    createdBookingIds.push(bookingId);
    expect(bookingId).toBeGreaterThan(0);

    const res = await artistRequest.put(`/api/bookings/${bookingId}/accept`, {
      data: { appointmentDate: 1700000000.5 },
    });

    expect(res.status()).toBe(400);
  });

  test("rejects missing appointmentDate field", async () => {
    const bookingId = createTestBooking(
      dbPaths,
      "mara",
      "Missing Field Tester",
      "missingfield@test.com",
    );
    createdBookingIds.push(bookingId);
    expect(bookingId).toBeGreaterThan(0);

    const res = await artistRequest.put(`/api/bookings/${bookingId}/accept`, {
      data: {},
    });

    expect(res.status()).toBe(400);
  });

  test("returns 404 for non-existent booking", async () => {
    const res = await artistRequest.put("/api/bookings/999999/accept", {
      data: { appointmentDate: TOMORROW },
    });

    expect(res.status()).toBe(404);
  });

  test("returns 401 when not authenticated", async ({ request }) => {
    const bookingId = createTestBooking(
      dbPaths,
      "mara",
      "Unauth Tester",
      "unauth@test.com",
    );
    createdBookingIds.push(bookingId);
    expect(bookingId).toBeGreaterThan(0);

    // Use bare request without dev_role cookie
    const res = await request.put(`/api/bookings/${bookingId}/accept`, {
      data: { appointmentDate: TOMORROW },
    });

    expect(res.status()).toBe(401);
  });
});

// ---------------------------------------------------------------------------
// E2E: Booking form date input validation
// ---------------------------------------------------------------------------

test.describe("Bug: booking form has no date picker or min-date guard", () => {
  test("booking form has no date input field at all", async ({ page }) => {
    // The booking form (/booking) does not include a date picker for the
    // user. The appointment date is set only by the artist via the accept
    // API. This means:
    //   1. Users CANNOT select past dates in the form (no input exists)
    //   2. BUT the API accepts past dates, which is the real bug
    //
    // This test verifies that there is no <input type="date"> in the
    // booking form. If one is added in the future, it MUST have a `min`
    // attribute set to today's date to prevent past-date selection.

    await page.goto("/booking");

    // Wait for the React form to hydrate
    await page.waitForSelector("form", { timeout: 10_000 });

    // Check: no date input exists in the form
    const dateInputs = page.locator("form input[type='date']");
    const count = await dateInputs.count();

    if (count === 0) {
      // Good: no date picker — users can't select dates at all.
      // The past-date bug is purely server-side (accept API).
      expect(count).toBe(0);
    } else {
      // If a date input exists, verify it has a min attribute set to today
      const firstDateInput = dateInputs.first();
      const minAttr = await firstDateInput.getAttribute("min");

      if (!minAttr) {
        // BUG: Date input exists without a min attribute — users can
        // select past dates in the UI as well as the API.
        expect(
          minAttr,
          "Date input exists but has no min attribute — users can select past dates",
        ).toBeTruthy();
      } else {
        // min attribute present — verify it's today or later
        const minDate = new Date(minAttr);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        expect(minDate.getTime()).toBeGreaterThanOrEqual(today.getTime());
      }
    }
  });
});

// ---------------------------------------------------------------------------
// Schema-level validation: AcceptSchema definition
// ---------------------------------------------------------------------------

test.describe("AcceptSchema contract: appointmentDate validation rules", () => {
  test("AcceptSchema enforces future-date guard via superRefine", async () => {
    // Verifies the shared AcceptSchema in schemas.ts has proper validation:
    // - z.number().int().positive() as the base
    // - .superRefine() for future-date and max-date checks
    // - Static error messages (no leaked timestamps)

    const { readFileSync } = await import("node:fs");
    const schemasSource = readFileSync(
      "src/lib/api/schemas.ts",
      "utf-8",
    );

    // The schema should be defined and exported
    expect(schemasSource).toContain("export const AcceptSchema");
    expect(schemasSource).toContain("appointmentDate");

    // Must have a future-date guard
    const hasSuperRefine = schemasSource.includes(".superRefine(");
    expect(
      hasSuperRefine,
      "AcceptSchema must use .superRefine() for future-date validation",
    ).toBe(true);

    // Error messages must be static (no interpolated timestamps)
    expect(schemasSource).not.toMatch(/>=\s*\$\{/);
    expect(schemasSource).not.toMatch(/<=\s*\$\{/);
  });
});
