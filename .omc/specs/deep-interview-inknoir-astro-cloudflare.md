# Deep Interview Spec: INKNOIR — Astro + Cloudflare NFT Ecommerce

## Metadata
- Interview ID: di-inknoir-001
- Rounds: 5 (Topology Round 0 + 5 scoring rounds)
- Final Ambiguity Score: 18%
- Type: brownfield (prototype zip provided) → greenfield (new Astro repo)
- Generated: 2026-06-08
- Threshold: 0.20
- Threshold Source: default
- Initial Context Summarized: yes (handoff zip read, only relevant facts carried forward)
- Status: PASSED
- Spec Path: `.omc/specs/deep-interview-inknoir-astro-cloudflare.md`

## Clarity Breakdown
| Dimension | Score | Weight | Weighted |
|-----------|-------|--------|----------|
| Goal Clarity | 0.85 | 0.40 | 0.34 |
| Constraint Clarity | 0.80 | 0.30 | 0.24 |
| Success Criteria | 0.80 | 0.30 | 0.24 |
| **Total Clarity** | | | **0.82** |
| **Ambiguity** | | | **0.18 (18%)** |

## Topology

All 7 top-level components confirmed active in Round 0.

| Component | Status | Description | Coverage / Deferral Note |
|-----------|--------|-------------|--------------------------|
| Astro Frontend | active | Port INKNOIR React prototype to Astro pages/components, preserve visual design exactly | All 8 prototype screens visually ported; pixel-faithful match |
| Catalog & Data Layer | active | Designs + artists source-of-truth on Cloudflare D1; image assets on R2; ERC-721 metadata pinned to IPFS | D1 schema for artists/designs/status; R2 bucket for images; IPFS for tokenURI metadata JSON |
| Commerce Flow | active | Lazy-mint ERC-721 with EIP-712 voucher; Checkout → buyer signs mint tx paying ETH price + gas | One-of-one inventory locked at contract level (unique tokenId per design, no re-mint); Worker signer |
| Bookings | active | Booking screen submits to a Worker endpoint that emails the artist; persisted as inquiry rows in D1 | Form → Worker → D1 booking_inquiries table + email notification |
| Auth & Customer Accounts | active | Wallet-only auth (no email/password). Owned-collection read from chain via contract balanceOf/ownerOf | Wagmi + RainbowKit. Wallet screen shows owned tokens from chain |
| Cloudflare Infrastructure | active | Cloudflare Pages (Astro static + SSR via @astrojs/cloudflare); Workers for voucher signing + booking + metadata proxy; D1, R2, KV bindings | wrangler.toml with all bindings; live deploy attempted via Cloudflare MCP |
| Repo & CI | active | Git init, commit, push to github.com/Poom5741/tattoo-project on `main`. Cloudflare MCP attempts live deploy. | Single push to provided remote; deploy via MCP tools post-push |

## Goal

Build a production-grade Astro 5 project that pixel-faithfully recreates the INKNOIR React prototype as a one-of-one NFT marketplace for tattoo designs. Buyers connect a wallet, browse curated "plates" by 4 artists across 15 designs, and acquire any AVAILABLE design via a lazy-mint flow on **Base Sepolia testnet**: the Astro frontend requests an EIP-712 signed voucher from a Cloudflare Worker, the buyer signs the mint transaction in their wallet, and the ERC-721 token (one-of-one per design) is minted directly to their address while paying ETH. Owned tokens appear on the Wallet screen via on-chain reads. The Booking screen routes artist inquiries through a Worker into D1. All catalog data lives in Cloudflare D1, all images on Cloudflare R2 with a custom public domain, and all token metadata JSON is pinned to IPFS. The site deploys to Cloudflare Pages with @astrojs/cloudflare adapter and supporting Workers, with live deployment attempted via the Cloudflare MCP tools after the repo is pushed to github.com/Poom5741/tattoo-project.

## Constraints

