/**
 * SEO metadata + favicon — unit tests (TDD).
 *
 * Base.astro currently has no og: tags, no twitter cards, and no favicon.
 * This test pins the fix: the <head> must include standard social-preview
 * metadata and a favicon reference.
 *
 * Prerequisites: vitest (pnpm test). No network required.
 */

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const BASE = resolve(__dirname, "../../src/layouts/Base.astro");

describe("Base.astro <head> — SEO metadata", () => {
  let head: string;

  beforeAll(() => {
    head = readFileSync(BASE, "utf8");
  });

  it("has og:title", () => {
    expect(head).toMatch(/<meta[^>]*property=["']og:title["']/);
  });

  it("has og:description", () => {
    expect(head).toMatch(/<meta[^>]*property=["']og:description["']/);
  });

  it("has og:image", () => {
    expect(head).toMatch(/<meta[^>]*property=["']og:image["']/);
  });

  it("has og:url", () => {
    expect(head).toMatch(/<meta[^>]*property=["']og:url["']/);
  });

  it("has og:type", () => {
    expect(head).toMatch(/<meta[^>]*property=["']og:type["']/);
  });

  it("has twitter:card", () => {
    expect(head).toMatch(/<meta[^>]*name=["']twitter:card["']/);
  });

  it("has twitter:title", () => {
    expect(head).toMatch(/<meta[^>]*name=["']twitter:title["']/);
  });

  it("has twitter:description", () => {
    expect(head).toMatch(/<meta[^>]*name=["']twitter:description["']/);
  });

  it("has twitter:image", () => {
    expect(head).toMatch(/<meta[^>]*name=["']twitter:image["']/);
  });

  it("has a favicon link", () => {
    expect(head).toMatch(/<link[^>]*rel=["']icon["']/);
  });
});
