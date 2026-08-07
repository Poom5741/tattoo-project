# Ticket: Flow — Footer Cleanup, i18n & readHtmlLocale Fix

**wayfinder:task**

## Question

Three polish items across the navigation and locale layer:

### 1. Footer Link Cleanup

`src/components/Footer.astro` has duplicated and dead links:
- "Browse plates" and "New releases" both go to `/market`
- "The roster", "Apply to sell", and "Book a session" all go to `/artists`
- "Aftercare" and "Authenticity" go to `/` (dead)

**Fix:** Deduplicate and correct:
- "Browse plates" → `/market`
- "New releases" → `/market` (remove or keep — it's the same page)
- "The roster" → `/artists`
- "Book a session" → `/booking`
- "How it works" → `/#how-it-works` (anchor link)
- "Aftercare" → remove or link to a real page (if one exists)
- "Authenticity" → remove or link to a real page

Also add i18n to all footer strings (currently hardcoded English).

### 2. readHtmlLocale DOM Read Pattern

5+ components use `readHtmlLocale()` which reads `document.querySelector("html")?.getAttribute("data-locale")` during React initialization. Your own AGENTS.md says DON'T do this — it returns fallback values on the server, causing hydration mismatches.

Components affected:
- `src/components/Nav.tsx`
- `src/components/ChatBox.tsx`
- `src/components/InboxView.tsx`
- `src/components/BookingForm.tsx`
- `src/components/WalletOwnedPlates.tsx`

**Fix:** The correct pattern is already used in some places — pass `locale` as a prop from Astro SSR. The components already accept `locale?: Locale` props. The fix is:
1. Remove the `readHtmlLocale()` function from each component
2. Use only the `propLocale` prop (with a default of `"en"`)
3. Ensure every Astro page that renders these components passes `locale={locale}`

Most pages already do this. Verify each one passes the prop.

### 3. Footer i18n

Add footer text to `en.json` and `th.json` locale files:
```json
"footer": {
  "tagline": "A gallery of one-of-one tattoo plates...",
  "galleryTitle": "Gallery",
  "browsePlates": "Browse plates",
  "yourCollection": "Your collection",
  "artistsTitle": "Artists",
  "theRoster": "The roster",
  "bookSession": "Book a session",
  "houseTitle": "House",
  "howItWorks": "How it works",
  "copyright": "© 2026 SAKNID — house of one-off ink",
  "locations": "Berlin · Osaka · CDMX · Stockholm"
}
```

### Acceptance Criteria

- [x] Footer links are deduplicated and point to correct pages
- [x] Footer text is i18n-enabled (en + th)
- [x] `readHtmlLocale()` removed from all 5+ components
- [x] All Astro pages pass `locale` prop to affected components
- [x] No hydration mismatches from locale reads
- [x] E2E tests still pass

### Files to Change

- `src/components/Footer.astro` — deduplicate links, add i18n
- `src/locales/en.json` — add footer keys
- `src/locales/th.json` — add footer keys
- `src/components/Nav.tsx` — remove readHtmlLocale
- `src/components/ChatBox.tsx` — remove readHtmlLocale
- `src/components/InboxView.tsx` — remove readHtmlLocale
- `src/components/BookingForm.tsx` — remove readHtmlLocale
- `src/components/WalletOwnedPlates.tsx` — remove readHtmlLocale
- Various `.astro` pages — verify locale prop is passed

## Resolution

### Footer link cleanup

`Footer.astro` was rewritten to use `t()` calls for all visible text. Links corrected:
- "New releases" removed (was a duplicate of "Browse plates").
- "Apply to sell" removed (dead — no real page).
- "Aftercare" and "Authenticity" removed (dead — no real pages).
- "Book a session" → `/booking` (was `/artists`).
- "How it works" → `/#how-it-works` (anchor link, was `/`).

### readHtmlLocale removal

All 5 components cleaned up in the same pattern:
- `readHtmlLocale()` function deleted.
- `useState<Locale>(propLocale || readHtmlLocale)` → `useState<Locale>(propLocale || "en")`.
- `document.querySelector` no longer appears in any of the 5 files.

The `locale` prop is already passed from every Astro page that renders these components (verified by the existing i18n tests). The DOM read was redundant and the source of hydration mismatches.

### Footer i18n

`footer` keys added to both `en.json` and `th.json`:
- `en.json` — 11 keys (tagline, galleryTitle, browsePlates, yourCollection, artistsTitle, theRoster, bookSession, houseTitle, howItWorks, copyright, locations)
- `th.json` — same 11 keys with Thai translations

`Footer.astro` now imports `createT` and wraps all visible strings in `t()` calls.

### Tests added (TDD, RED→GREEN per slice)
- `tests/unit/footer-i18n.test.ts` — 18 tests:
  - 6 link correctness tests (dedup, dead link removal, correct hrefs)
  - 10 readHtmlLocale removal tests (no function, no document.querySelector)
  - 2 i18n keys existence tests (en + th footer objects)
