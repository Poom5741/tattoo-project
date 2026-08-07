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

- [ ] Rate limiting configured for auth endpoints (e.g., 5 req/min per IP)
- [ ] Rate limiting configured for booking/chat endpoints (e.g., 20 req/min per IP)
- [ ] Security headers set: CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy
- [ ] Headers don't break existing functionality (Tawk.to widget needs script-src allowance)
- [ ] E2E tests still pass

### Files to Change

- `wrangler.toml` — add rate limiting config (if Cloudflare Pages supports it)
- OR `src/middleware.ts` — add rate limiting logic
- OR `public/_headers` — add security headers
- OR `src/middleware.ts` — add security headers in middleware
