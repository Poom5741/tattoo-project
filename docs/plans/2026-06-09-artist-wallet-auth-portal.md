# Artist Wallet Auth & Portal Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Artists log in with a crypto wallet (or email/social via Privy's embedded wallet) and land on a private portal showing their own plates and booking inquiries.

**Architecture:** Privy handles account abstraction — artists can sign in with email/Google and receive an auto-generated ERC-4337 smart wallet on Base, no seed phrase needed. After Privy auth, the client posts a Privy access token to a Cloudflare Worker endpoint that verifies it, looks up the artist by wallet address in D1, and issues an `artist_token` KV session cookie (same pattern as admin auth). The existing Wagmi + RainbowKit setup for buyers is untouched.

**Tech Stack:**
- `@privy-io/react-auth` (React island, browser only)
- `@privy-io/node` (Cloudflare Workers-compatible server-side token verification)
- `viem` (already installed — used for address checksumming)
- Astro SSR + Cloudflare D1 + KV (SESSION namespace, already wired)
- wrangler.toml already has `nodejs_compat` flag

**Research summary:** Privy is the only provider with an explicitly Cloudflare Workers-confirmed server SDK (`@privy-io/node`). It supports ERC-4337 smart wallets on the free tier (499 MAU), email + Google + Apple + SMS + external wallets, and Base Sepolia. Acquired by Stripe in June 2025 — keep session layer in standard cookies so switching providers is a thin change later. Privy App ID: public (wrangler.toml `[vars]`). Privy App Secret: secret (`wrangler pages secret put PRIVY_APP_SECRET`).

---

## Before you start

1. Create a free Privy app at https://dashboard.privy.io
2. In the dashboard:
   - **Login methods**: enable Email, Google, and "External wallet"
   - **Embedded wallets**: ON, set `Create on login: true`
   - **Smart wallets**: ON, select "Alchemy" or "Kernel (ZeroDev)" implementation, set chain to **Base Sepolia**
   - **Allowed domains**: add `inknoir.pages.dev` and `localhost:4321`
3. Copy **App ID** (public) and **App Secret** (private)

---

### Task 1: Install Privy packages

**Files:**
- Modify: `package.json` (via pnpm add)

**Step 1: Install**
```bash
pnpm add @privy-io/react-auth @privy-io/node
```

**Step 2: Verify install**
```bash
pnpm ls @privy-io/react-auth @privy-io/node
```
Expected: both packages listed with versions.

**Step 3: Commit**
```bash
git add pnpm-lock.yaml package.json
git commit -m "chore: add Privy packages for wallet auth"
```

---

### Task 2: D1 migration — add wallet_address columns

**Files:**
- Create: `migrations/0004_artist_wallets.sql`

**Step 1: Create migration file**
```sql
-- migrations/0004_artist_wallets.sql
BEGIN;

ALTER TABLE artists ADD COLUMN wallet_address TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_artists_wallet ON artists(wallet_address);

ALTER TABLE booking_inquiries ADD COLUMN buyer_wallet TEXT;

INSERT OR IGNORE INTO _migrations VALUES (4, strftime('%s','now'));

COMMIT;
```

**Step 2: Run against remote D1**
```bash
node_modules/.pnpm/node_modules/.bin/wrangler d1 execute inknoir-catalog \
  --file migrations/0004_artist_wallets.sql --remote
```
Expected output: `Executed 1 commands` or similar success message.

**Step 3: Verify column exists**
```bash
node_modules/.pnpm/node_modules/.bin/wrangler d1 execute inknoir-catalog \
  --command "PRAGMA table_info(artists);" --remote
```
Expected: output includes `wallet_address` row.

**Step 4: Commit**
```bash
git add migrations/0004_artist_wallets.sql
git commit -m "feat: D1 migration — add wallet_address to artists and buyer_wallet to bookings"
```

---

### Task 3: Wire env vars

**Files:**
- Modify: `src/env.d.ts`
- Modify: `wrangler.toml`

