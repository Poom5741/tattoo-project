# Research — Deployment Address & Email Delivery

> Research findings for wayfinder ticket 07.
> Captures the current state, evaluates the options against the SAKNID stack, and recommends a path forward.
> No code changes in this document — those land in ticket 06 once the decision is locked.

## 1. Deployment address — runtime resolution in a Cloudflare Pages worker

### Current state

| Location | What it does | Status |
|---|---|---|
| `src/lib/config/contract.ts:2-3` | `const _DEPLOYMENT_ADDRESS = ""` — hardcoded empty string at the top of the file. Falls back to the zero address `0x000…0` on line 7. | **Broken.** `CONTRACT_ADDRESS` is always the zero address in the compiled worker. |
| `src/pages/api/reconcile.ts:7-15` | `await import("../../../contracts/deployments/base-sepolia.json")` at module load. Catches the error and leaves `deploymentAddress = ""`. | **Broken.** The JSON has `"address": ""` so the assignment is a no-op even when the import succeeds. |
| `wrangler.toml` `[vars]` | `PUBLIC_CONTRACT_ADDRESS = "PLACEHOLDER_FILLED_BY_DEPLOY"`. | **Inert.** This is a Vite build-time `import.meta.env.PUBLIC_*` var, inlined at build, and not currently read by the server code. |
| `scripts/deploy-contract.sh` | Writes the address back into `src/lib/config/contract.ts` (line `CONTRACT_TS="$REPO_ROOT/src/lib/config/contract.ts"`). | **Functional but wrong layer.** Re-deploys require a code commit + Cloudflare Pages redeploy. |

### Downstream impact

- `POST /api/confirm` — line 76: `if (receipt.to?.toLowerCase() !== CONTRACT_ADDRESS.toLowerCase())` always fires `wrong_contract` because the comparison is against the zero address. The endpoint is dead at runtime.
- `GET /api/reconcile` — line 22: returns `200 { ok: true, reconciled: 0, note: "contract not deployed" }` and never reconciles. The cron trigger is silent.
- `POST /api/voucher` — line 108: the early-exit guard `CONTRACT_ADDRESS !== "0x000…0"` is always false, so vouchers are signed without a destination contract.
- `POST /api/resale/*` — same zero address used for the contract call site. Dead.

### Options evaluated

| Option | Configuration surface | Works on Pages | Granularity | Survives code redeploy? | Verdict |
|---|---|---|---|---|---|
| A. Hardcoded TS const (current) | Source file | Yes | Per-deploy | No (rebuild required) | Reject. The whole point of the ticket. |
| B. D1 config table (new) | New `app_config` table + helper | Yes | Per-row, mutable at runtime | Yes | **Recommend.** |
| C. KV namespace (new) | New `CONFIG` KV binding | Yes | Per-key, mutable at runtime | Yes | Acceptable. Slightly higher read cost than D1. |
| D. Cloudflare env var (`vars` in `wrangler.toml`) | `wrangler.toml` | Yes | Per-deploy, immutable without redeploy | No | Reject for mutable config. Useful for immutable secrets. |
| E. Cloudflare secret (`wrangler secret put`) | CLI | Yes | Per-deploy, encrypted at rest | No | Same as D. Reject for mutable. |

### Recommendation: option B (D1 `app_config` table)

Reasoning, in order of weight:

1. **D1 is already bound and migrated.** Every API route already has `env.DB` available. Adding a `app_config` table is a 3-line migration and one helper function. No new binding, no new dashboard wiring, no new env var.
2. **Mutable without redeploy.** The deploy script can `UPDATE app_config SET value = ? WHERE key = 'contract_address'` after broadcasting, and the very next cron tick picks it up. The whole reason this ticket exists is to escape the rebuild cycle.
3. **Consistent with the existing config surface.** `designs`, `earnings`, `wallet_backups` all live in D1. Putting a one-row config table next to them is the natural shape.
4. **No read cost concern.** A 1-key lookup on the hot path of `confirm` and `reconcile` is negligible against the chain RPC call that follows.

#### Proposed schema (lands in ticket 06)

```sql
CREATE TABLE IF NOT EXISTS app_config (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_at INTEGER NOT NULL,
  note       TEXT
);

INSERT OR IGNORE INTO app_config (key, value, updated_at, note) VALUES
  ('contract_address', '', strftime('%s','now'), 'Base Sepolia — populated by scripts/deploy-contract.sh'),
  ('contract_chain_id', '97', strftime('%s','now'), 'BSC Testnet (56 = mainnet)'),
  ('booking_email_recipient', 'admin@saknid.local', strftime('%s','now'), 'HITL: confirm address before production');
```

#### Proposed helper (lands in ticket 06)

```ts
// src/lib/config/runtime.ts
export async function getConfig(env: Env, key: string): Promise<string | null> {
  const row = await env.DB.prepare("SELECT value FROM app_config WHERE key = ?")
    .bind(key).first<{ value: string }>();
  return row?.value ?? null;
}
```

#### Migration of the deploy script (lands in ticket 06)

Replace the `sed` into `contract.ts` with a D1 write:

