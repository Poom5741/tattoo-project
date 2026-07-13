# Implementation Plan: SUKNID — Astro + Cloudflare NFT Ecommerce (v2 — consensus)

**Status:** pending approval
**Source spec:** [.omc/specs/deep-interview-suknid-astro-cloudflare.md](../specs/deep-interview-suknid-astro-cloudflare.md)
**Mode:** Consensus, deliberate (smart contract + signer key + value flow on testnet)
**Iteration:** v2 (incorporates architect + critic feedback from v1)

---

## RALPLAN-DR Summary (deliberate)

### Principles (5)
1. **Design fidelity over framework purity.** Port typography, accent themes, textures, and procedural SVG exactly. Inline CSS where needed.
2. **On-chain is canonical for ownership; D1 is canonical for *listing intent* (not ownership).** D1 stores `status` (available/reserved/sold) and `reserved_until` TTL. Ownership is read by Viem from chain. A single writer (`POST /api/confirm`) flips D1 to `sold` after verifying the transaction receipt.
3. **Signer keys never leave Cloudflare Workers Secrets.** Local dev uses a *separate* test signer wallet whose private key lives only in `.dev.vars` (gitignored). Production signer key lives only in `wrangler secret put`. Contract exposes `setAuthorizedSigner(address)` for rotation.
4. **One Worker, one voucher contract, one chain (Base Sepolia).** No indexers, no multi-chain, no mainnet in v1.
5. **Idempotent infra, deterministic deploy.** Migrations use `INSERT OR IGNORE` + a `_migrations` versioning table. Worker/Pages/D1/R2 create steps detect existing resources and no-op. Resources prefixed `suknid-`.

### Decision Drivers (top 3)
1. **Security-of-funds.** Signer compromise, voucher race, reentrancy, key rotation paths must all be safe even on testnet — bad habits propagate to mainnet.
2. **Time-to-deployed-URL.** Live MCP deploy to `*.pages.dev` with all 8 screens visible, wallet connect, and mint working end-to-end.
3. **Pixel fidelity vs Astro idioms.** Visual output identical, but structure rebuilt as Astro pages + React islands.

### Viable Options

#### Option A — All-Astro with React islands (CHOSEN)
**Approach:** Astro 5 + `@astrojs/cloudflare` hybrid. `.astro` pages for routing/SEO/shell. React islands for wallet-sensitive screens. Module-level Wagmi singleton + `cookieToInitialState` to share wallet state across islands.

**Pros:**
- Per-route prerender control (`/`, `/artists`, `/booking` static; `/market`, `/design/[id]`, `/checkout/[id]`, `/wallet`, `/api/*` SSR).
- Per-route SEO metadata.
- Bundle isolation via deferred-RainbowKit Connect button in Nav.

**Cons:**
- Two mental models (`.astro` + `.tsx`).
- Wagmi-across-islands requires a module singleton pattern and cookie bridge — non-trivial.
- Nav Connect button must be designed to *not* pull RainbowKit into every route (defer load until clicked).

#### Option B — Single Astro page hosting the React SPA
**Approach:** One `[...path].astro` that mounts the prototype's React app as one giant island.

**Pros:**
- One provider tree — Wagmi/RainbowKit context shared trivially.
- Near-copy port from prototype's `app.jsx`.

**Cons (honest):**
- One per-route SEO file pattern is lost; `/design/[id]` loses SSR metadata.
- Every route ships the full Wagmi bundle even when it doesn't need it (e.g., `/booking`).
- The prototype's `screen` state machine duplicates Astro's router — leaves us with two routers if we add anything Astro-native later.

**Invalidation rationale:** Option A's per-route SEO and prerender flexibility outweigh provider-sharing ergonomics, especially since Wagmi v2's SSR pattern (module-level config + `cookieToInitialState`) is a documented solved problem. Adopted as the choice.

#### Option C — Next.js on Cloudflare Pages
Out of scope per spec. Recorded for completeness only.

### Pre-mortem (10 failure scenarios — 3 original + 7 added)

#### F1 — Signer key leak via commit
The voucher-signing private key gets committed to git via `.env`, `wrangler.toml`, or a leaked Worker dump.
**Prevention:** Key lives only in `wrangler secret put SIGNER_PRIVATE_KEY`. `.gitignore` excludes `.env*` (except `.env.example`), `.dev.vars`, `.wrangler/`. Pre-commit hook scans diff for `0x[a-fA-F0-9]{64}` + signer env var names. Contract `setAuthorizedSigner(address)` (owner-only) allows rotation if leak is detected. Contract still enforces `msg.value >= voucher.price` and `expiry`, so even a leaked signer cannot mint for free.
**Detection:** Pre-commit hook + `wrangler secret list` audit. (Note: GitHub push protection is server-side; we enable it post-push by setting repo Secret Scanning on first push.)

#### F2 — Hydration mismatch flickers TweaksPanel/Wallet
Astro SSR has no DOM, so client-side `document.documentElement.style` mutations cause first-paint flicker; Wagmi's `useAccount` initially returns disconnected on SSR.
**Prevention:** Initial CSS variables baked into `:root` in `styles/global.css` so server-rendered first paint is correct. TweaksPanel is `client:load` only. Wallet-reading components are `client:only="react"`. Wagmi config uses `cookieStorage` + `cookieToInitialState` so initial connect state hydrates from cookie.
**Detection:** Playwright JS-disabled smoke test per screen; React strict-mode dev console must not warn `hydration`.

#### F3 — D1 status drift vs on-chain reality
Buyer mints; D1 status stays RESERVED; second buyer requests voucher; second mint reverts.
**Prevention:** Atomic reservation in voucher endpoint (see Phase 4.3): `UPDATE designs SET status='reserved', reserved_until=? WHERE id=? AND (status='available' OR (status='reserved' AND reserved_until < ?)) RETURNING token_id` — only sign if `changes()==1`. Pre-sign chain read `_ownerOf(tokenId)`; if exists, flip D1 to SOLD and 409. `POST /api/confirm` (the **single writer to SOLD**) verifies receipt via `getTransactionReceipt(txHash)` with 3 confirmations, idempotency keyed on `txHash`. Cron Worker every 5 min reconciles RESERVED past TTL.
**Detection:** `/api/health` returns drift counts (RESERVED past TTL, SOLD with no Transfer event in last 24h). Alert threshold: drift > 0 for ≥10 min.