**Step 1: Add to wrangler.toml `[vars]` section**
```toml
PRIVY_APP_ID = "clxxxxxxxxxxxxxxxxxxxxxxx"   # replace with your real App ID
```

**Step 2: Add PRIVY_APP_SECRET as a Cloudflare secret**
```bash
node_modules/.pnpm/node_modules/.bin/wrangler pages secret put PRIVY_APP_SECRET \
  --project-name inknoir
# Paste your Privy App Secret at the prompt
```

**Step 3: Update `src/env.d.ts`**
Add to the `Env` interface:
```typescript
PRIVY_APP_ID: string;
PRIVY_APP_SECRET: string;
```

**Step 4: Commit**
```bash
git add src/env.d.ts wrangler.toml
git commit -m "feat: add PRIVY_APP_ID env var and update Env interface"
```

---

### Task 4: Create artist session auth helper

**Files:**
- Create: `src/lib/artist/auth.ts`

**Step 1: Create the helper**
```typescript
// src/lib/artist/auth.ts
import type { KVNamespace } from "@cloudflare/workers-types";

export interface ArtistSession {
  artistId: string;
  walletAddress: string;
  name: string;
}

export async function getArtistSession(
  cookieHeader: string,
  kv: KVNamespace
): Promise<ArtistSession | null> {
  const token = cookieHeader.match(/artist_token=([^;]+)/)?.[1];
  if (!token) return null;
  try {
    const val = await kv.get(`artist:${token}`);
    if (!val) return null;
    return JSON.parse(val) as ArtistSession;
  } catch {
    return null;
  }
}
```

**Step 2: Commit**
```bash
git add src/lib/artist/auth.ts
git commit -m "feat: artist session helper (KV token lookup)"
```

---

### Task 5: Create artist wallet login API endpoint

**Files:**
- Create: `src/pages/api/auth/artist-login.ts`

**Step 1: Create the endpoint**
```typescript
// src/pages/api/auth/artist-login.ts
export const prerender = false;

import type { APIRoute } from "astro";
import { randomUUID } from "crypto";
import { PrivyClient } from "@privy-io/node";

interface ArtistRow {
  id: string;
  name: string;
  wallet_address: string | null;
}

export const POST: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime.env;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { accessToken } = body as { accessToken?: string };
  if (!accessToken) {
    return new Response(JSON.stringify({ error: "Missing accessToken" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Verify token with Privy server SDK
  const privy = new PrivyClient(env.PRIVY_APP_ID, env.PRIVY_APP_SECRET);

  let walletAddress: string;
  try {
    const claims = await privy.verifyAuthToken(accessToken);
    const user = await privy.getUser(claims.userId);
    // Prefer smart wallet address; fall back to embedded EOA or linked wallet
    const addr =
      user.smartWallet?.address ??
      user.wallet?.address;
    if (!addr) {
      return new Response(JSON.stringify({ error: "No wallet on account" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    walletAddress = addr.toLowerCase();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid Privy token" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Look up artist by wallet address (case-insensitive)
  const artist = await env.DB.prepare(
    "SELECT id, name, wallet_address FROM artists WHERE lower(wallet_address) = ?"
  )
    .bind(walletAddress)
    .first<ArtistRow>();

  if (!artist) {
    return new Response(
      JSON.stringify({ error: "Wallet not linked to any artist profile" }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  // Create session in KV
  const token = randomUUID();
  const session = { artistId: artist.id, walletAddress, name: artist.name };
  await env.SESSION.put(`artist:${token}`, JSON.stringify(session), {
    expirationTtl: 60 * 60 * 8,
  });

  return new Response(JSON.stringify({ ok: true, artistId: artist.id }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": `artist_token=${token}; Path=/artist; HttpOnly; SameSite=Lax; Max-Age=28800`,
    },
  });
};
```

**Step 2: Commit**
```bash
git add src/pages/api/auth/artist-login.ts
git commit -m "feat: artist wallet login API — Privy token verify → KV session"
```

---

### Task 6: Create artist logout API endpoint

**Files:**
- Create: `src/pages/api/auth/artist-logout.ts`

