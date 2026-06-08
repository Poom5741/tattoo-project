# Implementation Plan: INKNOIR — Astro + Cloudflare NFT Ecommerce (v1)

**Status:** DRAFT (Planner output, pre-review)
**Source spec:** `.omc/specs/deep-interview-inknoir-astro-cloudflare.md`
**Mode:** Consensus, deliberate (high-risk: smart contract + signer key + value flow on testnet)

---

## RALPLAN-DR Summary (deliberate)

### Principles (5)
1. **Design fidelity over framework purity.** The prototype's typography, accent themes, textures, and procedural SVG are the brand — port them exactly, even if it means inlining CSS or shipping React islands.
2. **On-chain is canonical for ownership; D1 is canonical for listing state.** No dual writes of the same fact. Voucher issuance flips D1 `status` to RESERVED; on-chain `Transfer` event confirms SOLD.
3. **Signer keys never leave Cloudflare Workers Secrets.** No client-side signing, no leaked env vars in the repo, no signer key in `wrangler.toml`.
4. **One Worker, one voucher contract, one chain (Base Sepolia).** Resist scope creep into indexers, multi-chain, mainnet, or microservices in v1.
5. **Idempotent infra, deterministic deploy.** Re-running `wrangler deploy` or contract deploy must converge, not drift. Resource names prefixed `inknoir-` to avoid colliding with the 8 existing Workers in the account.

### Decision Drivers (top 3)
1. **Security-of-funds (testnet but still real ETH semantics).** Any signing/minting bug becomes a class of "anyone can mint anything" or "signer key exfiltrated" — these are unrecoverable in NFT space, even on testnet they teach bad habits.
2. **Time-to-deployed-URL.** User explicitly wants live MCP deploy to a `*.pages.dev` URL with all 8 screens visible. Optimize for "buyer connects wallet, sees market, mints a token, sees it in Wallet" working end-to-end.
3. **Pixel fidelity vs Astro idioms.** The handoff README says "recreate pixel-perfectly … don't copy the prototype's internal structure." So we keep visual output identical but rebuild the structure with Astro pages + React islands.

### Viable Options

#### Option A — All-Astro with React islands (CHOSEN)
**Approach:** Astro 5 + `@astrojs/cloudflare` hybrid. Static `.astro` pages for routing/SEO/shell. React 18 islands (`client:load` / `client:idle`) for Market filters, DesignDetail acquire, Checkout (wallet-heavy), Wallet (on-chain reads), Booking form, TweaksPanel. CSS ported verbatim from `styles.css`. Procedural `Plate` SVG component ported as React island.
**Pros:**
- Astro-native — best static performance, cheapest Cloudflare Pages footprint.
- Islands isolate Wagmi/RainbowKit bundle to screens that actually need wallet.
- Easy to add `output: 'hybrid'` `prerender = false` per route for `/api/*`.
**Cons:**
- Two mental models in the codebase (`.astro` + `.tsx`).
- Hydration boundaries require care for the TweaksPanel since it sets CSS vars on `:root` from any screen.

#### Option B — Single Astro page hosting the entire React SPA
**Approach:** One `src/pages/[...path].astro` that mounts the existing React app as a giant island, near-verbatim port of the prototype's `app.jsx` router.
**Pros:**
- Minimal port work — almost a copy/paste of the prototype.
- One hydration boundary, no per-route islands to design.
**Cons:**
- Throws away Astro's static prerender benefit; every route is fully client-rendered.
- Wagmi bundle loads on Home (overkill).
- SEO/metadata stays in one file.
**Invalidation rationale:** Loses Cloudflare Pages' main value prop (cheap static delivery + per-route SSR for API). The prototype's `screen` state machine is exactly the kind of routing Astro replaces — keeping it duplicates Astro's job.

#### Option C — Next.js on Cloudflare Pages instead of Astro
**Approach:** Next.js 15 App Router on Cloudflare Pages adapter.
**Pros:**
- Larger ecosystem for Wagmi/RainbowKit + Next.
- App Router server components fit data-fetching cleanly.
**Cons:**
- User explicitly asked for Astro. Hard requirement.
**Invalidation rationale:** Out of scope per spec. Recorded for completeness only.

### Pre-mortem (3 failure scenarios)

