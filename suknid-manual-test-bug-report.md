# SAKNID Tattoo Marketplace — Manual Bug Hunt Report

**Date:** 2026-08-23
**Scope:** Exploratory manual testing of http://localhost:4321 (Astro 5 + Cloudflare Pages + D1 + R2) to find *additional* bugs beyond the 8 already reported.
**Method:** Manual navigation (Playwright browser + direct HTTP), supplemented by 4 independent code-review passes (auth, booking/chat, design lifecycle, UI/responsive). Every finding below is backed by live API/browser evidence or source inspection.
**Test data note:** testing mutated seeded rows (booking `164` accepted; `bug-test-reserved` flipped to `available` on read) — expected, it is a sandbox DB.

---

## Executive summary

**~30 new issues found** beyond the original 8, of which **3 are Critical** (all security), **7 High**, and the rest Medium/Low.

The most important discoveries:

1. **Anyone can become admin or artist by setting a `dev_role` cookie** — the dev role-switcher backdoor is compiled into the production nav with zero environment gating.
2. **The admin password and Better Auth signing secret both have hardcoded fallbacks** committed to git.
3. **An unauthenticated attacker can forge a conversation into any wallet's inbox** (the booking `contact` field is used as the chat `client_id`).
4. **`GET /api/designs` leaks every design** (pending/rejected/delisted included) with no auth, filter, or pagination.

### Severity distribution

| Severity | Count | Area |
|---|---|---|
| 🔴 Critical | 3 | Auth/security |
| 🟠 High | 7 | Auth, booking/chat, design, data-hygiene |
| 🟡 Medium | 10 | Booking/chat, design, i18n/UI |
| 🟢 Low | 10 | Auth hardening, i18n, UX polish |

---

## 🔴 Critical

### C1. `dev_role` cookie grants full admin/artist access — no environment gate
- **Area:** Auth / access control
- **Location:** `src/lib/admin/auth.ts:7-8`, `src/lib/artist/auth.ts:13-15`, `src/middleware.ts:30-35`, `DevRoleSwitcher` rendered in `Nav.tsx:99,183`
- **Description:** `isAdminAuthed()` returns `true` when a `dev_role=admin` cookie is present; `getArtistSession()` returns a synthetic session for `dev_role=artist` *or* `dev_role=admin`. Neither checks `import.meta.env.DEV`/`PROD`, and the `DevRoleSwitcher` component (which writes this cookie) is rendered unconditionally in the production nav. Any visitor can set the cookie and become admin.
- **Reproduction:** `curl -H 'Cookie: dev_role=admin' http://localhost:4321/api/admin/pending-designs` → `200 []` (was `401` without the cookie). Same for `dev_role=artist` on `/api/artist/earnings`.
- **Fix:** Gate every dev-role path behind `import.meta.env.DEV` (or strip the override from production builds) in both lib files, middleware, and the Nav render. Do not rely on hiding the UI — the cookie is attacker-controllable via curl/devtools.

### C2. Hardcoded default admin password
- **Area:** Auth
- **Location:** `src/pages/api/admin/login.ts:19` (`env.ADMIN_PASSWORD ?? "saknid2026"`)
- **Description:** The fallback password is committed to git and is live in this environment (no `ADMIN_PASSWORD` set). A production deploy that forgets the secret is wide open.
- **Evidence:** `POST /api/admin/login {"password":"saknid2026"}` → `200` + `admin_token` cookie.
- **Fix:** Remove the fallback; return 500/503 when unset. Compare with a constant-time check (and hash the value).

### C3. Hardcoded fallback Better Auth signing secret
- **Area:** Auth
- **Location:** `src/lib/auth/server.ts:17` (`env.BETTER_AUTH_SECRET || "default-secret-change-in-production-1234567890"`)
- **Description:** When `BETTER_AUTH_SECRET` is unset (it is unset here), all sessions are signed with a publicly-known secret, allowing session-cookie forgery to impersonate any user on endpoints that trust `locals.user`.
- **Fix:** Fail closed at startup if the secret is missing; never ship a fallback.

---

## 🟠 High

