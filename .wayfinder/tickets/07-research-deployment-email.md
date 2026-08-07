# Ticket: Research — Deployment Address Runtime Resolution & Email Delivery

**wayfinder:research**

## Question

Two technical issues need investigation:

### 1. confirm.ts / reconcile.ts Deployment Address

Both `src/pages/api/confirm.ts` and `src/pages/api/reconcile.ts` try to import the contract deployment address from `contracts/deployments/base-sepolia.json` at module load time. But this import happens during the build, and the JSON file may not exist yet (pre-deploy) or may have a placeholder address.

The result: `deploymentAddress` is always an empty string `""` in the compiled worker, making these endpoints silently do nothing.

**Research needed:** How to resolve the deployment address at **runtime** in a Cloudflare Pages worker, not at build time. Options:
- Read from D1 (store address in a config table)
- Read from KV (store address in a KV namespace)
- Use the `PUBLIC_CONTRACT_ADDRESS` env var (already exists in `wrangler.toml` but set to `"PLACEHOLDER_FILLED_BY_DEPLOY"`)
- Use a Cloudflare Pages environment variable set after deploy

Find the simplest approach that works with the existing deploy workflow.

### 2. Email Delivery

`src/pages/api/bookings.ts` sends emails via Resend (if `RESEND_API_KEY` is set) or MailChannels fallback. But the recipient is hardcoded to `bookings@saknid.pages.dev` — likely a dead address.

**Research needed:**
- Is Resend configured with a real domain? Or is it using the default sandbox?
- Is MailChannels still available on Cloudflare Workers?
- What's the correct recipient address for booking notifications?
- Should emails go to the artist, the admin, or both?

This is a HITL decision — the user needs to decide where booking emails should be delivered.

### Acceptance Criteria

- [ ] Research findings documented in the ticket resolution
- [ ] Recommended approach for deployment address resolution
- [ ] Email delivery status and next steps documented
- [ ] No code changes in this ticket (research only)

### Files to Investigate

- `src/pages/api/confirm.ts` — deployment address import
- `src/pages/api/reconcile.ts` — deployment address import
- `src/pages/api/bookings.ts` — email send function
- `contracts/deployments/base-sepolia.json` — current state
- `wrangler.toml` — env vars
