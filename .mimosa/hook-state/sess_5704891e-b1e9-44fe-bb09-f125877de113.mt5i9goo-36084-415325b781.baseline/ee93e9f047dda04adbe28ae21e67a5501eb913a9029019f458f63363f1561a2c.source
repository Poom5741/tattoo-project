/**
 * 401 null-body → JSON envelope — unit tests (TDD).
 *
 * All API error responses should return `{ error: string }` JSON.
 * Six endpoints were returning `new Response(null, { status: 401 })`.
 * This test pins the fix.
 */

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const SRC = (p: string) => resolve(__dirname, "../../src", p);

const OFFENDERS = [
  "pages/api/artist/earnings.ts",
  "pages/api/bookings/[id]/accept.ts",
  "pages/api/bookings/[id]/decline.ts",
  "pages/api/admin/register-artist.ts",
  "pages/api/admin/review-design.ts",
  "pages/api/admin/pending-designs.ts",
];

describe("401 responses return JSON { error: 'Unauthorized' }", () => {
  OFFENDERS.forEach((file) => {
    it(`${file} uses JSON envelope, not null body`, () => {
      const src = readFileSync(SRC(file), "utf8");
      // Should not contain the null-body 401 pattern
      expect(src).not.toMatch(/new Response\(null,\s*\{\s*status:\s*401/);
      // Should contain a JSON 401 with error message
      expect(src).toMatch(/Unauthorized/);
      expect(src).toMatch(/application\/json/);
    });
  });
});