### H1. `GET /api/designs` returns every design — no status filter, no pagination
- **Area:** Design lifecycle / marketplace
- **Location:** `src/pages/api/designs/index.ts`
- **Description:** `SELECT * FROM designs ORDER BY token_id ASC` with no `WHERE`/`LIMIT`, on a public (unprotected-classified) route. Any caller can enumerate `pending`, `rejected`, and `delisted` designs with their `image_url`, `artist_id`, and price.
- **Evidence:** `curl http://localhost:4321/api/designs` returns 17 rows interleaving sold/reserved/available + the two `bug-test-*` rows.
- **Fix:** Add `WHERE status IN ('available','reserved','sold')` and `LIMIT/OFFSET`, or gate the route behind auth if it is meant to be internal.

### H2. Accept booking accepts PAST / nonsensical appointment dates
- **Area:** Booking
- **Location:** `src/pages/api/bookings/[id]/accept.ts:8` (`appointmentDate: z.number().int().positive()`)
- **Description:** Only `integer` + `positive` is enforced — no future-date check and no upper bound. Any positive epoch seconds is persisted verbatim.
- **Evidence:** `PUT /api/bookings/164/accept {"appointmentDate":<yesterday>}` → `200 accepted`. `1700000000` (2023) and `99999999999` (~year 5138) both accepted.
- **Fix:** Enforce `appointmentDate > now + lead` and `<= now + horizon` (e.g. 2 years). Align or delete the unused `BookingActionSchema`.

### H3. Booking `contact` used as chat `client_id` → thread merge + inbox spoofing
- **Area:** Booking / chat (identity)
- **Location:** `src/pages/api/bookings.ts:46` (`clientId = buyerWallet ?? locals.user?.id ?? contact`)
- **Description:** For anonymous bookings, `client_id` is the raw attacker-controlled `contact` string. Consequences: (a) all bookings with the same contact collapse into one thread; (b) an attacker submits `contact = <victim wallet>` to forge a conversation that appears in the victim's inbox (the read filter matches on `client_id`).
- **Evidence:** Two anonymous bookings with the same contact returned the same `conversationId` (`unread=2`, second `design_id` ignored). A booking with `contact="0x2222…"` created a conversation with that forged `client_id`.
- **Fix:** Never derive identity from `contact`. Use an authenticated client identity; store `contact` as display-only. For anonymous threads, mint a non-forgeable session token and require it for reads.

### H4. Buyer wallet/id mismatch — some buyer conversations invisible in inbox
- **Area:** Booking / chat (identity)
- **Location:** `src/pages/api/bookings.ts:46` (writes `client_id = buyerWallet`) vs `src/pages/api/chat/conversations/index.ts:39-41` (reads `client_id = user.id`); root cause `src/middleware.ts:76-112`
- **Description:** The booking form sends the passkey wallet address, but the inbox filters on a *different* viem `client_token` session id. When the two differ, the buyer's own conversation is missing from their inbox.
- **Evidence:** Booking with `buyerWallet="0x1111…"` created a conversation invisible to the buyer's session (`clientId="test-client"`).
- **Fix:** Pick one canonical client identity and use it for both write and read paths.

### H5. ChillPay webhook writes a string transaction id into `token_id INTEGER UNIQUE`
- **Area:** Design lifecycle / payment
- **Location:** `src/pages/api/chillpay/webhook.ts`
- **Description:** On success it does `UPDATE designs SET token_id = ?` with `transactionId = "CHILL"+Date.now()` (non-numeric). This breaks the `INTEGER UNIQUE` contract and makes the design unfindable by the metadata endpoint (`WHERE token_id = Number(...)`).
- **Fix:** Leave `token_id` NULL for off-chain sales, or assign a real on-chain token id; keep the payment reference in a separate column.

### H6. Soft-deleted artists still appear on the public site
- **Area:** Artist profile
- **Location:** `src/pages/artists.astro:32`, `src/pages/artist/[id].astro:46`
- **Description:** `delete-artist.ts` soft-deletes via `deleted_at`, and the admin UI promises the artist "will be hidden", but the public roster and detail page don't filter `deleted_at`.
- **Fix:** Add `AND deleted_at IS NULL` to the public artist queries (roster + detail + sub-queries in market/design).