**Step 1: Create the endpoint**
```typescript
// src/pages/api/auth/artist-logout.ts
export const prerender = false;

import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime.env;
  const cookie = request.headers.get("cookie") ?? "";
  const token = cookie.match(/artist_token=([^;]+)/)?.[1];

  if (token) {
    await env.SESSION.delete(`artist:${token}`).catch(() => {});
  }

  return new Response(null, {
    status: 302,
    headers: {
      Location: "/artist/portal",
      "Set-Cookie":
        "artist_token=; Path=/artist; HttpOnly; SameSite=Lax; Max-Age=0",
    },
  });
};
```

**Step 2: Commit**
```bash
git add src/pages/api/auth/artist-logout.ts
git commit -m "feat: artist logout API"
```

---

### Task 7: Create PrivyArtistGate React island

This component is the browser-side login wall. It wraps Privy's provider and handles the auth handshake.

**Files:**
- Create: `src/components/PrivyArtistGate.tsx`

**Step 1: Create the component**
```tsx
// src/components/PrivyArtistGate.tsx
import { PrivyProvider, usePrivy } from "@privy-io/react-auth";
import { baseSepolia } from "viem/chains";

interface Props {
  appId: string;
}

function LoginWall() {
  const { login, ready } = usePrivy();

  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "24px",
      }}
    >
      <div className="kicker" style={{ letterSpacing: "0.2em" }}>
        INKNOIR / Artist Portal
      </div>
      <h1 className="display" style={{ fontSize: "34px" }}>
        Sign in with your wallet
      </h1>
      <p
        className="mono"
        style={{ fontSize: "13px", color: "var(--fg-dim)", maxWidth: "360px", textAlign: "center" }}
      >
        Use email, Google, or any Ethereum wallet. No seed phrase required — your smart wallet is created automatically.
      </p>
      <button
        className="btn btn--solid btn--lg"
        onClick={login}
        disabled={!ready}
        style={{ minWidth: "200px" }}
      >
        {ready ? "Connect & Sign in" : "Loading…"}
      </button>
    </div>
  );
}

function AuthHandler({ onSession }: { onSession: () => void }) {
  const { authenticated, getAccessToken, logout } = usePrivy();
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const calledRef = React.useRef(false);

  React.useEffect(() => {
    if (!authenticated || calledRef.current) return;
    calledRef.current = true;
    setLoading(true);

    (async () => {
      try {
        const accessToken = await getAccessToken();
        const res = await fetch("/api/auth/artist-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accessToken }),
        });
        if (res.ok) {
          onSession();
        } else {
          const { error: msg } = await res.json();
          setError(msg ?? "Login failed");
          await logout();
          calledRef.current = false;
        }
      } catch {
        setError("Network error. Please try again.");
        calledRef.current = false;
      } finally {
        setLoading(false);
      }
    })();
  }, [authenticated]);

  if (loading) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p className="mono" style={{ fontSize: "13px", color: "var(--fg-dim)" }}>
          Verifying wallet…
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px" }}>
        <p className="mono" style={{ fontSize: "13px", color: "var(--warn)" }}>{error}</p>
        <button className="btn btn--ghost" onClick={() => { setError(null); calledRef.current = false; }}>
          Try again
        </button>
      </div>
    );
  }

  return <LoginWall />;
}

import React from "react";

export default function PrivyArtistGate({ appId }: Props) {
  const [sessionReady, setSessionReady] = React.useState(false);

  if (sessionReady) {
    // Cookie is set — full page reload to hit SSR with the new cookie
    window.location.reload();
    return null;
  }

  return (
    <PrivyProvider
      appId={appId}
      config={{
        loginMethods: ["email", "google", "wallet"],
        embeddedWallets: {
          createOnLogin: "all-users",
          requireUserPasswordOnCreate: false,
        },
        defaultChain: baseSepolia,
        supportedChains: [baseSepolia],
        appearance: {
          theme: "dark",
          accentColor: "#c9a96e",
          logo: "/favicon.svg",
        },
      }}
    >
      <AuthHandler onSession={() => setSessionReady(true)} />
    </PrivyProvider>
  );
}
```

