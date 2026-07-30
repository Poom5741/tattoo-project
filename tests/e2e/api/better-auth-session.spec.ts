import { test, expect } from "@playwright/test";

test.describe("GET /api/auth/session", () => {
  test("returns 200 with session payload", async ({ request }) => {
    const res = await request.get("/api/auth/session");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty("session");
  });
});
