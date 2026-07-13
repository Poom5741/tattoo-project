# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: nav.spec.ts >> Navigation >> mobile hamburger menu opens slide-in panel
- Location: tests/e2e/nav.spec.ts:83:3

# Error details

```
Error: expect(locator).not.toBeVisible() failed

Locator:  locator('div.fixed.right-0.h-full').first()
Expected: not visible
Received: visible
Timeout:  10000ms

Call log:
  - Expect "not toBeVisible" with timeout 10000ms
  - waiting for locator('div.fixed.right-0.h-full').first()
    21 × locator resolved to <div class="fixed top-0 right-0 z-40 h-full w-[300px] max-w-[85vw] bg-surface-container-low shadow-2xl flex flex-col pt-20 px-6 pb-8 transition-transform duration-300 ease-out md:hidden translate-x-full">…</div>
       - unexpected value "visible"

```

```yaml
- navigation:
  - link "Gallery":
    - /url: /market
  - link "Artists":
    - /url: /artists
  - link "Book":
    - /url: /booking
  - link "My Wallet":
    - /url: /wallet
  - link "Artist Portal":
    - /url: /artist/portal
  - link "How it works":
    - /url: /
- button "Connect Wallet"
```

# Test source

```ts
  1   | import { test, expect } from "@playwright/test";
  2   | 
  3   | test.describe("Navigation", () => {
  4   |   test("home page has working nav links", async ({ page }) => {
  5   |     await page.goto("/");
  6   | 
  7   |     // Find links to key pages
  8   |     const marketLink = page.locator("nav a[href='/market'], a[href='/market']").first();
  9   |     const artistsLink = page.locator("nav a[href='/artists'], a[href='/artists']").first();
  10  | 
  11  |     if (await marketLink.isVisible()) {
  12  |       await expect(marketLink).toHaveAttribute("href", "/market");
  13  |     }
  14  |     if (await artistsLink.isVisible()) {
  15  |       await expect(artistsLink).toHaveAttribute("href", "/artists");
  16  |     }
  17  |   });
  18  | 
  19  |   test("nav links navigate correctly from home to market", async ({ page }) => {
  20  |     await page.goto("/");
  21  |     // Click the hero CTA to enter gallery
  22  |     const galleryLink = page.locator("a", { hasText: "Explore Drop" }).first();
  23  |     await expect(galleryLink).toBeVisible();
  24  |     await galleryLink.click();
  25  |     await expect(page).toHaveURL("/market");
  26  |   });
  27  | 
  28  |   test("nav links navigate correctly from home to artists", async ({ page }) => {
  29  |     await page.goto("/");
  30  |     const artistsLink = page.locator("a", { hasText: "View Artist" }).first();
  31  |     await expect(artistsLink).toBeVisible();
  32  |     await artistsLink.click();
  33  |     await expect(page).toHaveURL("/artists");
  34  |   });
  35  | 
  36  |   test("back link on booking page goes to /artists", async ({ page }) => {
  37  |     await page.goto("/booking");
  38  |     const backLink = page.locator("a", { hasText: "All artists" });
  39  |     await expect(backLink).toBeVisible();
  40  |     await expect(backLink).toHaveAttribute("href", "/artists");
  41  |   });
  42  | 
  43  |   test("market page has back navigation to home", async ({ page }) => {
  44  |     await page.goto("/market");
  45  |     // Nav renders on each page
  46  |     await expect(page.locator("body")).toBeVisible();
  47  |   });
  48  | 
  49  |   test("market page links to design detail pages", async ({ page }) => {
  50  |     await page.goto("/market");
  51  |     await page.waitForLoadState("domcontentloaded");
  52  | 
  53  |     const designLinks = page.locator("a[href^='/design/']");
  54  |     const count = await designLinks.count();
  55  |     if (count > 0) {
  56  |       const href = await designLinks.first().getAttribute("href");
  57  |       expect(href).toMatch(/^\/design\//);
  58  |     }
  59  |   });
  60  | 
  61  |   test("nav is sticky with cream background", async ({ page }) => {
  62  |     await page.goto("/");
  63  |     const header = page.locator("header.sticky").first();
  64  |     await expect(header).toBeVisible();
  65  |     await expect(header).toHaveCSS("position", "sticky");
  66  |   });
  67  | 
  68  |   test("brand name renders INKNOIR", async ({ page }) => {
  69  |     await page.goto("/");
  70  |     const brand = page.locator("header a.font-display").first();
  71  |     await expect(brand).toContainText("INKNOIR");
  72  |   });
  73  | 
  74  |   test("active nav link shows red underline", async ({ page }) => {
  75  |     await page.goto("/market");
  76  |     const activeLink = page.locator("header nav a[href='/market']").first();
  77  |     if (await activeLink.isVisible()) {
  78  |       const underline = activeLink.locator("span.bg-primary-container").first();
  79  |       await expect(underline).toBeVisible();
  80  |     }
  81  |   });
  82  | 
  83  |   test("mobile hamburger menu opens slide-in panel", async ({ page }) => {
  84  |     await page.setViewportSize({ width: 390, height: 844 });
  85  |     await page.goto("/");
  86  | 
  87  |     const menuButton = page.locator("button[aria-label='Open menu']").first();
  88  |     await expect(menuButton).toBeVisible();
  89  |     await menuButton.click();
  90  | 
  91  |     const panel = page.locator("div.fixed.right-0.h-full").first();
  92  |     await expect(panel).toBeVisible();
  93  | 
  94  |     const closeButton = page.locator("button[aria-label='Close menu']").first();
  95  |     await closeButton.click();
> 96  |     await expect(panel).not.toBeVisible();
      |                             ^ Error: expect(locator).not.toBeVisible() failed
  97  |   });
  98  | 
  99  |   test("Connect Wallet button text is correct", async ({ page }) => {
  100 |     await page.goto("/");
  101 |     const walletButton = page.locator("button.nav__wallet").first();
  102 |     await expect(walletButton).toBeVisible();
  103 |     await expect(walletButton).toContainText("Connect Wallet");
  104 |   });
  105 | });
  106 | 
```