#### Failure 1 — Signer key leak via `.env`
The voucher-signing private key gets committed to git via `.env`, `wrangler.toml`, or a leaked Worker dump. Buyer scripts mint every available token for 0 wei.
**Prevention:** Key lives only in `wrangler secret put SIGNER_PRIVATE_KEY`. `.gitignore` excludes `.env*`, `.wrangler/`. Contract `mintWithVoucher` requires (a) signature from `authorizedSigner` AND (b) `msg.value >= voucher.price` AND (c) `block.timestamp <= voucher.expiry` AND (d) `_ownerOf(tokenId) == address(0)`. Even if signer is compromised, attacker still must pay the listed price.
**Detection:** Pre-commit hook scans for hex private keys + the env var name. Post-deploy: `wrangler secret list` shows secret name; we never log the value.

#### Failure 2 — Hydration mismatch breaks TweaksPanel + Wallet
TweaksPanel mutates `document.documentElement.style` on every render. With Astro SSR, the server-rendered HTML has no `style="--font-display: ..."`, so the first paint flickers and Wagmi's wallet-connect state desyncs.
**Prevention:** TweaksPanel is `client:load` only. Initial CSS variable values are inlined in `styles.css` `:root` so the server-rendered first paint is correct without JS. `localStorage` reads happen inside `useEffect`. The Wallet screen reads owned tokens via Viem in a `client:only="react"` boundary so server never tries to call `useAccount`.
**Detection:** Playwright smoke test loads each screen with JS disabled — checks that the page renders the bone accent + base layout. Console-warn-on-hydration-error guard in dev mode.

#### Failure 3 — D1 status drift vs on-chain reality
A buyer mints successfully on-chain, but the D1 `status` stays RESERVED forever because no event ingestion ran. Two days later another buyer requests a voucher for the same `tokenId`, the Worker happily signs because D1 says RESERVED-but-expired, the second `mintWithVoucher` reverts at the contract (token exists), the buyer eats gas, support tickets follow.
**Prevention:** Worker `POST /api/voucher` is the read-path-of-truth. Before signing, it MUST call `viem.readContract(InknoirPlates, 'exists', [tokenId])` against Base Sepolia. If `true`, return 409 and update D1 `status` to SOLD synchronously. The D1 `status=RESERVED` window has a hard 15-minute TTL (`reserved_until`); after expiry, the next voucher request re-checks chain and either flips to SOLD or back to AVAILABLE. Optional Cron Worker every 5 minutes reconciles RESERVED rows past TTL.
**Detection:** `/api/health` endpoint returns count of (D1 RESERVED) and (D1 SOLD without on-chain token) — alerts when ratio diverges.

### Expanded Test Plan

| Layer | What we test | Tooling |
|-------|--------------|---------|
| **Unit (contract)** | `mintWithVoucher` reverts on: expired voucher, wrong signer, token already minted, underpayment. EIP-712 domain separator matches contract `chainId` + `verifyingContract`. | Foundry `forge test` |
| **Unit (worker)** | Voucher payload validates against zod schema; signer derives address from `SIGNER_PRIVATE_KEY` matching contract's `authorizedSigner`; D1 status flips correctly on issue/expire. | Vitest + `wrangler dev --test-scheduled` |
| **Unit (frontend)** | `Plate` SVG produces identical paths for same seed (snapshot test). Tweaks state persists to localStorage. | Vitest + React Testing Library |
| **Integration** | Voucher endpoint → contract: forge script signs a voucher with the same key, runs `mintWithVoucher` on a local anvil forked from Base Sepolia, expects success and `Transfer` event. | Foundry script + Vitest |
| **e2e (visual)** | Playwright screenshot diff per screen vs the rendered `INKNOIR.html` baseline at 3 viewports (mobile 390px, tablet 768px, desktop 1440px). | Playwright + pixelmatch |
| **e2e (functional)** | Connect mock wallet → browse Market → click design → Acquire → see success → Wallet shows token. Uses Viem mock transport + a stub voucher endpoint. | Playwright |
| **Observability** | Worker logs request_id, route, status, duration, chainCallMs, d1QueryMs. Sentry-light: structured `console.log` JSON to `cf observability` queries. Frontend ships `web-vitals` to a Worker endpoint. | `wrangler tail` + Cloudflare observability MCP |
| **Smoke (post-deploy)** | A scripted curl flow: `GET /api/designs` returns 15 rows, `GET /api/health` returns ok, `GET /metadata/1` returns ERC-721 JSON, root URL returns 200 with `<title>INKNOIR</title>`. | Shell script run by deploy step |

---

## Requirements Summary

