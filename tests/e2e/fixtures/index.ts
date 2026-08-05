import { test as base, expect, type APIRequestContext } from "@playwright/test";

export const test = base.extend<{
  adminPage: import("@playwright/test").Page;
  adminRequest: APIRequestContext;
}>({
  adminPage: async ({ page }, use) => {
    // Log in as admin — sets admin_token cookie on the browser context
    const resp = await page.request.post("/api/admin/login", {
      data: { password: "saknid2026" },
    });
    // Cookies set by the API response are applied automatically to the context
    await expect(resp).toBeOK();
    await use(page);
  },
  adminRequest: async ({ playwright }, use) => {
    // A request context with the admin_token cookie pre-set. Useful for
    // API specs that need an authenticated sender but don't need a
    // browser. Admin authentication bypasses the participant check, so
    // the request is treated as if it were from a conversation admin.
    const ctx = await playwright.request.newContext({
      baseURL: "http://localhost:4321",
    });
    const resp = await ctx.post("/api/admin/login", {
      data: { password: "saknid2026" },
    });
    await expect(resp).toBeOK();
    await use(ctx);
    await ctx.dispose();
  },
});

export { expect };
