/**
 * Checkout redirect + resale cleanup — unit tests (TDD).
 *
 * Per ticket 03 of the .wayfinder map:
 *   1. /checkout/[id] redirects to /booking?designId=[id] (no checkout UI).
 *   2. No auto-release of reservations on checkout page load.
 *   3. Design detail CTA says "Reserve this plate".
 *   4. ResaleButton shows "Resale coming soon" (no wagmi).
 *   5. POST /api/resale/create and POST /api/resale/buy return 503.
 *
 * Prerequisites: vitest (pnpm test). No network required.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { POST as resaleCreatePost } from "@/pages/api/resale/create";
import { POST as resaleBuyPost } from "@/pages/api/resale/buy";

const SRC = (p: string) => resolve(__dirname, "../../src", p);

interface MockDb {
  prepare: ReturnType<typeof vi.fn>;
}

function makeDb(design: unknown = null): MockDb & { updates: string[] } {
  const updates: string[] = [];
  return {
    updates,
    prepare: vi.fn().mockImplementation((sql: string) => ({
      bind: vi.fn().mockReturnThis(),
      first: vi.fn().mockImplementation(async () => design),
      all: vi.fn().mockResolvedValue({ results: [] }),
      run: vi.fn().mockImplementation(async () => {
        if (/^\s*UPDATE\b/i.test(sql)) updates.push(sql);
        return { success: true, meta: { changes: 1 } };
      }),
    })),
  };
}

function mockLocals(db: MockDb) {
  return {
    runtime: { env: { DB: db, SESSION: { get: vi.fn().mockResolvedValue(null) } } },
    user: null,
    session: null,
    artistSession: null,
  };
}

function mockResaleRequest(body: object) {
  return new Request("http://localhost/api/resale/create", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/resale/create", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("returns 503 with { error: 'Resale is not yet available' }", async () => {
    const db = makeDb();
    const ctx = { request: mockResaleRequest({}), locals: mockLocals(db) } as never;
    const res = await resaleCreatePost(ctx);
    expect(res.status).toBe(503);
    expect(res.headers.get("content-type")).toMatch(/application\/json/);
    const body = (await res.json()) as { error?: string };
    expect(body.error).toBe("Resale is not yet available");
  });
});

describe("POST /api/resale/buy", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("returns 503 with { error: 'Resale is not yet available' }", async () => {
    const db = makeDb();
    const ctx = { request: mockResaleRequest({}), locals: mockLocals(db) } as never;
    const res = await resaleBuyPost(ctx);
    expect(res.status).toBe(503);
    expect(res.headers.get("content-type")).toMatch(/application\/json/);
    const body = (await res.json()) as { error?: string };
    expect(body.error).toBe("Resale is not yet available");
  });
});

describe("ResaleButton component", () => {
  it("no longer imports from wagmi", () => {
    const src = readFileSync(SRC("components/ResaleButton.tsx"), "utf8");
    expect(src).not.toMatch(/from\s+["']wagmi["']/);
    expect(src).not.toMatch(/from\s+["']@rainbow-me\/rainbowkit["']/);
  });

  it("renders a 'Resale coming soon' notice in the JSX", () => {
    const src = readFileSync(SRC("components/ResaleButton.tsx"), "utf8");
    expect(src).toMatch(/resale coming soon/i);
  });
});

describe("design detail page CTA", () => {
  it("says 'Reserve this plate' on the Acquire button (en)", () => {
    const en = readFileSync(SRC("locales/en.json"), "utf8");
    const th = readFileSync(SRC("locales/th.json"), "utf8");
    const enDict = JSON.parse(en) as { artistDetail: { acquirePlate: string } };
    const thDict = JSON.parse(th) as { artistDetail: { acquirePlate: string } };
    expect(enDict.artistDetail.acquirePlate).toBe("Reserve this plate");
    // Thai is i18n-required; just assert it changed from the old literal.
    expect(thDict.artistDetail.acquirePlate).not.toBe("รับเพลทนี้");
  });
});

describe("checkout page redirect", () => {
  it("/checkout/[id] redirects to /booking?designId=[id]", () => {
    const src = readFileSync(SRC("pages/checkout/[id].astro"), "utf8");
    // The page should call Astro.redirect to /booking?designId=…
    expect(src).toMatch(/Astro\.redirect\([^)]*\/booking/);
    expect(src).toMatch(/designId=/);
  });

  it("does NOT auto-release reservations on page load", () => {
    const src = readFileSync(SRC("pages/checkout/[id].astro"), "utf8");
    // The old bug was an unconditional UPDATE that reset reserved→available.
    // The new page should not contain that statement at all.
    expect(src).not.toMatch(/UPDATE\s+designs\s+SET\s+status\s*=\s*['"]available['"]/);
  });
});
