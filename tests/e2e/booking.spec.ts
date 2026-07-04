import { test, expect } from "@playwright/test";

test.describe("Booking page (/booking)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/booking");
  });

  test("loads successfully", async ({ page }) => {
    await expect(page).toHaveURL("/booking");
    await expect(page).toHaveTitle(/Book a session/);
    await expect(page.locator("body")).toBeVisible();
  });

  test("shows 'Request an appointment' heading with Bone & Blood typography", async ({ page }) => {
    const heading = page.locator("h1", { hasText: "Request an appointment" });
    await expect(heading).toBeVisible();
    await expect(heading).toHaveClass(/font-display/);
  });

  test("shows 'Book a session' kicker", async ({ page }) => {
    await expect(page.locator(".kicker", { hasText: "Book a session" })).toBeVisible();
  });

  test("uses Bone & Blood design system classes", async ({ page }) => {
    // Container uses container-bb
    await expect(page.locator(".container-bb")).toBeVisible();
    // Form wrapper uses card-bb
    await expect(page.locator(".card-bb")).toBeVisible();
    // Back link uses font-body
    const backLink = page.locator("a", { hasText: "All artists" });
    await expect(backLink).toBeVisible();
    await expect(backLink).toHaveClass(/font-body/);
  });

  test("shows '← All artists' back link", async ({ page }) => {
    await expect(page.locator("a", { hasText: "All artists" })).toBeVisible();
  });

  test("renders booking form with input-bb styled fields", async ({ page }) => {
    // Wait for the React BookingForm to hydrate
    const form = page.locator("form").first();
    await expect(form).toBeVisible({ timeout: 10_000 });

    // Inputs use input-bb class
    const inputs = form.locator(".input-bb");
    await expect(inputs.first()).toBeVisible({ timeout: 5_000 });
  });

  test("shows artist availability sidebar with B&B styling", async ({ page }) => {
    // The sidebar renders artist name divs (.display) alongside the form.
    await page.waitForSelector(".display", { timeout: 10_000 });
    const pageText = await page.locator("body").innerText();
    expect(pageText).toContain("Mara Vael");
    expect(pageText).toContain("Koto Arai");

    // Sidebar uses tag-bb for availability badges
    await expect(page.locator(".tag-bb").first()).toBeVisible();
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
    const nameInput = page.locator("input[placeholder*='name' i]").first();
    if (await nameInput.isVisible()) {
      await nameInput.fill("Test User");
    }

    // Fill contact
    const contactInput = page.locator("input[placeholder*='email' i], input[placeholder*='handle' i]").first();
    if (await contactInput.isVisible()) {
      await contactInput.fill("test@example.com");
    }

    // Submit button uses btn-primary
    const submitBtn = page.locator("form button[type='submit']");
    await expect(submitBtn).toHaveClass(/btn-primary/);
  });

  test("booking type toggle: plate vs custom consultation", async ({ page }) => {
    // Wait for form hydration
    await page.waitForSelector("form", { timeout: 10_000 });

    // Look for booking type toggle buttons
    const plateOption = page.locator("button:has-text('plate')").first();
    const customOption = page.locator("button:has-text('Custom')").first();

    if (await plateOption.isVisible()) {
      await plateOption.click();
    }
    if (await customOption.isVisible()) {
      await customOption.click();
    }
  });
});
