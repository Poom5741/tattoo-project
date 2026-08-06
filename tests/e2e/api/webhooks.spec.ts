/**
 * POST /api/chillpay/webhook — ChillPay payment callback signature verification.
 *
 * Covers closed issue:
 *   #17 (Add webhook signature verification - unauthenticated DB mutation)
 *
 * Source: src/pages/api/chillpay/webhook.ts, src/lib/server/chillpay.ts.
 *
 * The route expects x-www-form-urlencoded data with a CheckSum field.
 * The checksum is computed as MD5(TransactionId+Amount+OrderNo+CustomerId+
 * BankCode+PaymentDate+PaymentStatus+BankRefCode+CurrentDate+CurrentTime+
 * PaymentDescription+CreditCardToken+Currency+CustomerName+md5Secret).
 *
 * This spec tests:
 *   - Unsigned/invalid-signature requests return 401
 *   - Valid-signature requests with a matching chillpay_transactions row
 *     process correctly (200)
 *   - Idempotency: re-sending the same webhook returns 200 "already_processed"
 *
 * Prerequisite: CHILLPAY_MD5_SECRET must be set. In dev, add it to .dev.vars.
 * In CI (#70), pass it via webServer.env or GH secrets.
 */

import { test, expect } from "@playwright/test";
import { createHash } from "node:crypto";
import { DatabaseSync } from "node:sqlite";
import { readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";

/** Locate all local wrangler D1 files. Same logic as seed-dev-d1.ts. */
function findD1Paths(): string[] {
  const d1Dir = ".wrangler/state/v3/d1/miniflare-D1DatabaseObject";
  if (!existsSync(d1Dir)) return [];
  const files = readdirSync(d1Dir)
    .filter((f: string) => f.endsWith(".sqlite") && !f.endsWith("-wal") && !f.endsWith("-shm"))
    .map((f: string) => ({ f, mtime: statSync(join(d1Dir, f)).mtimeMs }))
    .sort((a, b) => b.mtime - a.mtime);
  return files.map((f: { f: string }) => join(d1Dir, f.f));
}

const WEBHOOK_SECRET = "test-webhook-secret-12345";

/** Compute the ChillPay webhook checksum given params + secret. */
function computeWebhookChecksum(params: Record<string, string>, secret: string): string {
  const concatenated =
    (params.TransactionId ?? "") +
    (params.Amount ?? "") +
    (params.OrderNo ?? "") +
    (params.CustomerId ?? "") +
    (params.BankCode ?? "") +
    (params.PaymentDate ?? "") +
    (params.PaymentStatus ?? "") +
    (params.BankRefCode ?? "") +
    (params.CurrentDate ?? "") +
    (params.CurrentTime ?? "") +
    (params.PaymentDescription ?? "") +
    (params.CreditCardToken ?? "") +
    (params.Currency ?? "") +
    (params.CustomerName ?? "") +
    secret;
  return createHash("md5").update(concatenated).digest("hex");
}

/** Insert a pending chillpay_transactions row for testing. Returns the order_no. */
function seedPendingTransaction(dbPaths: string[]): { orderNo: string; txId: string; designId: string } {
  const now = new Date().toISOString();
  const orderNo = `ORD-${Date.now()}`;
  const txId = `TX-${Date.now()}`;
  const designId = "d1"; // seeded design, status should be 'available' or 'reserved'

  for (const dbPath of dbPaths) {
    const con = new DatabaseSync(dbPath);
    try {
      con
        .prepare(
          `INSERT INTO chillpay_transactions (id, order_no, design_id, amount, status, channel_code, customer_id, customer_email, created_at, updated_at)
           VALUES (?, ?, ?, ?, 'pending', 'qrpayment', 'cust-test', 'test@example.com', ?, ?)`,
        )
        .run(txId, orderNo, designId, 1.2, now, now);
    } catch (e) {
      console.warn("Failed to seed transaction in", dbPath, e);
    } finally {
      con.close();
    }
  }
  return { orderNo, txId, designId };
}

/** Clean up the test transaction. */
function cleanTestTransaction(orderNo: string, dbPaths: string[]): void {
  for (const dbPath of dbPaths) {
    const con = new DatabaseSync(dbPath);
    try {
      con.prepare("DELETE FROM chillpay_transactions WHERE order_no = ?").run(orderNo);
    } catch {
      // ignore
    } finally {
      con.close();
    }
  }
}

test.describe("POST /api/chillpay/webhook", () => {
  let testOrderNo: string;
  let testTxId: string;
  let dbPaths: string[];

  test.beforeAll(() => {
    // Seed a pending transaction so the webhook has something to process.
    dbPaths = findD1Paths();
    if (dbPaths.length === 0) {
      test.skip(true, "Local D1 not found. Run `pnpm dev` once and then `pnpm db:seed:dev`.");
    }
    const result = seedPendingTransaction(dbPaths);
    testOrderNo = result.orderNo;
    testTxId = result.txId;
  });

  test.afterAll(() => {
    // Clean up.
    if (dbPaths && dbPaths.length > 0) {
      cleanTestTransaction(testOrderNo, dbPaths);
    }
  });

  test("returns 401 when the checksum is invalid", async ({ request }) => {
    const payload = new URLSearchParams({
      TransactionId: testTxId,
      Amount: "120",
      OrderNo: testOrderNo,
      CustomerId: "cust-test",
      BankCode: "",
      PaymentDate: new Date().toISOString(),
      PaymentStatus: "0",
      BankRefCode: "",
      CurrentDate: new Date().toISOString(),
      CurrentTime: "12:00:00",
      PaymentDescription: "SAKNID - Serpent in Negative",
      CreditCardToken: "",
      Currency: "764",
      CustomerName: "Test Buyer",
      CheckSum: "invalid-checksum",
    });
    const res = await request.post("/api/chillpay/webhook", {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      data: payload.toString(),
    });
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Invalid checksum");
  });

  test("returns 200 when the checksum is valid and processes the payment", async ({ request }) => {
    const validParams: Record<string, string> = {
      TransactionId: testTxId,
      Amount: "120",
      OrderNo: testOrderNo,
      CustomerId: "cust-test",
      BankCode: "",
      PaymentDate: new Date().toISOString(),
      PaymentStatus: "0", // SUCCESS
      BankRefCode: "",
      CurrentDate: new Date().toISOString(),
      CurrentTime: "12:00:00",
      PaymentDescription: "SAKNID - Serpent in Negative",
      CreditCardToken: "",
      Currency: "764",
      CustomerName: "Test Buyer",
    };
    const checkSum = computeWebhookChecksum(validParams, WEBHOOK_SECRET);
    validParams.CheckSum = checkSum;

    const payload = new URLSearchParams(validParams);
    const res = await request.post("/api/chillpay/webhook", {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      data: payload.toString(),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("success");
  });

  test("is idempotent: re-sending the same webhook returns 200 'already_processed'", async ({ request }) => {
    // Re-send the same payload from the previous test.
    const validParams: Record<string, string> = {
      TransactionId: testTxId,
      Amount: "120",
      OrderNo: testOrderNo,
      CustomerId: "cust-test",
      BankCode: "",
      PaymentDate: new Date().toISOString(),
      PaymentStatus: "0",
      BankRefCode: "",
      CurrentDate: new Date().toISOString(),
      CurrentTime: "12:00:00",
      PaymentDescription: "SAKNID - Serpent in Negative",
      CreditCardToken: "",
      Currency: "764",
      CustomerName: "Test Buyer",
    };
    const checkSum = computeWebhookChecksum(validParams, WEBHOOK_SECRET);
    validParams.CheckSum = checkSum;

    const payload = new URLSearchParams(validParams);
    const res = await request.post("/api/chillpay/webhook", {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      data: payload.toString(),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("already_processed");
  });

  test("returns 404 when the transaction does not exist", async ({ request }) => {
    const validParams: Record<string, string> = {
      TransactionId: "non-existent-tx",
      Amount: "120",
      OrderNo: "non-existent-order",
      CustomerId: "cust-test",
      BankCode: "",
      PaymentDate: new Date().toISOString(),
      PaymentStatus: "0",
      BankRefCode: "",
      CurrentDate: new Date().toISOString(),
      CurrentTime: "12:00:00",
      PaymentDescription: "SAKNID",
      CreditCardToken: "",
      Currency: "764",
      CustomerName: "Test Buyer",
    };
    const checkSum = computeWebhookChecksum(validParams, WEBHOOK_SECRET);
    validParams.CheckSum = checkSum;

    const payload = new URLSearchParams(validParams);
    const res = await request.post("/api/chillpay/webhook", {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      data: payload.toString(),
    });
    expect(res.status()).toBe(404);
    const body = await res.json();
    expect(body.error).toBe("Transaction not found");
  });
});