### H7. Junk `test-profile-img-*` artist records leak into public surfaces
- **Area:** Data hygiene (artist profile image flow)
- **Location:** artist creation path used by profile-image testing
- **Description:** Three artist rows named `test-profile-img-<timestamp>` (empty name/handle/city/bio, style "Ink", rate 0) are visible on `/artists` and selectable in the booking form's artist dropdown.
- **Evidence:** Playwright `/booking` dropdown lists `test-profile-img-1787346135301`, `-1787346671781`, `-1787346806529`; `/artists` body contains all three.
- **Fix:** Add cleanup for test-created artists; never derive an artist's display name from an upload filename.

---

## 🟡 Medium

### M1. accept / decline never notify the buyer
- **Location:** `src/pages/api/bookings/[id]/accept.ts:83-86`, `decline.ts:59-62`
- **Description:** Status changes write no chat message, don't bump `unread`, and send no email. The `messages.booking_action` column is never written. The buyer has no signal their request was accepted/declined. (Directly related to the known "buyer dashboard shows no accept details".)

### M2. Edition numbering polluted — `nextN = MAX(CAST(n AS INTEGER)) + 1`
- **Location:** `src/pages/api/designs/create.ts`
- **Description:** Test rows `n=998/999` inflate the next edition to `1000` instead of `16`; output is unpadded vs seed's `001…015`.

### M3. `reserved_until` stored in two incompatible formats
- **Location:** `src/pages/api/voucher.ts` (epoch seconds) vs `src/pages/api/chillpay/create-order.ts` (ISO-8601 string)
- **Description:** Consumers assume one format, so expiry semantics break depending on the reserving path.

### M4. "Edit & resubmit" flow disconnected — edit endpoint unreachable
- **Location:** `src/pages/artist/portal.astro`, `src/components/NewDesignForm.tsx`; API `src/pages/api/designs/[id]/edit.ts`
- **Description:** The portal's "Edit & resubmit" passes `editId`, but `NewDesignForm` reads no `editId`, never prefills, and always POSTs to `/create`. The `PUT …/edit` endpoint is never called by any client. (This is the structural cause of the known "edit tattoo post broken".)

### M5. NFT metadata `image` points to a non-existent `.json` URL
- **Location:** `src/pages/api/metadata/[tokenId].ts`
- **Description:** `image` falls back to `${R2_PUBLIC_URL}/metadata/${tokenId}.json` (a 404 JSON path) and ignores the real `image_url`.

### M6. Rate limiter trusts client `X-Forwarded-For` / collapses to `"unknown"`
- **Location:** `src/lib/security/rate-limit.ts:71-80`
- **Description:** Attackers can rotate `X-Forwarded-For` to bypass the 5/min login cap; or everyone shares the `"unknown"` bucket when headers are absent.

### M7. Hardcoded English on artist detail page (ignores locale)
- **Location:** `src/pages/artist/[id].astro` ("Available plates", "2 OF 5 OPEN", "yrs", "€180/hr", status tags) — persists under `locale=th`.

### M8. Hardcoded English on design detail page
- **Location:** `src/pages/design/[id].astro:99,195,205-208,242` ("Drawn by hand…", "collectors", "Resale coming soon", `fmtDate` hardcodes `en-GB`).

### M9. Market grid filters/badges hardcoded English (no `locale` plumbed)
- **Location:** `src/components/MarketGrid.tsx` ("Available/Reserved/Claimed", "SOULBOUND", filters, empty state).

### M10. Artist portal + NewDesignForm + inbox fully hardcoded English; uses non-existent `font-sora`/`font-playfair` classes
- **Location:** `src/pages/artist/portal.astro`, `src/components/NewDesignForm.tsx`, `src/components/InboxView.tsx`
- **Description:** Entire portal/form is English; `font-sora`/`font-playfair` are undefined tokens (real tokens are `font-body`/`font-display`), so intended typefaces silently fall back.

---

## 🟢 Low

### L1. Nonce deleted before signature verification (login DoS)
- **Location:** `src/pages/api/auth/client-login.ts:47-49`, `artist-login.ts:47-49`

### L2. Login challenge not bound to purpose/address
- **Location:** `src/pages/api/auth/challenge.ts:12` (shared `inknoir-artist-login-${nonce}` for both flows)

### L3. Conversations list returns raw ids (no artist/client name JOIN)
- **Location:** `src/pages/api/chat/conversations/index.ts:51-63`

