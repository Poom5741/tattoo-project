# Wayfinder Map: SAKNID Production-Ready Soft Launch

## Destination

SAKNID is production-ready for soft launch: all security gaps fixed, every user flow polished and working, payment/resale flows disabled with clear notices, currency displays corrected, and the codebase consistent enough for real users.

## Notes

- **Payments are disabled.** ChillPay is implemented but not active (no credentials). Money and purchases happen outside this web. The web is for reservations and consultations only.
- **Resale is disabled.** On-chain resale depends on transactions that aren't testnable yet.
- **Auth systems:** Admin (password), Artist (wallet signature → KV), Buyer (passkey wallet). All three ship, but admin auth needs hardening.
- **Design system cleanup** (artist portal inline styles, admin panel theme) is a **separate effort** — not in this map.
- **AdminReviewPanel** is a placeholder with hardcoded mock data — leave as-is, note on map.
- **Execution mode: ON.** This map carries execution, not just decisions. Every task ticket is implemented test-first (TDD) by the agent and committed. The map clears when all tickets are closed, not when they are decided. Branch: `fix/rate-limiting-headers` is the working branch for tickets 02–06; the map and ticket 01's resolution live on `fix/security-hardening` and have been merged in via the working tree.
- **Ticket 02 was researched AND implemented in this branch** (rather than split into a research subagent + separate implementation pass) because the rate-limiting research question resolves to a one-line "use the existing KV" answer that the implementation immediately consumes. Splitting it would have added two extra sessions for no added fidelity.
- **Ticket 07 was a pure research ticket and is closed as findings only.** No code in this branch for it. The D1 `app_config` table and Resend wiring land in ticket 06.
- **Ticket 06 has one HITL question** the agent can't decide: the booking-email recipient model (artist-direct / admin-moderated / hybrid). Will be raised when ticket 06 is picked up; default to admin-moderated (single `admin@` inbox) if no answer by then.

## Decisions so far

- **[01 — Security Hardening](tickets/01-security-hardening.md)** — Closed in commit `46ece82` (`fix(security): remove hardcoded auth fallbacks, guard dev role switcher`): hardcoded `ADMIN_PASSWORD` and `BETTER_AUTH_SECRET` fallbacks removed, dev role switcher guarded by `DEV_MODE` env var in middleware and hidden in production builds.
- **[02 — Rate Limiting & Headers](tickets/02-rate-limiting-headers.md)** — Closed on this branch (`fix/rate-limiting-headers`): in-middleware rate limiting on Cloudflare KV with two buckets (`auth` 5/min, `submit` 20/min) plus standard security headers on every response. 32 unit tests across 3 files (headers, rate-limit, route classifier). Implementation lives in `src/lib/security/` and is wired into `src/middleware.ts`.
- **[07 — Research: Deployment & Email](tickets/07-research-deployment-email.md)** — Closed: findings in `docs/research/deployment-address-and-email.md`. Recommended: D1 `app_config` table for runtime contract address; Resend on a verified domain for email (drop MailChannels fallback). Recipient model (artist-direct vs admin vs hybrid) is a HITL question carried into ticket 06.
- **[06 — Error Page & API Consistency](tickets/06-error-page-api-consistency.md)** — Closed on this branch: `src/pages/500.astro` added (mirrors 404 with Bone & Blood theme + "Back to gallery" CTA); the only API offender returning raw strings (`register-artist.ts`, 6 responses) converted to `{ error: string }` JSON envelope; `POST /api/voucher` now requires a buyer / artist / dev-admin session and verifies the body's `buyer` matches the authenticated user. 11 new unit tests (3 files). Email-recipient HITL question stays open and is logged on the map.
- **[03 — Checkout Redirect & Resale Cleanup](tickets/03-checkout-redirect-resale-cleanup.md)** — Closed on this branch: `/checkout/[id]` is now a 6-line redirect shim to `/booking?designId=[id]`; the design-detail CTA moves through the existing i18n layer ("Reserve this plate" / "จองเพลทนี้"); the reservation auto-release UPDATE is gone; `ResaleButton` is a static placeholder (no wagmi); `/api/resale/{create,buy}` return `503 { error: "Resale is not yet available" }`. 7 new unit tests in `tests/unit/checkout-flow.test.ts`.
- **[04 — Currency & Booking Fix](tickets/04-currency-booking-fix.md)** — Closed on this branch: all ETH price displays replaced with `fmtThb` / `toLocaleString("th-TH")` across `index.astro`, `artist/[id].astro`, and `WalletOwnedPlates.tsx`; `booking.astro` now queries D1 first (seed data is the fallback); booking success state includes a "Go to your inbox" link to `/inbox`. 6 new unit tests in `tests/unit/currency-booking.test.ts`.
- **[05 — Footer, i18n & Locale Fix](tickets/05-footer-i18n-locale-fix.md)** — Closed on this branch: Footer links deduplicated and corrected ("New releases", "Apply to sell", "Aftercare", "Authenticity" removed; "Book a session" → `/booking`; "How it works" → `/#how-it-works`); footer fully i18n-enabled (en + th); `readHtmlLocale()` removed from all 5 React components (Nav, ChatBox, InboxView, BookingForm, WalletOwnedPlates) — locale now passed exclusively via prop from Astro SSR. 18 new unit tests in `tests/unit/footer-i18n.test.ts`.

