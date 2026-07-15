import { test, expect } from "@playwright/test";

test.describe("Admin auth API (/api/admin/login + /api/admin/logout)", () => {
  test("POST /api/admin/login with wrong password returns 401", async ({ request }) => {
    const res = await request.post("/api/admin/login", {
      data: { password: "wrong-password-xyz" },
    });
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body).toHaveProperty("error");
  });

  test("POST /api/admin/login with correct password returns 200", async ({ request }) => {
    const res = await request.post("/api/admin/login", {
      data: { password: "saknid2026" },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty("ok", true);
  });

  test("POST /api/admin/login with correct password sets admin_token cookie", async ({ request }) => {
    const res = await request.post("/api/admin/login", {
      data: { password: "saknid2026" },
    });
    expect(res.status()).toBe(200);

    // Cookie header should contain admin_token
    const setCookie = res.headers()["set-cookie"];
    expect(setCookie).toBeTruthy();
    expect(setCookie).toContain("admin_token=");
  });

  test("POST /api/admin/login with empty body returns 401", async ({ request }) => {
    const res = await request.post("/api/admin/login", {
      data: {},
    });
    expect(res.status()).toBe(401);
  });

  test("POST /api/admin/login with invalid JSON returns 400 or 401", async ({ request }) => {
    const res = await request.post("/api/admin/login", {
      headers: { "Content-Type": "application/json" },
      data: "not json",
    });
    // Admin login catches invalid JSON and treats as wrong password
    expect([400, 401]).toContain(res.status());
  });

  test("POST /api/admin/logout redirects to /admin and clears cookie", async ({ page }) => {
    // First log in to get a valid session
    const loginRes = await page.request.post("/api/admin/login", {
      data: { password: "saknid2026" },
    });
    expect(loginRes.status()).toBe(200);

    // Now logout
    const logoutRes = await page.request.post("/api/admin/logout", {
      maxRedirects: 0,
    });
    // Should be a redirect (302) or OK
    expect([200, 302]).toContain(logoutRes.status());

    // Verify cookie is cleared by navigating to /admin
    await page.goto("/admin");
    // Should show login form (not dashboard) since session is gone
    await expect(page.locator("#pw, input[type='password']")).toBeVisible({ timeout: 10_000 });
  });
});