#### F4 — Public RPC rate-limit on Wallet reads
Demo with 5 concurrent viewers loading `/wallet` hits Base Sepolia public RPC throttling.
**Prevention:** Viem transport uses `fallback([http(BASE_RPC_PRIMARY), http(BASE_RPC_FALLBACK)])`. `/api/wallet/:addr` has 30-second `Cache-Control: s-maxage=30` SWR. No `tokenOfOwnerByIndex` (contract does not implement enumerable); instead a `Transfer` event log scan via `getLogs({event: Transfer, args: {to: addr}})` then filter by `ownerOf` for current holdings.

#### F5 — Voucher front-running / griefing
Bot watches mempool of `/api/voucher` calls and tries to front-run the buyer's mint with its own.
**Prevention:** `buyer` field in the EIP-712 `LazyMintVoucher` struct binds the voucher to the buyer's address. Contract `mintWithVoucher` validates `voucher.buyer == msg.sender`. Different addresses cannot redeem. Test: `testRevertOnWrongBuyer`.

#### F6 — R2 public bucket access misconfigured
Phase 7.3 creates the bucket but image overrides 404 because R2 buckets are private by default.
**Prevention:** Phase 7.3 explicitly enables the `r2.dev` dev URL (or binds a custom domain later); Phase 7.3 verification curls a known key. Phase 1.x adds an "image override is optional" path so missing bucket only degrades to procedural SVG, never errors.

#### F7 — Base Sepolia chain reorg orphans SOLD row
A mint tx is reorganized out, D1 stuck in SOLD.
**Prevention:** `POST /api/confirm` waits for 3 confirmations before flipping SOLD. Cron reconcile re-checks `_ownerOf` and rolls back to AVAILABLE if the owner has zero address. Documented in Risks as known testnet hazard.

#### F8 — NFT.Storage outage at deploy
Build-time pinning fails or pins partial set; mint succeeds but `tokenURI` is broken.
**Prevention:** Pin step is fail-loud (build aborts if any of the 15 designs fails to pin after 3 retries with exponential backoff). Generated metadata JSON is also written to R2 as a fallback gateway path. `tokenURI` returns `ipfs://<cid>`; Worker `/api/metadata/[tokenId]` serves the R2 copy as a `Location: ipfs://...` 302 alternative for clients that can't resolve IPFS. Multiple gateway URLs (cf-ipfs.com, w3s.link, ipfs.io) tried client-side via Viem normalize hook.

#### F9 — GitHub remote already has content
`git push -u origin main` on a non-empty remote fails or requires force-push.
**Prevention:** Phase 8.0 pre-flight: `git ls-remote origin main`. If non-empty, surface to user with three options (rebase local onto remote, force-push, or pivot to a new branch). Do not force-push without explicit confirmation.

#### F10 — Prototype localStorage collision
Old prototype keys `suknid_col` and `suknid_book` linger in a developer's or stakeholder's browser; Wallet screen renders fake "owned" plates.
**Prevention:** New app uses namespaced keys `suknid.v2.drawn`, `suknid.v2.tweaks`. Wallet screen reads ownership **only** from chain (`balanceOf` + log scan), never from any localStorage. A one-time migration deletes legacy `suknid_col` / `suknid_book` keys on first app load.

### Expanded Test Plan

| Layer | What we test | Tooling |
|-------|--------------|---------|
| **Unit (contract)** | `mintWithVoucher` reverts on: expired voucher, wrong signer, double-claim, underpayment, wrong buyer (front-run), wrong chainId. EIP-712 domain separator matches `chainId=84532 + verifyingContract`. `setAuthorizedSigner` only callable by owner. Reentrancy guard blocks re-entry via malicious treasury. | Foundry `forge test` |
| **Unit (worker)** | Voucher payload validates against zod; signer derives address matching contract's `authorizedSigner`; atomic D1 UPDATE refuses if `changes()==0`; `/api/confirm` idempotent on `txHash`. | Vitest + Miniflare |
| **Unit (frontend)** | `Plate` SVG snapshot per seed (deterministic). Tweaks state persists. Legacy localStorage keys deleted on first load. | Vitest + React Testing Library |
| **Integration** | Signer + contract: Foundry script signs a voucher with the same TypedData hash a Worker would produce; running `mintWithVoucher` on an anvil fork of Base Sepolia succeeds. Chain-id 84532 enforced. | Foundry script + Vitest |
| **Concurrency / load** | 50 concurrent `POST /api/voucher` for the same `designId` → exactly 1 × 200 + 49 × 409. | autocannon |
| **e2e (visual)** | Playwright screenshot diff per screen vs **committed PNG baselines** captured from a deterministic prototype-render harness at 3 viewports (390/768/1440). Font-ready wait via `document.fonts.ready`. Tolerance ≤2%. | Playwright + pixelmatch |
| **e2e (functional)** | Connect mock wallet (Viem mock transport) → browse Market → click design → Acquire → success → Wallet shows token. | Playwright |
| **R2 access** | `curl <r2-public-url>/test.txt` returns the test object after deploy. | Shell |
| **IPFS gateway fallback** | Disable primary gateway via Viem normalize hook test → asserts secondary gateway resolves token metadata. | Vitest |
| **Observability** | Worker logs `{request_id, route, status, duration_ms, chain_call_ms, d1_query_ms}` structured JSON. Frontend ships `web-vitals` to Worker. Health endpoint reports D1 + chain reachability. | `wrangler tail` + Cloudflare observability MCP |
| **Smoke (post-deploy)** | Scripted curl: `/api/health` has `ok:true && d1=="ok" && chain=="ok"`; `/api/designs | jq length == 15`; `/api/metadata/1 | jq -e '.name and .image and .attributes'`; root URL has `<title>SUKNID`. Status counts derived from `seed.ts` at runtime, not hardcoded. | Shell |
| **Idempotence drill** | Re-run `wrangler d1 execute … 0002_seed.sql` against a live DB — must not error and must not duplicate rows. Re-run `pages project create suknid` — must detect-and-skip. | Shell |
| **Signer rotation drill** | `setAuthorizedSigner` called on testnet contract; old signer's vouchers now fail (`testRevertOnRotatedSigner`); new signer's succeed. Documented runbook. | Foundry script + manual |

---

## Requirements Summary

Port the SUKNID React prototype to an Astro 5 project with `@astrojs/cloudflare` (hybrid output), wire a lazy-mint ERC-721 on Base Sepolia (Foundry, EIP-712 voucher signed by a Cloudflare Worker with rotation support and reentrancy protection), persist catalog + bookings in D1, serve images from R2 with explicit public access, pin token metadata to IPFS at build time with R2 fallback, deploy live to Cloudflare Pages via the Cloudflare MCP, and push the repo to `https://github.com/Poom5741/tattoo-project` `main` after a remote pre-flight check. All 8 prototype screens visually faithful. Testnet only, wallet-only auth, no fiat.