Port the INKNOIR React prototype to an Astro 5 project with `@astrojs/cloudflare` (hybrid output), wire a lazy-mint ERC-721 on Base Sepolia (Foundry, EIP-712 voucher signed by a Cloudflare Worker), persist catalog + bookings in D1, serve images from R2 with a procedural SVG fallback, pin token metadata to IPFS, deploy live to Cloudflare Pages via the Cloudflare MCP, and push the repo to `https://github.com/Poom5741/tattoo-project` `main`. All 8 prototype screens visually faithful. Status: testnet only, wallet-only auth, no fiat.

---

## Acceptance Criteria (testable)

### A. Repo & local dev (Repo & CI)
- [ ] **A1.** `pnpm install && pnpm dev` in repo root serves Astro on `http://localhost:4321` with no console errors.
- [ ] **A2.** `pnpm build` produces `dist/` and `.wrangler/` artifacts without TypeScript errors.
- [ ] **A3.** `pnpm test` runs Vitest unit tests, all pass.
- [ ] **A4.** `forge test -vv` in `contracts/` passes all unit tests.
- [ ] **A5.** `git log --oneline` shows ≥1 commit; `git remote -v` shows `origin https://github.com/Poom5741/tattoo-project.git`; `main` branch is pushed.
- [ ] **A6.** `.gitignore` excludes `node_modules`, `.env*` (except `.env.example`), `.wrangler`, `dist`, `out`, `.astro`, `_handoff/`, `cache`, `*.log`, `broadcast/`, `cache_forge/`, `out/`.

### B. Astro Frontend
- [ ] **B1.** Routes exist and 200: `/`, `/market`, `/design/[id]`, `/artists`, `/artist/[id]`, `/booking`, `/checkout/[id]`, `/wallet`.
- [ ] **B2.** `:root` CSS variables (`--font-display`, `--font-mono`, `--font-body`, `--accent`, `--ok`) match the prototype's defaults on first paint (no FOUC flicker).
- [ ] **B3.** TweaksPanel toggles fontPair (couture/editorial/modern), texture (grain/scan/hatch/none), accent (bone/ember/jade) and the change is visible without reload.
- [ ] **B4.** `Plate` React component produces visually identical SVG to the prototype `ink.jsx` for `seed=11,29,47,71` (snapshot test passes).
- [ ] **B5.** Visual diff (Playwright) ≤2% pixel difference per screen vs reference render at 1440×900.
- [ ] **B6.** Mobile viewport (390×844): all screens scroll without horizontal overflow.

### C. Catalog & Data Layer
- [ ] **C1.** D1 db `inknoir-catalog` exists; `wrangler d1 execute inknoir-catalog --remote --command "SELECT COUNT(*) FROM designs"` returns 15.
- [ ] **C2.** `SELECT COUNT(*) FROM artists` returns 4 with the same ids as `data.jsx` (`mara`, `koto`, `sol`, `vera`).
- [ ] **C3.** `GET /api/designs` returns JSON array of 15 designs with full schema.
- [ ] **C4.** `GET /api/designs/d1` returns design 1 (Serpent in Negative) with `artistName: "Mara Vael"`.
- [ ] **C5.** `GET /api/metadata/1` returns ERC-721 metadata: `{name, description, image, attributes:[{trait_type, value}]}` validating against the OpenSea schema.
- [ ] **C6.** R2 bucket `inknoir-assets` exists; `wrangler r2 object list inknoir-assets` succeeds.

### D. Commerce Flow
- [ ] **D1.** Contract `InknoirPlates` (ERC-721) deployed to Base Sepolia (chainId 84532). Deployment tx visible on basescan-sepolia.
- [ ] **D2.** Contract source verified or `forge verify-contract` script provided.
- [ ] **D3.** `forge test --match-contract InknoirPlatesTest` passes: `testRevertOnExpiredVoucher`, `testRevertOnWrongSigner`, `testRevertOnDoubleClaim`, `testRevertOnUnderpayment`, `testSuccessfulMint`, `testTokenURIReturnsIPFS`.
- [ ] **D4.** `POST /api/voucher` body `{designId:"d1", buyer:"0x…"}` returns `{tokenId, designId, price, artistTreasury, expiry, buyer, signature}` with valid EIP-712 signature; D1 row updated to RESERVED with `reserved_until = now + 15min`.
- [ ] **D5.** `POST /api/voucher` for a design with `status=SOLD` or `status=RESERVED` (non-expired) returns 409 with explanatory body.
- [ ] **D6.** Checkout page connects wallet, calls `/api/voucher`, prompts wallet to sign `mintWithVoucher`, awaits 1 confirmation, shows success toast.
- [ ] **D7.** After mint, design's D1 `status` flips to SOLD (via Worker post-confirm callback or next read-time reconcile).

