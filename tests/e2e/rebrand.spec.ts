import { test, expect } from "@playwright/test";
import { readFileSync } from "fs";

test.describe("Rebrand Core UI — SAKNID", () => {
  test("home page displays SAKNID in title", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/SAKNID/);
  });

  test("nav displays SAKNID branding", async ({ page }) => {
    await page.goto("/");
    const navBrand = page.locator("nav a[href='/']").first();
    await expect(navBrand).toHaveText("SAKNID");
  });

  test("footer displays SAKNID branding", async ({ page }) => {
    await page.goto("/");
    const footerBrand = page.locator("footer a[href='/']").first();
    await expect(footerBrand).toHaveText("SAKNID");
    
    const footerCopyright = page.locator("footer").getByText(/© 2026 SAKNID/);
    await expect(footerCopyright).toBeVisible();
  });

  test("admin login accepts saknid2026 password", async ({ request }) => {
    const res = await request.post("/api/admin/login", {
      data: { password: "saknid2026" },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty("ok", true);
  });

  test("admin login sets cookie with valid saknid2026 password", async ({ request }) => {
    const res = await request.post("/api/admin/login", {
      data: { password: "saknid2026" },
    });
    expect(res.status()).toBe(200);
    const setCookie = res.headers()["set-cookie"];
    expect(setCookie).toBeTruthy();
    expect(setCookie).toContain("admin_token=");
  });

  test("CONTEXT.md references SAKNID not SUKNID", () => {
    const content = readFileSync("CONTEXT.md", "utf-8");
    expect(content).toContain("SAKNID");
    expect(content).not.toContain("SUKNID");
  });

  test("Base layout default title uses SAKNID", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/SAKNID/);
  });
});