## Frontier

| Ticket | Type | Status | Claimed by |
|--------|------|--------|------------|
| [01 — Security Hardening](tickets/01-security-hardening.md) | task | **Closed** (`46ece82`) | — |
| [02 — Rate Limiting & Headers](tickets/02-rate-limiting-headers.md) | research+task | **Closed** (this branch) | wayfinder-loop |
| [03 — Checkout Redirect & Resale](tickets/03-checkout-redirect-resale-cleanup.md) | task | **Closed** (this branch) | — |
| [04 — Currency & Booking Fix](tickets/04-currency-booking-fix.md) | task | **Closed** (this branch) | — |
| [05 — Footer, i18n & Locale Fix](tickets/05-footer-i18n-locale-fix.md) | task | **Closed** (this branch) | — |
| [06 — Error Page & API Consistency](tickets/06-error-page-api-consistency.md) | task | **Closed** (this branch) | — |
| [07 — Research: Deployment & Email](tickets/07-research-deployment-email.md) | research | **Closed** (this branch) | — |

## Dependencies

- **Ticket 06** (Error Page & API) is blocked by **Ticket 07** (Research) — the `confirm.ts` deployment address fix depends on research findings.
- All other tickets are independent and can be worked in any order.

**Loop order chosen:** 02 → 07 → 06 → 03 → 04 → 05. Security first, then research, then error page, then flow cleanup, then polish.

## Not yet specified

<!-- fog of war: in-scope decisions you can't ticket yet; graduates as the frontier advances -->

- Booking email retry / queue (when Resend is down, currently the message is lost; needs a retryable sidecar)
- Booking email recipient model — artist-direct vs admin-moderated vs hybrid (HITL, see ticket 06)
- 401-null-body API endpoints → JSON envelope for full consistency (ticket 06 left as-is, cross-cutting change)
- Voucher auth: tighten artist path so the artist must own the design they're vouchering for
- 500 page i18n (en + th strings) — currently hardcoded English
- 500 page request-id rendering (already logged by API routes; surface to the user)
- ResaleButton final UX (current placeholder is intentionally minimal)
- Resale listing table rows: the "Buy" links still render, but the destination `/checkout/[id]?resale=…` now redirects to booking. The user sees no action. Tighten when resale is re-enabled.
- `fmtThb` exists in 4 separate files (index.astro, artist/[id].astro, design/[id].astro, WalletOwnedPlates.tsx). Consider extracting to a shared util when the next currency-related ticket arrives.
- All 7 wayfinder tickets are closed. The map is clear — nothing left to decide before shipping.
- Domain acquisition for `saknid.io` (or equivalent) so Resend can verify it
- Push/email notifications when a booking is accepted/declined or a new chat message arrives
- Structured error tracking (beyond console.log) — Sentry, Logflare, or Cloudflare Analytics
- Loading skeletons/spinners for client-side data fetches (wallet, inbox, earnings)
- Pagination or infinite scroll for the market grid
- Mobile nav wallet button state sync with desktop
- SEO metadata completeness (og:image, structured data, sitemap)
- Performance optimization for Plate canvas rendering on mobile

## Out of scope

- Artist portal styling refactor (raw inline styles → Tailwind) — separate effort
- Design system cleanup (consistent component library) — separate effort
- Admin panel theme consistency (gray/white → Bone & Blood tokens) — separate effort
- AdminReviewPanel wiring to real flagged-conversations data — placeholder for future feature