### E. Bookings
- [ ] **E1.** Booking form posts to `POST /api/bookings` with `{artistId, name, contact, message, designId?}`.
- [ ] **E2.** Worker inserts row into `booking_inquiries` D1 table; `wrangler d1 execute … "SELECT * FROM booking_inquiries"` shows the row.
- [ ] **E3.** Worker sends an email to the artist's stored email via Resend (or MailChannels if Resend key missing); response body acknowledges queued.
- [ ] **E4.** Frontend shows success toast on 200.

### F. Auth & Customer Accounts
- [ ] **F1.** RainbowKit Connect button visible in Nav; clicking opens RainbowKit modal.
- [ ] **F2.** Wagmi config targets only `baseSepolia`. Wrong-chain wallet prompts switch.
- [ ] **F3.** Wallet screen with no wallet connected shows a "Connect wallet" empty state.
- [ ] **F4.** Wallet screen with a connected address that owns `tokenId=1` displays the corresponding plate (read via `viem.readContract(InknoirPlates, 'balanceOf', [addr])` + `tokenOfOwnerByIndex`).

### G. Cloudflare Infrastructure
- [ ] **G1.** `wrangler.toml` declares: `[[d1_databases]]` (inknoir-catalog), `[[r2_buckets]]` (inknoir-assets), `[vars]` (PUBLIC_BASE_RPC, PUBLIC_CONTRACT_ADDRESS, PUBLIC_CHAIN_ID), `[env.production]` overrides.
- [ ] **G2.** Cloudflare Pages project `inknoir` exists; `wrangler pages deployment list inknoir` shows a successful deploy.
- [ ] **G3.** Deployed URL `https://inknoir.pages.dev` (or alias) returns 200 and renders Home.
- [ ] **G4.** Secrets `SIGNER_PRIVATE_KEY`, `NFT_STORAGE_KEY`, `RESEND_API_KEY` (or `EMAIL_FROM` for MailChannels) are set via `wrangler secret put` and listed by `wrangler secret list`.
- [ ] **G5.** Existing 8 Workers in the account are untouched (verified via `mcp__cloudflare-bindings__workers_list` before and after — same 8 names present).

---

## Implementation Steps

> **Convention:** Steps are numbered Phase.Step. Phases roughly correspond to topology components. Files use forward slashes relative to repo root `/Users/poom-work/codingZone/business/tattoo-project`.

### Phase 0 — Repo bootstrap (1 step, 5 min)
- **0.1** Initialize repo skeleton.
  - Create `.gitignore`, `pnpm-workspace.yaml` (optional, lets us split contracts/), `package.json`, `tsconfig.json`, `astro.config.mjs`, `README.md`.
  - `git init` + first commit "chore: bootstrap repo". Do NOT push yet (no remote configured).
  - Move the extracted `_handoff/` reference set out of the way OR add it to `.gitignore` so it isn't committed.

### Phase 1 — Astro app scaffold (5 steps, ~45 min)
- **1.1** Install deps: `astro@^5`, `@astrojs/cloudflare`, `@astrojs/react`, `react@^18`, `react-dom@^18`, `typescript`, `@types/react`, `@types/react-dom`, `vitest`, `@playwright/test`, `wagmi@^2`, `viem@^2`, `@rainbow-me/rainbowkit@^2`, `@tanstack/react-query@^5`, `zod`.
  - Pin versions in `package.json`.
- **1.2** Configure `astro.config.mjs`:
  ```js
  import cloudflare from '@astrojs/cloudflare';
  import react from '@astrojs/react';
  export default { output: 'hybrid', adapter: cloudflare({ platformProxy: { enabled: true } }), integrations: [react()] };
  ```
- **1.3** Copy `styles.css` from `_handoff/tattoo-project/project/styles.css` → `src/styles/global.css`. Import once from a base layout `src/layouts/Base.astro` that contains `<head>` with font links + `<slot />`.
- **1.4** Port the `<Nav />`, `<Footer />`, `<TextureLayer />` shell from `app.jsx` into:
  - `src/components/Nav.tsx` (React, `client:load` for wallet connect)
  - `src/components/Footer.astro` (static)
  - `src/components/TextureLayer.tsx` (`client:idle`, listens to context)
  - `src/components/TweaksPanel.tsx` (`client:load`, mutates `:root` from a context provider)
