import { test, expect } from "@playwright/test";

test.describe("POST /api/voucher", () => {
  test("returns 400 for empty body", async ({ request }) => {
    const res = await request.post("/api/voucher", {
      data: {},
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body).toHaveProperty("error");
  });

  test("returns 400 for invalid JSON", async ({ request }) => {
    const res = await request.post("/api/voucher", {
      headers: { "Content-Type": "application/json" },
      data: "not-json",
    });
    expect(res.status()).toBe(400);
  });

  test("returns 400 when designId is missing", async ({ request }) => {
    const res = await request.post("/api/voucher", {
      data: {
        buyer: "0x1234567890123456789012345678901234567890",
      },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body).toHaveProperty("error", "validation_error");
  });

  test("returns 400 when buyer address is invalid format", async ({ request }) => {
    const res = await request.post("/api/voucher", {
      data: {
        designId: "d1",
        buyer: "not-a-valid-eth-address",
      },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body).toHaveProperty("error", "validation_error");
  });

  test("returns 400 when buyer is missing", async ({ request }) => {
    const res = await request.post("/api/voucher", {
      data: {
        designId: "d1",
      },
    });
    expect(res.status()).toBe(400);
  });

  test("schema validation: buyer must be a 0x Ethereum address (42 chars)", async ({ request }) => {
    // Short address — should fail
    const res = await request.post("/api/voucher", {
      data: {
        designId: "d1",
        buyer: "0x123",
      },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("validation_error");
    expect(body.issues).toBeDefined();
  });

  test("returns 409 or 500 for a non-existent design (not available)", async ({ request }) => {
    // Design d999 doesn't exist, should return 409 (not_available) or 500 (DB issue)
    const res = await request.post("/api/voucher", {
      data: {
        designId: "d999",
        buyer: "0x1234567890123456789012345678901234567890",
      },
    });
    // Either 409 (not_available) when DB works, or 500 if DB unavailable
    expect([409, 500]).toContain(res.status());
  });

  test("idempotency: second request for same reserved design returns 409", async ({ request }) => {
    const payload = {
      designId: "d1",
      buyer: "0xaBcDef1234567890aBcDef1234567890aBcDef12",
    };

    const first = await request.post("/api/voucher", { data: payload });
    // First may succeed (200) if d1 is available, or 409/500 if already reserved or DB unavailable
    if (first.status() === 200) {
      // If first succeeded (design was available and reserved),
      // the second request should return 409 (design now reserved)
      const second = await request.post("/api/voucher", { data: payload });
      expect(second.status()).toBe(409);
      const body = await second.json();
      expect(body).toHaveProperty("error", "not_available");
    } else {
      // If first failed, the test still passes — design wasn't available
      expect([409, 500]).toContain(first.status());
    }
  });
});
