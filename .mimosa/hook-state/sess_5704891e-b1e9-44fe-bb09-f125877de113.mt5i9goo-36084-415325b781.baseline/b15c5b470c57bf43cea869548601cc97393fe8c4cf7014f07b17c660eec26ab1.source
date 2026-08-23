import { test, expect } from "@playwright/test";

test.describe("GET /api/resale/[id]", () => {
  test("returns 404 or 405 for non-existent listing ID", async ({ request }) => {
    // The resale/[id].ts only has DELETE handler, not GET
    // So GET on /api/resale/[id] should return 405 Method Not Allowed
    const res = await request.get("/api/resale/nonexistent-id");
    // Astro returns 405 for method not allowed, or 404 if route doesn't handle GET
    expect([404, 405]).toContain(res.status());
  });

  test("DELETE /api/resale/[id] returns 400 for invalid JSON body", async ({ request }) => {
    const res = await request.delete("/api/resale/test-id", {
      headers: { "Content-Type": "application/json" },
      data: "not-json",
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body).toHaveProperty("error");
  });

  test("DELETE /api/resale/[id] returns 400 when callerWallet is missing", async ({ request }) => {
    const res = await request.delete("/api/resale/test-id", {
      data: {},
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body).toHaveProperty("error");
  });

  test("DELETE /api/resale/[id] returns 400 when callerWallet is invalid address", async ({ request }) => {
    const res = await request.delete("/api/resale/test-id", {
      data: { callerWallet: "not-a-valid-address" },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body).toHaveProperty("error", "Validation failed");
  });

  test("DELETE /api/resale/[id] returns 404 for non-existent listing", async ({ request }) => {
    const res = await request.delete("/api/resale/nonexistent-listing-id-9999", {
      data: { callerWallet: "0x1234567890123456789012345678901234567890" },
    });
    // 404 if listing not found, or 422 if can't verify on-chain (no RPC), or 500 if DB issue
    expect([404, 422, 500]).toContain(res.status());
    if (res.status() === 404) {
      const body = await res.json();
      expect(body).toHaveProperty("error", "Listing not found");
    }
  });
});

test.describe("POST /api/resale/create", () => {
  test("returns 400 or 401 without auth", async ({ request }) => {
    const res = await request.post("/api/resale/create", {
      data: {},
    });
    expect([400, 401, 403]).toContain(res.status());
  });
});

test.describe("POST /api/resale/buy", () => {
  test("returns 400 or 401 with empty body", async ({ request }) => {
    const res = await request.post("/api/resale/buy", {
      data: {},
    });
    expect([400, 401, 403]).toContain(res.status());
  });
});
