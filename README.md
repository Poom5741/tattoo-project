# INKNOIR (formerly SUKNID)

One-of-one tattoo plate NFTs on BSC Testnet. Passkey wallet + Better Auth. No third-party auth provider.

Built with Astro 5 + Cloudflare Pages + D1 + R2 + Foundry ERC-721 lazy-mint contract.

---

## Auth Pivot (2026-07-15)

Replaced legacy auth with a self-custodial auth stack:

| Layer | Tech | Status |
|-------|------|--------|
| Wallet | dacc-js + WebAuthn PRF (biometric) | ✅ Live |
| Auth | Better Auth (D1 + Google OAuth) | ✅ Live |
| Artist login | Wallet signature (viem.verifyMessage) | ✅ Live |
| Backup | PBKDF2 recovery + D1 storage | ✅ Live |

### Key changes

- **Passkey wallet**: Self-custodial EVM wallet via Face ID / Touch ID
- **Better Auth**: User identity with D1 sessions and Google OAuth
- **Wallet signature**: Artist portal login via signed challenge
- **Cross-auth recovery**: Google + recovery password restores wallet on new device

---

## Deploy state

**Provisioned via Cloudflare MCP:**
- ✅ D1 database `inknoir-catalog` — wired in `wrangler.toml`
- ✅ R2 bucket `inknoir-assets`
- ✅ Schema migrations applied
- ✅ Code pushed to `main` on https://github.com/Poom5741/tattoo-project

**Current deploy:** https://inknoir.pages.dev

---

## Prerequisites

- Node.js >= 20
- [pnpm](https://pnpm.io/) >= 9
- [Foundry](https://getfoundry.sh/) — for smart contract work
- A Cloudflare account with Workers/Pages/D1/R2 enabled

---

## Development

```bash
pnpm install
pnpm dev          # http://localhost:4321
pnpm build        # Production build
pnpm test         # Unit tests
pnpm test:e2e     # Playwright e2e
```

## Secrets

| Name | Where | Description |
|------|-------|-------------|
| `BETTER_AUTH_SECRET` | `wrangler pages secret put` | Better Auth cookie encryption |
| `GOOGLE_CLIENT_ID` | `wrangler pages secret put` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | `wrangler pages secret put` | Google OAuth client secret |
| `SIGNER_PRIVATE_KEY` | `wrangler pages secret put` | Test signer wallet key |
| `NFT_STORAGE_KEY` | `wrangler pages secret put` | NFT.Storage API key |

Public vars in `wrangler.toml` `[vars]`:
- `PUBLIC_CONTRACT_ADDRESS` — deployed contract address
- `PUBLIC_CHAIN_ID` — `97` (BSC Testnet)
- `BETTER_AUTH_URL` — deployment URL for OAuth callbacks

Copy `.env.example` → `.env` and `.dev.vars.example` → `.dev.vars` for local dev.

---

## Testing

```bash
pnpm test                    # Vitest unit tests (63 tests)
pnpm test:e2e                # Playwright e2e
pnpm exec playwright test    # Run with UI
forge test -vv --root contracts  # Foundry contract tests
```

---

## Deploy

```bash
pnpm build
pnpm wrangler pages deploy dist --branch main
```
