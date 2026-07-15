/**
 * Artist wallet signature login — API tests (Playwright request fixture).
 *
 * Tests the challenge endpoint and login with wallet signature verification.
 */

import { test, expect } from "@playwright/test";

test.describe("GET /api/auth/challenge", () => {
  test("returns a message and nonce", async ({ request }) => {
    const res = await request.get("/api/auth/challenge");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty("message");
    expect(body).toHaveProperty("nonce");
    expect(typeof body.message).toBe("string");
    expect(body.message).toContain("inknoir-artist-login");
    expect(typeof body.nonce).toBe("string");
  });
});

test.describe("POST /api/auth/artist-login", () => {
  test("returns 400 when body is missing", async ({ request }) => {
    const res = await request.post("/api/auth/artist-login", {
      data: {},
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body).toHaveProperty("error");
  });

  test("returns 400 when address is missing", async ({ request }) => {
    const res = await request.post("/api/auth/artist-login", {
      data: { signature: "0xsig", nonce: "nonce123" },
    });
    expect(res.status()).toBe(400);
  });

  test("returns 400 when signature is missing", async ({ request }) => {
    const res = await request.post("/api/auth/artist-login", {
      data: { address: "0x123", nonce: "nonce123" },
    });
    expect(res.status()).toBe(400);
  });

  test("returns 400 when nonce is missing", async ({ request }) => {
    const res = await request.post("/api/auth/artist-login", {
      data: { address: "0x123", signature: "0xsig" },
    });
    expect(res.status()).toBe(400);
  });

  test("returns 401 for invalid signature", async ({ request }) => {
    // Get a valid nonce first
    const challengeRes = await request.get("/api/auth/challenge");
    const { nonce } = await challengeRes.json();

    const res = await request.post("/api/auth/artist-login", {
      data: {
        address: "0x0000000000000000000000000000000000000000",
        signature: "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001b",
        nonce,
      },
    });
    expect(res.status()).toBe(401);
  });

  test("returns 401 for expired nonce", async ({ request }) => {
    const res = await request.post("/api/auth/artist-login", {
      data: {
        address: "0x0000000000000000000000000000000000000000",
        signature: "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001b",
        nonce: "nonexistent-nonce",
      },
    });
    expect(res.status()).toBe(401);
  });
});
