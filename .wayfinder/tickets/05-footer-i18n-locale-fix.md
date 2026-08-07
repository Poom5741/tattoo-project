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

- [ ] Footer links are deduplicated and point to correct pages
- [ ] Footer text is i18n-enabled (en + th)
- [ ] `readHtmlLocale()` removed from all 5+ components
- [ ] All Astro pages pass `locale` prop to affected components
- [ ] No hydration mismatches from locale reads
- [ ] E2E tests still pass

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
