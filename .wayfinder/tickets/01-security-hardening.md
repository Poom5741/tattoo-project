# Ticket: Security Hardening — Admin Auth, Secrets & Dev Guard

**wayfinder:task**

## Question

Three security gaps must be closed before soft launch:

1. **Hardcoded admin password fallback.** `src/pages/api/admin/login.ts` falls back to `"saknid2026"` when `ADMIN_PASSWORD` env var is missing. Anyone who reads the source (it's a public repo) can log in as admin. **Fix:** Remove the fallback. If `ADMIN_PASSWORD` is not set, return a 500 error with a generic message — never authenticate with a hardcoded secret.

2. **Hardcoded BETTER_AUTH_SECRET fallback.** `src/lib/auth/server.ts` falls back to `"default-secret-change-in-production-1234567890"`. This means session tokens can be forged by anyone who knows this value. **Fix:** Remove the fallback. If `BETTER_AUTH_SECRET` is not set, the auth instance should fail to initialize (throw), which will surface as a 500 on auth routes — better than silent token forgery.

3. **Dev role switcher in production.** `DevRoleSwitcher` component sets a `dev_role` cookie that the middleware reads to inject fake sessions. There's no environment check — it works in production. **Fix:** In the middleware (`src/middleware.ts`), only honor the `dev_role` cookie when a `DEV_MODE` env var (or similar) is set to `"true"`. In the `DevRoleSwitcher` component, hide the UI when `import.meta.env.DEV` is false (or when a build-time flag indicates production). The cookie can still be set, but the middleware will ignore it.

### Acceptance Criteria

- [ ] `ADMIN_PASSWORD` fallback removed — missing env = 500
- [ ] `BETTER_AUTH_SECRET` fallback removed — missing env = throw on auth init
- [ ] Dev role switcher hidden in production builds
- [ ] Middleware ignores `dev_role` cookie unless `DEV_MODE=true`
- [ ] Existing E2E tests still pass (the CI workflow sets `BETTER_AUTH_SECRET` and uses `dev_role` for testing)

### Files to Change

- `src/pages/api/admin/login.ts` — remove hardcoded password fallback
- `src/lib/auth/server.ts` — remove hardcoded secret fallback, throw if missing
- `src/middleware.ts` — guard `dev_role` behind env check
- `src/components/DevRoleSwitcher.tsx` — hide in production
