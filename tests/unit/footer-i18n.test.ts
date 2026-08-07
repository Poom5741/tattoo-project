/**
 * Footer cleanup + readHtmlLocale fix + footer i18n — unit tests (TDD).
 *
 * Per ticket 05 of the .wayfinder map:
 *   1. Footer links are deduplicated and point to correct pages.
 *   2. readHtmlLocale() is removed from all 5 React components.
 *   3. Footer text is i18n-enabled (en + th keys exist).
 *
 * Prerequisites: vitest (pnpm test). No network required.
 */

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const SRC = (p: string) => resolve(__dirname, "../../src", p);

describe("footer — link correctness", () => {
  let footer: string;

  beforeAll(() => {
    footer = readFileSync(SRC("components/Footer.astro"), "utf8");
  });

  it("Browse plates links to /market", () => {
    expect(footer).toMatch(/href="\/market"[^>]*>\s*\{t\("footer\.browsePlates"\)\}/);
  });

  it("Book a session links to /booking, not /artists", () => {
    expect(footer).toMatch(/href="\/booking"[^>]*>\s*\{t\("footer\.bookSession"\)\}/);
  });

  it("How it works links to /#how-it-works, not /", () => {
    expect(footer).toMatch(/href="\/#how-it-works"/);
  });

  it("no dead link goes to bare /", () => {
    // Every <a href="/"> should be exactly the SAKNID logo link, not a nav item.
    // After the fix, the only bare / links are the logo and potentially the
    // "How it works" anchor. The footer body should have zero href="/" links
    // in the nav sections.
    const logoSection = footer.split("</div>")[0]; // first top-level div
    const navLinks = footer.replace(logoSection, "");
    const bareSlashLinks = navLinks.match(/<a[^>]*href="\/"[^>]*>/g) ?? [];
    expect(bareSlashLinks).toHaveLength(0);
  });

  it("'New releases' is removed (was duplicate of Browse plates)", () => {
    expect(footer).not.toMatch(/>New releases</);
  });

  it("'Apply to sell' is removed (dead link, no real page)", () => {
    expect(footer).not.toMatch(/>Apply to sell</);
  });
});

describe("readHtmlLocale — removed from all components", () => {
  const COMPONENTS = [
    "Nav.tsx",
    "BookingForm.tsx",
    "InboxView.tsx",
    "ChatBox.tsx",
    "WalletOwnedPlates.tsx",
  ];

  COMPONENTS.forEach((file) => {
    it(`${file} no longer defines readHtmlLocale`, () => {
      const src = readFileSync(SRC(`components/${file}`), "utf8");
      expect(src).not.toMatch(/function readHtmlLocale/);
    });

    it(`${file} uses propLocale with fallback to "en" (not DOM read)`, () => {
      const src = readFileSync(SRC(`components/${file}`), "utf8");
      // The pattern should be: propLocale || "en" — no document.querySelector
      expect(src).not.toMatch(/document\.querySelector/);
    });
  });
});

describe("footer — i18n keys exist", () => {
  it("en.json has a 'footer' object with expected keys", () => {
    const en = JSON.parse(readFileSync(SRC("locales/en.json"), "utf8"));
    expect(en.footer).toBeDefined();
    expect(typeof en.footer.tagline).toBe("string");
    expect(typeof en.footer.galleryTitle).toBe("string");
    expect(typeof en.footer.browsePlates).toBe("string");
    expect(typeof en.footer.artistsTitle).toBe("string");
    expect(typeof en.footer.bookSession).toBe("string");
    expect(typeof en.footer.howItWorks).toBe("string");
    expect(typeof en.footer.copyright).toBe("string");
  });

  it("th.json has a 'footer' object with all the same keys", () => {
    const en = JSON.parse(readFileSync(SRC("locales/en.json"), "utf8"));
    const th = JSON.parse(readFileSync(SRC("locales/th.json"), "utf8"));
    expect(th.footer).toBeDefined();
    const enKeys = Object.keys(en.footer).sort();
    const thKeys = Object.keys(th.footer).sort();
    expect(thKeys).toEqual(enKeys);
  });
});
