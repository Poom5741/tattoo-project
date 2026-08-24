/**
 * Manual browser test — opens real browser, clicks through flows, screenshots each step.
 * Run: cd /Users/poom-work/tattoo-project && HEADED=true npx playwright test .openclaw/tmp/manual-test.ts --reporter=list
 */
import { test, expect } from "@playwright/test";
import { mkdirSync } from "fs";
import { join } from "path";
import { getAdminPassword } from "./helpers/admin-password";

const DIR = join(process.cwd(), "test-results", "manual-screenshots");

test.describe("Manual browser walkthrough", () => {
  test.beforeAll(() => mkdirSync(DIR, { recursive: true }));

  test("1. Home page", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: join(DIR, "01-home.png"), fullPage: true });
    const nav = page.locator("nav");
    await expect(nav.first()).toBeVisible();
  });

  test("2. Market — browse all designs", async ({ page }) => {
    await page.goto("/market");
    await page.waitForSelector('[data-testid="plate-grid"]', { timeout: 10000 });
    await page.screenshot({ path: join(DIR, "02-market.png"), fullPage: true });
    const cards = await page.locator('[data-testid="plate-card"]').count();
    console.log(`[MARKET] ${cards} design cards`);
  });

  test("3. Market — filter by Available", async ({ page }) => {
    await page.goto("/market");
    await page.waitForSelector('[data-testid="plate-grid"]', { timeout: 10000 });
    await page.locator('[data-testid="filter-status"] button', { hasText: "Available" }).click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: join(DIR, "03-market-available.png"), fullPage: true });
    console.log(`[FILTER] Available: ${await page.locator('[data-testid="plate-card"]').count()}`);
  });

  test("4. Market — filter by Sold", async ({ page }) => {
    await page.goto("/market");
    await page.waitForSelector('[data-testid="plate-grid"]', { timeout: 10000 });
    await page.locator('[data-testid="filter-status"] button', { hasText: "Sold" }).click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: join(DIR, "04-market-sold.png"), fullPage: true });
    console.log(`[FILTER] Sold: ${await page.locator('[data-testid="plate-card"]').count()}`);
  });

  test("5. Design d1 — available", async ({ page }) => {
    await page.goto("/design/d1");
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: join(DIR, "05-design-d1.png"), fullPage: true });
    const title = await page.locator("h1").first().textContent();
    console.log(`[D1] Title: ${title}`);
    const acquire = await page.locator("a", { hasText: /Reserve|Acquire/ }).first().isVisible().catch(() => false);
    const book = await page.locator("a", { hasText: /Book.*to ink/ }).first().isVisible().catch(() => false);
    console.log(`[D1] Acquire: ${acquire}, Book: ${book}`);
  });

  test("6. Design d4 — reserved (check timestamp bug)", async ({ page }) => {
    await page.goto("/design/d4");
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: join(DIR, "06-design-d4.png"), fullPage: true });
    const reserved = await page.getByRole("button", { name: /Reserved/ }).isVisible().catch(() => false);
    const available = await page.locator("a", { hasText: /Reserve|Acquire/ }).first().isVisible().catch(() => false);
    console.log(`[D4] Reserved: ${reserved}, Available: ${available}`);
    if (available && !reserved) console.log("[D4] ⚠️ BUG: Reserved auto-transitioned to available (seconds vs ms)");
  });

  test("7. Mobile — design d1 at 375px", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/design/d1");
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: join(DIR, "07-mobile-design.png"), fullPage: true });
    const scrollW = await page.evaluate(() => document.body.scrollWidth);
    console.log(`[MOBILE] scrollWidth: ${scrollW}px (viewport: 375)`);
    if (scrollW > 375) console.log("[MOBILE] ⚠️ BUG: Horizontal scroll on mobile");
    const imgBox = await page.locator(".card-bb.aspect-square").first().boundingBox().catch(() => null);
    if (imgBox) {
      console.log(`[MOBILE] Image: ${imgBox.width}x${imgBox.height} at x=${imgBox.x}`);
      if (imgBox.width > 375) console.log("[MOBILE] ⚠️ BUG: Image exceeds viewport");
    }
    const cursor = await page.locator(".card-bb.aspect-square").first().evaluate(el => getComputedStyle(el).cursor).catch(() => "?");
    console.log(`[MOBILE] Image cursor: ${cursor} (default=no zoom)`);
  });

  test("8. Mobile — market at 375px", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/market");
    await page.waitForSelector('[data-testid="plate-grid"]', { timeout: 10000 });
    await page.screenshot({ path: join(DIR, "08-mobile-market.png"), fullPage: true });
    const scrollW = await page.evaluate(() => document.body.scrollWidth);
    console.log(`[MOBILE MARKET] scrollWidth: ${scrollW}`);
    const cards = page.locator('[data-testid="plate-card"]');
    if (await cards.count() >= 2) {
      const b1 = await cards.nth(0).boundingBox();
      const b2 = await cards.nth(1).boundingBox();
      if (b1 && b2) console.log(`[MOBILE MARKET] Card overlap: ${b1.y + b1.height > b2.y}`);
    }
  });

  test("9. Booking form — fill and submit", async ({ page }) => {
    await page.goto("/booking");
    await page.waitForSelector("form", { timeout: 10000 });
    await page.screenshot({ path: join(DIR, "09-booking-empty.png"), fullPage: true });
    const dateInputs = await page.locator("form input[type='date']").count();
    console.log(`[BOOKING] Date inputs: ${dateInputs} (0 = no date picker)`);
    await page.locator("#bf-name").fill("Manual Test Buyer");
    await page.locator("#bf-contact").fill("manual@test.com");
    await page.locator("#bf-message").fill("Testing booking flow");
    await page.screenshot({ path: join(DIR, "09b-booking-filled.png"), fullPage: true });
    await page.locator("form button[type='submit']").click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: join(DIR, "09c-booking-done.png"), fullPage: true });
    const ok = await page.locator("text=Request sent").first().isVisible().catch(() => false);
    console.log(`[BOOKING] Success: ${ok}`);
  });

  test("10. Booking form — empty submit validation", async ({ page }) => {
    await page.goto("/booking");
    await page.waitForSelector("form", { timeout: 10000 });
    await page.locator("form button[type='submit']").click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: join(DIR, "10-booking-validation.png"), fullPage: true });
    const err = await page.locator(".font-body.text-xs.text-primary-container").first().textContent().catch(() => "");
    console.log(`[BOOKING VALIDATION] Error: ${err || "none shown"}`);
  });

  test("11. Artist portal (dev_role=artist)", async ({ page }) => {
    await page.context().addCookies([{ name: "dev_role", value: "artist", domain: "localhost", path: "/" }]);
    await page.goto("/artist/portal");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: join(DIR, "11-artist-portal.png"), fullPage: true });
    const body = await page.locator("body").textContent() ?? "";
    console.log(`[PORTAL] Has "Artist Portal": ${body.includes("Artist Portal")}`);
    console.log(`[PORTAL] Has "Your plates": ${body.includes("Your plates")}`);
    const uploadBtns = await page.locator('button:has-text("Upload"), button:has-text("Change photo"), input[type="file"]').count();
    console.log(`[PORTAL] Upload/profile-image buttons: ${uploadBtns} (0 = bug)`);
  });

  test("12. Artist inbox (dev_role=artist)", async ({ page }) => {
    await page.context().addCookies([{ name: "dev_role", value: "artist", domain: "localhost", path: "/" }]);
    await page.goto("/artist/inbox");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: join(DIR, "12-artist-inbox.png"), fullPage: true });
    const body = await page.locator("body").textContent() ?? "";
    console.log(`[INBOX] Loaded: ${body.includes("Inbox") || body.includes("Chat") || body.includes("Messages")}`);
  });

  test("13. Buyer inbox", async ({ page }) => {
    await page.context().addCookies([{ name: "dev_role", value: "buyer", domain: "localhost", path: "/" }]);
    await page.goto("/inbox");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: join(DIR, "13-buyer-inbox.png"), fullPage: true });
  });

  test("14. Admin dashboard", async ({ page }) => {
    await page.goto("/admin");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: join(DIR, "14-admin.png"), fullPage: true });
    const pwInput = page.locator('input[type="password"]');
    if (await pwInput.isVisible().catch(() => false)) {
      await pwInput.fill(getAdminPassword());
      await page.locator('button[type="submit"], button:has-text("Sign in")').first().click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: join(DIR, "14b-admin-loggedin.png"), fullPage: true });
      console.log("[ADMIN] Logged in successfully");
    }
  });

  test("15. Login page — passkey check", async ({ page }) => {
    await page.goto("/auth/login");
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: join(DIR, "15-login.png"), fullPage: true });
    const body = await page.locator("body").textContent() ?? "";
    const hasPasskey = /passkey/i.test(body) || /biometric/i.test(body) || /face.?id/i.test(body);
    const passkeyBtn = await page.locator('#passkey-signin, button:has-text("Passkey"), button:has-text("Biometric")').count();
    console.log(`[LOGIN] Passkey text: ${hasPasskey}, Passkey button: ${passkeyBtn}`);
    if (!hasPasskey && passkeyBtn === 0) console.log("[LOGIN] ⚠️ BUG: No passkey login option");
  });

  test("16. Artist profile (mara)", async ({ page }) => {
    await page.goto("/artist/mara");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: join(DIR, "16-artist-mara.png"), fullPage: true });
    const avatarImgs = await page.locator('img[alt*="profile"], img[alt*="avatar"]').count();
    const plates = await page.locator("canvas, svg").count();
    console.log(`[PROFILE] Real avatar imgs: ${avatarImgs}, Plate components: ${plates}`);
    if (avatarImgs === 0 && plates > 0) console.log("[PROFILE] ⚠️ BUG: Avatar is generative Plate, not real photo");
  });

  test("17. Checkout d1", async ({ page }) => {
    await page.goto("/checkout/d1");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: join(DIR, "17-checkout.png"), fullPage: true });
  });

  test("18. Wallet page", async ({ page }) => {
    await page.context().addCookies([{ name: "dev_role", value: "buyer", domain: "localhost", path: "/" }]);
    await page.goto("/wallet");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: join(DIR, "18-wallet.png"), fullPage: true });
    const body = await page.locator("body").textContent() ?? "";
    const hasBooking = body.includes("appointment") || body.includes("Booked") || body.includes("booking");
    console.log(`[WALLET] Shows booking details: ${hasBooking}`);
    if (!hasBooking) console.log("[WALLET] ⚠️ BUG: No booking accept details on wallet");
  });

  test("19. API edge cases via browser fetch", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const tests = [
      { name: "XSS in name", body: { artistId: "mara", name: "<script>alert(1)</script>", contact: "x@t.com", bookingType: "plate" } },
      { name: "SQLi in name", body: { artistId: "mara", name: "'; DROP TABLE x; --", contact: "s@t.com", bookingType: "plate" } },
      { name: "Long name (300 chars)", body: { artistId: "mara", name: "A".repeat(300), contact: "l@t.com", bookingType: "plate" } },
      { name: "Empty message", body: { artistId: "mara", name: "Test", contact: "e@t.com", bookingType: "plate", message: "" } },
      { name: "Non-existent artist", body: { artistId: "nonexistent", name: "Test", contact: "n@t.com", bookingType: "plate" } },
    ];

    for (const t of tests) {
      const r = await page.evaluate(async (body) => {
        const res = await fetch("/api/bookings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        return { status: res.status, ok: res.ok };
      }, t.body);
      console.log(`[API] ${t.name}: ${r.status} ${r.ok ? "OK" : "FAIL"}`);
    }

    // Chat edge cases
    const chatTests = [
      { name: "Empty chat", body: { conversationId: "conv-test-001", text: "" } },
      { name: "Long chat (2500)", body: { conversationId: "conv-test-001", text: "A".repeat(2500) } },
      { name: "URL in chat", body: { conversationId: "conv-test-001", text: "Visit https://evil.com" } },
      { name: "@handle in chat", body: { conversationId: "conv-test-001", text: "@someone hello" } },
      { name: "Non-existent conv", body: { conversationId: "conv-does-not-exist", text: "test" } },
    ];

    for (const t of chatTests) {
      const r = await page.evaluate(async (body) => {
        const res = await fetch("/api/chat/send", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        return { status: res.status, body: await res.json() };
      }, t.body);
      console.log(`[CHAT] ${t.name}: ${r.status} ${JSON.stringify(r.body).slice(0, 100)}`);
    }

    await page.screenshot({ path: join(DIR, "19-api-tests.png"), fullPage: true });
  });
});