- **1.5** Port `ink.jsx` → `src/components/Plate.tsx` and `data.jsx` types → `src/lib/catalog/types.ts`. The runtime catalog data is now served from D1 (Phase 2); keep `data.jsx` only as a TS-typed seed file `src/lib/catalog/seed.ts`.

### Phase 2 — Catalog (D1) + Worker /api (6 steps, ~1 hr)
- **2.1** Author D1 schema migrations at `migrations/0001_init.sql`:
  ```sql
  CREATE TABLE artists (id TEXT PRIMARY KEY, name TEXT, handle TEXT, city TEXT, style TEXT, years INT, booked TEXT, rate INT, bio TEXT, pieces INT, rating TEXT, seed INT, email TEXT);
  CREATE TABLE designs (id TEXT PRIMARY KEY, n TEXT, title TEXT, artist_id TEXT REFERENCES artists(id), style TEXT, price REAL, price_usd INT, status TEXT CHECK(status IN ('available','reserved','sold','owned')), placement TEXT, seed INT, token TEXT, minted TEXT, medium TEXT, sessions INT, drawn INT, image_override_url TEXT, token_id INT UNIQUE, reserved_until INT);
  CREATE TABLE booking_inquiries (id INTEGER PRIMARY KEY AUTOINCREMENT, artist_id TEXT, design_id TEXT, name TEXT, contact TEXT, message TEXT, created_at INT);
  CREATE INDEX idx_designs_status ON designs(status);
  CREATE INDEX idx_designs_artist ON designs(artist_id);
  ```
- **2.2** Seed migration `migrations/0002_seed.sql` derived from `data.jsx` (4 artists + 15 designs, `token_id = n` as integer).
- **2.3** Create Worker entry `src/pages/api/designs/index.ts` (Astro endpoint, `prerender = false`) returning `SELECT * FROM designs`. Implement zod schemas in `src/lib/api/schemas.ts`.
- **2.4** `src/pages/api/designs/[id].ts` returns one design + artist join.
- **2.5** `src/pages/api/metadata/[tokenId].ts` returns ERC-721-compliant metadata JSON (build from D1 row + R2 image URL or procedural placeholder URL).
- **2.6** `src/pages/api/health.ts` returns `{ok, d1, chain, reservedCount}` for the smoke test.