---

## Acceptance Criteria (testable)

### A. Repo & local dev
- [ ] **A1.** `pnpm install && pnpm dev` serves Astro on `http://localhost:4321` without errors.
- [ ] **A2.** `pnpm build` produces `dist/` + `.wrangler/` without TS errors.
- [ ] **A3.** `pnpm test` Vitest unit + integration tests pass.
- [ ] **A4.** `forge test -vv --root contracts` passes including `testRevertOnExpiredVoucher`, `testRevertOnWrongSigner`, `testRevertOnDoubleClaim`, `testRevertOnUnderpayment`, `testRevertOnWrongBuyer`, `testRevertOnWrongChainId`, `testRevertOnWrongCid`, `testSetAuthorizedSignerOnlyOwner`, `testReentrancyBlocked`, `testRevertOnRotatedSigner`.
- [ ] **A5.** `git log --oneline` shows ≥1 commit; `git remote -v` shows `origin`; `main` pushed.
- [ ] **A6.** `.gitignore` excludes `node_modules`, `.env*` (except `.env.example`), `.dev.vars`, `.wrangler`, `dist`, `out`, `.astro`, `_handoff/`, `cache`, `cache_forge`, `broadcast`, `*.log`, `contracts/out`.
- [ ] **A7.** No file in `git ls-files` contains a 64-hex-char private-key pattern (pre-commit hook + CI check).

### B. Astro Frontend
- [ ] **B1.** Routes 200: `/`, `/market`, `/design/[id]`, `/artists`, `/artist/[id]`, `/booking`, `/checkout/[id]`, `/wallet`.
- [ ] **B2.** `:root` CSS variables match prototype defaults on first paint (verified by JS-disabled smoke test — no FOUC).
- [ ] **B3.** TweaksPanel toggles fontPair / texture / accent live; persists to `suknid.v2.tweaks`.
- [ ] **B4.** `Plate` snapshot test passes for `seed=11,29,47,71`.
- [ ] **B5.** Visual diff ≤2% vs committed PNG baselines at 390/768/1440px, captured via `pnpm baseline:capture` from a deterministic prototype-render harness.
- [ ] **B6.** Mobile viewport (390×844): no horizontal overflow on any screen.
- [ ] **B7.** Legacy localStorage keys `suknid_col` and `suknid_book` removed on first app load.

### C. Catalog & Data Layer
- [ ] **C1.** D1 `suknid-catalog` exists; `SELECT COUNT(*) FROM designs` returns 15; `SELECT COUNT(*) FROM artists` returns 4 with ids `mara, koto, sol, vera`.
- [ ] **C2.** Seed migration is idempotent — running it twice produces no errors and no duplicates.
- [ ] **C3.** `GET /api/designs` returns JSON array of 15 designs.
- [ ] **C4.** `GET /api/designs/d1` returns design 1 with `artistName: "Mara Vael"`.
- [ ] **C5.** `GET /api/metadata/1` returns ERC-721 metadata with `name`, `description`, `image` (IPFS or R2 URL), `attributes: [...]` validating against OpenSea schema.
- [ ] **C6.** R2 `suknid-assets` exists AND a public URL (`r2.dev` or custom domain) returns 200 for an uploaded test object.

### D. Commerce Flow
- [ ] **D1.** `SuknidPlates` deployed on Base Sepolia (chainId 84532); address persisted in `contracts/deployments/base-sepolia.json` and surfaced in `src/lib/config/contract.ts`.
- [ ] **D2.** Contract **verified** on Basescan Sepolia (`forge verify-contract` succeeds); verification link in README.
- [ ] **D3.** Contract:
  - inherits `ERC721`, `Ownable`, `ReentrancyGuard`, `EIP712`
  - exposes `setAuthorizedSigner(address) onlyOwner`
  - `mintWithVoucher` is `nonReentrant`, validates `msg.sender == voucher.buyer`, uses `call{value:}("")` not `transfer`
  - `tokenURI` returns `ipfs://<cid>` for each tokenId (cid from D1)
- [ ] **D4.** `POST /api/voucher` body `{designId, buyer}` returns signed voucher; performs atomic D1 reservation (refuses if `changes()==0`); pre-signs chain read for `_ownerOf` and 409s on conflict.
- [ ] **D5.** Same endpoint returns 409 for SOLD or unexpired RESERVED rows.
- [ ] **D6.** Checkout: wallet connects → voucher fetched → wallet signs mint → frontend waits **3 confirmations** → calls `POST /api/confirm` → success toast → redirects to `/wallet`.
- [ ] **D7.** `POST /api/confirm` is the **sole writer** that flips D1 to SOLD; idempotent on `txHash`; verifies receipt via Viem before writing.
- [ ] **D8.** Concurrency test: 50 simultaneous voucher requests for one design yield 1 × 200 + 49 × 409.

### E. Bookings
- [ ] **E1.** `POST /api/bookings {artistId, name, contact, message, designId?}` inserts row.
- [ ] **E2.** Worker sends email via Resend (fallback MailChannels).
- [ ] **E3.** Form shows success toast on 200.

### F. Auth & Customer Accounts
- [ ] **F1.** Nav shows a **deferred Connect button** that loads RainbowKit modal only on click (verified by Lighthouse bundle inspection: home `_app.js` does not contain `@rainbow-me/rainbowkit`).
- [ ] **F2.** Wagmi config uses module-level singleton imported by every island; `baseSepolia` is the only chain.
- [ ] **F3.** Disconnected Wallet/Checkout shows "Connect wallet" empty state.
- [ ] **F4.** Wallet screen reads ownership via `Transfer` event log scan + `ownerOf` filter (NOT `tokenOfOwnerByIndex` — contract is not Enumerable). Owned plate visible after a successful mint.
- [ ] **F5.** Connect state survives navigation across islands (cookie-bridged Wagmi state).