- **Chain:** Base Sepolia (testnet). Chain ID 84532. No mainnet deploy in this scope.
- **Contract:** ERC-721 with lazy-mint via EIP-712 voucher. Solmate or OpenZeppelin base. Foundry preferred (Hardhat acceptable). One token per design (token_id encodes design.n). Mint reverts if token already exists.
- **Wallet stack:** Wagmi v2 + RainbowKit v2 + Viem. Base Sepolia configured as the only chain.
- **RPC:** Public Base Sepolia RPC primary; Cloudflare Worker can proxy/cache later (out of v1 scope unless trivial).
- **Auth:** Wallet-connect only. No email/password. SIWE not required for v1 (owned-collection is derived from on-chain reads, not from a session).
- **Frontend framework:** Astro 5 with `@astrojs/cloudflare` adapter, output `hybrid`. Static pages prerendered; `/api/*` routes SSR on Workers.
- **UI:** React 18 islands for the interactive screens (Market filters, DesignDetail acquire button, Checkout, Wallet, Booking form, TweaksPanel). Static content (Home hero, Footer, Nav shell) rendered at build time as `.astro`.
- **Design fidelity:** Pixel-faithful port of `INKNOIR.html` + `styles.css`. Same font stack (Bodoni Moda / Playfair / Spectral / Archivo / Space Mono / JetBrains Mono / IBM Plex), same `--accent` themes (bone/ember/jade), same texture overlays (grain/scanlines/hatch). TweaksPanel preserved and functional.
- **Catalog source:** D1 SQLite. Seed migration carries the 4 artists + 15 designs from `data.jsx` verbatim. Procedural SVG renderer (the `ink.jsx` `Plate` component) is ported to React so listings still render visually even without uploaded images. R2 holds optional override images per design.
- **Token metadata:** ERC-721 `tokenURI` returns an IPFS gateway URL. Metadata JSON is generated at admin-upload time and pinned via NFT.Storage or web3.storage (key in Worker Secrets). For v1, metadata can be auto-generated from the seed catalog at deploy time.
- **Bookings:** Worker route `POST /api/bookings` validates payload, inserts into D1 `booking_inquiries`, sends email via Resend or MailChannels. Email service key in Worker Secrets.
- **State:** localStorage cache for "drawn" (saved) ids stays for UX continuity; canonical owned-collection is on-chain.
- **Deployment surface:** Cloudflare Pages for the Astro app; a single Worker (or Pages Functions) for `/api/*`. D1 + R2 bindings live in `wrangler.toml`. Resources namespaced `inknoir-*` to avoid colliding with the 8 existing Workers in the account.
- **Secrets:** Voucher signer private key, NFT.Storage key, Resend/email key — all `wrangler secret put` only. Never committed.
- **Repo:** `git init` in `/Users/poom-work/codingZone/business/tattoo-project`. Remote: `https://github.com/Poom5741/tattoo-project.git`. Branch: `main`. Single initial push.
- **Live deploy:** Attempt via Cloudflare MCP tools (`d1_database_create`, `r2_bucket_create`, deploy Worker code, Pages project creation). Account has 8 existing Workers — must not modify them.

## Non-Goals

- Mainnet deployment (testnet only for this build).
- Email/password or social login.
- Real-money fiat checkout (Stripe/cards).
- Mobile app (responsive web only).
- Multi-language i18n.
- A full Admin/CMS UI (catalog seeded via migrations; admin operations via wrangler/CLI for v1).
- Per-design real image upload UI (images are optional override; default is the procedural SVG renderer).
- Custom-domain DNS configuration (deploy to `*.pages.dev` for v1; custom domain wiring deferred).
- GitHub Actions CI auto-deploy (deploy via MCP/manual wrangler for v1).
- Indexer / on-chain event ingestion service (read directly via Viem from RPC for v1).
- Multi-chain support.

## Acceptance Criteria

### Astro Frontend
- [ ] All 8 prototype screens exist as routes: `/` (Home), `/market`, `/design/[id]`, `/artists`, `/artist/[id]`, `/booking`, `/checkout/[id]`, `/wallet`.
- [ ] Visual diff against `INKNOIR.html` rendered locally is pixel-faithful (fonts, colors, spacing, textures, accent themes match).
- [ ] TweaksPanel toggles fontPair / texture / accent and applies CSS custom properties on `:root`.
- [ ] All `styles.css` rules ported (kept as a single CSS file or split into per-component scopes — visual output identical).
- [ ] `Plate` SVG renderer ported and produces the same procedural designs from the same seeds.

### Catalog & Data Layer
- [ ] D1 database `inknoir-catalog` created with tables: `artists`, `designs`, `booking_inquiries`.
- [ ] D1 seed migration inserts the 4 artists + 15 designs from `data.jsx` verbatim (id, name, handle, city, style, etc. for artists; n, title, artistId, style, price, status, placement, seed, token, minted, medium, sessions, drawn for designs).
- [ ] R2 bucket `inknoir-assets` created with public access for image overrides (optional).
- [ ] `/api/designs` and `/api/designs/[id]` Worker routes return D1-backed data.
- [ ] `/api/metadata/[tokenId]` Worker route returns ERC-721-compliant metadata JSON (referenced by `tokenURI` from the contract).

