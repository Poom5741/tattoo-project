import { test, expect } from "@playwright/test";

test.describe("GET /api/health", () => {
  test("returns JSON response", async ({ request }) => {
    const res = await request.get("/api/health");
    // Should return 200 (healthy) or 503 (degraded) but always JSON
    expect([200, 503]).toContain(res.status());
    const body = await res.json();
    expect(body).toBeTruthy();
  });

  test("response contains 'ok' field", async ({ request }) => {
    const res = await request.get("/api/health");
    const body = await res.json();
    expect(body).toHaveProperty("ok");
    expect(typeof body.ok).toBe("boolean");
  });

  test("response contains 'd1' field", async ({ request }) => {
    const res = await request.get("/api/health");
    const body = await res.json();
    expect(body).toHaveProperty("d1");
    expect(["ok", "fail"]).toContain(body.d1);
  });

  test("response contains 'chain' field", async ({ request }) => {
    const res = await request.get("/api/health");
    const body = await res.json();
    expect(body).toHaveProperty("chain");
    expect(["ok", "fail"]).toContain(body.chain);
  });

  test("response contains count fields when d1 is ok", async ({ request }) => {
    const res = await request.get("/api/health");
    const body = await res.json();
    if (body.d1 === "ok") {
      expect(body).toHaveProperty("reservedCount");
      expect(body).toHaveProperty("soldCount");
      expect(body).toHaveProperty("availableCount");
      expect(typeof body.reservedCount).toBe("number");
      expect(typeof body.soldCount).toBe("number");
      expect(typeof body.availableCount).toBe("number");
    }
  });

  test("status is 200 when both d1 and chain are ok", async ({ request }) => {
    const res = await request.get("/api/health");
    const body = await res.json();
    if (body.d1 === "ok" && body.chain === "ok") {
      expect(res.status()).toBe(200);
      expect(body.ok).toBe(true);
    }
  });

  test("status is 503 when either d1 or chain fails", async ({ request }) => {
    const res = await request.get("/api/health");
    const body = await res.json();
    if (body.d1 === "fail" || body.chain === "fail") {
      expect(res.status()).toBe(503);
      expect(body.ok).toBe(false);
    }
  });
});
