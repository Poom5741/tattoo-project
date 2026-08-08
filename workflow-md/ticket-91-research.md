# Ticket #91: Auth Persistence Architecture — Research

## Status: Research Complete

## Current State Analysis

### How Auth Works Today

1. **Client Login Flow** (`/api/auth/client-login`):
   - User signs a challenge message with their EVM passkey wallet
   - Server verifies signature via `viem.verifyMessage`
   - Creates a KV session: `client:{uuid}` → `{ address }` with 30-day TTL
   - Sets `client_token` cookie (HttpOnly, 30-day Max-Age)

2. **Server-Side Restoration** (middleware.ts):
   - Reads `client_token` cookie from request
   - Fetches session from KV: `SESSION.get('client:{token}')`
   - Sets `context.locals.user` with address as ID
   - This works on every SSR page load

3. **Client-Side State** (walletStore.ts):
   - Stores wallet keys in localStorage: `saknid_wallet_daccPublickey`, `saknid_wallet_address`, `saknid_wallet_secret`
   - Module-level singleton shared across all Astro islands
   - Status: `"loading"` | `"none"` | `"locked"` | `"unlocked"`

### The Problem

The middleware correctly restores the session server-side (`context.locals.user`), but **client components don't have access to this**. Each page that needs wallet state:
- Renders `<PasskeyWalletProvider>` (which is now a no-op wrapper)
- Reads from localStorage (which only has keys, not session status)
- Forces user to "unlock" wallet on every page

### What's Actually Missing

The client doesn't know "this user has an active session" vs "this user has wallet keys but no session." The middleware restores the session, but this information never reaches the React components.

## Recommended Approach

### Option A: Server → Client Session Passing (Recommended)

Pass the session status from `context.locals.user` to client components via:
1. A `data-session-active="true"` attribute on `<html>` or a meta tag
2. Or inject `window.__SAKNID_SESSION__ = { active: true, address: "0x..." }` in the layout

**Pros:**
- Minimal change (layout + one hook)
- Session state is authoritative (comes from server)
- No additional network requests

**Cons:**
- Exposes address to client JS (already in localStorage, so acceptable)
- Slightly increases HTML size

### Option B: Client-Side Cookie Check

Have the wallet store check for `client_token` cookie on mount:
- If cookie exists → status = `"locked"` (can unlock without re-auth)
- If no cookie → status = `"none"` (need to sign in)

**Pros:**
- No server changes needed
- Simple implementation

**Cons:**
- Cookie is HttpOnly (can't read from JS!)
- Would need to change cookie to be JS-readable, which weakens security

### Option C: API Call on Mount

Have the wallet store call `/api/auth/session` on mount to check if session exists.

**Pros:**
- Authoritative session check
- No cookie changes needed

**Cons:**
- Extra network request on every page load
- Adds latency

## Recommendation: Option A

The smallest safe change is Option A:

1. **In Base.astro**: Inject `window.__SAKNID_SESSION__` with session status from `Astro.locals.user`
2. **In walletStore.ts**: On mount, check `window.__SAKNID_SESSION__` to set initial status
3. **In Nav.tsx**: If session exists but wallet is "locked", show "Unlock" instead of "Connect"

### Files to Change

| File | Change |
|------|--------|
| `src/layouts/Base.astro` | Add `<script>` that sets `window.__SAKNID_SESSION__` |
| `src/lib/walletStore.ts` | Read session status on hydration |
| `src/components/Nav.tsx` | Update button text based on session vs wallet status |

### Risk Assessment

- **Security**: Address is already in localStorage; exposing it to JS is acceptable
- **UX**: Users with valid sessions see "Unlock" instead of "Connect" — correct behavior
- **Performance**: Zero additional network requests

### Migration Path

- Existing users with `client_token` cookie will automatically get session restoration
- No database changes needed
- No cookie changes needed

## Decision

**Approach:** Option A — Server → Client Session Passing
**Scope:** 3 files, ~30 lines of code
**Risk:** Low