### Commerce Flow
- [ ] ERC-721 contract `InknoirPlates` deployed to Base Sepolia.
- [ ] Contract supports `mintWithVoucher(LazyMintVoucher voucher, bytes signature)` payable, validates EIP-712 signature against an authorized signer address, reverts if `tokenId` already exists, transfers ETH to artist (or platform) treasury.
- [ ] Worker route `POST /api/voucher` returns an EIP-712-signed `LazyMintVoucher{tokenId, designId, price, artistTreasury, expiry, buyer}` for a given design id (only if status=AVAILABLE in D1).
- [ ] Checkout screen: wallet connected → Acquire button → POST /api/voucher → wallet signs mint tx → tx confirmed → success toast → redirect to `/wallet`.
- [ ] D1 design status flips to `RESERVED` when a voucher is issued (with TTL); flips to `SOLD` once the contract `Transfer` event is observed (read-time check or post-confirm callback).

### Bookings
- [ ] Booking form posts to `POST /api/bookings` (artistId, name, contact, message, optional designId).
- [ ] Worker validates and inserts into `booking_inquiries` D1 table.
- [ ] Worker sends notification email to the artist's stored email via Resend/MailChannels.
- [ ] User sees success toast.

### Auth & Customer Accounts
- [ ] RainbowKit Connect button visible on every screen (in Nav).
- [ ] Wagmi configured for Base Sepolia only.
- [ ] Wallet screen fetches owned tokens for the connected address (Viem `readContract` `balanceOf` + iterated `tokenOfOwnerByIndex` or event log scan).
- [ ] Disconnected state on Checkout/Wallet shows "Connect wallet" prompt.

### Cloudflare Infrastructure
- [ ] `wrangler.toml` declares `[[d1_databases]]`, `[[r2_buckets]]`, vars, and a single `[ai]`-free Worker entry.
- [ ] `@astrojs/cloudflare` adapter installed, `output: 'hybrid'`, `prerender = true` on static pages, `false` on `/api/*` and dynamic checkout/design pages that read live data.
- [ ] Pages project `inknoir` created and deployed; live URL accessible.
- [ ] D1 + R2 + Worker secrets created in the account via MCP.

### Repo & CI
- [ ] `git init` in working dir, `.gitignore` excludes `node_modules`, `.env*`, `.wrangler`, `dist`, `out`, `.astro`, `_handoff/` (the prototype zip extraction), `cache`, `*.log`.
- [ ] Commit 1: initial scaffold (Astro app + contracts + worker + wrangler + README).
- [ ] `git remote add origin https://github.com/Poom5741/tattoo-project.git`, `git branch -M main`, `git push -u origin main` succeeds.
- [ ] README documents: prerequisites, install, dev, deploy, secrets, contract deploy, deploy-via-MCP transcript summary.

## Assumptions Exposed & Resolved

| Assumption | Challenge | Resolution |
|------------|-----------|------------|
| "Buyer is buying a service/booking" | Round 1: what is the buyer actually buying? | Resolved: **digital collectible (NFT)**. Service/booking is optional/separate. |
| "Use mainnet for production feel" | Round 2: which chain? | Resolved: **testnet only** (Base Sepolia). Mainnet explicitly out of scope. |
| "Use procedural SVG in production" | Round 3: where do images and metadata live? | Resolved: **R2 + D1 + IPFS**. Procedural SVG kept as default visual fallback; image override path provisioned via R2. |
| "Pre-mint all designs upfront" | Round 4: mint mechanic? | Resolved: **lazy mint with EIP-712 voucher**. Worker signs vouchers; buyer pays gas at mint. |
| "All 8 prototype screens must ship" | Round 4 contrarian: cut Booking/Wallet? | Resolved: keep all 8 — Booking as Worker-backed inquiry form, Wallet reads on-chain ownership. |
| "User deploys manually after push" | Round 5: deploy scope? | Resolved: **scaffold + push + attempt live deploy via Cloudflare MCP**. MCP access confirmed (8 existing Workers visible). |
| "localStorage is canonical for owned collection" | Implied by prototype | Resolved: on-chain is canonical; localStorage retained only for `drawn` (saved) UX cache. |

## Technical Context