**Step 2: Commit**
```bash
git add src/components/PrivyArtistGate.tsx
git commit -m "feat: PrivyArtistGate React island — social/wallet login with AA"
```

---

### Task 8: Create artist portal page

**Files:**
- Create: `src/pages/artist/portal.astro`

**Step 1: Create the page**
```astro
---
export const prerender = false;

import Base from "../../layouts/Base.astro";
import { getArtistSession } from "../../lib/artist/auth";
import type { ArtistSession } from "../../lib/artist/auth";

const env = Astro.locals.runtime.env;
const session = await getArtistSession(
  Astro.request.headers.get("cookie") ?? "",
  env.SESSION
);

interface DesignRow {
  id: string;
  n: string;
  title: string;
  style: string | null;
  price: number | null;
  status: string;
  placement: string | null;
}

interface BookingRow {
  id: number;
  design_id: string | null;
  name: string;
  contact: string;
  message: string | null;
  buyer_wallet: string | null;
  created_at: number;
}

let plates: DesignRow[] = [];
let bookings: BookingRow[] = [];
let artistName = "";

if (session) {
  const db = env.DB;
  const [pRes, bRes, aRow] = await Promise.all([
    db
      .prepare(
        "SELECT id, n, title, style, price, status, placement FROM designs WHERE artist_id = ? ORDER BY token_id ASC"
      )
      .bind(session.artistId)
      .all<DesignRow>(),
    db
      .prepare(
        "SELECT id, design_id, name, contact, message, buyer_wallet, created_at FROM booking_inquiries WHERE artist_id = ? ORDER BY created_at DESC"
      )
      .bind(session.artistId)
      .all<BookingRow>(),
    db
      .prepare("SELECT name FROM artists WHERE id = ?")
      .bind(session.artistId)
      .first<{ name: string }>(),
  ]);
  plates = pRes.results;
  bookings = bRes.results;
  artistName = aRow?.name ?? session.name;
}

const stats = {
  total: plates.length,
  available: plates.filter((p) => p.status === "available").length,
  reserved: plates.filter((p) => p.status === "reserved").length,
  sold: plates.filter((p) => p.status === "sold").length,
  inquiries: bookings.length,
};

function fmtDate(ts: number) {
  return new Date(ts * 1000).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const PRIVY_APP_ID = env.PRIVY_APP_ID;
---

<Base title="Artist Portal — INKNOIR">
  <style>
    .portal { max-width: 1000px; margin: 0 auto; padding: 40px 28px 80px; }
    .portal-hd { display: flex; justify-content: space-between; align-items: center;
      padding-bottom: 24px; border-bottom: 1px solid var(--line); margin-bottom: 40px; }
    .stats { display: grid; grid-template-columns: repeat(5, 1fr); gap: 1px;
      background: var(--line); border: 1px solid var(--line); margin-bottom: 48px; }
    .stat { background: var(--ink-800); padding: 20px 22px; }
    .stat .n { font-family: var(--font-display); font-size: 36px; line-height: 1; }
    .stat .l { font-family: var(--font-mono); font-size: 9px; letter-spacing: .2em;
      text-transform: uppercase; color: var(--fg-faint); margin-top: 6px; }
    .sec { font-family: var(--font-mono); font-size: 10.5px; letter-spacing: .2em;
      text-transform: uppercase; color: var(--fg-dim); margin-bottom: 14px; }
    .tbl { width: 100%; border: 1px solid var(--line); border-collapse: collapse; margin-bottom: 52px; }
    .tbl th { font-family: var(--font-mono); font-size: 10px; letter-spacing: .14em;
      text-transform: uppercase; color: var(--fg-faint); padding: 11px 16px; text-align: left;
      border-bottom: 1px solid var(--line); background: var(--ink-850); white-space: nowrap; }
    .tbl td { padding: 12px 16px; border-bottom: 1px solid var(--line); font-size: 13px;
      vertical-align: top; }
    .tbl tr:last-child td { border-bottom: none; }
    .tbl tr:hover td { background: var(--ink-750); }
    .wallet-chip { font-family: var(--font-mono); font-size: 10px; background: var(--ink-750);
      border: 1px solid var(--line); padding: 2px 7px; border-radius: 2px;
      color: var(--fg-dim); overflow: hidden; max-width: 140px; white-space: nowrap;
      text-overflow: ellipsis; display: inline-block; vertical-align: middle; }
    @media (max-width: 640px) { .stats { grid-template-columns: repeat(2, 1fr); } }
  </style>

  {!session ? (
    <div id="login-mount">
      {/* Privy login island — injected below */}
    </div>
    <script define:vars={{ PRIVY_APP_ID }}>
      // Mount the React login island only on the client
      import("/src/components/PrivyArtistGate.tsx")
        .catch(() => {});
    </script>
    <!-- SSR fallback: use a proper island -->
  ) : (
    <div class="portal">
      <div class="portal-hd">
        <div>
          <div class="kicker" style="margin-bottom: 8px;">INKNOIR / Artist Portal</div>
          <h1 class="display" style="font-size: 32px;">{artistName}</h1>
          <div class="wallet-chip" style="margin-top: 8px;" title={session.walletAddress}>
            {session.walletAddress.slice(0, 6)}…{session.walletAddress.slice(-4)}
          </div>
        </div>
        <form method="POST" action="/api/auth/artist-logout">
          <button type="submit" class="btn btn--ghost">Sign out</button>
        </form>
      </div>

      <div class="stats">
        <div class="stat"><div class="n">{stats.total}</div><div class="l">Plates</div></div>
        <div class="stat"><div class="n" style="color:var(--ok)">{stats.available}</div><div class="l">Available</div></div>
        <div class="stat"><div class="n" style="color:var(--warn)">{stats.reserved}</div><div class="l">Reserved</div></div>
        <div class="stat"><div class="n">{stats.sold}</div><div class="l">Sold</div></div>
        <div class="stat"><div class="n">{stats.inquiries}</div><div class="l">Inquiries</div></div>
      </div>

      <div class="sec">Your plates</div>
      {plates.length === 0 ? (
        <p class="mono faint" style="font-size:13px; margin-bottom:48px;">No plates yet.</p>
      ) : (
        <table class="tbl">
          <thead>
            <tr>
              <th>№</th><th>Title</th><th>Style</th>
              <th>Placement</th><th>Price</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            {plates.map((p) => (
              <tr>
                <td class="mono faint" style="font-size:11px">{p.n}</td>
                <td>
                  <a href={`/design/${p.id}`} style="text-decoration:underline;text-underline-offset:3px">
                    {p.title}
                  </a>
                </td>
                <td class="mono faint" style="font-size:11px">{p.style ?? "—"}</td>
                <td class="mono faint" style="font-size:11px">{p.placement ?? "—"}</td>
                <td class="mono" style="font-size:12px">
                  {p.price != null ? p.price.toFixed(3) + " ETH" : "—"}
                </td>
                <td>
                  <span class={`tag ${p.status === "available" ? "tag--avail" : p.status === "reserved" ? "tag--reserved" : "tag--sold"}`}>
                    <span class="dot"></span>{p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div class="sec">Booking inquiries</div>
      {bookings.length === 0 ? (
        <p class="mono faint" style="font-size:13px;">No inquiries yet.</p>
      ) : (
        <table class="tbl">
          <thead>
            <tr>
              <th>#</th><th>Date</th><th>Name</th><th>Contact</th>
              <th>Plate</th><th>Buyer wallet</th><th>Message</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr>
                <td class="mono faint" style="font-size:11px">{b.id}</td>
                <td class="mono" style="font-size:11px;white-space:nowrap">{fmtDate(b.created_at)}</td>
                <td style="font-weight:500">{b.name}</td>
                <td class="mono" style="font-size:12px">{b.contact}</td>
                <td class="mono faint" style="font-size:11px">{b.design_id ?? "—"}</td>
                <td>
                  {b.buyer_wallet ? (
                    <span class="wallet-chip" title={b.buyer_wallet}>
                      {b.buyer_wallet.slice(0, 6)}…{b.buyer_wallet.slice(-4)}
                    </span>
                  ) : "—"}
                </td>
                <td>
                  <div style="font-size:12px;color:var(--fg-dim);max-width:220px">
                    {b.message ?? "—"}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )}
</Base>
```

