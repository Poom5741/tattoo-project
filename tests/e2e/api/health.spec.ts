import { test, expect } from "@playwright/test";

/**
 * GET /api/health — API contract tests.
 *
 * Source: src/pages/api/health.ts. The endpoint runs two probes:
 *   1. KV: env.SESSION.get("health-check")
 *   2. D1: env.DB.prepare("SELECT 1").first()
 *
 * Response shape:
 *   {
 *     status:   "healthy" | "degraded",
 *     timestamp: <epoch_ms>,
 *     checks:   { kv: "ok" | "error", db: "ok" | "error" }
 *   }
 *
 * HTTP status: 200 when both probes are "ok", 503 otherwise.
 *
 * The earlier shape was { ok: boolean, d1: "ok"|"fail", chain: "ok"|"fail", ... }
 * with KV removed and an on-chain probe. The endpoint was simplified to KV+D1
 * only and the test file was not updated. This rewrite pins the live shape.
 */

test.describe("GET /api/health", () => {
  test("returns JSON response", async ({ request }) => {
    const res = await request.get("/api/health");
    expect([200, 503]).toContain(res.status());
    const body = await res.json();
    expect(body).toBeTruthy();
  });

  test("response has status, timestamp, and checks", async ({ request }) => {
    const res = await request.get("/api/health");
    const body = await res.json();
    expect(body).toHaveProperty("status");
    expect(body).toHaveProperty("timestamp");
    expect(body).toHaveProperty("checks");
    expect(typeof body.timestamp).toBe("number");
  });

  test("status is 'healthy' or 'degraded'", async ({ request }) => {
    const res = await request.get("/api/health");
    const body = await res.json();
    expect(["healthy", "degraded"]).toContain(body.status);
  });

  test("checks.db is 'ok' or 'error'", async ({ request }) => {
    const res = await request.get("/api/health");
    const body = await res.json();
    expect(["ok", "error"]).toContain(body.checks.db);
  });

  test("checks.kv is 'ok' or 'error'", async ({ request }) => {
    const res = await request.get("/api/health");
    const body = await res.json();
    expect(["ok", "error"]).toContain(body.checks.kv);
  });

  test("status is 200 when both probes are ok", async ({ request }) => {
    const res = await request.get("/api/health");
    const body = await res.json();
    if (body.checks.db === "ok" && body.checks.kv === "ok") {
      expect(res.status()).toBe(200);
      expect(body.status).toBe("healthy");
    }
  });

  test("status is 503 when either probe is not ok", async ({ request }) => {
    const res = await request.get("/api/health");
    const body = await res.json();
    if (body.checks.db === "error" || body.checks.kv === "error") {
      expect(res.status()).toBe(503);
      expect(body.status).toBe("degraded");
    }
  });
});
