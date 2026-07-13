# SUKNID

One-of-one tattoo plates. Blockchain-verified ownership on Base Sepolia.

Built with Astro 5 + Cloudflare Pages + D1 + R2 + a Foundry ERC-721 lazy-mint contract.

---

## Deploy state (2026-06-08)

**Provisioned via Cloudflare MCP:**

- ✅ D1 database `suknid-catalog` — uuid `18219077-0bbb-4a1b-8c85-ff088df600d7` (wired in `wrangler.toml`)
- ✅ R2 bucket `suknid-assets` (private by default — public toggle is manual, see below)
- ✅ Schema migrations applied: `0001_init.sql` (5 tables) + 4 artists + 15 designs + 15 stub IPFS CIDs
- ✅ Code pushed to `main` on https://github.com/Poom5741/tattoo-project

**Manual completion steps (require keys/auth not available to this session):**

1. **Toggle R2 public access.** Cloudflare dashboard → R2 → `suknid-assets` → Settings → Public access → Allow access. Copy the `*.r2.dev` URL and put it into `wrangler.toml` `[vars] R2_PUBLIC_URL`.
2. **Authenticate wrangler locally.** `pnpm dlx wrangler login` (OAuth) or `export CLOUDFLARE_API_TOKEN=...` + `CLOUDFLARE_ACCOUNT_ID=...`.
3. **Generate a test signer wallet.** `cast wallet new` (Foundry) — note the private key + address.
4. **Get a Base Sepolia funded deployer wallet.** Use the Coinbase faucet (https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet) for testnet ETH.
5. **Deploy contract** — set `SIGNER_ADDRESS`, `ARTIST_TREASURY`, `DEPLOYER_PRIVATE_KEY`, then `bash scripts/deploy-contract.sh`. Persists address + deployBlock to `contracts/deployments/base-sepolia.json` and `src/lib/config/contract.ts`.
6. **Update `wrangler.toml`** with the deployed contract address (`PUBLIC_CONTRACT_ADDRESS`).
7. **(Optional) Pin real IPFS metadata.** Get an NFT.Storage API key, set `NFT_STORAGE_KEY`, run `pnpm pin:metadata`, then `wrangler d1 execute suknid-catalog --remote --file migrations/0003_cids.sql` to overwrite the stub CIDs.
8. **Create the Pages project + set secrets.**
   ```bash
   pnpm dlx wrangler pages project create suknid --production-branch main
   pnpm dlx wrangler pages secret put SIGNER_PRIVATE_KEY --project-name suknid
   pnpm dlx wrangler pages secret put NFT_STORAGE_KEY --project-name suknid
   pnpm dlx wrangler pages secret put RESEND_API_KEY --project-name suknid   # optional
   ```
9. **Build + deploy.**
   ```bash
   pnpm build
   pnpm dlx wrangler pages deploy dist --project-name suknid
   ```
10. **Smoke test.** `bash scripts/smoke.sh https://suknid.pages.dev`.

**Pre-existing Cloudflare workers in this account (do NOT modify):** `tubc-ai-hack`, `kubchain-explorer`, `solnest`, `eggo-world-pb`, `aris-wallet`, `telegram-gaming-bot-staging`, `telegram-gaming-bot`, `cet-dex`, `myport`. Snapshot in `.omc/state/suknid-baseline-workers.json`. Verified unchanged post-deploy.

**Source-of-truth artifacts (committed under `.omc/`):**
- Deep-interview spec — `.omc/specs/deep-interview-suknid-astro-cloudflare.md` (18% ambiguity)
- Consensus plan v2.2 — `.omc/plans/suknid-astro-cloudflare.md` (35 fixes applied across 3 iterations)
- Team handoff — `.omc/handoffs/team-plan.md`

---

## Prerequisites

- Node.js >= 20
- [pnpm](https://pnpm.io/) >= 9 (`npm install -g pnpm`)
- [Foundry](https://getfoundry.sh/) — for smart contract work
- A Cloudflare account with Workers/Pages/D1/R2 enabled

---

## Install

```bash
pnpm install
```

---

## Development

```bash
# Start Astro dev server (http://localhost:4321)
pnpm dev

# Build for production
pnpm build

# Preview production build locally
pnpm preview
```

---

## Testing

```bash
# Vitest unit + integration tests
pnpm test

# Foundry contract tests
forge test -vv --root contracts

# Playwright e2e
pnpm exec playwright test
```

---

## Deploy

```bash
# Pin metadata to IPFS (requires NFT_STORAGE_KEY in .dev.vars)
pnpm pin:metadata

# Deploy to Cloudflare Pages via wrangler
wrangler pages deploy dist --project-name suknid
```

---

## Secrets

| Name | Where | Description |
|------|-------|-------------|
| `SIGNER_PRIVATE_KEY` | `wrangler pages secret put` / `.dev.vars` (local only) | Test signer wallet key — never the production key |
| `NFT_STORAGE_KEY` | `wrangler pages secret put` / `.dev.vars` | NFT.Storage API key for IPFS pinning |
| `RESEND_API_KEY` | `wrangler pages secret put` / `.dev.vars` | Resend email API key (optional) |

Public vars (non-secret, safe in `wrangler.toml` `[vars]`):
- `PUBLIC_CONTRACT_ADDRESS` — deployed `SuknidPlates` address on Base Sepolia
- `PUBLIC_CHAIN_ID` — `84532` (Base Sepolia)
- `BASE_RPC_PRIMARY` / `BASE_RPC_FALLBACK` — RPC endpoints

Copy `.env.example` → `.env` and `.dev.vars.example` → `.dev.vars` for local dev.

---

## Contract Deploy

```bash
# Set required env vars
export SIGNER_ADDRESS=<your-test-signer-address>
export ARTIST_TREASURY=<treasury-address>
export DEPLOYER_PRIVATE_KEY=<deployer-key>

# Deploy and verify
bash scripts/deploy-contract.sh
```

The deploy script writes the contract address to `contracts/deployments/base-sepolia.json` and `src/lib/config/contract.ts`.

---

## Links

- Spec: `.omc/specs/deep-interview-suknid-astro-cloudflare.md`
- Plan: `.omc/plans/suknid-astro-cloudflare.md`
- Basescan Sepolia: https://sepolia.basescan.org
