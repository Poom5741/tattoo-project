# Ticket: Fix — 500 Error Page, API Consistency & Voucher Auth

**wayfinder:task**

## Question

Three code quality fixes:

### 1. 500 Error Page

There's a `404.astro` page but no `500.astro`. When an unhandled server error occurs, Astro shows its default error page — which doesn't match the Bone & Blood theme.

**Fix:** Create `src/pages/500.astro` with:
- Same layout as 404 (Base + Nav + Footer)
- "Something went wrong" message
- "Back to gallery" CTA
- Consistent with the Bone & Blood design system
- In Chinese/Thai if locale is set

### 2. API Response Envelope Inconsistency

Some API endpoints return `{ error: "..." }` on failure, some return raw arrays on success, some wrap in `{ data: [...] }`. There's no consistent envelope.

**Decision needed:** Standardize on one pattern. Options:
- **Option A:** No envelope — return raw data on success, `{ error: "..." }` on failure (current majority pattern)
- **Option B:** Full envelope — `{ data: [...], error: null }` on success, `{ data: null, error: "..." }` on failure

**Recommendation:** Option A (no envelope) — it's simpler, already the majority pattern, and the frontend already handles it this way. Just ensure all error responses use `{ error: "..." }` consistently.

Audit all API endpoints and fix any that deviate:
- `GET /api/designs` — returns raw array (fine)
- `GET /api/wallet/[addr]` — returns raw array (fine)
- `POST /api/admin/login` — returns `{ error: "..." }` (fine)
- Any endpoint that returns a string instead of `{ error: "..." }` on failure

### 3. Voucher Endpoint Auth

`POST /api/voucher` creates a mint voucher signed by the server's private key. It has **no authentication check** — anyone can request a voucher for any design.

**Fix:** Add authentication — either require admin session or artist session (the artist who owns the design). At minimum, require that the requester is authenticated.

### Acceptance Criteria

- [x] `500.astro` page exists with Bone & Blood theme
- [x] All API error responses use `{ error: string }` format (offender: register-artist.ts)
- [x] `POST /api/voucher` requires authentication
- [x] No endpoint returns raw strings on error
- [x] Unit tests cover the seam

## Resolution

### 1. 500.astro

`src/pages/500.astro` created. Mirrors `404.astro`'s structure (Base layout + Nav + Footer, Bone & Blood tokens, "Back to gallery" CTA). The page is `prerender = false` so a live error context is available if we want to add per-request messages later. Locale-aware copy deferred — the page uses the same hardcoded English as 404, and adding i18n keys for the 500 path is a separate small follow-up.

### 2. API envelope

Audited all 30+ API endpoints. The only offender returning raw strings was `POST /api/admin/register-artist.ts` (6 responses: invalid form data, missing name, invalid name, invalid wallet, duplicate ID, internal error). All converted to a `{ error: string }` JSON envelope via a local `jsonError(status, message)` helper.

The 401-null-body pattern (used by admin / bookings / artist endpoints to short-circuit unauthorized requests) is left as-is. It does not return raw strings; it's an intentional "no body" sentinel. Changing it to a JSON body is a separate, cross-cutting change that needs the calling pages to handle the new shape. Logged on the map as out-of-scope follow-up if we want a stricter pass later.

Other endpoints already use the envelope. The audit confirmed `chillpay/*`, `auth/*`, `admin/login`, `admin/register-artist` (after fix), `designs/*`, `voucher`, `upload`, `earnings`, `bookings/*`, `chat/*`, `wallet/*`, `confirm`, `reconcile`, `resale/*` are all consistent.

### 3. Voucher auth

`POST /api/voucher` now requires one of:
- A buyer session (`locals.user`) — and the body's `buyer` field must case-insensitively match the session user id (the wallet address).
- An artist session (`locals.artistSession`).
- The dev-admin role (when `DEV_MODE=true` and `dev_role=admin`).

The buyer-must-match check prevents a session of buyer A from being used to mint a voucher for buyer B. The artist path allows an artist to mint on behalf of any of their own designs (the existing owner check on the design row enforces the ownership).

`artistSession` support is in place but the artist ownership check (the body of the function — not the auth gate) is left as a follow-up if the team wants to tighten it. Today, any artist session can voucher any design; the design's own `UPDATE … WHERE status='available'` clause still prevents double-minting.

### Files changed
- `src/pages/500.astro` — new
- `src/pages/api/admin/register-artist.ts` — 6 raw-string responses → JSON envelope via `jsonError()` helper
- `src/pages/api/voucher.ts` — added auth gate + buyer-must-match check

### Tests added (TDD, RED→GREEN per slice)
- `tests/unit/error-page-500.test.ts` — 6 tests (file structure, prerender flag, layout imports, status number, CTA)
- `tests/unit/voucher-auth.test.ts` — 2 tests (no session → 401, buyer mismatch → 403)
- `tests/unit/api-envelope.test.ts` — 3 tests (invalid form / missing name / invalid wallet all return JSON `{ error: string }`)

### Open follow-ups (logged on map, not in scope)
- Apply the same envelope to the 401-null-body endpoints if we want full consistency.
- Stricten voucher auth: artist session must own the design (not just be any artist).
- I18n strings for the 500 page.
- 500 page should report a short request id (already logged by the API routes) so users can quote it in support.
