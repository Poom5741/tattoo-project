# Plan: Live Chat with Admin — Tawk.to Widget Embed

**Status:** pending approval
**Source spec:** [.omc/specs/deep-interview-live-chat-widget.md](.omc/specs/deep-interview-live-chat-widget.md)
**Mode:** consensus (RALPLAN-DR short) — revised after Architect + Critic review (iteration 2)

## Requirements Summary
Embed the free Tawk.to live-chat widget on all public client pages of the Astro/Cloudflare site, suppressed on `/admin`. The business owner answers conversations (many at once) via Tawk.to's hosted web dashboard + mobile apps. $0/month, no custom backend, no new D1 tables. Implementation is a conditional inline embed in the shared `Base.astro` layout, with property/widget IDs sourced from build-time `PUBLIC_TAWK_*` env vars and a fail-safe guard.

## RALPLAN-DR Summary (short)

**Principles**
1. Lowest total cost (dollars + dev + maintenance) decides — **subject to not expanding the trust boundary on wallet/signing pages beyond an explicitly accepted risk** (amended per Architect antithesis).
2. Reuse the single existing global injection point (`Base.astro`); don't touch every page.
3. No new infrastructure, bindings, or runtime dependencies.
4. Fail safe: if config is missing, render nothing (no broken widget, no errors).
5. Keep the change reversible and isolated (one layout edit + one env-typing entry).

**Decision Drivers (top 3)**
1. Free forever with unlimited agents + a hosted multi-conversation dashboard (matches "chat with multiple accounts" with zero build).
2. Single-file change at the global layout; near-zero blast radius.
3. Must not regress existing page performance or the `/admin` experience.

**Viable Options**
- **Option A — Tawk.to embed in `Base.astro` (CHOSEN).** Pros: $0/mo, unlimited agents, hosted dashboard + mobile apps, minutes to ship, one-file change. Cons: third-party "powered by" badge (optional paid removal), PII hosted by Tawk.to, unpinned remote script, separate admin login.
- **Option B — Crisp free tier.** Pros: nicer UI, multichannel. Cons: **2-agent cap**, chatbot/automation paid; same third-party-script/PII risk as A with less headroom.
- **Option C — Self-hosted Chatwoot.** Pros: full data ownership, unlimited agents. Cons: requires VPS (≥4GB RAM, Postgres) + ongoing DevOps — violates Principle 3.
- **Option D — Custom Cloudflare (Durable Objects + D1) build.** Pros: full ownership on existing stack, no third-party script/PII export, ~$0/mo runtime. Cons: highest dev + maintenance cost; reopens the two deferred components. Explicitly declined by the user (spec Round 4).

**Invalidation rationale:** B is strictly more limited than A at the same $0 (agent cap, paid automation). C and D add build/maintenance burden contradicting Principles 1+3; D was explicitly declined. The one principled argument *for* D (closed trust boundary on a wallet site) is addressed by the ADR's accepted-risk record + the easily-extensible page guard, keeping A viable.

## Acceptance Criteria
- [ ] AC-1: Tawk.to widget loads and is interactive on every public page (`/`, `/artists`, `/booking`, `/design/[id]`, etc.).
- [ ] AC-2: Widget does **not** render on `/admin` (no Tawk script in the served HTML for that route).
- [ ] AC-3: A message sent from the widget appears in the Tawk.to dashboard; an admin reply appears back in the visitor's widget.
- [ ] AC-4: No new console errors; script loads async/non-blocking; no layout shift (CLS) introduced on existing pages.
- [ ] AC-5: Property/Widget IDs come from `import.meta.env.PUBLIC_TAWK_PROPERTY_ID` / `PUBLIC_TAWK_WIDGET_ID`, typed in an `ImportMetaEnv` interface; when either is unset, the widget renders nothing (no broken embed).
- [ ] AC-6: The two `prerender = true` pages ([index.astro](src/pages/index.astro), [booking.astro](src/pages/booking.astro)) build with the real widget src inlined — i.e. `PUBLIC_TAWK_*` must be present in the Cloudflare Pages **build** environment.
- [ ] AC-7: `crossorigin` is a valid value (`anonymous`) or omitted — no `crossorigin="*"`.

## Implementation Steps

### Step 1 — Type the public env vars (correct target)
- File: [src/env.d.ts](src/env.d.ts). Add a **new `ImportMetaEnv` interface** (the project currently has none — confirmed by `WalletProvider.tsx` reading an untyped `import.meta.env.PUBLIC_PRIVY_APP_ID`). Do **NOT** add these to the Cloudflare `interface Env` (that interface is for runtime bindings accessed via `Astro.locals.runtime.env`, a different mechanism):
  ```ts
  interface ImportMetaEnv {
    readonly PUBLIC_TAWK_PROPERTY_ID: string;
    readonly PUBLIC_TAWK_WIDGET_ID: string;
  }
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
  ```
  (Optional cleanup, out of scope: also add `PUBLIC_PRIVY_APP_ID` here to fix the existing untyped read.)
