# Spec: Auth Pivot — Legacy Auth to Passkey Wallet + Better Auth + Wallet Signatures

## Problem Statement

The app uses a **legacy third-party authentication service** for user authentication (email/Google/wallet login), wallet creation, and artist verification. The third-party service creates a centralized dependency: the site cannot authenticate users or verify artist identities without the external API. The service does not support passkey (biometric) wallet auth natively, and the current login flow forces users through the third-party's modal rather than offering direct wallet-based auth. Artist login depends on verifying third-party JWTs, adding a network request on every login.

## Solution

Replace the legacy auth with three independent auth layers:

1. **Passkey wallet** — Self-custodial EVM wallet using `dacc-js` + WebAuthn PRF (Face ID / Touch ID). No server needed for wallet operations. Wallet encryption key derived from biometrics.
2. **Better Auth** — User identity layer with Google OAuth, session management via D1, and optional passkey/email auth. Handles user management.
3. **Wallet signature verification** — Artist portal login via `viem.verifyMessage` instead of third-party JWT verification.

Both passkey and Google auth provide access to the same wallet, bridged by a **recovery password** (PBKDF2-encrypted backup stored in D1).

## User Stories

1. As a visitor, I want to browse the gallery without any authentication, so that I can explore available plates before committing to a wallet.
2. As a collector, I want to create a wallet using my device's biometrics (Face ID / Touch ID), so that I don't need to remember a seed phrase.
3. As a collector, I want to unlock my wallet with biometrics, so that I can browse my collection and make purchases securely.
4. As a collector, I want to sign in with Google via Better Auth, so that I can access my profile without a blockchain wallet.
5. As a collector, I want my passkey wallet and Google identity to share the same wallet address, so that I can use either method to access my plates.
6. As a collector, I want to set a recovery password when creating my wallet, so that I can restore my wallet on a new device or if I lose biometric access.
7. As a collector, I want to export my wallet as an encrypted backup file, so that I can store it offline or in cloud storage.
8. As a collector, I want to import a wallet from a backup file, so that I can restore my collection on a new device.
9. As a collector on a new device, I want to sign in with Google and enter my recovery password to restore my wallet, so that I don't need the original passkey.
10. As a collector, I want to see my connected wallet address in the navigation bar, so that I know I am authenticated.
11. As a collector, I want to lock my wallet from the nav bar, so that I can secure my wallet when stepping away.
12. As a collector, I want to buy a plate by authorizing the transaction with my passkey, so that I can complete a purchase securely.
13. As a collector, I want to view my owned plates in the wallet page, so that I can see my collection.
14. As an artist, I want to sign a login challenge with my wallet, so that I can access the artist portal without a third-party auth provider.
15. As an artist, I want to automatically reconnect to my portal session on return visits, so that I don't need to sign in every time.
16. As an artist, I want my wallet address to be the only credential needed for portal access, so that the login is simple and self-custodial.
17. As a site operator, I want to remove the third-party auth dependency from the codebase, so that the site is simpler, cheaper, and fully self-hosted.
18. As a developer, I want web crypto and WebAuthn to run entirely on the client, so that no server-side key material exists.
19. As a site operator, I want artist sessions stored in KV (as today) but authorized by wallet signature, so that the API change is minimal.
20. As a user, I want Better Auth to use D1 for session storage, so that the auth system works within our existing Cloudflare stack.
21. As an administrator, I want the admin password login unchanged, so that there is no impact on admin workflows.

## Implementation Decisions

### 1. Passkey Wallet Library

Copy the wallet-passkey repo's `passkey.ts`, `crypto.ts`, `storage.ts`, `backup.ts` into `src/lib/passkey/`. These files are pure TypeScript with no framework dependency. Adapt `backup.ts` to also support uploading encrypted blobs to D1 via the user's Better Auth session.

Modules:
- `src/lib/passkey/passkey.ts` — `registerPasskey()`, `authenticateWithPasskey()`, `isPlatformAuthenticatorAvailable()`
- `src/lib/passkey/crypto.ts` — `deriveAESKeyFromPRF()`, `encryptString()`, `decryptString()`, base64/base64url utilities, `generateRandomSecret()`
- `src/lib/passkey/storage.ts` — `saveWallet()`, `loadWallet()`, `deleteWallet()` (IndexedDB, identical to wallet-passkey)
- `src/lib/passkey/backup.ts` — `createBackupFile()`, `parseBackupFile()`, `recoverWithPassword()`, `decryptWithRecoveryPassword()` + new `uploadBackupToD1()`, `downloadBackupFromD1()`