### G. Cloudflare Infrastructure
- [ ] **G1.** `wrangler.toml` declares `[[d1_databases]]` (suknid-catalog), `[[r2_buckets]]` (suknid-assets), `[vars] BASE_RPC_PRIMARY, BASE_RPC_FALLBACK, PUBLIC_CONTRACT_ADDRESS, PUBLIC_CHAIN_ID=84532`.
- [ ] **G2.** Pages project `suknid` exists; `wrangler pages deployment list suknid` shows a successful deploy.
- [ ] **G3.** Deployed URL returns 200 and renders Home.
- [ ] **G4.** Secrets set via `wrangler pages secret put <NAME> --project-name suknid`: `SIGNER_PRIVATE_KEY`, `NFT_STORAGE_KEY`, `RESEND_API_KEY` (optional). `wrangler pages secret list --project-name suknid` shows the names; values never logged.
- [ ] **G5.** Pre-deploy `workers_list` snapshot and post-deploy `workers_list` snapshot — pre-existing 8 Worker names (kubchain-explorer, solnest, eggo-world-pb, aris-wallet, telegram-gaming-bot-staging, telegram-gaming-bot, cet-dex, myport) all present unchanged.
- [ ] **G6.** R2 public access confirmed (curl returns 200 for a test object).

---

## Implementation Steps

### Phase 0 — Repo bootstrap (~10 min)
- **0.1** Init repo skeleton: `.gitignore` (excludes per A6), `package.json`, `tsconfig.json`, `astro.config.mjs`, `pnpm-workspace.yaml`, `README.md`, `.env.example`, `.dev.vars.example`. Add `_handoff/` to `.gitignore`. Pre-commit hook: `scripts/pre-commit-secrets.sh` scanning staged diff for hex private keys.
- **0.2** `git init`. **Stage explicitly** (never `git add .` so `_handoff/` cannot leak in via timing): `git add .gitignore .env.example .dev.vars.example astro.config.mjs package.json tsconfig.json pnpm-workspace.yaml README.md scripts/pre-commit-secrets.sh`. First commit: "chore: bootstrap repo". Do not configure remote yet.

### Phase 1 — Astro app scaffold (~45 min)
- **1.1** Install pinned deps: `astro@^5`, `@astrojs/cloudflare`, `@astrojs/react`, `react@^18.3`, `react-dom@^18.3`, `typescript`, `@types/react`, `@types/react-dom`, `vitest`, `@playwright/test`, `wagmi@^2`, `viem@^2`, `@rainbow-me/rainbowkit@^2`, `@tanstack/react-query@^5`, `zod`, `nft.storage`.
- **1.2** `astro.config.mjs`: hybrid output, cloudflare adapter with `platformProxy.enabled`, react integration.
- **1.3** Copy `_handoff/.../styles.css` → `src/styles/global.css`. Inline default CSS variables in `:root` so first paint is correct without JS. Base layout `src/layouts/Base.astro` includes `<head>` with font preloads + `<slot />`.
- **1.4** Port shell components:
  - `src/components/Nav.tsx` — `client:load`. Contains a deferred Connect button that dynamic-imports RainbowKit on click.
  - `src/components/Footer.astro` — static.
  - `src/components/TextureLayer.tsx` — `client:idle`.
  - `src/components/TweaksPanel.tsx` — `client:load`, mutates `:root` CSS vars, persists to `suknid.v2.tweaks`.
  - Legacy-localStorage cleanup hook on app boot deletes `suknid_col`, `suknid_book`.
- **1.5** Port `ink.jsx` → `src/components/Plate.tsx`. Port `data.jsx` types → `src/lib/catalog/types.ts` and seed → `src/lib/catalog/seed.ts`.

### Phase 2 — Catalog (D1) + Worker /api (~1 hr)
- **2.1** `migrations/0000_versioning.sql` — create `_migrations(version INTEGER PRIMARY KEY, applied_at INTEGER)`.
- **2.2** `migrations/0001_init.sql` — schema:
  - `artists` (id, name, handle, city, style, years, booked, rate, bio, pieces, rating, seed, email)
  - `designs` (id, n, title, artist_id FK, style, price, price_usd, status, placement, seed, token, minted, medium, sessions, drawn, image_override_url, token_id INT UNIQUE, reserved_until INT, ipfs_cid TEXT)
  - `booking_inquiries` (id, artist_id, design_id, name, contact, message, created_at)
  - **`mint_confirmations`** (tx_hash TEXT PRIMARY KEY, token_id INT NOT NULL UNIQUE, buyer TEXT, confirmed_at INT) — idempotency table for the SOLD writer. `UNIQUE(token_id)` blocks a phantom second confirmation for the same token even if a malicious event impersonator slipped past the log-address filter.
  - Indexes on `designs(status)`, `designs(artist_id)`, `mint_confirmations(token_id)`.
  - Migration wrapped in `BEGIN; ... INSERT OR IGNORE INTO _migrations VALUES (1, strftime('%s','now')); COMMIT;`.
- **2.3** `migrations/0002_seed.sql` — `INSERT OR IGNORE INTO artists/designs ...` (idempotent). `token_id = n` as integer. Status distribution mirrors `data.jsx` (available=11, reserved=2, sold=2 from the `_titles` array).
- **2.4** `scripts/seed-export.ts` — reads `src/lib/catalog/seed.ts` and emits `migrations/0002_seed.sql`. Single source of truth.
- **2.5** Astro endpoints (`prerender = false`):
  - `src/pages/api/designs/index.ts` — `SELECT * FROM designs`, zod-validated response.
  - `src/pages/api/designs/[id].ts` — design + artist join.
  - `src/pages/api/metadata/[tokenId].ts` — returns ERC-721 metadata. Uses `ipfs_cid` from D1 to build `image` URL via `ipfs://`; falls back to R2 URL if `ipfs_cid IS NULL`.
  - `src/pages/api/health.ts` — `{ok, d1, chain, reservedCount, soldCount, drift}`.
  - `src/pages/api/wallet/[addr].ts` — `Cache-Control: s-maxage=30`. Scans `Transfer` events with `to=addr` and `fromBlock = deployBlock` (from `contracts/deployments/base-sepolia.json`, closes architect-iter2 N2), filters by current `ownerOf`.
- **2.6** Worker observability: each handler emits structured `console.log` JSON `{request_id, route, status, duration_ms, chain_call_ms, d1_query_ms}`.
- **2.7** **NEW — Build-time IPFS pinning**: `scripts/pin-metadata.ts` reads seed, generates 15 metadata JSON files, pins each via NFT.Storage with 3-retry exponential backoff (fail-loud on persistent failure). Writes `ipfs_cid` back into a generated `migrations/0003_cids.sql` containing `UPDATE designs SET ipfs_cid='...' WHERE id='...'`. Also writes a copy of each JSON to `r2://suknid-assets/metadata/<tokenId>.json` for the R2 fallback path.
  - **Commit policy:** `migrations/0003_cids.sql` is `.gitignore`'d (build artifact); the pin step always runs before `wrangler d1 execute` in Phase 7.4. Idempotent because CIDs are content-addressed — same seed produces same CID. (Resolves architect-iter2 ambiguity.)