- File: [.env.example](.env.example) — document `PUBLIC_TAWK_PROPERTY_ID` and `PUBLIC_TAWK_WIDGET_ID` with placeholder values + a comment.
- **Config (build-time, not runtime):** Set `PUBLIC_TAWK_*` as **build-time environment variables** in Cloudflare Pages → Settings → Environment variables, applied to **both Production and Preview** builds. Do NOT set them only as runtime secrets — `PUBLIC_*` vars are statically inlined at build, so the two prerendered pages would otherwise bake in `undefined`. Also set them in local `.env` for dev.
- **Human prerequisite:** create a free Tawk.to account → add a Property → copy Property ID + Widget ID from `Administration → Channels → Chat Widget` (embed `src` is `https://embed.tawk.to/<PROPERTY_ID>/<WIDGET_ID>`).

### Step 2 — Conditionally embed in the shared layout
- File: [src/layouts/Base.astro](src/layouts/Base.astro).
- In the frontmatter (after line 9), compute a **prefix-array guard** (extensible) plus fail-safe config check:
  ```ts
  // Pages where the chat widget must NOT load. /admin is required;
  // wallet/signing routes can be added here if the third-party-script
  // risk on those pages is later deemed unacceptable (see ADR).
  const widgetBlockedPrefixes = ['/admin'];
  const isBlocked = widgetBlockedPrefixes.some((p) => Astro.url.pathname.startsWith(p));
  const tawkProperty = import.meta.env.PUBLIC_TAWK_PROPERTY_ID;
  const tawkWidget = import.meta.env.PUBLIC_TAWK_WIDGET_ID;
  const showTawk = !isBlocked && Boolean(tawkProperty) && Boolean(tawkWidget);
  const tawkSrc = showTawk ? `https://embed.tawk.to/${tawkProperty}/${tawkWidget}` : null;
  ```
- Before `</body>` (after the existing cleanup `<script>`, ~line 34), add the conditional inline script (`is:inline` is required for conditional scripts; `define:vars` injects the server-computed src):
  ```astro
  {showTawk && (
    <script is:inline define:vars={{ tawkSrc }}>
      var Tawk_API = Tawk_API || {}, Tawk_LoadStart = new Date();
      (function () {
        var s1 = document.createElement("script"),
            s0 = document.getElementsByTagName("script")[0];
        s1.async = true;
        s1.src = tawkSrc;
        s1.charset = "UTF-8";
        s1.crossOrigin = "anonymous";
        s0.parentNode.insertBefore(s1, s0);
      })();
    </script>
  )}
  ```

### Step 3 — Tawk.to dashboard configuration (no code)
- Optionally enable the pre-chat form (name + email) to match the booking-form pattern. **Default: leave off** until a privacy-policy line exists (minimizes PII export by default — see ADR).
- Confirm widget appearance/position and offline-form behavior.

## Risks and Mitigations
| Risk | Mitigation |
|------|-----------|
| Astro bundles the script and loses `tawkSrc` | `is:inline` + `define:vars`; verify served HTML contains literal `embed.tawk.to/<ids>` |
| Prerendered pages inline empty src | `PUBLIC_TAWK_*` set in Cloudflare Pages **build** env (Prod + Preview), not runtime secret (AC-6) |
| Widget appears on `/admin` | `widgetBlockedPrefixes` guard (AC-2); verify served `/admin` HTML has no Tawk script |
| Third-party script slows page / CLS | Tawk loads `async`, fixed-position float; AC-4 verifies no blocking/shift |
| Missing config ships broken widget | `showTawk` guard renders nothing when IDs absent (AC-5) |
| Invalid `crossorigin` attribute | Use `crossOrigin = "anonymous"` (AC-7) |
| **Unpinned 3rd-party script on wallet/signing origin** | Site uses passkey wallet + on-chain signing (`WalletProvider.tsx`, `CheckoutFlow.tsx`, `market.astro`, `wallet.astro`). SRI is infeasible for Tawk's rotating bootstrap, so this is inherent to Option A. Mitigation: guard is a prefix array — `/checkout`, `/wallet` can be added in one line; risk is explicitly accepted in the ADR. |
| Future CSP blocks Tawk | No CSP exists today (confirmed: none in `Base.astro`). If added, allowlist `*.tawk.to` across `script-src`, `connect-src`, `img-src`, `style-src`, `frame-src` (see ADR) |
| PII export to US third party | Chat content + IP + (if pre-chat on) name/email go to Tawk.to. Pre-chat off by default; add privacy-policy note; accepted in ADR |

## Verification Steps
1. `npm run build` succeeds; no type errors from the `env.d.ts` change.
2. Dev/preview with `PUBLIC_TAWK_*` set → load `/`, `/artists`, `/booking` → widget bubble visible & opens (AC-1).
3. Inspect built output of a prerendered page (e.g. `dist/.../index.html`) → confirm it contains a real `embed.tawk.to/<property>/<widget>` src, not `undefined` (AC-5/AC-6).
4. Load `/admin` → confirm no Tawk script in page source / no widget (AC-2).
5. Send a test message → confirm it lands in the Tawk.to dashboard; reply → confirm it returns to the widget (AC-3).
6. Unset one env var, rebuild → confirm widget silently absent, no console error (AC-5).
7. DevTools console + Lighthouse/Network: script `async`, no CLS regression (AC-4); confirm `crossorigin="anonymous"` in emitted tag (AC-7).
8. **Rollback:** revert the single `Base.astro` edit (and optionally the `env.d.ts` addition) — no data/migration to undo.

## ADR
**Decision:** Add live chat by embedding the free Tawk.to widget in `Base.astro`, shown on all public pages and hidden on `/admin`, with the owner answering via Tawk.to's hosted dashboard/apps. No custom chat backend or console is built.

**Drivers:** (1) $0/mo with unlimited agents + a hosted multi-conversation inbox; (2) single-file, near-zero-blast-radius change; (3) no new infra on the existing Cloudflare stack.

**Alternatives considered:** Crisp free (2-agent cap, paid automation), self-hosted Chatwoot (VPS+Postgres+DevOps), custom Cloudflare DO+D1 build (highest build/maintenance cost; user-declined). Each invalidated by a stated principle.

**Why chosen:** Best fit for the cost-first, no-maintenance, multi-conversation requirement; the deferred custom build was explicitly rejected by the user.

**Consequences / accepted risks:**
- **PII export:** Visitor chat content, IP, and page URL (plus name/email if the pre-chat form is enabled) are sent to and stored by Tawk.to (US-hosted). Pre-chat form is **off by default**; a privacy-policy line noting "chat provided by Tawk.to" should be added. Accepted.
- **Unpinned third-party script / no SRI:** Tawk's bootstrap script can execute arbitrary JS in-origin on every page it loads. Because the site performs wallet connection and on-chain signing, this is a higher-stakes trust boundary than for a brochure site. SRI is infeasible for Tawk's rotating script. **Accepted risk**, mitigated by: (a) the widget loads only on public pages, never `/admin`; (b) the page guard is a prefix array so `/checkout`, `/wallet`, and artist/signing routes can be excluded with a one-line change if the team later decides the widget should not coexist with signing flows.
- **CSP:** None exists today. If/when a CSP is introduced (Cloudflare Pages headers or middleware), it must allowlist `*.tawk.to` across `script-src`, `connect-src`, `img-src`, `style-src`, and `frame-src`. Tracked as a follow-up.
- **Vendor lock-in:** Chat history lives in Tawk.to; migrating later means exporting from their platform.

**Follow-ups:**
1. Decide whether to exclude `/checkout`/`/wallet`/artist-signing pages from the widget (product + security call); record the outcome by editing `widgetBlockedPrefixes`.
2. Add a privacy-policy note before enabling the pre-chat name/email form.
3. If a CSP is added, include the `*.tawk.to` allowlist above.
4. (Optional) Type `PUBLIC_PRIVY_APP_ID` in `ImportMetaEnv` to fix the pre-existing untyped read in `WalletProvider.tsx`.

## Changelog (consensus iteration 2)
Applied from Architect (SOUND-WITH-CHANGES) + Critic (REJECT) feedback:
- Step 1 now targets a new `ImportMetaEnv` interface, not the Cloudflare `Env` interface; removed the "match existing PUBLIC_* style" instruction (that style was the bug).
- Build-time vs runtime env made explicit (Cloudflare Pages build env, Prod + Preview).
- `crossorigin="*"` → `crossOrigin = "anonymous"` (new AC-7).
- Route guard converted to an extensible prefix array; wallet/signing-page exclusion surfaced as a recorded decision.
- ADR fully populated: PII-export acceptance, no-SRI third-party-script risk on a wallet origin, full 5-directive `*.tawk.to` CSP allowlist, vendor lock-in.
- Added verification of build-time env resolution + rollback note; corrected route example `/designs` → `/design/[id]`; traced AC renumbering (spec AC-6 → plan AC-5/AC-6).
