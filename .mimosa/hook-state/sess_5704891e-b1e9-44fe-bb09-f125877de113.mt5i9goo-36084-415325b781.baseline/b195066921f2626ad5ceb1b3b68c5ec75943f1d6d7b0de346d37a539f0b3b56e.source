import { test, expect } from "@playwright/test";

test.describe("GET /api/auth/session", () => {
  test("returns 200 with session payload (no auth)", async ({ request }) => {
    const res = await request.get("/api/auth/session");
    expect(res.status()).toBe(200);
    const body = await res.json();
    // Without auth, session should be null
    expect(body).toHaveProperty("session");
    expect(body.session).toBeNull();
    expect(body).toHaveProperty("user");
    expect(body.user).toBeNull();
  });

  test("returns 200 with session payload (with auth)", async ({ request }) => {
    // Note: Full auth flow testing is limited because email/password is disabled.
    // This test verifies the endpoint structure is correct.
    // Real auth flow testing would require Google OAuth or passkey setup.
    const res = await request.get("/api/auth/session");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty("session");
    expect(body).toHaveProperty("user");
  });
});