### L4. `BookingActionSchema` is dead code and inconsistent
- **Location:** `src/lib/api/schemas.ts:106-112`

### L5. Footer "How it works" anchor points to a missing element
- **Location:** `src/components/Footer.astro:36` → `/#how-it-works` (no `id="how-it-works"` exists)

### L6. Invalid Tailwind opacity classes silently drop styling
- **Location:** `MarketGrid.tsx` (`bg-*-900/8`, `bg-on-surface/8`), `admin/artists.astro` (`bg-error/container`)

### L7. `TranslationKeys` type stale (missing several groups)
- **Location:** `src/lib/i18n/types.ts`

### L8. Currency/label inconsistency (THB vs USDT) + unvalidated email in admin artist endpoints
- **Location:** `NewDesignForm.tsx` "Price (THB)" vs `price_usdt`; `edit-artist.ts`/`register-artist.ts` accept any email string

### L9. Admin booking status transitions inconsistent with accept/decline
- **Location:** `admin/index.astro` `VALID_TRANSITIONS` (`pending→confirmed`, `accepted→confirmed`, `confirmed→completed|cancelled`) has no entry for `declined` → declined bookings are a terminal orphan; "accepted" vs "confirmed" are parallel vocabularies.

### L10. Inbox SSR renders "No active conversations" (requires client hydration)
- **Location:** `src/components/InboxView.tsx` — initial SSR state is empty; conversations appear only after client fetch.

---

## ✅ Verified NOT broken (for accuracy)

- **Sold-design detail CTA:** `/design/bug-test-sold` correctly renders a disabled "🔒 Claimed — retired" button (no Acquire/Book). The known "sold still available" symptom is the *market listing*, not the detail CTA.
- **Mobile horizontal overflow:** at 390px the market grid does not overflow (`scrollW == innerW`); design image renders 350×350. The "huge image / no zoom" issue is app-level (no pinch/zoom affordance, `overflow-hidden` clips), not a viewport/overflow defect.
- **`upload.ts`** already validates MIME (jpeg/png/webp) and 10 MB size.
- **Chat read access control:** client↔client and artist↔artist reads correctly return 403 — the vulnerability is identity *establishment* (H3/H4), not the read checks.

---

## Known bugs (context — already reported, re-confirmed here)

1. Booking accepts past dates (now H2, broadened).
2. Passkey login doesn't let the user choose passkey source (gmail/machine/other) — unchanged.
3. Buyer doesn't get message back from artist (→ M1 + H3/H4).
4. Buyer dashboard doesn't show booking-accept details (→ M1).
5. Sold design still appears on sale (→ H1 + market listing).
6. Small-screen design rendering/zoom (app-level, no zoom affordance).
7. Artist profile image change broken (structural: no image column/endpoint/UI — see UI review).
8. Edit tattoo post broken (structural: edit UI never calls `PUT …/edit` — M4).

---

## Suggested fix order (quick wins → structural)

1. **P0 (today):** Gate `dev_role` behind `import.meta.env.DEV`; remove hardcoded admin password + Better Auth secret fallbacks (C1–C3).
2. **P0:** Add status filter + pagination to `GET /api/designs` (H1).
3. **P1:** Fix booking/chat identity — stop using `contact` as `client_id`; canonicalize wallet↔session id; enforce future-date `appointmentDate` (H2–H4).
4. **P1:** Filter soft-deleted artists; clean up `test-profile-img-*` rows (H6, H7).
5. **P2:** Notify buyer on accept/decline; wire up the edit & resubmit flow; fix ChillPay `token_id` + metadata image (M1, M4, H5, M5).
6. **P3:** i18n sweep (artist/detail/market/portal) + Tailwind class/type fixes (M7–M10, L5–L8).

---

## Evidence assets

- Screenshots: `.cluster/suknid-manual-test/screenshots/{mobile-market,mobile-design-d1,desktop-design-sold,desktop-booking,desktop-artists}.png`
- Full per-surface reports: `.cluster/suknid-manual-test/subagent_01..04.md`
- Orchestrator first-hand findings: `.cluster/suknid-manual-test/mainline_findings.md`
- Playwright navigation script: `.cluster/suknid-manual-test/navigate.js`
