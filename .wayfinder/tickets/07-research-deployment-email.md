# Ticket: Research — Deployment Address Runtime Resolution & Email Delivery

**wayfinder:research**

## Question

Two technical issues need investigation:

1. **confirm.ts / reconcile.ts Deployment Address**

Both `src/pages/api/confirm.ts` and `src/pages/api/reconcile.ts` try to import the contract deployment address from `contracts/deployments/base-sepolia.json` at module load time. But this import happens during the build, and the JSON file may not exist yet (pre-deploy) or may have a placeholder address.

The result: `deploymentAddress` is always an empty string `""` in the compiled worker, making these endpoints silently do nothing.

**Research needed:** How to resolve the deployment address at **runtime** in a Cloudflare Pages worker, not at build time. Options:
- Read from D1 (store address in a config table)
- Read from KV (store address in a KV namespace)
- Use the `PUBLIC_CONTRACT_ADDRESS` env var (already exists in `wrangler.toml` but set to `"PLACEHOLDER_FILLED_BY_DEPLOY"`)
- Use a Cloudflare Pages environment variable set after deploy

Find the simplest approach that works with the existing deploy workflow.

2. **Email Delivery**

`src/pages/api/bookings.ts` sends emails via Resend (if `RESEND_API_KEY` is set) or MailChannels fallback. But the recipient is hardcoded to `bookings@saknid.pages.dev` — likely a dead address.

**Research needed:**
- Is Resend configured with a real domain? Or is it using the default sandbox?
- Is MailChannels still available on Cloudflare Workers?
- What's the correct recipient address for booking notifications?
- Should emails go to the artist, the admin, or both?

This is a HITL decision — the user needs to decide where booking emails should be delivered.

### Acceptance Criteria

- [x] Research findings documented in the ticket resolution
- [x] Recommended approach for deployment address resolution
- [x] Email delivery status and next steps documented
- [x] No code changes in this ticket (research only)

## Resolution

Findings captured in **`docs/research/deployment-address-and-email.md`**. Headlines:

### Deployment address — recommend D1 `app_config` table

Evaluated five options against the SAKNID stack (Cloudflare Pages, D1 + KV + R2 bound, single Pages project). D1 wins because:
- D1 is already bound (`env.DB` on every route); the helper is a 3-line migration + 1 function.
- Mutable at runtime — the deploy script updates the row, the next cron tick picks it up. No rebuild.
- No new binding, no new dashboard wiring, no new env var.

KV is acceptable but adds a binding for a 1-row config. Cloudflare `vars` / `secrets` are static at deploy, so they re-create the original problem. Build-time TS imports are the status quo and the source of the bug.

**Implementation lands in ticket 06** (was already a downstream dependency).

### Email delivery — recommend Resend on a verified domain, drop MailChannels

- `saknid.pages.dev` cannot be verified on Resend (subdomains of `cloudflarepages.com` are not delegated for DNS). Same on MailChannels.
- MailChannels' free tier is restricted to Workers Paid accounts and requires domain verification. Not a reliable default for a new project.
- Resend works cleanly once a real domain (e.g. `saknid.io`) is set up with DKIM/SPF/DMARC.

**Recipient model is a HITL decision** for ticket 06 to carry forward:
- Artist-direct (each artist gets their own booking email)
- Admin-moderated (single admin inbox, forwards manually)
- Hybrid (artist + admin cc)

The `artists.email` column already exists in D1, so the data is there for the artist-direct model. The user picks.

**Implementation lands in ticket 06** — the `sendEmail` body, the failure-mode logging, and the recipient lookup.