> **Note on the login wall:** The `{!session}` branch above shows a placeholder. After Task 8, you need to replace it with the proper Astro island syntax (Task 9 fixes this). The PrivyArtistGate needs to be mounted as an Astro island with `client:load`.

**Step 2: Commit**
```bash
git add src/pages/artist/portal.astro
git commit -m "feat: artist portal page — plates + bookings with wallet session gate"
```

---

### Task 9: Fix the login wall with a proper Astro island

The `{!session}` branch needs a real Astro island import for Privy to work client-side. Fix the portal page's unauthenticated branch:

**Files:**
- Modify: `src/pages/artist/portal.astro`

**Step 1: Add the island import at the top of the frontmatter** (after other imports)
```typescript
import PrivyArtistGate from "../../components/PrivyArtistGate";
```

**Step 2: Replace the `{!session}` block with**
```astro
{!session ? (
  <PrivyArtistGate client:load appId={PRIVY_APP_ID} />
) : (
  // ... authenticated dashboard content stays the same
)}
```

**Step 3: Remove the old `<div id="login-mount">` block and the inline `<script>` tag** — they're replaced by the island.

**Step 4: Run build to check for TypeScript errors**
```bash
pnpm run build 2>&1 | grep -E "error|Error|warn" | head -20
```
Expected: `[build] Complete!` with no type errors.

