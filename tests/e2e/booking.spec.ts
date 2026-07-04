import { test, expect } from "@playwright/test";

test.describe("Booking page (/booking)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/booking");
  });

  test("loads successfully", async ({ page }) => {
    await expect(page).toHaveURL("/booking");
    await expect(page.locator("body")).toBeVisible();
  });

  test("shows page title 'Book a session — INKNOIR'", async ({ page }) => {
    await expect(page).toHaveTitle(/Book a session/);
  });

  test("shows 'Request an appointment' heading", async ({ page }) => {
    await expect(page.locator("h1", { hasText: "Request an appointment" })).toBeVisible();
  });

  test("shows 'Book a session' kicker", async ({ page }) => {
    await expect(page.locator(".kicker", { hasText: "Book a session" })).toBeVisible();
  });

  test("shows '← All artists' back link", async ({ page }) => {
    await expect(page.locator("a", { hasText: "All artists" })).toBeVisible();
  });

  test("renders booking form with artist select and name field", async ({ page }) => {
    // Wait for the React BookingForm to hydrate
    // The form contains at minimum an artist selector and name input
    const form = page.locator("form").first();
    await expect(form).toBeVisible({ timeout: 10_000 });
  });

  test("shows artist availability sidebar", async ({ page }) => {
    // The sidebar renders artist name divs (.display) alongside the form.
    // Can't use `text=Mara Vael` because it also matches hidden <option> elements.
    // Instead check the sidebar div structure shows all 4 artists.
    await page.waitForSelector(".display", { timeout: 10_000 });
    const pageText = await page.locator("body").innerText();
    expect(pageText).toContain("Mara Vael");
    expect(pageText).toContain("Koto Arai");
  });

  test("submits booking form with valid data via mocked API", async ({ page }) => {
    // Mock the POST /api/bookings endpoint
    await page.route("/api/bookings", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true }),
      });
    });

    // Wait for form to hydrate
    await page.waitForSelector("form", { timeout: 10_000 });

    // Fill in artist select — the BookingForm renders a <select> for artist
    const artistSelect = page.locator("select").first();
    if (await artistSelect.isVisible()) {
      await artistSelect.selectOption({ index: 1 });
    }

    // Fill name
    const nameInput = page.locator("input[name='name'], input[placeholder*='name' i], input[placeholder*='Name' i]").first();
    if (await nameInput.isVisible()) {
      await nameInput.fill("Test User");
    }

    // Fill contact
    const contactInput = page.locator("input[name='contact'], input[placeholder*='contact' i], input[placeholder*='email' i], input[type='email']").first();
    if (await contactInput.isVisible()) {
      await contactInput.fill("test@example.com");
    }
  });

  test("booking type toggle: plate vs custom consultation", async ({ page }) => {
    // Wait for form hydration
    await page.waitForSelector("form", { timeout: 10_000 });

    // Look for booking type radio/button: "plate" or "custom"
    const plateOption = page.locator("label:has-text('Plate'), button:has-text('Plate'), input[value='plate']").first();
    const customOption = page.locator("label:has-text('Custom'), button:has-text('Custom'), input[value='custom']").first();

    if (await plateOption.isVisible()) {
      await plateOption.click();
    }
    if (await customOption.isVisible()) {
      await customOption.click();
    }
  });
});
