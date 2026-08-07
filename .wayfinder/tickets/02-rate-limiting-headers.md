# Ticket: Security — Rate Limiting & Security Headers

**wayfinder:research** (rate limiting options) + **wayfinder:task** (implementation)

## Question

Two security layers are missing:

1. **Rate limiting.** No API endpoint has rate limiting. An attacker can brute-force admin login, spam booking submissions, or flood chat messages. Cloudflare Workers supports rate limiting natively via `wrangler.toml` configuration or the Cloudflare dashboard. Research the best approach for this stack.

2. **Security headers.** No Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, or Referrer-Policy headers are set. These should be added via Astro middleware or Cloudflare `_headers` file.

### Research: Rate Limiting Options

For each option, evaluate:
- How to configure it (wrangler.toml vs dashboard vs middleware)
- Whether it works on Cloudflare Pages (not just Workers)
- Granularity (per-IP, per-route, global)
- Whether it survives page redirects

Key endpoints to protect:
- `POST /api/auth/sign-in/*` (brute-force)
- `POST /api/auth/artist-login` (brute-force)
- `POST /api/admin/login` (brute-force)
- `POST /api/bookings` (spam)
- `POST /api/chat/send` (spam)

### Acceptance Criteria

- [x] Rate limiting configured for auth endpoints (5 req/min per IP)
- [x] Rate limiting configured for booking/chat endpoints (20 req/min per IP)
- [x] Security headers set: CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy
- [x] Headers don't break existing functionality (Tawk.to widget needs script-src allowance)
- [x] Unit tests cover the seam (32 tests across 3 files)

## Resolution

**Approach:** In-middleware rate limiting on Cloudflare KV, plus standard security headers on every response.

**Why KV rather than the Cloudflare dashboard / wrangler.toml rate-limit rule:**
- Works on Cloudflare Pages (not just Workers — the dashboard rule is available on Pages too but needs a paid plan for the rate-limits binding).
- Per-route, per-IP granularity without paid features.
- Survives redirects (it's middleware, not a redirect chain).
- No external config drift between dashboard and code.

**Bucket design:**
- `auth` — 5 req / 60 s. POST `/api/admin/login`, `/api/auth/artist-login`, `/api/auth/client-login`, `/api/auth/sign-in/*`. Brute-force protection.
- `submit` — 20 req / 60 s. POST `/api/bookings`, `/api/chat/send`, `/api/chat/messages/*`. Spam / flooding protection.

**Files added:**
- `src/lib/security/headers.ts` — `applySecurityHeaders(response)` pure function
- `src/lib/security/rate-limit.ts` — `checkRateLimit`, `getClientIp`, `classifyProtectedRoute`, `rateLimitResponse`
- `src/lib/security/index.ts` — barrel

**Files changed:**
- `src/middleware.ts` — calls `checkRateLimit` before `next()` on protected routes, `applySecurityHeaders` on every response

**Tests added** (RED→GREEN, one slice at a time):
- `tests/unit/security-headers.test.ts` — 8 tests
- `tests/unit/security-rate-limit.test.ts` — 9 tests
- `tests/unit/security-classify-route.test.ts` — 15 tests
- Total: 32 unit tests, all passing

**Behavioural notes:**
- Rate-limit checks fail-open: if KV throws, the request continues (logged). Hard-failing on a transient KV error would amplify outages.
- Client IP is read from `cf-connecting-ip` then `x-forwarded-for`, with `unknown` as the final fallback. Behind Cloudflare, the first is always set.
- CSP is intentionally permissive on `script-src` (`'unsafe-inline' 'unsafe-eval'`) because Astro hydrates with inline scripts and Tawk.to's loader uses eval. Tighten in a follow-up if the hydration path is cleaned up to nonce-based.

### Out-of-scope follow-ups (logged on map, not implemented here)

- Cloudflare WAF rate-limit rules for the IP layer (defence in depth). The dashboard UI rule complements the middleware.
- Sliding-window algorithm — current is fixed window for simplicity. Switch when the abuse profile demands it.
- Per-user rate limits (rather than per-IP) for authenticated endpoints.