**Step 5: Commit**
```bash
git add src/pages/artist/portal.astro
git commit -m "fix: wire PrivyArtistGate as Astro island in artist portal"
```

---

### Task 10: Add wallet_address management to admin dashboard

Artists need their wallet addresses set before they can log in. Add a simple inline form to the admin dashboard that lets the admin update an artist's wallet address.

**Files:**
- Create: `src/pages/api/admin/update-artist-wallet.ts`
- Modify: `src/pages/admin/index.astro`

**Step 1: Create the update endpoint**
```typescript
// src/pages/api/admin/update-artist-wallet.ts
export const prerender = false;

import type { APIRoute } from "astro";
import { isAdminAuthed } from "../../../lib/admin/auth";

export const POST: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime.env;
  const authed = await isAdminAuthed(
    request.headers.get("cookie") ?? "",
    env.SESSION
  );
  if (!authed) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  const form = await request.formData();
  const artistId = form.get("artistId")?.toString().trim();
  const walletAddress = form.get("walletAddress")?.toString().trim().toLowerCase();

  if (!artistId || !walletAddress) {
    return new Response(JSON.stringify({ error: "Missing fields" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Basic hex address validation
  if (!/^0x[0-9a-f]{40}$/.test(walletAddress)) {
    return new Response(JSON.stringify({ error: "Invalid wallet address" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  await env.DB.prepare(
    "UPDATE artists SET wallet_address = ? WHERE id = ?"
  )
    .bind(walletAddress, artistId)
    .run();

  return new Response(null, {
    status: 302,
    headers: { Location: "/admin" },
  });
};
```

**Step 2: Add a "Manage artist wallets" section to `src/pages/admin/index.astro`**

In the authenticated branch, after the "All plates" table, add:

