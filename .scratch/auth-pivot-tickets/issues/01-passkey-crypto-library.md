# 01 — Prefactor: Passkey crypto + backup library

**What to build:** Pure TypeScript utilities for WebAuthn PRF passkey registration, AES-GCM + HKDF encryption, IndexedDB storage, and PBKDF2 recovery backup. No React components, no API routes, no wallet engine dependency.

Sources the implementation from `tokenine/wallet-passkey` (MIT license), adapted to the project's codebase structure under `src/lib/passkey/`.

**Blocked by:** None — can start immediately

**Status:** ready-for-agent

- [ ] `src/lib/passkey/crypto.ts` — `deriveAESKeyFromPRF()`, `encryptString()`, `decryptString()`, base64/base64url utilities, `generateRandomBytes()`, `generateRandomSecret()`
- [ ] `src/lib/passkey/passkey.ts` — `registerPasskey()`, `authenticateWithPasskey()`, `isWebAuthnSupported()`, `isPlatformAuthenticatorAvailable()`
- [ ] `src/lib/passkey/storage.ts` — `saveWallet()`, `loadWallet()`, `deleteWallet()` via IndexedDB
- [ ] `src/lib/passkey/backup.ts` — `createBackupFile()`, `parseBackupFile()`, `encryptWithRecoveryPassword()`, `decryptWithRecoveryPassword()`
- [ ] Tests in `tests/unit/passkey-crypto.test.ts` — encrypt/decrypt round-trip, base64 encode/decode, HKDF derivation
- [ ] Tests in `tests/unit/backup.test.ts` — backup file creation/parsing, recovery password encrypt/decrypt
- [ ] `vitest` passes
