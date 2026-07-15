# Auth Pivot: Privy → Passkey Wallet + Better Auth + Wallet Signatures

## Destination

Replace Privy (email/Google/wallet login + embedded wallets + JWT verification) with:

1. **Passkey wallet** (`dacc-js` + WebAuthn PRF) — self-custodial blockchain wallet, client-side
2. **Better Auth** (Astro + D1) — user identity/Google OAuth/role management
3. **Wallet signatures via viem** — artist portal authentication

Both passkey and Google auth provide access to the same wallet, bridged by a **recovery password** (PBKDF2-encrypted backup in D1).

## Key Design Decisions

- Passkey wallet is the blockchain identity; Better Auth is the user/identity layer
- All wallet operations stay client-side (IndexedDB + WebAuthn)
- Better Auth stores encrypted wallet backups in D1 for cross-auth recovery
- Artist auth: sign challenge → `viem.verifyMessage` → JWT session (no third-party)
- Admin login: unchanged (password-based)

## Files to Remove

- `src/lib/config/privy.ts`
- `src/components/PrivyNavButton.tsx`
- `src/components/PrivyNavButtonInner.tsx`
- `src/components/PrivyArtistGate.tsx`
- `@privy-io/react-auth`, `@privy-io/wagmi` from package.json

## Files to Rewrite

- `src/components/WalletProvider.tsx` → wagmi + PasskeyWalletContext only
- `src/components/CheckoutFlow.tsx` → use passkey wallet
- `src/components/WalletOwnedPlates.tsx` → use passkey wallet
- `src/pages/api/auth/artist-login.ts` → viem.verifyMessage instead of Privy JWT
- `src/pages/artist/portal.astro` → replace PrivyArtistGate
- `src/pages/design/[id].astro` → use passkey wallet

## New Files

**Passkey wallet library (from tokenine/wallet-passkey):**
- `src/lib/passkey/passkey.ts` — WebAuthn PRF
- `src/lib/passkey/crypto.ts` — AES-GCM + HKDF + base64
- `src/lib/passkey/storage.ts` — IndexedDB
- `src/lib/passkey/backup.ts` — recovery backup
- `src/contexts/PasskeyWalletContext.tsx` — React context
- `src/components/PasskeyNavButton.tsx` — wallet status button
- `src/components/WalletManage.tsx` — create/unlock/import/backup wallet UI

**Better Auth integration:**
- `src/lib/auth/server.ts` — Better Auth server config
- `src/lib/auth/client.ts` — Better Auth client
- `src/pages/api/auth/[...all].ts` — Better Auth API routes
- `src/pages/auth/login.astro` — Login page
- `src/pages/auth/callback.astro` — OAuth callback (if needed)
- D1 schema for Better Auth tables

## New Dependencies

```json
{
  "dependencies": {
    "dacc-js": "^0.1.1",
    "better-auth": "^latest"
  }
}
```
