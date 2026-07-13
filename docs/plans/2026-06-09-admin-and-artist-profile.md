# Admin Dashboard & Artist Profile Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a password-protected admin dashboard for the shop owner (booking inquiries + plate status) and polish the artist profile page so it loads live from D1.

**Architecture:** Admin is a single Astro SSR page at `/admin` that renders a login form or dashboard depending on a KV-backed session cookie. Auth uses the existing `SESSION` KV binding and an `ADMIN_PASSWORD` secret already uploaded to Cloudflare Pages. Artist profile at `/artist/[id]` already queries D1 correctly — only the artists _listing_ (`/artists`) needs a D1 upgrade.

**Tech Stack:** Astro 5 SSR, Cloudflare D1, Cloudflare KV (`SESSION` binding), `ADMIN_PASSWORD` secret, existing `global.css` design system (no new deps).

---

## State at Plan-Writing Time

Partial files were created before this plan was written — they must be **replaced in full** by this plan:
- `src/pages/admin/index.astro` — exists, incomplete, replace
- `src/pages/api/admin/login.ts` — exists, replace
- `src/pages/api/admin/logout.ts` — exists, replace

---

### Task 1: Replace admin login API

**Files:**
- Replace: `src/pages/api/admin/login.ts`

**Step 1: Write the file**

```typescript
export const prerender = false;

import type { APIRoute } from "astro";
import { randomUUID } from "crypto";

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

  const { password } = body as { password?: string };
  const expected = env.ADMIN_PASSWORD ?? "suknid2026";

  if (!password || password !== expected) {
    return new Response(JSON.stringify({ error: "Invalid password" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const token = randomUUID();
  await env.SESSION.put(`admin:${token}`, "1", { expirationTtl: 60 * 60 * 8 });

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": `admin_token=${token}; Path=/admin; HttpOnly; SameSite=Lax; Max-Age=28800`,
    },
  });
};
```

**Step 2: Smoke-test locally (optional) or proceed to deploy**

---

### Task 2: Replace admin logout API

**Files:**
- Replace: `src/pages/api/admin/logout.ts`

**Step 1: Write the file**

```typescript
export const prerender = false;

import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime.env;
  const cookie = request.headers.get("cookie") ?? "";
  const token = cookie.match(/admin_token=([^;]+)/)?.[1];

  if (token) {
    await env.SESSION.delete(`admin:${token}`).catch(() => {});
  }

  return new Response(null, {
    status: 302,
    headers: {
      Location: "/admin",
      "Set-Cookie": "admin_token=; Path=/admin; HttpOnly; SameSite=Lax; Max-Age=0",
    },
  });
};
```

---

### Task 3: Admin auth helper

**Files:**
- Create: `src/lib/admin/auth.ts`

**Step 1: Write the helper**

```typescript
import type { KVNamespace } from "@cloudflare/workers-types";

export async function isAdminAuthed(
  cookieHeader: string,
  kv: KVNamespace
): Promise<boolean> {
  const token = cookieHeader.match(/admin_token=([^;]+)/)?.[1];
  if (!token) return false;
  try {
    const val = await kv.get(`admin:${token}`);
    return val === "1";
  } catch {
    return false;
  }
}
```

---

### Task 4: Admin dashboard page

**Files:**
- Replace: `src/pages/admin/index.astro`

This page renders a **login form** when unauthenticated, or a full **dashboard** when authenticated. It uses only the existing `global.css` design system — no new CSS framework.

**Step 1: Write the full page**

