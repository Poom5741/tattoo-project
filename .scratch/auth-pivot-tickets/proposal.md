# Ticket Breakdown: Auth Pivot

## Proposed vertical slices

### 01 — Prefactor: Passkey crypto + backup library
**Blocked by:** None — can start immediately
**What it delivers:** Pure TypeScript utilities for WebAuthn PRF passkey registration, AES-GCM encryption, HKDF key derivation, IndexedDB storage, and PBKDF2 backup. No React, no API routes, no wallet engine dependency.
**Verifiable:** `vitest` passes for crypto round-trips and backup serialization.

### 02 — Passkey wallet client (create/unlock + nav)
**Blocked by:** 01
**What it delivers:** A user can create a passkey wallet (dacc-js + WebAuthn PRF), see the address in the nav, lock and unlock it. `PasskeyWalletContext` provides wallet state. `PasskeyNavButton` replaces `PrivyNavButton`. `WalletOwnedPlates` and design detail page read the wallet address from context. No signature-based API routes yet.
**Verifiable:** E2E — nav shows "Connect Wallet" → user clicks → create wallet → nav shows address. Lock → unlock → address reappears.

### 03 — Artist wallet signature login
**Blocked by:** 02 (needs wallet to sign)
**What it delivers:** Artist portal authentication via wallet signature instead of Privy JWT. New `POST /api/auth/artist-login` verifies a signed challenge with `viem.verifyMessage`. `WalletSignatureGate` replaces `PrivyArtistGate`. KV sessions work the same as before.
**Verifiable:** API test — sign challenge → POST with valid signature → 200 + cookie set. Invalid signature → 401.

### 04 — Better Auth foundation (D1 schema + API routes)
**Blocked by:** None — independent of passkey wallet
**What it delivers:** Better Auth server config with D1 adapter, Google OAuth provider, and D1 migration for user/session/account tables + `wallet_backups` table. API catch-all route at `/api/auth/[...all]`. Login page at `/auth/login` with Google sign-in button. Sessions stored in D1.
**Verifiable:** `GET /api/auth/session` returns 200 (not authenticated). Google OAuth redirect works.

### 05 — Wallet backup to D1 + cross-auth recovery
**Blocked by:** 02 (wallet) + 04 (Better Auth)
**What it delivers:** When a user with a passkey wallet signs into Better Auth, the encrypted wallet backup is uploaded to D1. On a new device, signing into Google + entering the recovery password restores the wallet (creates a new passkey). Passkey-only users without Better Auth still work via IndexedDB + backup file download.
**Verifiable:** Create wallet via passkey → sign into Google → backup in D1. On new browser, sign into Google → enter recovery password → wallet restored.

### 06 — Remove all Privy code
**Blocked by:** 02, 03, 04 (everything works without Privy)
**What it delivers:** Delete PrivyNavButton, PrivyNavButtonInner, PrivyArtistGate, privy.ts config. Remove @privy-io dependencies from package.json. Remove PRIVY env vars from wrangler.toml and env.d.ts.
**Verifiable:** `pnpm build` succeeds. No `@privy-io` references in the codebase.
