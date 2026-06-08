/**
 * Phase 9.0 — visual baseline capture.
 *
 * Captures the prototype's initial Home screen at 3 viewports.
 * The prototype uses an internal React state router (no URL routing), so only
 * the initial render can be captured deterministically. Full multi-screen
 * baselines require manual navigation and are documented as a follow-up task.
 *
 * Prerequisites: `npx playwright install chromium` must have been run once.
 *
 * Usage: pnpm baseline:capture
 */

import { chromium } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");
const BASELINES_DIR = path.join(PROJECT_ROOT, "tests", "baselines");

const PROTOTYPE_PATH = path.join(
  PROJECT_ROOT,
  "_handoff",
  "tattoo-project",
  "project",
  "INKNOIR.html"
);

const VIEWPORTS = [
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 900 },
];

async function capture() {
  const browser = await chromium.launch();

  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
    });
    const page = await context.newPage();

    const url = `file://${PROTOTYPE_PATH}`;
    await page.goto(url);

    // Wait for fonts and initial React render
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(500);

    const outPath = path.join(BASELINES_DIR, `home-${vp.width}.png`);
    await page.screenshot({ path: outPath, fullPage: false });
    console.log(`  captured: tests/baselines/home-${vp.width}.png`);

    await context.close();
  }

  await browser.close();

  console.log("\nBaseline capture complete.");
  console.log(
    "NOTE: Only the Home screen was captured. The prototype uses an internal"
  );
  console.log(
    "React state machine for navigation (no URL routing), so other screens"
  );
  console.log(
    "(Market, Design Detail, Artists, etc.) require manual interaction to reach."
  );
  console.log(
    "To add more baselines: navigate the prototype manually, then call"
  );
  console.log(
    "  page.screenshot({ path: 'tests/baselines/<screen>-<vw>.png' })"
  );
  console.log("in a custom script or the Playwright REPL.");
}

capture().catch((err) => {
  console.error(err);
  process.exit(1);
});
