import { test, expect } from "@playwright/test";
import { existsSync, readFileSync } from "fs";
import path from "path";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";

const BASELINES_DIR = path.join(import.meta.dirname, "..", "baselines");
const TOLERANCE = 0.02; // 2%

const VIEWPORTS = [
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 900 },
];

for (const vp of VIEWPORTS) {
  test(`home visual regression — ${vp.name} (${vp.width}px)`, async ({ page }) => {
    const baselinePath = path.join(BASELINES_DIR, `home-${vp.width}.png`);

    test.skip(!existsSync(baselinePath), `baseline missing: run pnpm baseline:capture first`);

    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);

    const screenshot = await page.screenshot({ fullPage: false });

    const baselinePNG = PNG.sync.read(readFileSync(baselinePath));
    const screenshotPNG = PNG.sync.read(screenshot);

    const { width, height } = baselinePNG;
    const numPixels = width * height;
    const mismatch = pixelmatch(
      baselinePNG.data,
      screenshotPNG.data,
      null,
      width,
      height,
      { threshold: 0.1 }
    );

    const ratio = mismatch / numPixels;
    expect(ratio, `pixel mismatch ${(ratio * 100).toFixed(2)}% exceeds ${TOLERANCE * 100}% tolerance`).toBeLessThanOrEqual(TOLERANCE);
  });
}