```astro
---
export const prerender = false;

import Base from "../../layouts/Base.astro";
import { isAdminAuthed } from "../../lib/admin/auth";

const env = Astro.locals.runtime.env;
const authed = await isAdminAuthed(
  Astro.request.headers.get("cookie") ?? "",
  env.SESSION
);

interface BookingRow {
  id: number;
  artist_id: string;
  design_id: string | null;
  name: string;
  contact: string;
  message: string | null;
  created_at: number;
}

interface DesignRow {
  id: string;
  n: string;
  title: string;
  artist_id: string;
  style: string | null;
  price: number | null;
  status: string;
}

interface ArtistRow {
  id: string;
  name: string;
}

let bookings: BookingRow[] = [];
let designs: DesignRow[] = [];
let artists: ArtistRow[] = [];

if (authed) {
  const db = env.DB;
  const [bRes, dRes, aRes] = await Promise.all([
    db.prepare("SELECT * FROM booking_inquiries ORDER BY created_at DESC").all<BookingRow>(),
    db.prepare("SELECT id, n, title, artist_id, style, price, status FROM designs ORDER BY token_id ASC").all<DesignRow>(),
    db.prepare("SELECT id, name FROM artists ORDER BY name ASC").all<ArtistRow>(),
  ]);
  bookings = bRes.results;
  designs = dRes.results;
  artists = aRes.results;
}

const artistMap = Object.fromEntries(artists.map((a) => [a.id, a.name]));
const stats = {
  bookings: bookings.length,
  available: designs.filter((d) => d.status === "available").length,
  reserved: designs.filter((d) => d.status === "reserved").length,
  sold: designs.filter((d) => d.status === "sold").length,
};

function fmtDate(ts: number) {
  return new Date(ts * 1000).toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}
---

<Base title="Admin — SUKNID">
  <style>
    .adm { max-width: 1100px; margin: 0 auto; padding: 40px 28px 80px; }
    .adm-hd { display: flex; justify-content: space-between; align-items: center; padding-bottom: 24px; border-bottom: 1px solid var(--line); margin-bottom: 40px; }
    .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: var(--line); border: 1px solid var(--line); margin-bottom: 48px; }
    .stat { background: var(--ink-800); padding: 24px 28px; }
    .stat .n { font-family: var(--font-display); font-size: 44px; line-height: 1; }
    .stat .l { font-family: var(--font-mono); font-size: 10px; letter-spacing: .2em; text-transform: uppercase; color: var(--fg-faint); margin-top: 8px; }
    .sec { font-family: var(--font-mono); font-size: 10.5px; letter-spacing: .2em; text-transform: uppercase; color: var(--fg-dim); margin-bottom: 14px; }
    .tbl { width: 100%; border: 1px solid var(--line); border-collapse: collapse; margin-bottom: 52px; }
    .tbl th { font-family: var(--font-mono); font-size: 10px; letter-spacing: .14em; text-transform: uppercase; color: var(--fg-faint); padding: 11px 16px; text-align: left; border-bottom: 1px solid var(--line); background: var(--ink-850); white-space: nowrap; }
    .tbl td { padding: 13px 16px; border-bottom: 1px solid var(--line); font-size: 13px; vertical-align: top; }
    .tbl tr:last-child td { border-bottom: none; }
    .tbl tr:hover td { background: var(--ink-750); }
    .msg-cell { font-size: 12px; color: var(--fg-dim); max-width: 260px; }
    .login-outer { min-height: 100vh; display: flex; align-items: center; justify-content: center; }
    .login-box { width: 360px; border: 1px solid var(--line-2); background: var(--ink-800); padding: 40px; }
    #login-err { font-family: var(--font-mono); font-size: 11px; color: var(--warn); margin-top: 10px; display: none; }
    @media (max-width: 640px) { .stats { grid-template-columns: repeat(2, 1fr); } }
  </style>

  {!authed ? (
    <div class="login-outer">
      <div class="login-box">
        <div class="kicker" style="margin-bottom: 18px;">SUKNID / Admin</div>
        <h1 class="display" style="font-size: 30px; margin-bottom: 28px;">Sign in</h1>
        <form id="lf" novalidate>
          <div class="field">
            <label for="pw">Password</label>
            <input id="pw" type="password" class="input" placeholder="••••••••" autocomplete="current-password" />
          </div>
          <div id="login-err">Incorrect password.</div>
          <button type="submit" class="btn btn--solid btn--block btn--lg" style="margin-top: 22px;">Enter dashboard</button>
        </form>
        <script>
          document.getElementById("lf")?.addEventListener("submit", async (e) => {
            e.preventDefault();
            const pw = (document.getElementById("pw") as HTMLInputElement).value;
            const res = await fetch("/api/admin/login", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ password: pw }),
            });
            if (res.ok) {
              location.reload();
            } else {
              const el = document.getElementById("login-err");
              if (el) el.style.display = "block";
            }
          });
        </script>
      </div>
    </div>
  ) : (
    <div class="adm">
      <div class="adm-hd">
        <div>
          <div class="kicker" style="margin-bottom: 8px;">SUKNID / Admin</div>
          <h1 class="display" style="font-size: 34px;">Dashboard</h1>
        </div>
        <form method="POST" action="/api/admin/logout">
          <button type="submit" class="btn btn--ghost">Sign out</button>
        </form>
      </div>

      <div class="stats">
        <div class="stat"><div class="n">{stats.bookings}</div><div class="l">Bookings</div></div>
        <div class="stat"><div class="n" style="color:var(--ok)">{stats.available}</div><div class="l">Available</div></div>
        <div class="stat"><div class="n" style="color:var(--warn)">{stats.reserved}</div><div class="l">Reserved</div></div>
        <div class="stat"><div class="n">{stats.sold}</div><div class="l">Sold</div></div>
      </div>

      <div class="sec">Booking inquiries</div>
      {bookings.length === 0 ? (
        <p class="mono faint" style="font-size:13px; margin-bottom:48px;">No bookings yet.</p>
      ) : (
        <table class="tbl">
          <thead>
            <tr>
              <th>#</th><th>Date</th><th>Name</th><th>Contact</th>
              <th>Artist</th><th>Plate</th><th>Message</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr>
                <td class="mono faint" style="font-size:11px">{b.id}</td>
                <td class="mono" style="font-size:11px;white-space:nowrap">{fmtDate(b.created_at)}</td>
                <td style="font-weight:500">{b.name}</td>
                <td class="mono" style="font-size:12px">{b.contact}</td>
                <td class="mono" style="font-size:12px">{artistMap[b.artist_id] ?? b.artist_id}</td>
                <td class="mono faint" style="font-size:11px">{b.design_id ?? "—"}</td>
                <td><div class="msg-cell">{b.message ?? "—"}</div></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div class="sec">All plates</div>
      <table class="tbl">
        <thead>
          <tr><th>№</th><th>Title</th><th>Artist</th><th>Style</th><th>Price</th><th>Status</th></tr>
        </thead>
        <tbody>
          {designs.map((d) => (
            <tr>
              <td class="mono faint" style="font-size:11px">{d.n}</td>
              <td><a href={`/design/${d.id}`} style="text-decoration:underline;text-underline-offset:3px">{d.title}</a></td>
              <td class="mono" style="font-size:12px">{artistMap[d.artist_id] ?? d.artist_id}</td>
              <td class="mono faint" style="font-size:11px">{d.style ?? "—"}</td>
              <td class="mono" style="font-size:12px">{d.price != null ? d.price.toFixed(3) + " ETH" : "—"}</td>
              <td>
                <span class={`tag ${d.status === "available" ? "tag--avail" : d.status === "reserved" ? "tag--reserved" : "tag--sold"}`}>
                  <span class="dot"></span>{d.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
</Base>
```

