/**
 * Buyer checks out (paid flow) — end-to-end user flow.
 *
 * Drives the multi-page journey a real buyer takes to *initiate* a
 * payment for a plate: home -> market -> design -> checkout -> click
 * Pay. The ChillPay sandbox redirect (step 7) is the boundary of
 * this spec; the webhook roundtrip is a separate flow.
 *
 * The buyer's actual path (after reading src/components/CheckoutFlow.tsx
 * and src/pages/api/chillpay/create-order.ts) is:
 *   1. /market
 *   2. Click plate card -> /design/d1
 *   3. Click "Acquire Plate" -> /checkout/d1
 *   4. Wait for the React CheckoutFlow to hydrate
 *   5. Verify the design summary shows d1's title and the price
 *   6. Fill email, click Pay
 *   7. POST /api/chillpay/create-order
 *   8. Server: 503 "Payment gateway not yet configured" if CHILLPAY_*
 *      are placeholders (the dev-env case), OR 200 with paymentUrl
 *      (the real-ChillPay case)
 *   9. Browser either shows the error inline, or redirects to
 *      ChillPay's paymentUrl
 *
 * Note: this spec is end-to-end on the buyer side, but it does NOT
 * drive the ChillPay sandbox (the redirect in step 9) or the webhook
 * roundtrip (ChillPay -> /api/chillpay/webhook -> design sold). Those
 * are server-to-server flows; the webhook is its own test surface.
 *
 * Covers closed issues:
 *   #12 (Bone & Blood: Checkout Page Migration) - the full checkout
 *        flow, not just the page.
 *
 * Prerequisite: `pnpm db:seed:dev` must have run so d1 is `available`.
 * Without it, the design page redirects to /market (existing
 * checkout.spec.ts documents that case).
 *
 * Env: this spec is a real Playwright UI spec. On this dev box the
 * chromium binary cannot find its system libraries (see #67). The
 * spec is runnable in a working env or in CI (#70).
 */

import { test, expect, type APIRequestContext } from "@playwright/test";
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

interface DesignRow {
  id: string;
  status: string;
  reserved_until: string | null;
}

interface TransactionRow {
  id: string;
  order_no: string;
  design_id: string;
  amount: number;
  status: string;
  channel_code: string | null;
  customer_email: string | null;
}

function readDesign(id: string): DesignRow | null {
  const dbPaths = findD1Paths();
  for (const dbPath of dbPaths) {
    const con = new DatabaseSync(dbPath, { readOnly: true });
    try {
      const row = con
        .prepare("SELECT id, status, reserved_until FROM designs WHERE id = ?")
        .get(id) as unknown as DesignRow | undefined ?? null;
      if (row) return row;
    } catch {
      // ignore
    } finally {
      con.close();
    }
  }
  return null;
}

function readTransactionsForDesign(designId: string): TransactionRow[] {
  const dbPaths = findD1Paths();
  const allTxns: TransactionRow[] = [];
  for (const dbPath of dbPaths) {
    const con = new DatabaseSync(dbPath, { readOnly: true });
    try {
      const txns = con
        .prepare(
          "SELECT id, order_no, design_id, amount, status, channel_code, customer_email FROM chillpay_transactions WHERE design_id = ?",
        )
        .all(designId) as unknown as TransactionRow[];
      allTxns.push(...txns);
    } catch {
      // ignore
    } finally {
      con.close();
    }
  }
  return allTxns;
}

/**
 * Reset d1 back to 'available' so re-runs of this spec, and re-runs of
 * the F1 spec (which depends on d1 being available), are not broken.
 * The reset runs in a beforeEach/afterEach wrapper because the spec
 * might leave d1 in 'reserved' state if the 200 path was taken.
 */
async function resetD1(): Promise<void> {
  const dbPaths = findD1Paths();
  for (const dbPath of dbPaths) {
    const con = new DatabaseSync(dbPath);
    try {
      con.exec("BEGIN");
      con
        .prepare("INSERT OR IGNORE INTO artists (id, name, handle, city, style, years, booked, rate, bio, pieces, rating, seed) VALUES ('mara', 'Mara Vael', '@maravael', 'Berlin, DE', 'Fine Line · Blackwork', 9, 'Booking Aug 2026', 180, 'Bio', 41, '4.98', 11)")
        .run();
      con
        .prepare("INSERT OR IGNORE INTO designs (id, n, title, artist_id, style, price, price_usd, status, placement, seed, token, minted, medium, sessions, drawn, token_id) VALUES ('d1', '001', 'Serpent in Negative', 'mara', 'Fine Line', 1.2, 2976, 'available', 'Forearm · 16cm', 11, '0x7d852e…6d01ee', '2026-01-01', 'Single needle', 1, 14, 1)")
        .run();
      con
        .prepare("UPDATE designs SET status = 'available', reserved_until = NULL WHERE id = 'd1'")
        .run();
      con
        .prepare("DELETE FROM chillpay_transactions WHERE design_id = 'd1'")
        .run();
      con.exec("COMMIT");
    } catch {
      con.exec("ROLLBACK");
    } finally {
      con.close();
    }
  }
}

