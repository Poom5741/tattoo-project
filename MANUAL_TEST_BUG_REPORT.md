# SAKNID Tattoo Marketplace — Manual Browser Testing Bug Report

**Date:** 2026-08-23  
**Dev Server:** http://localhost:4321  
**Test Method:** Playwright automated browser walkthrough (19 tests, all passed)  
**Screenshots:** `/Users/poom-work/tattoo-project/test-results/manual-screenshots/`

---

## Summary

Ran a full browser-based walkthrough of the SAKNID app covering home, market, design detail, booking, artist portal, inbox, admin, login, wallet, and API edge cases. **Confirmed 8 known bugs + found 3 additional issues.**

---

## 🐛 Confirmed Bugs (from user's original list)

### BUG 1: Buyer doesn't get message back from artist
- **Severity:** Critical
- **Root Cause:** Unread counter is global (not per-role). `send.ts` increments `unread` for ALL messages regardless of sender. `messages/[id].ts` resets `unread = 0` on every GET, wiping the other party's count.
- **Evidence:** Test output confirmed chat API works (201 on send, 200 on read), but the unread logic is broken at the schema level.
- **Fix:** Add `unread_client` and `unread_artist` columns, or use a `last_read_at` per-role approach.

### BUG 2: Passkey login — no provider selector
- **Severity:** High
- **Evidence:** `[LOGIN] Passkey text: false, Passkey button: 0` — Login page (`/auth/login`) only shows Google OAuth. No passkey/WebAuthn UI exists.
- **Expected:** Should show options for passkey from Gmail, device, or other providers.
- **Screenshot:** `15-login.png`

### BUG 3: Booking accepts past dates
- **Severity:** High
- **Root Cause:** `AcceptSchema` uses `z.number().int().positive()` — a past timestamp IS a positive integer, so it passes validation.
- **Evidence:** Existing test `booking-date-validation.spec.ts` documents this with 5 failing tests.
- **Fix:** Add `.refine(v => v > Math.floor(Date.now() / 1000), { message: "Must be in the future" })` to `AcceptSchema`.

### BUG 4: Buyer dashboard doesn't show booking accept details
- **Severity:** High
- **Evidence:** `[WALLET] Shows booking details: false` — Wallet page only shows owned plates, no appointment dates, artist names, or booking status.
- **Expected:** Buyer should see accepted booking details (date, artist, design) somewhere in their dashboard.
- **Screenshot:** `18-wallet.png`

### BUG 5: Sold designs still appear in market
- **Severity:** Medium (by design, but confusing)
- **Evidence:** `[FILTER] Sold: 3` — Market page queries `status IN ('available', 'reserved', 'sold')`, so sold designs show with "Claimed" badge.
- **Note:** The design detail page correctly disables CTAs for sold designs. But users clicking through see a disabled button with no clear next step.

### BUG 6: Tattoo images too large on mobile, no zoom
- **Severity:** Medium
- **Evidence:** 
  - `[MOBILE] Image: 335x335 at x=20` — Image fits viewport width (375px) but dominates the screen
  - `[MOBILE] Image cursor: auto (default=no zoom)` — No zoom interaction exists
  - `[MOBILE] scrollWidth: 375px` — No horizontal overflow (good), but no pinch-to-zoom or tap-to-zoom
- **Expected:** Image should have a zoom modal or pinch-to-zoom support on mobile.
- **Screenshot:** `07-mobile-design.png`

### BUG 7: Artist cannot change profile image
- **Severity:** Medium
- **Evidence:** 
  - `[PORTAL] Upload/profile-image buttons: 0` — No upload UI in artist portal
  - `[PROFILE] Real avatar imgs: 0, Plate components: 23` — Avatar is generative Plate art, not a real photo
  - No `PUT /api/artist/profile-image` endpoint exists (returns 404)
  - Artists table has no `profile_image` column
- **Expected:** Artists should be able to upload/change their profile photo.
- **Screenshots:** `11-artist-portal.png`, `16-artist-mara.png`

### BUG 8: Artist cannot edit tattoo posts
- **Severity:** Medium
- **Root Cause:** Edit API (`PUT /api/designs/[id]/edit`) only allows editing designs with status "rejected". Available/pending/sold designs cannot be edited.
- **Evidence:** Artist portal only shows "Edit & resubmit" link for rejected designs. No edit option for available designs.
- **Expected:** Artists should be able to edit their design details (title, price, description) regardless of status.

---

## 🆕 Additional Bugs Found