### Phase 3 — Smart contract (Foundry) (~2 hr)
- **3.1** `contracts/` subtree with `foundry.toml`, install OZ v5 (`forge install OpenZeppelin/openzeppelin-contracts`).
- **3.2** `contracts/src/SuknidPlates.sol`:
  - Inherits `ERC721`, `Ownable`, `ReentrancyGuard`, `EIP712`.
  - Storage: `address public authorizedSigner; address public artistTreasury; mapping(uint256 => string) private _tokenCIDs;`.
  - Struct `LazyMintVoucher { uint256 tokenId; string designId; uint256 price; address artistTreasury; uint256 expiry; address buyer; bytes32 cidHash; }`. **`cidHash = keccak256(bytes(cid))`** — binds the metadata cid into the signed payload so a buyer cannot substitute a malicious cid at mint time (closes architect-iter2 attack N1).
  - EIP-712 domain `name="SUKNID", version="1"`, chainId baked in at deploy.
  - `mintWithVoucher(LazyMintVoucher voucher, bytes signature, string calldata cid) external payable nonReentrant`:
    1. `require(block.timestamp <= voucher.expiry, "EXPIRED")`
    2. `require(msg.value >= voucher.price, "UNDERPAID")`
    3. `require(msg.sender == voucher.buyer, "WRONG_BUYER")` *(front-run mitigation, F5)*
    4. `require(_ownerOf(voucher.tokenId) == address(0), "MINTED")`
    5. Recover signer from EIP-712 hash; `require(signer == authorizedSigner, "BAD_SIG")`
    6. `require(keccak256(bytes(cid)) == voucher.cidHash, "BAD_CID")` — cid binding check (closes architect-iter2 N1).
    7. `_tokenCIDs[voucher.tokenId] = cid;` (bind metadata cid post-validation)
    8. `_safeMint(voucher.buyer, voucher.tokenId)` (after CEI bookkeeping)
    9. `(bool ok, ) = voucher.artistTreasury.call{value: msg.value}(""); require(ok, "PAY_FAIL");`
    10. Emit `PlateMinted(tokenId, buyer, designId)`.
  - `setAuthorizedSigner(address newSigner) external onlyOwner` — rotation path (F1, signer rotation drill).
  - `tokenURI(uint256 tokenId) public view override returns (string memory)` returns `string.concat("ipfs://", _tokenCIDs[tokenId])`.
