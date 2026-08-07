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

## Decisions so far

- **[01 — Security Hardening](tickets/01-security-hardening.md)** — Closed in commit `46ece82` (`fix(security): remove hardcoded auth fallbacks, guard dev role switcher`): hardcoded `ADMIN_PASSWORD` and `BETTER_AUTH_SECRET` fallbacks removed, dev role switcher guarded by `DEV_MODE` env var in middleware and hidden in production builds.
- **[02 — Rate Limiting & Headers](tickets/02-rate-limiting-headers.md)** — Closed on this branch (`fix/rate-limiting-headers`): in-middleware rate limiting on Cloudflare KV with two buckets (`auth` 5/min, `submit` 20/min) plus standard security headers on every response. 32 unit tests across 3 files (headers, rate-limit, route classifier). Implementation lives in `src/lib/security/` and is wired into `src/middleware.ts`.

## Frontier

| Ticket | Type | Status | Claimed by |
|--------|------|--------|------------|
| [01 — Security Hardening](tickets/01-security-hardening.md) | task | **Closed** (`46ece82`) | — |
| [02 — Rate Limiting & Headers](tickets/02-rate-limiting-headers.md) | research+task | **Closed** (this branch) | wayfinder-loop |
| [03 — Checkout Redirect & Resale](tickets/03-checkout-redirect-resale-cleanup.md) | task | Open | — |
| [04 — Currency & Booking Fix](tickets/04-currency-booking-fix.md) | task | Open | — |
| [05 — Footer, i18n & Locale Fix](tickets/05-footer-i18n-locale-fix.md) | task | Open | — |
| [06 — Error Page & API Consistency](tickets/06-error-page-api-consistency.md) | task | Open (Blocked by 07) | — |
| [07 — Research: Deployment & Email](tickets/07-research-deployment-email.md) | research | Open | — |

## Dependencies

- **Ticket 06** (Error Page & API) is blocked by **Ticket 07** (Research) — the `confirm.ts` deployment address fix depends on research findings.
- All other tickets are independent and can be worked in any order.

**Loop order chosen:** 02 → 07 → 06 → 03 → 04 → 05. Security first, then research, then error page, then flow cleanup, then polish.

## Not yet specified

<!-- fog of war: in-scope decisions you can't ticket yet; graduates as the frontier advances -->

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
