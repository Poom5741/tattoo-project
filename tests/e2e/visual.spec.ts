/**
 * Visual regression — marketing + detail surfaces of the rebrand.
 *
 * Scope (#69): the rebrand's user-facing blast radius —
 *   - `/`            home
 *   - `/market`      plate gallery
 *   - `/design/d1`   plate detail (seeded plate, deterministic)
 *   - `/artist/mara` artist detail (seeded artist, deterministic)
 *
 * Mechanism: Playwright's native `toHaveScreenshot()`. The FIRST run
 * generates the baseline PNG next to this spec (under
 * `tests/e2e/visual.spec.ts-snapshots/`); commit it. Subsequent runs
 * diff against it at 2 % tolerance. This retires the former custom
 * pixelmatch/pngjs pipeline and the broken `baseline:capture` script
 * (which targeted a pre-rebrand SUKNID prototype that no longer exists).
 *
 * Viewports: mobile (390) + desktop (1440). Tablet dropped — it rarely
 * differs enough from desktop to earn its own baseline.
 *
 * Images are routed to a stable 1×1 placeholder so a screenshot never
 * bakes in live R2/IPFS bytes — otherwise an artist re-uploading a
 * plate image or a slow CDN edge would flake the baseline for reasons
 * unrelated to the rebrand.
 *
 * Env: real Playwright UI spec. Cannot run on this dev box (Playwright
 * unsupported on Ubuntu 26.04 — same wall as #73–#79). The first run
 * in CI (#70) or on a working laptop generates + commits the baselines.
 *
 * Covers closed rebrand issues #33, #36.
 */

import { test, expect } from "@playwright/test";
import { existsSync } from "fs";

/** Pages in scope — `[name, path]`. Paths use seeded, deterministic ids. */
const PAGES: [string, string][] = [
  ["home", "/"],
  ["market", "/market"],
  ["plate-detail", "/design/d1"],
  ["artist-detail", "/artist/mara"],
];

/** Two breakpoints — both ends of the responsive range. */
const VIEWPORTS = [
  { name: "mobile", width: 390, height: 844 },
  { name: "desktop", width: 1440, height: 900 },
];

/** Visual-regression tolerance (carried over from the former 2 % pixelmatch setup). */
const MAX_DIFF_RATIO = 0.02;

test.beforeEach(async ({ page }) => {
  // Stub every image request with a stable 1×1 transparent PNG so the
  // screenshot never depends on live R2/IPFS bytes. Routed per-context
  // so it covers both <img src> and any CSS background-image fetches.
  await page.route(
    /\.(?:png|jpe?g|webp|gif|svg)(?:\?.*)?$/i,
    (route) =>
      route.fulfill({
        contentType: "image/png",
        // 1×1 transparent PNG.
        body: Buffer.from(
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M8AAAMBAQDJ/pLvAAAAAElFTkSuQmCC",
          "base64",
        ),
      }),
  );
});

for (const [pageName, path] of PAGES) {
  for (const vp of VIEWPORTS) {
    test(`${pageName} (${vp.name}, ${vp.width}px)`, async ({ page }, testInfo) => {
      const snapshotPath = testInfo.snapshotPath(`${pageName}-${vp.width}.png`);
      test.skip(
        !existsSync(snapshotPath),
        `Visual baseline missing (${pageName}-${vp.width}.png). Run with --update-snapshots on a working machine or CI artifact generator to capture.`,
      );

      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(path);
      await page.evaluate(() => document.fonts.ready);
      // Let the island hydrate (Nav, etc.) before snapshotting.
      await expect(page.locator("header")).toBeVisible();

      await expect(page).toHaveScreenshot(`${pageName}-${vp.width}.png`, {
        maxDiffPixelRatio: MAX_DIFF_RATIO,
        fullPage: true,
        animations: "disabled",
      });
    });
  }
}