### 2. PasskeyWalletContext (React)

Single React context providing the wallet lifecycle:

```
status: "loading" | "none" | "locked" | "unlocked"
```

Methods: `createWallet()` → prompts passkey → creates dacc wallet → encrypts → stores in IndexedDB + uploads to D1. `unlock()` → passkey biometric → decrypt → ready. `lock()` → zeroize in-memory key. `importBackup()`, `exportBackup()`. `recoverWithPassword()`.

The context works independently from Better Auth. The wallet address is exposed via `usePasskeyWallet()` for components that need it (CheckoutFlow, WalletOwnedPlates).

### 3. Better Auth Integration

Better Auth runs as Astro middleware + API routes. It manages user identity and Google OAuth. The D1 database gets new tables for Better Auth (users, sessions, accounts, verifications).

Schema additions to D1 (managed by Better Auth's schema + our `0008_users` migration):

```sql
-- Better Auth uses its own schema for users/sessions/accounts/verifications.
-- Created automatically by better-auth when first accessed.
-- Additional table for user↔wallet linking:
CREATE TABLE IF NOT EXISTS wallet_backups (
  id            TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL,
  address       TEXT NOT NULL,
  encrypted_blob TEXT NOT NULL,   -- JSON backup encrypted with recovery password
  prf_salt      TEXT,             -- null if Google-only user
  credential_id TEXT,             -- null if Google-only user
  created_at    INTEGER NOT NULL,
  updated_at    INTEGER NOT NULL
);
```

Better Auth is configured in `src/lib/auth/server.ts`:

```
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { astro } from "better-auth/astro"  // or express-like integration

export const auth = betterAuth({
  database: drizzleAdapter(db, "sqlite"),  // D1 via drizzle
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  // Also support passkey sign-in (WebAuthn)
  passkey: {
    enabled: true,
    rpName: "SAKNID",
    rpID: "inknoir.pages.dev",
  },
})
```

Better Auth API routes mounted at `/api/auth/*` via an Astro catch-all route (`src/pages/api/auth/[...all].ts`).

### 4. Auth API Routes

| Route | Method | Auth | Purpose |
|---|---|---|---|
| `/api/auth/[...all]` | * | Better Auth | Better Auth handler (login, register, callback, session) |
| `/api/auth/artist-login` | POST | Wallet signature | Artist signs challenge → `viem.verifyMessage` → KV session |
| `/api/auth/artist-logout` | POST | Artist session | Clear KV session |

Artist login flow (replacing third-party JWT):

```
Client: GET /api/auth/challenge → { message, nonce }
Client: wallet.signMessage(message) → signature
Client: POST /api/auth/artist-login { address, signature, nonce }
Server: viem.verifyMessage({ address, message, signature }) → matches artist in DB? → create KV session
```

### 5. Component Changes

WalletProvider wraps only `WagmiProvider` + `QueryClientProvider` + `PasskeyWalletProvider`. No more legacy auth provider.

New components:
- `PasskeyNavButton` — Shows wallet status (connected address / "Connect Wallet") in the nav. Clicking opens WalletManage or triggers unlock.
- `WalletManage` — Modal/sheet for create/unlock/import/backup wallet flows. Adapts from wallet-passkey's CreateWallet + UnlockWallet + Dashboard panels.

Removed:
- Legacy auth components

### 6. Artist Portal

Legacy artist gate replaced with a `WalletSignatureGate` component:

1. User clicks "Sign in with Wallet" → wallet prompts biometrics for signing
2. A challenge message (`inknoir-artist-login-{nonce}`) is signed by the wallet
3. POST `/api/auth/artist-login` with `{ address, signature }`
4. Server verifies → KV session → cookie set → portal unlocked

### 7. Env Changes

Remove: Legacy third-party auth variables from wrangler.toml and env.d.ts
Add: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `BETTER_AUTH_SECRET` to wrangler.toml and env.d.ts

KV `SESSION` binding reused for artist sessions.
D1 `DB` binding reused — add Better Auth tables to same DB.

### 8. Recovery Flow Details

The recovery password is the bridge between auth methods:

```
Create wallet with passkey:
  1. Generate passwordSecretKey → dacc wallet
  2. Passkey PRF encrypts passwordSecretKey → IndexedDB
  3. User sets recovery password → PBKDF2 encrypts passwordSecretKey → D1 backup
  4. D1 backup linked to Better Auth user ID

Restore on new device via Google:
  1. Sign in with Google (Better Auth)
  2. D1 contains encrypted backup → download
  3. Enter recovery password → decrypt passwordSecretKey
  4. Register new passkey on this device
  5. Re-encrypt passwordSecretKey with new passkey → IndexedDB

Use wallet with Google only (no passkey):
  1. Sign in with Google
  2. Enter recovery password → decrypt from D1
  3. Use wallet in-memory (no passkey stored locally)
```

## Testing Decisions

### What makes a good test

Test external behavior, not implementation details. A good test for this feature defends:
- A user can create a wallet → wallet address is returned
- A user can unlock a wallet → can sign a message
- Recovery password decrypts a backup correctly
- Artist login with valid signature returns 200 + sets cookie
- Artist login with invalid signature returns 401
- Better Auth Google callback creates a session

### Existing seams

The codebase has two test layers:
1. **E2E (Playwright)** — `tests/e2e/*.spec.ts` — Tests pages via real browser. Good for nav/wallet/checkout flows.
2. **API (Playwright request fixture)** — `tests/e2e/api/*.spec.ts` — Tests HTTP endpoints without full page rendering. Good for auth endpoints.

### New tests to add or update

| Test | Type | What it covers |
|---|---|---|
| `tests/e2e/api/artist-login.spec.ts` | API (request fixture) | POST `/api/auth/artist-login` with valid/invalid signatures, challenge, missing params |
| `tests/e2e/wallet.spec.ts` (update) | E2E | Wallet page shows connect/unlock state after removal of legacy auth |
| `tests/e2e/nav.spec.ts` (update) | E2E | Nav shows wallet button, not crashing from missing legacy auth |
| `tests/unit/passkey-crypto.test.ts` | Vitest | Encrypt/decrypt round-trip, base64 encoding, HKDF derivation (pure functions, no DOM) |
| `tests/unit/backup.test.ts` | Vitest | Backup file creation and parsing, recovery password encrypt/decrypt |

### Prior art

- `tests/e2e/auth-admin.spec.ts` — Pattern for testing login API with request fixture: `request.post(...)` → assert status + cookie headers.
- `tests/e2e/api/health.spec.ts` — Pattern for API endpoint testing without auth.
- `tests/unit/i18n.test.ts` — Pattern for unit testing pure functions with Vitest.

Passkey and WebAuthn cannot be tested in Playwright or Vitest without browser WebAuthn API mocks. The `tests/unit/` level tests cover only the crypto primitives and backup logic. The wallet UI flow is tested via E2E by checking for the presence of wallet UI elements (not actual biometric prompts).

## Out of Scope

- Social login providers other than Google (GitHub, Apple, etc.)
- Admin auth changes — password login remains as-is
- Existing artist portal features (design listing, booking calendar, earnings) — only the auth gate changes
- Wallet recovery email/SMS — recovery is password-based only
- Multichain wallet support — BSC Testnet only (unchanged)
- Mobile native WebAuthn experience tuning — standard browser passkey behavior
- Existing admin auth flow — unchanged
- WalletConnect / external wallet browser extension support — passkey wallet replaces the need
- dacc-js wallet upgrades or feature additions beyond what we need (send native, ERC-20, sign messages, write contracts)

## Further Notes

- dacc-js is an npm package (`dacc-js@^0.1.1`). It creates wallets deterministically from a `passwordSecretKey` and exposes `address`, `daccPublickey`, and methods for signing.
- Better Auth requires a secret (`BETTER_AUTH_SECRET`) for cookie encryption. This is stored as a Cloudflare secret, not in wrangler.toml.
- The passkey PRF extension requires HTTPS (localhost works). Production at `inknoir.pages.dev` already serves HTTPS.
- Better Auth's Google OAuth requires `http://localhost:4321/api/auth/callback/google` for dev and `https://inknoir.pages.dev/api/auth/callback/google` for production in the Google Cloud Console.
- `dacc-js` wallet creation uses `passwordSecretKey` internally. The key derivation between passkey and recovery must produce the same `passwordSecretKey` — the PRF output and recovery password both decrypt to the same key.
- KV namespace `SESSION` continues to be used for artist portal sessions. Better Auth uses D1 for its sessions.
- The migration from legacy auth is a hard cutover: after deployment, existing users will need to create or import a wallet via passkey. Legacy-created wallets cannot be migrated (they were managed by the third-party infrastructure).
