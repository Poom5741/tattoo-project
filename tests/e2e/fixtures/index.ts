import { test as base, expect } from "@playwright/test";

export const test = base.extend<{
  adminPage: import("@playwright/test").Page;
}>({
  adminPage: async ({ page }, use) => {
    // Log in as admin — sets admin_token cookie on the browser context
    const resp = await page.request.post("/api/admin/login", {
      data: { password: "inknoir2026" },
    });
    // Cookies set by the API response are applied automatically to the context
    await expect(resp).toBeOK();
    await use(page);
  },
});

export { expect };