```bash
wrangler d1 execute inknoir-catalog \
  --command "UPDATE app_config SET value = '$DEPLOYED_ADDRESS', updated_at = $(date +%s) WHERE key = 'contract_address'"
```

### Cross-cutting note (not a blocker for this ticket)

`src/lib/config/contract.ts` is also imported by client-side code (the `wagmi.ts` config uses `PUBLIC_*` for the RPC URL, but `CONTRACT_ADDRESS` is consumed by `confirm.ts` and `voucher.ts` only on the server). The helper above is server-only, so the build-time import in `contract.ts` can stay as a fallback for any code path that wants the zero-address default.

## 2. Email delivery — Resend / MailChannels & the right recipient

### Current state (`src/pages/api/bookings.ts:107-148`)

- **If `RESEND_API_KEY` is set:** POST to `https://api.resend.com/emails` with `from: "SAKNID <noreply@saknid.pages.dev>"`, `to: ["bookings@saknid.pages.dev"]`.
- **Else (fallback):** POST to `https://api.mailchannels.net/tx/v1/send` with the same `from` / `to` pair.

Both paths hardcode `bookings@saknid.pages.dev` as the recipient and `noreply@saknid.pages.dev` as the sender. Neither is a real, deliverable address.

### Why the recipient is dead

`saknid.pages.dev` is a Cloudflare Pages preview / production hostname. Cloudflare does not run a mail server on it. There is no `bookings@` inbox; the message goes nowhere.

### Why the sender can't send

Resend requires **domain verification** (DKIM + SPF + DMARC) before it will sign and send mail "from" an address. `saknid.pages.dev` cannot be verified — subdomains of `cloudflarepages.com` are not delegated to the project owner for DNS. Same story for MailChannels: it requires the sending domain to be on an allowlist (or use the Cloudflare Workers email binding, which is also off-limits for `*.pages.dev`).

### MailChannels status (primary source: Cloudflare docs, 2025)

- MailChannels' free transactional tier **on Cloudflare Workers** is still available but is no longer a free-for-all. As of 2024–2025, it is restricted to accounts on a Workers Paid plan, and the sending domain must be verified through Cloudflare's email routing.
- The historical "just POST to `api.mailchannels.net` and it works" path is **not a reliable default** for a new project.

### Resend setup requirements (primary source: resend.com/docs)

1. Verify a real domain (e.g. `saknid.io`) via DKIM + SPF + DMARC DNS records.
2. Create an API key (`re_…`) and bind it to the project as `RESEND_API_KEY` (env var, or Cloudflare secret).
3. Send from a verified address (e.g. `bookings@saknid.io`).

### Recommendation: Resend, with a verified domain, sender = `bookings@saknid.io`

Concrete steps (owner: human — this is a provisioning task, not a coding task):

1. Acquire a real domain (or use an existing one) and delegate DNS to a provider that supports DKIM/SPF (Cloudflare Registrar works).
2. Add the domain to Resend, copy the DKIM + SPF records into DNS.
3. Set `RESEND_API_KEY` as a Cloudflare secret on the Pages project.
4. Set `BOOKING_FROM_EMAIL = "SAKNID <bookings@saknid.io>"` and `BOOKING_TO_EMAIL = "<artist-email-from-db>"` (see below) as wrangler vars.

#### Recipient decision (HITL — out of scope for this ticket)

Three viable models, in order of how the codebase is currently shaped:

| Model | Who receives | How | Trade-off |
|---|---|---|---|
| **Artist-direct** | The artist's own email (looked up from `artists.email`) | Per-artist delivery | Most actionable — the right person reads it first. Requires each artist to have a verified email on file. |
| **Admin-moderated** | A single admin inbox (e.g. `admin@saknid.io`) | One-to-one | Simplest to set up. Admin forwards to the artist manually or via a triage tool. |
| **Hybrid** | Artist + admin cc | Both | Best UX, but most plumbing. |

The current `artists` table has an `email` column (line 12 of `0001_init.sql`), so the data is there for the artist-direct model. But this is a **business decision** (do artists want raw booking emails? does the admin need oversight for the soft launch?), and the user needs to call it.

This is logged on the ticket as the one remaining open question for ticket 06 to address.

### Failure mode to add (in ticket 06)

`sendEmail` is called `void` at line 93 with `.catch((err) => …)`. If Resend returns a non-2xx, the function throws but the booking is already persisted — silent failure. Add:

- A non-2xx from Resend is a logged error, not a throw.
- The booking row records `email_sent_at` (nullable). If null, the artist can be re-notified.

This is small enough to roll into ticket 06.

## Acceptance criteria for ticket 07

- [x] Research findings documented (this file)
- [x] Recommended approach for deployment address resolution: D1 `app_config` table
- [x] Email delivery status and next steps documented: Resend on a verified domain, recipient model is a HITL decision
- [x] No code changes in this ticket (research only) — implementation lands in ticket 06

## Open questions for ticket 06

1. **Recipient model** — artist-direct, admin-moderated, or hybrid? (HITL)
2. **MailChannels keep or drop?** — If Resend is configured, the MailChannels fallback becomes dead code. Recommend drop.
3. **`app_config` table** — confirmed approach. Ship it in ticket 06.
4. **Booking email retry / queue** — out of scope for ticket 06, log on the map.
