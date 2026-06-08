/**
 * Legacy localStorage cleanup — unit test.
 *
 * Verifies that the Base layout's boot script removes the legacy prototype
 * keys `inknoir_col` and `inknoir_book` from localStorage.
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
    localStorage.removeItem("inknoir_col");
    localStorage.removeItem("inknoir_book");
  } catch (_) {}
}

describe("Base layout legacy cleanup", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("removes inknoir_col when it exists", () => {
    localStorage.setItem("inknoir_col", JSON.stringify(["design-1", "design-2"]));
    runBootScript();
    expect(localStorage.getItem("inknoir_col")).toBeNull();
  });

  it("removes inknoir_book when it exists", () => {
    localStorage.setItem("inknoir_book", JSON.stringify([{ id: "b1" }]));
    runBootScript();
    expect(localStorage.getItem("inknoir_book")).toBeNull();
  });

  it("removes both keys simultaneously", () => {
    localStorage.setItem("inknoir_col", "[]");
    localStorage.setItem("inknoir_book", "[]");
    runBootScript();
    expect(localStorage.getItem("inknoir_col")).toBeNull();
    expect(localStorage.getItem("inknoir_book")).toBeNull();
  });

  it("does not throw when keys are absent", () => {
    expect(() => runBootScript()).not.toThrow();
  });

  it("does not disturb unrelated localStorage keys", () => {
    localStorage.setItem("other_key", "keep-me");
    localStorage.setItem("inknoir_col", "[]");
    runBootScript();
    expect(localStorage.getItem("other_key")).toBe("keep-me");
  });
});