- **3.3** `contracts/script/Deploy.s.sol`: reads `SIGNER_ADDRESS`, `ARTIST_TREASURY` from env; deploys; writes `{address, chainId, deployBlock, abi}` to `contracts/deployments/base-sepolia.json` (deployBlock is used as `fromBlock` floor for the Wallet event-log scan, closes architect-iter2 N2); runs `forge verify-contract` post-deploy.
- **3.4** `contracts/test/SuknidPlates.t.sol`: tests per A4. Includes:
  - `testRevertOnWrongBuyer` — voucher.buyer ≠ msg.sender reverts.
  - `testRevertOnWrongChainId` — EIP-712 with chainId 1 fails (we're on 84532).
  - `testReentrancyBlocked` — malicious treasury attempts re-entry → reverts.
  - `testSetAuthorizedSignerOnlyOwner` — non-owner call reverts.
  - `testRevertOnRotatedSigner` — sign with old key after rotation → reverts.
- **3.5** `scripts/deploy-contract.sh` — runs Deploy script then verification; pipes address into `src/lib/config/contract.ts`.

### Phase 4 — Commerce wiring (~1.5 hr)
- **4.1** `src/lib/wagmi.ts`: **module-level singleton** `config = createConfig({...})` and `queryClient = new QueryClient()` exported once. Chain: baseSepolia. Transports: `fallback([http(BASE_RPC_PRIMARY), http(BASE_RPC_FALLBACK)])`. Storage: `cookieStorage`. Connectors: injected + walletConnect (deferred). **Note:** the same `queryClient` instance is re-used across React roots (one per island); islands must never call `queryClient.clear()` to avoid blowing away wallet state in sibling islands.
- **4.2** `src/components/WalletProvider.tsx`: imports `config` and `queryClient` from `wagmi.ts`. Renders `WagmiProvider` + `RainbowKitProvider` + `QueryClientProvider`. Used **inside each wallet-using island** (Nav's modal mount, CheckoutFlow, WalletOwnedPlates). `.astro` pages compute `initialState = cookieToInitialState(config, Astro.cookies)` and pass to each island as prop.
- **4.3** `src/pages/api/voucher.ts`:
  - Zod-validate `{designId, buyer}`.
  - **Atomic reservation**: `UPDATE designs SET status='reserved', reserved_until=:exp WHERE id=:id AND (status='available' OR (status='reserved' AND reserved_until < :now)) RETURNING token_id, price, artist_id, ipfs_cid`. If `changes()==0`, return 409.
  - Pre-sign chain read `viem.readContract(SuknidPlates, 'ownerOf', [tokenId])` (try-catch — `ownerOf` reverts for non-existent tokens, which is the happy path). If exists, `UPDATE … SET status='sold'` and return 409.
  - Compute `cidHash = keccak256(utf8Bytes(ipfs_cid))` (Viem `keccak256(toBytes(cid))`).
  - Sign EIP-712 voucher (including `cidHash`) with `SIGNER_PRIVATE_KEY`. Return `{voucher, signature, cid}` — the contract will verify `keccak256(cid) == voucher.cidHash` on mint.
- **4.4** `src/components/CheckoutFlow.tsx` (`client:load`, props include `initialState`):
  - `useAccount`. If wrong chain, prompt switch.
  - POST `/api/voucher`. Display price.
  - `writeContract({abi, functionName: 'mintWithVoucher', args: [voucher, signature, cid], value: voucher.price})`.
  - `waitForTransactionReceipt({hash, confirmations: 3})`.
  - POST `/api/confirm` with `{txHash, tokenId}`.
  - On success, toast + navigate `/wallet`.
- **4.5** **NEW — `src/pages/api/confirm.ts`** (sole D1 SOLD writer):
  - Zod-validate `{txHash, tokenId}`.
  - `viem.getTransactionReceipt({hash: txHash})` — assert receipt `status == 'success'`, `to == PUBLIC_CONTRACT_ADDRESS`, `blockNumber + 3 <= latest`.
  - **Event verification (closes architect-iter2 cross-design DoS + critic-iter2 smart-wallet compatibility):** use `viem.parseEventLogs({abi, eventName: 'PlateMinted', logs: receipt.logs.filter(l => l.address.toLowerCase() === PUBLIC_CONTRACT_ADDRESS.toLowerCase())})`. Reject **422** if the filtered set is empty (no `PlateMinted` event from our contract → not a mint tx). Assert decoded `tokenId == params.tokenId` and `buyer != address(0)`. **Do NOT assert `buyer == receipt.from`** — smart-contract wallets (Safe, Coinbase Smart Wallet, ERC-4337 bundlers) submit txs from a relayer EOA while the NFT owner is the smart-account address; the contract-level `msg.sender == voucher.buyer` check + the `tokenId` match are sufficient to prevent cross-design DoS without rejecting legitimate smart-wallet mints.
  - Idempotency: check `SELECT 1 FROM mint_confirmations WHERE tx_hash=?`. If exists, return 200 noop.
  - `UPDATE designs SET status='sold' WHERE token_id=?`. Insert into `mint_confirmations(tx_hash, token_id, buyer, confirmed_at)`. Return 200.
- **4.6** **NEW — Concurrency test scaffold**: `tests/load/voucher.test.ts` uses `autocannon` to fire 50 concurrent voucher requests; asserts 1×200 + 49×409.
- **4.7** Cron Worker `src/pages/api/reconcile.ts` (`prerender=false`, triggered by `[[triggers]] crons = ["*/5 * * * *"]` in wrangler.toml): scan RESERVED past TTL → re-check chain → flip statuses.

### Phase 5 — Bookings (~30 min)
- **5.1** `src/pages/api/bookings.ts`: zod, INSERT, fire-and-forget email.
- **5.2** `src/pages/booking.astro` + `src/components/BookingForm.tsx`.
- **5.3** Toast hook in `src/components/Toast.tsx`.

### Phase 6 — Screens port (~2-3 hr)
- **6.1** `/` Home — static, prerendered. Port from `screens-1.jsx`.
- **6.2** `/market` — SSR; client filter island `<MarketGrid client:load>`.
- **6.3** `/design/[id]` — SSR.
- **6.4** `/artists` — static, generated from `seed.ts` at build.
- **6.5** `/artist/[id]` — SSR.
- **6.6** `/booking` — covered in Phase 5.
- **6.7** `/checkout/[id]` — wraps `<CheckoutFlow client:load>` with `initialState` prop.
- **6.8** `/wallet` — wraps `<WalletOwnedPlates client:only="react">` with `initialState`.

### Phase 7 — Cloudflare resources via MCP (~45 min, live deploy)
- **7.1** Baseline: run `mcp__cloudflare-bindings__workers_list`, capture the 8 names → `.omc/state/suknid-baseline-workers.json`.
- **7.2** **Idempotent D1**: list databases; if `suknid-catalog` exists, reuse its id. Else `d1_database_create`. Write `database_id` into `wrangler.toml`.
- **7.3** **Idempotent R2 + public access**: list buckets; if `suknid-assets` exists, reuse. Else create. **Manual step required** — MCP creates bucket private; the deploy is NOT fully automatable end-to-end on this step. The agent surfaces the exact toggle path to the user: Cloudflare dashboard → R2 → `suknid-assets` → Settings → Public access → Allow access → save. Capture the returned `*.r2.dev` URL (or bound custom domain) into `wrangler.toml` vars. Verify with `curl <public-url>/healthcheck.txt` after uploading a test file via `wrangler r2 object put`.
- **7.4** **Run pin step first** — `pnpm pin:metadata` (Phase 2.7) generates `migrations/0003_cids.sql` (gitignored, absent from fresh checkouts). Then apply migrations in order: `wrangler d1 execute suknid-catalog --remote --file migrations/0001_init.sql`, then `0002_seed.sql`, then `0003_cids.sql`. Each migration uses `INSERT OR IGNORE` / `IF NOT EXISTS` / `UPDATE … WHERE` to be re-runnable.
- **7.5** **Idempotent Pages project**: `wrangler pages project list` → if `suknid` exists, reuse. Else `wrangler pages project create suknid --production-branch main`.
- **7.6** Set secrets via `wrangler pages secret put <NAME> --project-name suknid` for `SIGNER_PRIVATE_KEY`, `NFT_STORAGE_KEY`, `RESEND_API_KEY` (latter optional). Verify with `wrangler pages secret list --project-name suknid` showing names only. **Note:** Pages secrets use the `pages secret` CLI form, not the Worker `wrangler secret put` form — they are different APIs.
- **7.7** `pnpm build && wrangler pages deploy dist --project-name suknid`. Capture deploy URL.
- **7.8** Smoke script `scripts/smoke.sh <deploy-url>` runs.

### Phase 8 — Push to GitHub (~10 min)
- **8.0** **Pre-flight**: `git remote add origin https://github.com/Poom5741/tattoo-project.git` (skip if already set). `git ls-remote origin main`. **If non-empty, STOP** and surface to user with three options:
  - Rebase local onto remote (preserves remote history).
  - Force-push with explicit user confirmation (destroys remote history).
  - Push to a new branch `astro-cloudflare-v1` instead.
- **8.1** Once cleared: `git branch -M main`.
- **8.2** `git push -u origin main`. On auth failure, surface to user (do not commit credentials).
- **8.3** Enable GitHub repo Secret Scanning + Push Protection via `gh api` (post-push hardening for F1).

### Phase 9 — Verification (~45 min)
- **9.0** **Baseline capture**: `pnpm baseline:capture` — Playwright renders `SUKNID.html` via a frozen-render harness (loads the prototype in an isolated Chromium, awaits `document.fonts.ready`, screenshots each screen at 390/768/1440). Commits PNGs to `tests/baselines/`.
- **9.1** `scripts/smoke.sh <deploy-url>`: GETs return 200; `/api/health` has `ok && d1=="ok" && chain=="ok"`; `/api/designs | jq length == 15`; status counts derived from `seed.ts` (not hardcoded) match `/api/health` reported counts.
- **9.2** Playwright visual diff against committed baselines.
- **9.3** `forge test -vv --root contracts` + `pnpm test` + concurrency test all green.
- **9.4** Post-deploy `workers_list` — assert the 8 pre-existing names from 7.1 baseline still present.
- **9.5** Signer rotation drill (manual, documented): `forge script SetAuthorizedSigner` rotates signer; old-key voucher fails on chain; new-key voucher succeeds. Optional in v1 but tests must cover the contract path.
- **9.6** Manual MetaMask flow on testnet: connect → mint one design → confirm in wallet → see in `/wallet`. Document tx hash in deploy log.

---

## File Inventory (planned)

```
.
├── .gitignore
├── .env.example
├── .dev.vars.example
├── astro.config.mjs
├── package.json
├── pnpm-lock.yaml
├── README.md
├── tsconfig.json
├── wrangler.toml
├── migrations/
│   ├── 0000_versioning.sql
│   ├── 0001_init.sql
│   ├── 0002_seed.sql
│   └── 0003_cids.sql              (generated by pin-metadata)
├── scripts/
│   ├── pre-commit-secrets.sh
│   ├── deploy-contract.sh
│   ├── smoke.sh
│   ├── seed-export.ts
│   └── pin-metadata.ts
├── contracts/
│   ├── foundry.toml
│   ├── src/SuknidPlates.sol
│   ├── script/Deploy.s.sol
│   ├── script/SetAuthorizedSigner.s.sol
│   ├── test/SuknidPlates.t.sol
│   └── deployments/base-sepolia.json
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
│   │       ├── confirm.ts
│   │       ├── bookings.ts
│   │       ├── reconcile.ts
│   │       ├── wallet/[addr].ts
│   │       └── health.ts
│   ├── components/
│   │   ├── Nav.tsx
│   │   ├── DeferredConnectButton.tsx
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
    ├── baselines/                 (PNGs committed)
    ├── unit/plate.test.ts
    ├── unit/voucher.test.ts
    ├── unit/legacy-cleanup.test.ts
    ├── load/voucher.test.ts
    ├── integration/eip712.test.ts
    └── e2e/visual.spec.ts
```

---

## Risks and Mitigations

| Risk | Likelihood | Severity | Mitigation |
|------|-----------|----------|------------|
| Signer key leaked via commit | Low | Critical | `.gitignore` strict; `wrangler secret put` only; pre-commit hook + GH Push Protection; contract supports rotation |
| Hybrid hydration / provider duplication | Medium | High | Module-level Wagmi singleton; cookieToInitialState; `client:only="react"` on wallet-heavy screens |
| D1/on-chain status drift | Medium | High | Atomic reservation; sole-writer `/api/confirm`; cron reconcile; drift counters in `/api/health` |
| Voucher race / concurrent reservations | Medium | High | Atomic UPDATE with `changes()==1` check; 49×409 concurrency test |
| Public RPC rate-limit on Wallet reads | Medium | Medium | Fallback RPC list; 30s SWR cache on `/api/wallet/:addr` |
| MCP deploy fails mid-Phase 7 | Medium | Medium | Each step idempotent; rollback paths documented; D1 seed `INSERT OR IGNORE` |
| GitHub remote non-empty | Medium | High | Phase 8.0 pre-flight; no force-push without explicit user confirmation |
| Pixel diff brittleness | Medium | Medium | Committed PNG baselines from deterministic capture; 2% tolerance; font-ready wait |
| Existing 8 Workers accidentally modified | Very Low | Critical | Baseline snapshot 7.1; verify 9.4; `suknid-` prefix; never invoke `workers_get_worker` modify path |
| Lazy-mint signer compromised | Low | High | Contract enforces price + expiry + buyer + chainId even if signer leaks; rotation via `setAuthorizedSigner` |
| Voucher front-run by mempool bot | Medium | Low | `buyer` field in voucher + contract `msg.sender == buyer` check |
| NFT.Storage build outage | Low | High | 3-retry backoff; fail-loud; R2 metadata copy as fallback gateway |
| R2 bucket private by default | Medium | Medium | Phase 7.3 explicitly enables public URL + curl-verifies |
| Chain reorg orphans SOLD row | Low | Medium | 3-confirmation wait; cron reconcile rolls back if owner is zero |
| Reentrancy via malicious treasury | Low | Critical | `nonReentrant` modifier; CEI ordering; `call{value:}` with check |
| Smart-contract treasury rejects `transfer()` 2300 gas | Low | High | Use `call{value:}("")` from day one |
| Prototype localStorage residue fakes ownership | Low | Medium | Namespace new keys `suknid.v2.*`; cleanup hook; Wallet reads only from chain |
| ERC721Enumerable absent from contract | — | — | Acceptance F4 uses `Transfer` log scan, not `tokenOfOwnerByIndex` |

---

## Verification Steps (post-execution)

1. `pnpm test` (unit + integration + load) → green.
2. `forge test -vv --root contracts` → all 9 tests pass.
3. `wrangler d1 execute suknid-catalog --remote --command "SELECT status, COUNT(*) c FROM designs GROUP BY status"` matches counts derived at runtime from `seed.ts` (no hardcoded numbers).
4. `curl -s <deploy-url>/api/health | jq -e '.ok and .d1=="ok" and .chain=="ok"'` truthy.
5. `curl -s <deploy-url>/api/designs | jq 'length'` → `15`.
6. `curl -s <deploy-url>/api/metadata/1 | jq -e '.name and .image and .attributes'` truthy; `.image` starts with `ipfs://`.
7. `curl -s <r2-public-url>/healthcheck.txt` → 200.
8. Open `<deploy-url>` in browser → Home renders with bone accent, fonts loaded, no console errors.
9. `/market` → 15 plates; filter works; clicking opens DesignDetail.
10. `/design/d1` → Acquire visible; disconnected wallet shows Connect prompt.
11. Manual MetaMask flow (testnet ETH funded) → mint succeeds → tx hash captured → `/wallet` shows the plate.
12. `mcp__cloudflare-bindings__workers_list` → 8 pre-existing names from 7.1 baseline all present.
13. `git ls-remote origin main` returns latest commit; `gh repo view Poom5741/tattoo-project` shows pushed code.
14. `wrangler secret list --name suknid` shows `SIGNER_PRIVATE_KEY, NFT_STORAGE_KEY, RESEND_API_KEY` (names only, no values).
15. Run seed migration twice in a row → no errors, no duplicates (idempotence drill).
16. Lighthouse on Home → bundle inspection shows no `@rainbow-me/rainbowkit` in initial JS (deferred Connect verified).
17. Concurrency test → 1×200 + 49×409 distribution.

---

## ADR — Architectural Decision Record

### Decision
Use **Astro 5 + @astrojs/cloudflare (hybrid output) + React 18 islands** with **module-level Wagmi singleton + cookieToInitialState SSR bridge** as the frontend. Backend: a single Cloudflare Worker (Astro `/api/*` SSR routes) with **two writer-distinct endpoints** — `/api/voucher` (sole writer to RESERVED, atomic), `/api/confirm` (sole writer to SOLD, idempotent on `txHash`). State: **Cloudflare D1** (listing intent + booking inquiries), **Cloudflare R2** (image overrides + metadata JSON fallback gateway), **IPFS via NFT.Storage** (canonical token metadata, pinned at build time). Contract: **lazy-mint ERC-721** with `ReentrancyGuard`, `Ownable`, EIP-712 voucher binding `buyer` + `chainId`, `setAuthorizedSigner` for rotation, `call{value:}` payouts, deployed to Base Sepolia and verified on Basescan.

### Drivers
1. Spec mandates Astro + Cloudflare Pages + testnet NFT commerce.
2. Pixel-faithful port of the prototype (all 8 screens, fonts, textures, accents).
3. Live deploy via Cloudflare MCP must coexist with 8 unrelated Workers in the account.
4. Security-of-funds in a value-flow system, even on testnet (drives reentrancy guard, rotation, atomic reservation, 3-confirm wait).

### Alternatives Considered
- **Option B (single SPA in one Astro page):** rejected — loses per-route SEO and prerender; the Wagmi-across-islands "problem" is solved by the documented module-singleton + cookieToInitialState pattern. Honest tradeoff: developer ergonomics for islands is harder than Option B, but the SEO/prerender win is real on `/`, `/artists`, `/booking`.
- **Option C (Next.js):** out of scope per spec.
- **Pre-mint instead of lazy mint:** rejected at deep-interview Round 4.
- **Mainnet:** rejected at deep-interview Round 2.
- **Email/social auth:** rejected at deep-interview Round 1.
- **R2-only metadata (no IPFS):** rejected at deep-interview Round 3.
- **`tokenOfOwnerByIndex` for Wallet read:** rejected — would require `ERC721Enumerable` (gas + storage cost); event-log scan is sufficient for 15-design catalog.
- **`payable.transfer()` to treasury:** rejected — 2300-gas stipend breaks contract-wallet treasuries; use `call{value:}` with reentrancy guard.

### Why Chosen
- Maps to every spec choice with no compromises.
- Minimum viable surface area: 1 contract + 1 Worker + 1 D1 + 1 R2 + 1 Pages project + 1 cron trigger.
- Security posture survives signer key compromise (price/expiry/buyer/chainId enforced on-chain) AND signer rotation is supported.
- All 8 prototype screens ship without dropping UX.
- D1↔chain drift bounded by single-writer pattern + cron reconcile + drift metrics in `/api/health`.

### Consequences
- Two languages in repo (TS + Solidity).
- Build pipeline now has a network dependency (NFT.Storage) — mitigated by 3-retry + fail-loud + R2 fallback.
- Visual fidelity ties the project to the prototype's font/color choices.
- Pages auto-deploy on git push NOT wired in v1 — deferred.
- Nav uses deferred Connect to avoid Wagmi-on-every-page; first wallet click pays a JS load cost.
- **R2 public-access toggle is a documented manual step** (Phase 7.3). Deploy is automatable up to that point; the one human gate is acknowledged rather than masked.

### Follow-ups (out of v1 scope)
- Indexer (Goldsky/Envio) for richer Wallet history.
- GitHub Actions CI for auto-deploy.
- Mainnet deployment + custom domain + DKIM/SPF for Resend.
- Admin UI for adding designs without a migration.
- Per-design real images uploaded to R2.
- Workers RPC proxy with caching for high-throughput chain reads.
- ERC2981 royalties (out of v1 scope but contract-level decision documented here).

---

## Changelog
- **v1** (Planner draft) — Initial plan from deep-interview spec.
- **v2** (Consensus iter 1) — Applied 23 fixes from Architect + Critic review:
  - **Architect (15):** Wagmi singleton + cookieToInitialState; atomic D1 reservation; `/api/confirm` endpoint; build-time IPFS pinning; idempotent seed migrations; fallback RPC; document `buyer` in voucher + test; mandatory Basescan verification; 3-confirm wait; Phase 9.0 baseline capture; concurrency load test; RPC rate-limit risk row; reorg risk row; ADR Nav-bundle decision; git push pre-flight.
  - **Critic (8):** `setAuthorizedSigner` + `nonReentrant` + `call{value:}` in contract; replace `tokenOfOwnerByIndex` with event-log scan; Phase 8.0 GitHub remote pre-flight; R2 public access verification; deterministic visual baseline; status counts derived from seed at runtime; localStorage namespace + cleanup; NFT.Storage outage policy + multi-gateway fallback.
- **v2.2** (Consensus iter 3 — CONVERGED) — Applied 5 fixes from Critic iter-2 review:
  - **MAJOR-1 — Pages secrets CLI syntax:** `wrangler pages secret put/list --project-name suknid` in Phase 7.6 + G4 (was incorrectly using Worker `wrangler secret put` form).
  - **MAJOR-2 — Smart-wallet false rejection:** `/api/confirm` no longer asserts `buyer == receipt.from` (would reject Safe / Coinbase Smart Wallet / ERC-4337 users); kept `log.address == contract` filter + `tokenId` match + contract-level `msg.sender == voucher.buyer`.
  - **MAJOR-3 — `mint_confirmations.token_id` UNIQUE constraint:** blocks phantom second confirmations on the same token.
  - **MINOR — Phase 7.4 pin-step ordering:** explicit "run `pnpm pin:metadata` first" before `wrangler d1 execute`.
  - **MINOR — Phase 0.2 explicit `git add`:** stage the bootstrap files by name, never `git add .` (prevents `_handoff/` from leaking pre-gitignore).
- **v2.1** (Consensus iter 2) — Applied 7 fixes from Architect iter-2 review:
  - **N1 (blocking) — cid substitution attack:** added `bytes32 cidHash` to `LazyMintVoucher` struct; contract verifies `keccak256(cid) == voucher.cidHash`; new test `testRevertOnWrongCid` in A4.
  - **N3 (blocking) — missing schema:** added `mint_confirmations` table to `0001_init.sql`.
  - **/api/confirm event verification (blocking):** parse `PlateMinted` log; assert decoded `tokenId == params.tokenId` AND decoded `buyer == receipt.from`.
  - **0003_cids.sql commit policy:** explicitly `.gitignore`'d; always regenerated by pin step.
  - **`deployBlock` recorded** in `base-sepolia.json`; used as `fromBlock` floor in wallet event-log scan.
  - **R2 manual step** called out in ADR Consequences.
  - **`queryClient` shared-instance constraint** noted in Phase 4.1.
