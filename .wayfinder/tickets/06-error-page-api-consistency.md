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

**Recommendation:** Option A (no envelope) — it's simpler, already the majority pattern, and the frontend already handles it this way. Just ensure all error responses use `{ error: string }` consistently.

Audit all API endpoints and fix any that deviate:
- `GET /api/designs` — returns raw array (fine)
- `GET /api/wallet/[addr]` — returns raw array (fine)
- `POST /api/admin/login` — returns `{ error: "..." }` (fine)
- Any endpoint that returns a string instead of `{ error: "..." }` on failure

### 3. Voucher Endpoint Auth

`POST /api/voucher` creates a mint voucher signed by the server's private key. It has **no authentication check** — anyone can request a voucher for any design.

**Fix:** Add authentication — either require admin session or artist session (the artist who owns the design). At minimum, require that the requester is authenticated.

### Acceptance Criteria

- [ ] `500.astro` page exists with Bone & Blood theme
- [ ] All API error responses use `{ error: string }` format
- [ ] `POST /api/voucher` requires authentication
- [ ] No endpoint returns raw strings on error
- [ ] E2E tests still pass

### Files to Change

- `src/pages/500.astro` — new file
- `src/pages/api/voucher.ts` — add auth check
- Various API endpoints — audit and fix error format