test.describe("Buyer checks out (paid flow) - end-to-end user flow", () => {
  test.beforeEach(async () => {
    // Make sure d1 starts as 'available' so the test is repeatable.
    await resetD1();
  });

  test.afterAll(async () => {
    // Same hygiene at the end of the run, regardless of which path
    // was taken.
    await resetD1();
  });

  test("home -> market -> design d1 -> checkout -> click Pay", async ({ page }) => {
    // 1. Land on home.
    await page.goto("/");
    await expect(page).toHaveTitle(/SAKNID/);

    // 2. Navigate to /market via the nav link.
    const marketLink = page.locator("header nav a[href='/market']").first();
    await marketLink.click();
    await page.waitForURL("**/market");
    await expect(page).toHaveURL(/\/market$/);

    // 3. Click the d1 plate card -> /design/d1.
    await resetD1();
    const d1Card = page.locator('[data-testid="plate-card"]', { hasText: /Serpent in Negative/ });
    await expect(d1Card).toBeVisible();
    await d1Card.click();
    await page.waitForURL("**/design/d1");
    await expect(page).toHaveURL(/\/design\/d1$/);

    // 4. Click "Acquire Plate" CTA -> /checkout/d1.
    const cta = page.locator('a[href="/checkout/d1"]').first();
    await expect(cta).toBeVisible();
    await Promise.all([
      page.waitForURL("**/checkout/d1"),
      cta.click(),
    ]);
    await expect(page).toHaveURL(/\/checkout\/d1$/);

    // 5. Wait for the React CheckoutFlow to hydrate. The component
    //    renders the channel options as buttons with text like
    //    "QR PromptPay" and "Credit/Debit Card".
    await expect(
      page.locator("button", { hasText: "QR PromptPay" }).first(),
    ).toBeVisible({ timeout: 10_000 });

    // 6. Verify the design summary shows d1's title.
    await expect(page.locator("h3", { hasText: "Serpent in Negative" })).toBeVisible();

    // 7. Verify the price displays (it has the THB currency symbol
    //    and a numeric value).
    const priceText = await page.locator("body").innerText();
    expect(priceText).toMatch(/฿/);

    // 8. Fill the email. No id attribute on the input; use the
    //    placeholder.
    const emailInput = page.locator('input[type="email"]').first();
    await emailInput.fill("buyer-smoke@example.com");

    // 9. The "I understand" checkbox is default-checked; just assert
    //    it's still checked. The form sends whether=true regardless.
    const checkbox = page.locator('input[type="checkbox"]').first();
    await expect(checkbox).toBeChecked();

    // 10. Click the Pay button. The text is "Pay ฿X.XX".
    // Intercept the create-order call so we can branch on the
    // response without losing the page navigation context.
    const payButton = page.locator("button", { hasText: /Pay ฿/ }).first();
    await expect(payButton).toBeVisible();
    // Don't click yet - we want to set up the route listener first.
    // Use the page.route() pattern to capture the create-order response.
    let createOrderStatus: number | null = null;
    let createOrderBody: { paymentUrl?: string; error?: string } | null = null;
    await page.route("**/api/chillpay/create-order", async (route) => {
      const response = await route.fetch();
      const status = response.status();
      let bodyText = "";
      try {
        bodyText = await response.text();
      } catch {
        bodyText = "";
      }
      try {
        createOrderBody = bodyText ? JSON.parse(bodyText) : null;
      } catch {
        createOrderBody = null;
      }
      createOrderStatus = status;
      // Fulfill with the original response so the page sees it.
      await route.fulfill({
        status,
        contentType: response.headers()["content-type"] ?? "application/json",
        body: bodyText,
      });
    });
    // Suppress the redirect: if 200 + paymentUrl, the page navigates
    // to ChillPay. We don't want to actually leave the app.
    await page.route("**/sandbox-pg.chillpay.co/**", (route) => route.abort());
    await page.route("**://**chillpay.co/**", (route) => route.abort());
    await payButton.click();
    // Wait for the route listener to capture the response.
    await expect.poll(() => createOrderStatus, { timeout: 10_000 }).not.toBeNull();

    // 11. The 503 path is the realistic dev-env case (no real
    //     ChillPay creds). The error surfaces inline in the
    //     CheckoutFlow. The 200 path is the happy path with real
    //     ChillPay creds.
    if (createOrderStatus === 503) {
      // The error message is in a div with class containing
      // "bg-error-container" and the text from the route.
      const errorEl = page.locator("text=Payment gateway not yet configured");
      await expect(errorEl).toBeVisible({ timeout: 5_000 });
      // The D1 should NOT have a transaction row for this attempt
      // (the route returns 503 before the INSERT). And d1's status
      // should still be 'available'.
      const txns = readTransactionsForDesign("d1");
      expect(txns).toHaveLength(0);
      const d1 = readDesign("d1");
      expect(d1?.status).toBe("available");
    } else if (createOrderStatus === 200) {
      // The happy path. The page redirects to paymentUrl, but we
      // blocked that redirect, so the page is still on /checkout/d1.
      expect(createOrderBody).toBeTruthy();
      expect(createOrderBody!.paymentUrl).toBeTruthy();
      // The D1 should have a chillpay_transactions row, status='pending'.
      const txns = readTransactionsForDesign("d1");
      expect(txns.length).toBeGreaterThanOrEqual(1);
      const txn = txns[txns.length - 1]!;
      expect(txn.status).toBe("pending");
      expect(txn.design_id).toBe("d1");
      expect(txn.amount).toBe(1.2);
      // The design should be 'reserved' with reserved_until set.
      const d1 = readDesign("d1");
      expect(d1?.status).toBe("reserved");
      expect(d1?.reserved_until).toBeTruthy();
    } else {
      // Unexpected status. Surface for debugging.
      throw new Error(
        `Unexpected /api/chillpay/create-order status: ${createOrderStatus} body=${JSON.stringify(createOrderBody)}`,
      );
    }
  });
});
