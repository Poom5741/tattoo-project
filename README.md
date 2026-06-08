# INKNOIR

One-of-one tattoo plates. Blockchain-verified ownership on Base Sepolia.

Built with Astro 5 + Cloudflare Pages + D1 + R2 + a Foundry ERC-721 lazy-mint contract.

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
wrangler pages deploy dist --project-name inknoir
```

---

## Secrets

| Name | Where | Description |
|------|-------|-------------|
| `SIGNER_PRIVATE_KEY` | `wrangler pages secret put` / `.dev.vars` (local only) | Test signer wallet key — never the production key |
| `NFT_STORAGE_KEY` | `wrangler pages secret put` / `.dev.vars` | NFT.Storage API key for IPFS pinning |
| `RESEND_API_KEY` | `wrangler pages secret put` / `.dev.vars` | Resend email API key (optional) |

Public vars (non-secret, safe in `wrangler.toml` `[vars]`):
- `PUBLIC_CONTRACT_ADDRESS` — deployed `InknoirPlates` address on Base Sepolia
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

- Spec: `.omc/specs/deep-interview-inknoir-astro-cloudflare.md`
- Plan: `.omc/plans/inknoir-astro-cloudflare.md`
- Basescan Sepolia: https://sepolia.basescan.org