### Brownfield findings (from handoff zip)
- `INKNOIR.html` loads React 18 UMD + Babel standalone + 8 `.jsx` files in order: `data → ink → ui → screens-1/2/3 → tweaks-panel → app`.
- `data.jsx`: 4 artists, 15 designs hardcoded; assigns to `window.{ARTISTS, DESIGNS, STYLES, STATUS, hash6}`.
- `app.jsx`: SCREENS map = `{home, market, design, artists, artist, booking, checkout, wallet}`; uses `localStorage` keys `inknoir_col` and `inknoir_book`; tweaks via `useTweaks` and CSS custom properties (`--font-display`, `--font-mono`, `--font-body`, `--accent`, `--ok`); textures via `<TextureLayer>` overlay.
- Fonts: Bodoni Moda, Playfair Display, Spectral, Archivo, IBM Plex Sans, Space Mono, JetBrains Mono, IBM Plex Mono.
- Accent presets: `bone` (#f4f1ea), `ember` (oklch ember), `jade` (oklch jade).

### Stack (decided)
- **Astro 5** + `@astrojs/cloudflare` adapter (`output: 'hybrid'`).
- **React 18** islands for interactive screens (`client:load` for wallet-sensitive components; `client:idle` for the rest).
- **Wagmi v2 + RainbowKit v2 + Viem** for wallet/chain.
- **Foundry** for the ERC-721 contract (Hardhat acceptable alternate).
- **Cloudflare D1** (catalog + bookings), **R2** (image assets), **Workers/Pages Functions** (`/api/*`).
- **NFT.Storage** (or web3.storage) for IPFS metadata pinning.
- **Resend** (or MailChannels) for artist email notification.

### Resource naming
All new Cloudflare resources prefixed `inknoir-` (e.g., `inknoir-catalog` D1, `inknoir-assets` R2, `inknoir` Pages project). Must not collide with existing 8 Workers in the account.

## Ontology (Key Entities — final round)

| Entity | Type | Fields | Relationships |
|--------|------|--------|---------------|
| Artist | core domain | id, name, handle, city, style, years, booked, rate, bio, pieces, rating, seed, email (new) | hasMany Design; hasMany BookingInquiry |
| Design | core domain | id, n, title, artistId, style, price, priceUsd, status, placement, seed, token, minted, medium, sessions, drawn, imageOverrideUrl (new), tokenId (new) | belongsTo Artist; hasOne TokenMetadata; mintedAs NFT |
| Buyer (Wallet) | core domain | address (EOA) | owns many Design (via on-chain `ownerOf`); creates BookingInquiry |
| Collection | derived | tokens owned by Wallet (read from chain) | derived from Design × Buyer |
| BookingInquiry | core domain | id, artistId, designId?, name, contact, message, createdAt | belongsTo Artist; optional belongsTo Design |
| TokenMetadata | supporting | name, description, image, attributes, external_url, ipfsCid | belongsTo Design (1:1) |
| MintVoucher | supporting | tokenId, designId, price, artistTreasury, expiry, buyer, signature | binds Design to Buyer for mint window |

## Ontology Convergence

| Round | Entity Count | New | Changed | Stable | Stability Ratio |
|-------|-------------|-----|---------|--------|-----------------|
| 1 | 5 | 5 | - | - | N/A |
| 2 | 5 | 0 | 0 | 5 | 100% |
| 3 | 6 | 1 (TokenMetadata) | 0 | 5 | 83% |
| 4 | 7 | 1 (MintVoucher) | 0 | 6 | 86% |
| 5 | 7 | 0 | 0 | 7 | 100% |

Domain model converged by Round 5. No drift across two consecutive rounds.

## Interview Transcript

<details>
<summary>Full Q&A (Round 0 topology + 5 scoring rounds)</summary>

### Round 0 — Topology Enumeration
**Q:** 7 top-level components proposed (Astro Frontend, Catalog & Data, Commerce, Bookings, Auth & Accounts, CF Infra, Repo & CI). Confirm topology?
**A:** Looks right — all 7 active.

### Round 1 — Commerce / Goal Clarity
**Q:** What is the buyer actually buying when they "acquire" a design?
**A:** Digital collectible (NFT).
**Ambiguity:** 60% (Goal: 0.55, Constraints: 0.30, Criteria: 0.30)

### Round 2 — Commerce + Auth / Constraints (chain & contract)
**Q:** Which chain and contract approach?
**A:** Testnet only (Sepolia/Base Sepolia). [Resolved default: Base Sepolia.]
**Ambiguity:** 46.5% (Goal: 0.70, Constraints: 0.50, Criteria: 0.35)

### Round 3 — Catalog + CF Infra / Constraints (asset pipeline)
**Q:** Where do design images and metadata live?
**A:** R2 (images) + D1 (catalog) + IPFS for token metadata.
**Ambiguity:** 38.5% (Goal: 0.75, Constraints: 0.70, Criteria: 0.35)

### Round 4 — Commerce / Success Criteria (mint mechanic) + Contrarian Mode
**Q (a):** What mint mechanic?
**A:** Lazy mint: buyer pays mint fee + gas.
**Q (b — contrarian):** Cut Booking/Wallet for v1?
**A:** Keep all 8 screens. Testnet mint flow + visually port everything.
**Ambiguity:** 30.5% (Goal: 0.80, Constraints: 0.65, Criteria: 0.60)

### Round 5 — Repo & CI + CF Infra / Success Criteria (deploy scope)
**Q:** Scaffold + push, you deploy / I attempt MCP deploy / GH Actions / Pages git integration?
**A:** Scaffold + push + I attempt live deploy via MCP.
**Verification:** Cloudflare MCP `workers_list` returned 8 existing Workers — account live and authenticated.
**Ambiguity:** 18% ✓ (Goal: 0.85, Constraints: 0.80, Criteria: 0.80)

</details>