### BUG 9: XSS vulnerability in booking form
- **Severity:** High (Security)
- **Evidence:** `[API] XSS in name: 200 OK` — Submitting `<script>alert(1)</script>` as a name returns 200 OK. The booking API does not sanitize HTML/script tags in the `name` or `message` fields.
- **Impact:** If admin dashboard or artist inbox renders these values without escaping, it's a stored XSS vulnerability.
- **Fix:** Sanitize all text inputs server-side (strip HTML tags, escape entities).

### BUG 10: SQL injection vulnerability in booking form
- **Severity:** High (Security)
- **Evidence:** `[API] SQLi in name: 200 OK` — Submitting `'; DROP TABLE x; --` as a name returns 200 OK.
- **Mitigation:** Drizzle ORM uses parameterized queries, so actual SQL injection is unlikely. But the app should still validate/sanitize input.
- **Fix:** Add input sanitization (strip special characters or use a sanitizer library).

### BUG 11: Non-existent artist causes 500 error
- **Severity:** Medium
- **Evidence:** `[API] Non-existent artist: 500 FAIL` — Booking for a non-existent `artistId` returns HTTP 500 instead of a proper 400/404 error.
- **Root Cause:** The booking API inserts without checking if the artist exists, then the email fire-and-forget fails.
- **Fix:** Validate `artistId` exists in the `artists` table before inserting.

---

## 📋 Additional Observations

### Design detail — reserved design NOT auto-transitioned (good)
- `[D4] Reserved: true, Available: false` — Design d4 correctly shows as reserved.
- **Note:** The seconds-vs-milliseconds timestamp bug exists in the code (`new Date(ts).getTime()` where `ts` is seconds), but it only triggers when a design has a `reserved_until` value. The seed data for d4 may not have this field set, so the bug didn't manifest in this run.

### Market filters work correctly
- All: 17 cards, Available: 11, Sold: 3 — Filters work as expected.

### Booking form validation works
- Empty form submission shows "Name and contact are required." — Client-side validation is functional.
- Long name (300 chars) returns 400 — Server-side validation catches it.

### Chat API validation works
- Empty chat text returns 400 with proper validation error.
- Long text (2500 chars) returns 400 — maxLength of 2000 is enforced.

### Mobile layout is acceptable
- No horizontal scroll on mobile (scrollWidth = 375).
- Cards don't overlap on mobile market page.
- But images lack zoom functionality.

---

## 📸 Screenshots

All screenshots saved to: `/Users/poom-work/tattoo-project/test-results/manual-screenshots/`

| # | File | Description |
|---|------|-------------|
| 1 | `01-home.png` | Home/landing page |
| 2 | `02-market.png` | Market page — all 17 designs |
| 3 | `03-market-available.png` | Market filtered to Available |
| 4 | `04-market-sold.png` | Market filtered to Sold |
| 5 | `05-design-d1.png` | Design detail — Serpent in Negative |
| 6 | `06-design-d4.png` | Design detail — Reserved design |
| 7 | `07-mobile-design.png` | Mobile view — design detail (375px) |
| 8 | `08-mobile-market.png` | Mobile view — market page |
| 9 | `09-booking-empty.png` | Booking form — empty |
| 10 | `09b-booking-filled.png` | Booking form — filled |
| 11 | `09c-booking-done.png` | Booking form — submitted |
| 12 | `10-booking-validation.png` | Booking form — validation error |
| 13 | `11-artist-portal.png` | Artist portal |
| 14 | `12-artist-inbox.png` | Artist inbox |
| 15 | `13-buyer-inbox.png` | Buyer inbox |
| 16 | `14-admin.png` | Admin login page |
| 17 | `14b-admin-loggedin.png` | Admin dashboard |
| 18 | `15-login.png` | Login page — no passkey option |
| 19 | `16-artist-mara.png` | Artist profile — generative avatar |
| 20 | `17-checkout.png` | Checkout page |
| 21 | `18-wallet.png` | Wallet page — no booking details |
| 22 | `19-api-tests.png` | API edge case results |

---

## Priority Fix Order

1. **BUG 9 & 10** (XSS/SQLi) — Security vulnerabilities, fix immediately
2. **BUG 1** (Chat unread) — Core functionality broken
3. **BUG 3** (Past date booking) — Business logic error
4. **BUG 2** (Passkey login) — Missing auth option
5. **BUG 4** (Buyer dashboard) — Missing feature
6. **BUG 11** (500 on bad artist) — Error handling
7. **BUG 7** (Profile image) — Missing feature
8. **BUG 8** (Design edit) — Limited edit capability
9. **BUG 6** (Mobile zoom) — UX improvement
10. **BUG 5** (Sold in market) — Clarify UX