### Phase 3 — Smart contract (Foundry) (5 steps, ~1.5 hr)
- **3.1** `contracts/` subtree with `foundry.toml`, `lib/openzeppelin-contracts` (forge install), `lib/openzeppelin-contracts-upgradeable` skipped (we don't need upgradeability for v1).
- **3.2** `contracts/src/InknoirPlates.sol`:
  - ERC-721 base from OpenZeppelin v5.
  - Storage: `address public authorizedSigner; address public artistTreasury; mapping(uint256 => bool) public used;`
  - Struct `LazyMintVoucher { uint256 tokenId; string designId; uint256 price; address artistTreasury; uint256 expiry; address buyer; }`
  - EIP-712 domain: `name="INKNOIR", version="1", chainId, verifyingContract`.
  - Function `mintWithVoucher(LazyMintVoucher voucher, bytes signature) external payable`:
    1. `require(block.timestamp <= voucher.expiry, "EXPIRED")`
    2. `require(msg.value >= voucher.price, "UNDERPAID")`
    3. `require(_ownerOf(voucher.tokenId) == address(0), "MINTED")`
    4. Recover signer from EIP-712 hash; `require(signer == authorizedSigner, "BAD_SIG")`
    5. `_safeMint(voucher.buyer, voucher.tokenId)`
    6. `payable(voucher.artistTreasury).transfer(msg.value)` (testnet ok; for mainnet use `call`)
    7. Emit `PlateMinted(tokenId, buyer, designId)`
  - `tokenURI(uint256) returns (string)` returns `<baseURI>/<tokenId>` where baseURI is the Worker `/api/metadata/`.
- **3.3** `contracts/script/Deploy.s.sol` script:
  - Reads `SIGNER_ADDRESS`, `ARTIST_TREASURY`, `BASE_URI` from env.
  - Deploys, writes deploy address to `contracts/deployments/base-sepolia.json`.
- **3.4** `contracts/test/InknoirPlates.t.sol`:
  - All 6 unit tests listed in D3.
- **3.5** Deploy script wrapper `scripts/deploy-contract.sh` that runs `forge script script/Deploy.s.sol --rpc-url $BASE_SEPOLIA_RPC --broadcast` and pipes the address into `src/lib/config/contract.ts` for the frontend.

### Phase 4 — Commerce wiring (5 steps, ~1 hr)
- **4.1** `src/lib/wagmi.ts`: configure Wagmi with `baseSepolia` chain only, RainbowKit theme tuned to INKNOIR's bone accent.
- **4.2** `src/components/WalletProvider.tsx`: wraps WagmiProvider + RainbowKitProvider + QueryClientProvider; root layout uses `client:load` for it.
- **4.3** `src/pages/api/voucher.ts`:
  - POST handler, zod-validate `{designId, buyer}`.
  - Read design from D1; reject if status≠AVAILABLE or RESERVED-expired.
  - Read on-chain `_ownerOf(tokenId)` via Viem with public Base Sepolia RPC; if exists, flip D1 to SOLD and return 409.
  - Otherwise: build `LazyMintVoucher`, sign with `SIGNER_PRIVATE_KEY` via `viem.signTypedData`, return JSON.
  - UPDATE D1: `status='reserved', reserved_until=now+900`.
- **4.4** `src/components/CheckoutFlow.tsx` (client:load):
  - useAccount, fetch voucher, `writeContract({abi: InknoirPlates, functionName: 'mintWithVoucher', args: [voucher, signature], value: voucher.price})`, wait for receipt, navigate to `/wallet`.
- **4.5** Optional reconcile endpoint `src/pages/api/reconcile.ts` (called by a Cron Trigger every 5 min): scan D1 RESERVED rows past TTL, check on-chain, flip statuses.

### Phase 5 — Bookings (3 steps, ~30 min)
- **5.1** `src/pages/api/bookings.ts`: zod-validate, INSERT into `booking_inquiries`, fire-and-forget email via Resend SDK (fall back to MailChannels `fetch('https://api.mailchannels.net/tx/v1/send', ...)` if `RESEND_API_KEY` missing).
- **5.2** Port Booking screen `src/pages/booking.astro` + `src/components/BookingForm.tsx` (client:load) — preserve the prototype layout (artist picker, date/time hints, message field).
- **5.3** Success-toast hook in `src/components/Toast.tsx`.

### Phase 6 — Screens port (8 steps, ~2-3 hr)
For each prototype screen, create `src/pages/<route>.astro` that uses `Base.astro` layout, fetches data via `Astro.fetch('/api/...')` at request time (`prerender = false`) or from `seed.ts` at build (`prerender = true` where data is static). Visual rules from `_handoff/tattoo-project/project/screens-1.jsx`, `screens-2.jsx`, `screens-3.jsx`.
- **6.1** `/` Home — static, prerendered. Read `screens-1.jsx Home`.
- **6.2** `/market` Market — SSR, fetches `/api/designs`, client filters in `<MarketGrid client:load>`.
- **6.3** `/design/[id]` DesignDetail — SSR, fetches one design.
- **6.4** `/artists` Artists — static, seeded from build-time D1 export (or `seed.ts`).
- **6.5** `/artist/[id]` ArtistProfile — SSR.
- **6.6** `/booking` (Phase 5).
- **6.7** `/checkout/[id]` Checkout — wraps `<CheckoutFlow client:load>`.
- **6.8** `/wallet` Wallet — wraps `<WalletOwnedPlates client:only="react">`.

### Phase 7 — Cloudflare resources via MCP (6 steps, ~30 min, live deploy)
- **7.1** `workers_list` baseline snapshot (already done in interview, 8 Workers). Save names to plan log for "untouched after" check (G5).
- **7.2** `d1_database_create name=inknoir-catalog`. Capture returned `database_id`. Update `wrangler.toml`.
- **7.3** `r2_bucket_create name=inknoir-assets` (jurisdiction=default). Update `wrangler.toml`.
- **7.4** Apply migrations remotely: `wrangler d1 execute inknoir-catalog --remote --file migrations/0001_init.sql` then `0002_seed.sql`.
- **7.5** `wrangler pages project create inknoir --production-branch main`. Set secrets via `wrangler pages secret put` (or via dashboard if MCP doesn't expose Pages secrets).
- **7.6** Build + deploy: `pnpm build && wrangler pages deploy dist --project-name inknoir`. Capture deploy URL.

### Phase 8 — Push to GitHub (3 steps, ~5 min)
- **8.1** `git remote add origin https://github.com/Poom5741/tattoo-project.git`
- **8.2** `git branch -M main`
- **8.3** `git push -u origin main` (requires user's gh auth in env or Personal Access Token; if push fails, surface error and ask the user for credentials).

### Phase 9 — Verification (4 steps, ~30 min)
- **9.1** Run smoke script `scripts/smoke.sh https://inknoir.pages.dev` — checks all 5 GETs return 200 with expected bodies.
- **9.2** Run Playwright visual diff against the reference render of `INKNOIR.html`.
- **9.3** Run `forge test -vv` and `pnpm test` — all green.
- **9.4** Re-run `workers_list` and assert the same 8 pre-existing Workers are present.

---

## File Inventory (planned)

```
.
├── .gitignore
├── .env.example
├── astro.config.mjs
├── package.json
├── pnpm-lock.yaml
├── README.md
├── tsconfig.json
├── wrangler.toml
├── migrations/
│   ├── 0001_init.sql
│   └── 0002_seed.sql
├── scripts/
│   ├── deploy-contract.sh
│   ├── smoke.sh
│   └── seed-export.ts
├── contracts/
│   ├── foundry.toml
│   ├── src/InknoirPlates.sol
│   ├── script/Deploy.s.sol
│   ├── test/InknoirPlates.t.sol
│   └── deployments/base-sepolia.json     (post-deploy)
├── src/
│   ├── styles/global.css
│   ├── layouts/Base.astro
│   ├── pages/
│   │   ├── index.astro
│   │   ├── market.astro
│   │   ├── design/[id].astro
│   │   ├── artists.astro
│   │   ├── artist/[id].astro
│   │   ├── booking.astro
│   │   ├── checkout/[id].astro
│   │   ├── wallet.astro
│   │   └── api/
│   │       ├── designs/index.ts
│   │       ├── designs/[id].ts
│   │       ├── metadata/[tokenId].ts
│   │       ├── voucher.ts
│   │       ├── bookings.ts
│   │       ├── reconcile.ts
│   │       └── health.ts
│   ├── components/
│   │   ├── Nav.tsx
│   │   ├── Footer.astro
│   │   ├── TextureLayer.tsx
│   │   ├── TweaksPanel.tsx
│   │   ├── Plate.tsx
│   │   ├── MarketGrid.tsx
│   │   ├── CheckoutFlow.tsx
│   │   ├── BookingForm.tsx
│   │   ├── WalletOwnedPlates.tsx
│   │   ├── WalletProvider.tsx
│   │   └── Toast.tsx
│   ├── lib/
│   │   ├── catalog/seed.ts
│   │   ├── catalog/types.ts
│   │   ├── api/schemas.ts
│   │   ├── config/contract.ts
│   │   └── wagmi.ts
│   └── env.d.ts
└── tests/
    ├── unit/plate.test.ts
    ├── unit/voucher.test.ts
    └── e2e/visual.spec.ts
```

---

## Risks and Mitigations

| Risk | Likelihood | Severity | Mitigation |
|------|-----------|----------|------------|
| Signer key leaked via commit | Low | Critical | `.gitignore` strict; `wrangler secret put` only; pre-commit grep for `^0x[a-fA-F0-9]{64}$` |
| `@astrojs/cloudflare` hybrid + RainbowKit hydration mismatch | Medium | High | `client:only="react"` on wallet-heavy components; isolated WalletProvider; smoke test in Phase 9 |
| D1/on-chain status drift | Medium | High | On-chain read on voucher issue; 15-min TTL; cron reconcile |
| MCP deploy fails mid-Phase 7 | Medium | Medium | Each Phase 7 step is idempotent + reversible; rollback by deleting created resource |
| `git push` fails for missing GitHub auth | Medium | Low | Detect and prompt user; do not attempt force-push; do not commit credentials |
| Pixel diff fails due to font loading order | Low | Medium | Preload all Google fonts in `<head>` of Base.astro; visual diff tolerance 2% |
| Existing 8 Workers accidentally modified | Very Low | Critical | Phase 7.1 baseline + Phase 9.4 verify; `inknoir-` prefix everywhere |
| Lazy-mint signer compromised | Low | High | Contract enforces `msg.value >= price` and `expiry` even if signer leaks — attacker can't mint for free |

---

## Verification Steps (post-execution)

1. `pnpm test` → green.
2. `forge test -vv --root contracts` → green.
3. `wrangler d1 execute inknoir-catalog --remote --command "SELECT status, COUNT(*) FROM designs GROUP BY status"` → expect `available: 11, reserved: 2, sold: 2` (matches seed status counts).
4. `curl -s https://inknoir.pages.dev/api/health` → `{"ok": true, ...}`.
5. `curl -s https://inknoir.pages.dev/api/designs | jq 'length'` → `15`.
6. `curl -s https://inknoir.pages.dev/api/metadata/1 | jq -e '.name and .image and .attributes'` → truthy.
7. Open `https://inknoir.pages.dev` in browser → Home renders, fonts loaded, accent applied.
8. Click `/market` → 15 plates visible, filter by style works.
9. Open `/design/d1` → Acquire button visible; clicking with no wallet shows Connect prompt.
10. Connect MetaMask on Base Sepolia → Acquire → sign mint tx → see token on BaseScan Sepolia.
11. `/wallet` → newly minted plate appears.
12. `mcp__cloudflare-bindings__workers_list` shows the same 8 pre-existing Worker names plus the new Pages-bundled Worker (named `inknoir`).
13. `gh repo view Poom5741/tattoo-project` shows `main` with the latest commit.

---

## ADR — Architectural Decision Record

### Decision
Use **Astro 5 + @astrojs/cloudflare (hybrid output) + React 18 islands** as the frontend stack, with a **single Cloudflare Worker** (Astro `/api/*` SSR routes) for backend, **Cloudflare D1** for catalog + bookings, **Cloudflare R2** for image overrides, **IPFS (NFT.Storage)** for token metadata, and a **lazy-mint ERC-721 with EIP-712 voucher** (Foundry, deployed to Base Sepolia) for on-chain ownership.

### Drivers
1. Spec mandates Astro and Cloudflare Pages.
2. Spec mandates testnet-only, NFT-native commerce on Base Sepolia.
3. Pixel-faithful port of the prototype, including all 8 screens, fonts, textures, accents.
4. Live deploy via Cloudflare MCP must coexist with 8 existing unrelated Workers.

### Alternatives Considered
- **Option B (single SPA in one Astro page):** rejected — defeats Astro's static delivery, loads Wagmi on Home.
- **Option C (Next.js):** rejected — out of scope per spec.
- **Pre-mint instead of lazy mint:** rejected at deep-interview Round 4 — higher upfront gas, less idiomatic for 1/1 drops.
- **Mainnet:** rejected at deep-interview Round 2 — explicit testnet-only.
- **Email/social auth:** rejected at deep-interview Round 1 — explicit wallet-only.
- **R2-only metadata (no IPFS):** rejected at deep-interview Round 3 — user picked the full R2+D1+IPFS combo for production-grade NFT semantics.
- **Mock commerce / waitlist:** rejected at deep-interview Round 4 contrarian — user chose full mint flow.

### Why Chosen
- Maps directly to every spec choice with no compromises.
- Minimum viable surface area: 1 contract + 1 Worker + 1 D1 + 1 R2 + 1 Pages project = 5 resources, all under one `inknoir-` namespace.
- Security posture survives signer key compromise (contract-side price/expiry enforcement).
- All 8 prototype screens ship without dropping any UX.

### Consequences
- Two languages in the repo (TS + Solidity). Acceptable for an NFT project.
- IPFS pin step adds a 2nd external dependency (NFT.Storage). Mitigation: metadata is also cached in R2 as a fallback if the IPFS gateway is slow.
- Visual fidelity ties us to the prototype's font/color choices; later rebrand requires a coordinated update across `styles.css`, contract metadata description, and OG cards.
- Pages auto-deploy on git push is NOT wired in v1 (deferred). Means each future deploy is a manual `wrangler pages deploy`.

### Follow-ups (out of v1 scope)
- Indexer (Goldsky/Envio or self-hosted) for richer Wallet UX (transfer history, owners).
- GitHub Actions CI for auto-deploy.
- Mainnet deployment + custom domain.
- Admin UI for adding new designs without a migration.
- Per-design real images uploaded to R2 (currently the procedural SVG is the canonical visual).
- Resend domain DKIM/SPF setup (currently fallback MailChannels works without it).
- Hyperdrive / Workers RPC proxy for higher-throughput chain reads.

---

## Changelog
- v1 (Planner draft) — Initial plan from deep-interview spec.
