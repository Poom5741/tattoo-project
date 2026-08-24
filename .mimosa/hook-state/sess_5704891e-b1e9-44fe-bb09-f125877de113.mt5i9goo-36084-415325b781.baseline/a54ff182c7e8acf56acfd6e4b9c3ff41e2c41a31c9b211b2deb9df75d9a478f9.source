# Agent Instructions

## Project Board Updates

When working on issues/tickets from the GitHub project board:
- **Before starting**: Move the card to "In Progress"
- **After completing**: Move the card to "Done" or appropriate status
- Always update the project board status when starting or finishing work

## Installed Skills (global)

The [mattpocock/skills](https://github.com/mattpocock/skills) repo is cloned at `~/.local/share/mattpocock-skills/`, and every non-deprecated skill is symlinked into pi's global skill directory at `~/.pi/agent/skills/` by `scripts/link-mattpocock-skills-to-pi.sh`. Re-run that script after `git pull`ing the upstream repo to refresh the links.

First-time setup per repo: invoke `/skill:setup-matt-pocock-skills` once so the engineering skills know which issue tracker, triage labels, and domain doc layout to use.

---

## 🧠 Mistake Learning & Architecture Guidelines

### DO's ✅

1. **Use Direct D1 Bindings for Astro SSR**:
   - Inside `.astro` frontmatter (server-side rendering), always query D1 directly via `Astro.locals.runtime.env.DB`.
   - Never perform self-referential HTTP `fetch()` calls (e.g. `fetch(new URL('/api/...'))`) during SSR; subrequests can fail or throw 500/redirect errors in Cloudflare Pages Workers environments.

2. **Provide Fallbacks for Server-Side Environment Variables**:
   - Always supply fallback values for authentication and API secrets (e.g. `env.BETTER_AUTH_SECRET || "fallback-secret"`) so unconfigured production or staging environments fail gracefully with 200/401 instead of crashing with 500 errors.

3. **Isolate Database State in E2E Tests**:
   - When tests or user flows mutate D1 database rows (e.g. reserving a plate or modifying a status), ensure `beforeEach` resets the row in **all** `.sqlite` database files under `.wrangler/state/v3/d1/miniflare-D1DatabaseObject/`.

4. **Scope Playwright Locators for Dual-Render Components**:
   - Components rendered in both desktop and mobile navigation drawers (such as `LanguageSwitcher` or nav links) produce multiple matching elements. Always use `.first()`, `getByRole()`, or container-scoped locators to prevent strict mode violations.

5. **Configure Playwright `webServer` correctly**:
   - In `playwright.config.ts`, specify `url` (e.g. `http://localhost:4321/api/health`) without specifying `port` simultaneously, as Playwright 1.60+ rejects having both.

---

### DON'Ts ❌

1. **DON'T Hardcode Protocol-Specific Cookie Flags**:
   - Never hardcode `Secure;` in `Set-Cookie` headers for endpoints called over HTTP in dev/test (e.g., `http://localhost:4321`). Check `request.url.startsWith("https://")` dynamically.

2. **DON'T Assume a Single Miniflare D1 SQLite File**:
   - Miniflare derives SQLite filenames dynamically (e.g. `<hash>.sqlite`). Never hardcode or assume there is only one `.sqlite` file in `.wrangler/state/...`; iterate over all `.sqlite` files in the directory.

3. **DON'T Execute SQL `BEGIN TRANSACTION` via Wrangler D1 Migrations API**:
   - Raw `.sql` migration files executed via Wrangler / D1 must not contain explicit `BEGIN TRANSACTION;` or `COMMIT;` statements, as Cloudflare D1 rejects them.

4. **DON'T Read DOM State (`document.querySelector`) in React SSR Initialization**:
   - Never try to read the active locale or other attributes from DOM queries (like `document.querySelector("html")`) inside React component initializers. These will return fallback values on the server since `document` is undefined, causing hydration mismatches. Pass them as props from Astro instead.

5. **DON'T Mix Google OAuth with Passkey Wallet Auth for Buyer Identity**:
   - Keep buyer-side messaging/inbox flows natively aligned with biometric Passkey Wallet signature authentication (EVM signature) instead of Google OAuth. SAKNID is a Web3/EVM application, and users should sign a challenge message using their biometric passkey wallet to authenticate.

