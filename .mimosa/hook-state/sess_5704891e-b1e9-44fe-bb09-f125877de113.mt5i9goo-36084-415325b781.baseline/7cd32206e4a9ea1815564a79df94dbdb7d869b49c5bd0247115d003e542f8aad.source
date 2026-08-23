/**
 * Legacy localStorage cleanup — unit test.
 *
 * Verifies that the Base layout's boot script removes the legacy prototype
 * keys `suknid_col` and `suknid_book` from localStorage.
 *
 * The cleanup logic lives in a <script> tag inside src/layouts/Base.astro.
 * We extract and run the same logic here rather than importing the .astro file
 * directly (Astro components are not importable in Vitest without the full
 * Vite/Astro pipeline).
 *
 * Prerequisites: vitest + happy-dom (configured in vitest.config.ts).
 */

import { describe, it, expect, beforeEach } from "vitest";

// Extracted verbatim from src/layouts/Base.astro <script> tag
function runBootScript() {
  try {
    localStorage.removeItem("suknid_col");
    localStorage.removeItem("suknid_book");
  } catch (_) {}
}

describe("Base layout legacy cleanup", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("removes suknid_col when it exists", () => {
    localStorage.setItem("suknid_col", JSON.stringify(["design-1", "design-2"]));
    runBootScript();
    expect(localStorage.getItem("suknid_col")).toBeNull();
  });

  it("removes suknid_book when it exists", () => {
    localStorage.setItem("suknid_book", JSON.stringify([{ id: "b1" }]));
    runBootScript();
    expect(localStorage.getItem("suknid_book")).toBeNull();
  });

  it("removes both keys simultaneously", () => {
    localStorage.setItem("suknid_col", "[]");
    localStorage.setItem("suknid_book", "[]");
    runBootScript();
    expect(localStorage.getItem("suknid_col")).toBeNull();
    expect(localStorage.getItem("suknid_book")).toBeNull();
  });

  it("does not throw when keys are absent", () => {
    expect(() => runBootScript()).not.toThrow();
  });

  it("does not disturb unrelated localStorage keys", () => {
    localStorage.setItem("other_key", "keep-me");
    localStorage.setItem("suknid_col", "[]");
    runBootScript();
    expect(localStorage.getItem("other_key")).toBe("keep-me");
  });
});