---

### Task 5: Fix artists listing page to read from D1

**Files:**
- Modify: `src/pages/artists.astro`

The page is currently `prerender = true` using static seed data. Change to SSR + D1.

**Step 1: Replace the frontmatter data-fetching block**

Change:
```astro
---
export const prerender = true;
...
import { ARTISTS, DESIGNS } from "../lib/catalog/seed";

const STYLE_KIND: Record<string, number> = { ... };

const artistDesignCounts = ARTISTS.map((a) => ({
  ...a,
  availableCount: DESIGNS.filter((d) => d.artistId === a.id && d.status === "available").length,
}));
---
```

To:
```astro
---
export const prerender = false;

import Base from "../layouts/Base.astro";
import Nav from "../components/Nav";
import Footer from "../components/Footer.astro";
import TweaksPanel from "../components/TweaksPanel";
import TextureLayer from "../components/TextureLayer";
import Toast from "../components/Toast";
import Plate from "../components/Plate";

interface ArtistRow {
  id: string;
  name: string;
  handle: string | null;
  city: string | null;
  style: string | null;
  years: number | null;
  booked: string | null;
  seed: number | null;
}

interface CountRow {
  artist_id: string;
  available_count: number;
}

const db = Astro.locals.runtime.env.DB;
const [aRes, cRes] = await Promise.all([
  db.prepare("SELECT id, name, handle, city, style, years, booked, seed FROM artists ORDER BY name ASC").all<ArtistRow>(),
  db.prepare("SELECT artist_id, COUNT(*) AS available_count FROM designs WHERE status='available' GROUP BY artist_id").all<CountRow>(),
]);

const availMap = Object.fromEntries(cRes.results.map((r) => [r.artist_id, r.available_count]));
const artistDesignCounts = aRes.results.map((a) => ({
  ...a,
  availableCount: availMap[a.id] ?? 0,
}));

const STYLE_KIND: Record<string, number> = {
  Geometric: 0, Blackwork: 1, "Fine Line": 2,
  Irezumi: 3, "Neo-Trad": 3, Realism: 4, Lettering: 5,
};
---
```

The template body remains unchanged — it already uses `artistDesignCounts` and `STYLE_KIND`.

---

### Task 6: Build and verify

**Step 1: Build**
```bash
pnpm build
```
Expected: `[build] Complete!` with no errors.

**Step 2: Deploy**
```bash
pnpm dlx wrangler pages deploy dist --project-name suknid --branch main --commit-dirty=true
```
Expected: `Deployment complete!` with a `*.suknid.pages.dev` URL.

**Step 3: Smoke-test admin**
```bash
# Should return 401 with wrong password
curl -s -X POST https://<deploy-url>/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"password":"wrong"}' | python3 -m json.tool

# Should return ok:true with correct password
curl -s -c /tmp/cookies.txt -X POST https://<deploy-url>/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"password":"suknid2026"}' | python3 -m json.tool

# Should return 302 redirect to /admin
curl -s -b /tmp/cookies.txt -o /dev/null -w "%{http_code}" \
  -X POST https://<deploy-url>/api/admin/logout
```

**Step 4: Smoke-test artists listing**
```bash
curl -s https://<deploy-url>/artists | grep -c "artist"
# Expected: several matches (SSR page with artist names)
```

---

### Task 7: Commit

```bash
git add src/pages/admin/ src/pages/api/admin/ src/lib/admin/ src/pages/artists.astro src/env.d.ts
git commit -m "feat: admin dashboard + live artists listing from D1"
```
