/**
 * 500 error page — unit tests (TDD).
 *
 * The 500 page is a static .astro file. The seam under test is its
 * content (it must mirror 404.astro's structure and theme). We read
 * the file as text and assert on the structural elements rather than
 * render it (rendering Astro pages in vitest is more machinery than
 * the page itself).
 *
 * Part of ticket 06 of the .wayfinder map.
 */

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const PAGE = resolve(__dirname, "../../src/pages/500.astro");

describe("src/pages/500.astro", () => {
  it("exists", () => {
    expect(() => readFileSync(PAGE, "utf8")).not.toThrow();
  });

  it("disables prerendering (server-rendered for live error context)", () => {
    const src = readFileSync(PAGE, "utf8");
    expect(src).toMatch(/export const prerender\s*=\s*false/);
  });

  it("uses the shared Base layout (matches 404 pattern)", () => {
    const src = readFileSync(PAGE, "utf8");
    expect(src).toMatch(/import\s+Base\s+from\s+["']\.\.\/layouts\/Base\.astro["']/);
    expect(src).toMatch(/<Base\b/);
  });

  it("includes the Nav and Footer components", () => {
    const src = readFileSync(PAGE, "utf8");
    expect(src).toMatch(/<Nav\b/);
    expect(src).toMatch(/<Footer\b/);
  });

  it("shows the 500 status number to the user", () => {
    const src = readFileSync(PAGE, "utf8");
    expect(src).toContain("500");
  });

  it("has a 'Back to gallery' CTA linking to /", () => {
    const src = readFileSync(PAGE, "utf8");
    expect(src).toMatch(/href=["']\/["']/);
    expect(src).toMatch(/Back to gallery/i);
  });
});