```astro
<div class="sec" style="margin-top: 24px;">Artist wallet addresses</div>
<table class="tbl" style="margin-bottom: 0">
  <thead>
    <tr>
      <th>Artist</th><th>ID</th><th>Current wallet</th><th>Update</th>
    </tr>
  </thead>
  <tbody>
    {artists.map((a) => {
      const artistWithWallet = a as typeof a & { wallet_address?: string | null };
      return (
        <tr>
          <td style="font-weight:500">{a.name}</td>
          <td class="mono faint" style="font-size:11px">{a.id}</td>
          <td class="mono" style="font-size:11px">
            {artistWithWallet.wallet_address ?? <span style="color:var(--fg-faint)">not set</span>}
          </td>
          <td>
            <form method="POST" action="/api/admin/update-artist-wallet"
              style="display:flex;gap:8px;align-items:center">
              <input type="hidden" name="artistId" value={a.id} />
              <input type="text" name="walletAddress" class="input"
                placeholder="0x…" style="font-size:11px;font-family:var(--font-mono);width:280px;padding:6px 10px"
                defaultValue={artistWithWallet.wallet_address ?? ""} />
              <button type="submit" class="btn btn--ghost" style="font-size:11px;padding:6px 14px">
                Save
              </button>
            </form>
          </td>
        </tr>
      );
    })}
  </tbody>
</table>
```

You also need to update the D1 query in the admin page to fetch `wallet_address`:

Change:
```typescript
db.prepare("SELECT id, name FROM artists ORDER BY name ASC").all<ArtistRow>(),
```
To:
```typescript
db.prepare("SELECT id, name, wallet_address FROM artists ORDER BY name ASC").all<ArtistRow & { wallet_address?: string | null }>(),
```

**Step 3: Build to verify no errors**
```bash
pnpm run build 2>&1 | tail -5
```

**Step 4: Commit**
```bash
git add src/pages/api/admin/update-artist-wallet.ts src/pages/admin/index.astro
git commit -m "feat: admin UI to set artist wallet addresses"
```

---

### Task 11: Build, deploy, and verify end-to-end

**Step 1: Final build**
```bash
pnpm run build 2>&1 | tail -5
```
Expected: `[build] Complete!`

**Step 2: Deploy**
```bash
node_modules/.pnpm/node_modules/.bin/wrangler pages deploy dist --project-name inknoir
```

**Step 3: Set a test artist wallet address via admin dashboard**
1. Go to `https://inknoir.pages.dev/admin`
2. Log in with the admin password
3. Scroll to "Artist wallet addresses"
4. Enter your wallet address for the `mara` artist and click Save

**Step 4: Test artist portal login**
1. Go to `https://inknoir.pages.dev/artist/portal`
2. Should see the Privy login modal
3. Log in with email or Google
4. Privy creates an embedded wallet → your session is verified → redirected to portal
5. Portal shows mara's plates and bookings

**Step 5: Test sign out**
1. Click "Sign out" in the portal header
2. Should redirect to `/artist/portal` showing the login wall again

**Step 6: Final commit**
```bash
git add -A
git commit -m "feat: deploy artist wallet auth + portal (Privy AA, KV sessions)"
```

---

## Post-deploy manual step

After the first deploy, set the Privy App Secret if not already done:
```bash
node_modules/.pnpm/node_modules/.bin/wrangler pages secret put PRIVY_APP_SECRET \
  --project-name inknoir
# Paste your secret at the prompt
```

Also verify `PRIVY_APP_ID` is in `wrangler.toml` `[vars]` with your real app ID.

---

## Architecture notes

- **Session namespace:** `SESSION` KV stores both admin (`admin:<token>`) and artist (`artist:<token>`) sessions. No collision because of the prefix.
- **Wallet address storage:** lowercase hex in D1. Always `.toLowerCase()` before comparison.
- **Smart wallet vs EOA:** `verifyAuthToken` → `getUser()` prefers `smartWallet.address` (ERC-4337 on Base). If smart wallets are off in the Privy dashboard, it falls back to `wallet.address` (EOA).
- **Privy acquisition hedge:** session layer is just cookies + KV. Swapping auth providers requires only changing `PrivyArtistGate.tsx` and `artist-login.ts` — the portal page and auth helper are provider-agnostic.
- **Buyer wallets:** `booking_inquiries.buyer_wallet` column is added but the booking form doesn't populate it yet. Future task: update `BookingForm.tsx` to send `user.wallet?.address` from `usePrivy()` (or `useAccount()` from Wagmi) to the booking API.
