/**
 * Shared fmtThb util + 500 page i18n — unit tests (TDD).
 *
 *   1. src/lib/format.ts exports fmtThb with correct behaviour.
 *   2. All pages use the shared import, not local definitions.
 *   3. 500.astro uses i18n keys (t() calls), not hardcoded English.
 *   4. en.json and th.json have a 'page500' object.
 */

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const SRC = (p: string) => resolve(__dirname, "../../src", p);

describe("fmtThb shared util", () => {
  it("exists at src/lib/format.ts and exports fmtThb", async () => {
    const mod = await import("@/lib/format");
    expect(typeof mod.fmtThb).toBe("function");
  });

  it("formats a number with ฿ prefix and th-TH locale", async () => {
    const { fmtThb } = await import("@/lib/format");
    const result = fmtThb(1234.5);
    expect(result).toContain("฿");
    expect(result).toContain("1");
    expect(result).toContain("234");
  });

  it("returns '—' for null", async () => {
    const { fmtThb } = await import("@/lib/format");
    expect(fmtThb(null)).toBe("—");
  });

  it("pages no longer define fmtThb locally", () => {
    for (const file of [
      "pages/index.astro",
      "pages/artist/[id].astro",
      "pages/design/[id].astro",
    ]) {
      const src = readFileSync(SRC(file), "utf8");
      expect(src).not.toMatch(/function fmtThb/);
    }
  });

  it("pages import fmtThb from @/lib/format or ../lib/format", () => {
    for (const file of [
      "pages/index.astro",
      "pages/artist/[id].astro",
      "pages/design/[id].astro",
    ]) {
      const src = readFileSync(SRC(file), "utf8");
      expect(src).toMatch(/import.*fmtThb.*from.*["'].*\/lib\/format["']/);
    }
  });

  it("WalletOwnedPlates.tsx uses fmtThb instead of inline formatting", () => {
    const src = readFileSync(SRC("components/WalletOwnedPlates.tsx"), "utf8");
    expect(src).toMatch(/fmtThb/);
    expect(src).not.toMatch(/toFixed\(3\)\s*ETH/);
  });
});

describe("500 page i18n", () => {
  it("500.astro uses t() calls, not hardcoded English", () => {
    const src = readFileSync(SRC("pages/500.astro"), "utf8");
    expect(src).toMatch(/import.*createT/);
    expect(src).toMatch(/t\("page500/);
  });

  it("en.json has a 'page500' object with title, message, and cta", () => {
    const en = JSON.parse(readFileSync(SRC("locales/en.json"), "utf8"));
    expect(en.page500).toBeDefined();
    expect(typeof en.page500.title).toBe("string");
    expect(typeof en.page500.message).toBe("string");
    expect(typeof en.page500.cta).toBe("string");
  });

  it("th.json has a 'page500' object with all the same keys as en", () => {
    const en = JSON.parse(readFileSync(SRC("locales/en.json"), "utf8"));
    const th = JSON.parse(readFileSync(SRC("locales/th.json"), "utf8"));
    expect(th.page500).toBeDefined();
    expect(Object.keys(th.page500).sort()).toEqual(Object.keys(en.page500).sort());
  });
});
