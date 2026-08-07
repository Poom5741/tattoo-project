/**
 * Currency display (ETH→THB) + Booking D1 refactor + inbox link — unit tests (TDD).
 *
 * Per ticket 04 of the .wayfinder map:
 *   1. All currency displays show ฿ (THB) not ETH — homepage, artist detail, wallet.
 *   2. Booking page loads artists/designs from D1, not seed.ts.
 *   3. Booking success state links to /inbox.
 *
 * Prerequisites: vitest (pnpm test). No network required.
 */

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const SRC = (p: string) => resolve(__dirname, "../../src", p);

describe("currency — no ETH literals in price display", () => {
  it("homepage (index.astro) shows ฿, not ETH", () => {
    const src = readFileSync(SRC("pages/index.astro"), "utf8");
    expect(src).not.toMatch(/\.toFixed\(\d\)\s*ETH/);
    expect(src).toContain("fmtThb");
  });

  it("artist detail ([id].astro) shows ฿, not ETH", () => {
    const src = readFileSync(SRC("pages/artist/[id].astro"), "utf8");
    expect(src).not.toMatch(/fmtEth/);
    expect(src).toContain("fmtThb");
  });

  it("wallet (WalletOwnedPlates.tsx) shows ฿, not ETH", () => {
    const src = readFileSync(SRC("components/WalletOwnedPlates.tsx"), "utf8");
    expect(src).not.toMatch(/ETH/);
    expect(src).toMatch(/toLocaleString.*th-TH/);
  });
});

describe("booking — loads from D1 with seed fallback", () => {
  it("booking.astro queries artists and designs from D1", () => {
    const src = readFileSync(SRC("pages/booking.astro"), "utf8");
    expect(src).toMatch(/db\.prepare\(/);
    expect(src).toMatch(/SELECT.*artists/i);
    expect(src).toMatch(/SELECT.*designs/i);
  });

  it("seed data is kept as fallback only (not primary source)", () => {
    const src = readFileSync(SRC("pages/booking.astro"), "utf8");
    // The D1 path must come BEFORE the seed assignment in the file,
    // so the default SEED values are overwritten when D1 succeeds.
    const d1Query = src.indexOf('db.prepare(');
    const seedImport = src.indexOf('from "../lib/catalog/seed"');
    expect(d1Query).toBeGreaterThan(-1);
    // seed import should appear before the D1 query (it's the fallback default)
    expect(seedImport).toBeLessThan(d1Query);
  });
});

describe("booking success — inbox link", () => {
  it("BookingForm.tsx success state links to /inbox", () => {
    const src = readFileSync(SRC("components/BookingForm.tsx"), "utf8");
    expect(src).toMatch(/\/inbox/);
  });
});
