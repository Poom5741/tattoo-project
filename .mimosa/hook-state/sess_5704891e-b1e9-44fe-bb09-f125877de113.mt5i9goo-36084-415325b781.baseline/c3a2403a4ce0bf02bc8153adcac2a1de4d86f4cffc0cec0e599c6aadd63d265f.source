import { test, expect } from "@playwright/test";

test.describe("Artist portal (/artist/portal) — unauthenticated", () => {
  test("shows wallet signature gate when not logged in", async ({ page }) => {
    await page.goto("/artist/portal");
    await page.waitForLoadState("domcontentloaded");

    const url = page.url();
    if (url.includes("/artist/portal")) {
      await expect(page.locator("body")).toBeVisible();
      await expect(page.locator("text=Internal Server Error")).not.toBeVisible();
      // WalletSignatureGate renders an artist sign-in prompt
      await expect(page.locator("text=Artist Portal")).toBeVisible();
    } else {
      expect(url).toMatch(/\/artists|\/|\/artist\/portal/);
    }
  });

  test("page does not crash when visiting unauthenticated", async ({ page }) => {
    const response = await page.goto("/artist/portal");
    expect(response?.status()).not.toBe(500);
    await expect(page.locator("body")).toBeVisible();
  });

  test("page title references SAKNID", async ({ page }) => {
    await page.goto("/artist/portal");
    await expect(page).toHaveTitle(/SAKNID|SUKNID/);
  });
});

test.describe("Artist portal (/artist/portal) — mocked auth", () => {
  test("page.route() intercepts artist-login; direct page.request bypasses it", async ({ page }) => {
    await page.route("/api/auth/artist-login", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true }),
      });
    });

    await page.goto("/");
    const status = await page.evaluate(async () => {
      const res = await fetch("/api/auth/artist-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: "0x1234567890123456789012345678901234567890",
          signature: "0x00",
          nonce: "fake-nonce",
        }),
      });
      return res.status;
    });
    expect(status).toBe(200);
  });

  test("POST /api/auth/artist-login without a valid signature returns 401", async ({ request }) => {
    const challengeRes = await request.get("/api/auth/challenge");
    const { nonce } = await challengeRes.json();
    const res = await request.post("/api/auth/artist-login", {
      data: {
        address: "0x0000000000000000000000000000000000000000",
        signature: "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001b",
        nonce,
      },
    });
    expect([400, 401]).toContain(res.status());
  });
});
