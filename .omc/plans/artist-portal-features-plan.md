# Artist Portal Features — Implementation Plan

**Plan ID:** artist-portal-features
**Created:** 2026-06-09
**Status:** CONSENSUS APPROVED — pending execution approval
**Complexity:** HIGH (cross-cutting: DB + smart contract + 10 API endpoints + 6 React components + chain migration)

---

## RALPLAN-DR Summary

### Principles (5)

1. **Brownfield-first** — Extend existing patterns (Astro SSR pages, D1 queries, KV sessions, Zod schemas) rather than introducing new frameworks or abstractions.
2. **Progressive delivery** — Each wave produces a shippable increment. Wave 1 must not break existing `/market`, `/design/:id`, or `/checkout/:id` flows.
3. **On-chain truth, off-chain convenience** — The smart contract is the source of truth for ownership and royalties. The DB is a read cache that gets reconciled.
4. **Minimal contract surface** — Keep the Solidity contract simple; push business logic (platform fees, payment splitting) to well-tested modifier patterns, not complex multi-call orchestration.
5. **One file per concern** — Each API endpoint is a single file under `src/pages/api/`. Each React island is a single file under `src/components/`. No shared state stores; pass data via SSR props.

### Decision Drivers (top 3)

1. **BSC chain migration risk** — The entire payment/voucher/confirm pipeline must change chains. This is the highest-risk cross-cutting concern.
2. **R2 write path** — Currently no upload API exists. The listing form is blocked until R2 write is wired.
3. **Smart contract rewrite** — ERC-2981, soulbound flag, USDT payment, and per-artist treasury require a new contract version, not a patch.

### Viable Options

#### Option A: New Contract + Parallel Deploy (RECOMMENDED)

Deploy a new `SuknidPlatesV2` contract on BSC that includes ERC-2981, soulbound flag, and USDT payment. The old Base Sepolia contract stays for existing minted tokens (if any). New listings use V2 only.

**Pros:**
- Clean separation; no migration of existing on-chain state needed
- Can use OpenZeppelin ERC721Royalty extension directly
- BSC deployment is independent of Base Sepolia

**Cons:**
- Two contract addresses to manage during transition
- Existing seed designs on Base Sepolia become orphaned (acceptable — they are test data)

#### Option B: Upgrade Existing Contract via Proxy (ERC-1967)

Deploy an upgradeable proxy on BSC, migrate existing token data.

**Pros:**
- Single contract address forever
- Future upgrades are simpler

**Cons:**
- Adds proxy complexity (ERC-1967 + initializer pattern)
- No existing mainnet tokens to preserve — over-engineering for current state
- Higher audit surface

**Decision:** Option A. The current contract is NOT deployed (`PUBLIC_CONTRACT_ADDRESS = "PLACEHOLDER_FILLED_BY_PHASE_3_DEPLOY"`). There are zero on-chain tokens to migrate. A clean V2 contract on BSC is simpler and lower-risk.

**Trade-off note (UUPS proxy):** A UUPS proxy was consciously rejected for V1 due to the added complexity when there is no on-chain state to preserve. If V3 requires in-place upgradability (e.g., post-mainnet with real tokens), UUPS should be revisited at that point.

#### Payment Integration: On-chain USDT Flow

**Option A: Contract accepts USDT via `transferFrom` (RECOMMENDED)**

Buyer approves USDT spending, contract calls `transferFrom` to split payment (artist - 3% fee, platform treasury gets 3%). Single transaction for buyer after approval.

**Pros:**
- Standard ERC-20 pattern, well-understood
- Atomic payment + mint in one tx
- Contract enforces fee split

**Cons:**
- Requires buyer to do 2 txs (approve + mint) on first purchase

**Option B: Off-chain USDT transfer, server verifies balance**

Buyer sends USDT to a holding address, server detects transfer, issues voucher.

**Pros:**
- Single tx for buyer

**Cons:**
- Race conditions, refund complexity, non-atomic
- Server must poll chain for incoming transfers

**Decision:** Option A. Standard ERC-20 approve+transferFrom. The two-step flow is well-understood in DeFi and the checkout UI already handles multi-step flows.

---

## ADR (Architectural Decision Record)

**Decision:** Build SuknidPlatesV2 on BSC with ERC-721 + ERC-2981 + soulbound flag + USDT BEP-20 payment. Deploy as a new contract (not proxy). PaySolution integration as a parallel off-chain path.

**Drivers:**
1. No existing on-chain state to preserve
2. BSC is a different chain than current Base Sepolia — migration is mandatory anyway
3. ERC-2981 requires storage changes incompatible with V1 layout

**Alternatives considered:**
- Proxy upgrade: rejected (no state to migrate, adds unnecessary complexity)
- UUPS proxy: consciously deferred — not needed for V1 with no on-chain state; V3 may require it if in-place upgradability becomes necessary post-mainnet
- Keep Base Sepolia: rejected (spec requires BSC)
- Native BNB payment: rejected (spec requires USDT BEP-20)

**Why chosen:** Lowest complexity path that satisfies all spec requirements. Clean-room contract on target chain.

**Consequences:**
- `wrangler.toml` PUBLIC_CHAIN_ID changes from 84532 to 56 (BSC mainnet) or 97 (BSC testnet)
- `src/lib/wagmi.ts` changes from `baseSepolia` to `bsc`
- `src/lib/config/contract.ts` gets new ABI with USDT + royalty + soulbound functions
- All viem chain references change throughout codebase
- PaySolution integration requires a new server-side payment verification flow
- **Platform fee increases from 2.5% (current `CheckoutFlow.tsx:59`) to 3%. This is a user-facing pricing change.**
- RPC env var naming: server-side secrets need to be renamed from `BASE_RPC_*` to `BSC_RPC_*` in the Cloudflare Pages dashboard

**Follow-ups:**
- BSC testnet (chain ID 97) for dev/staging, BSC mainnet (56) for production
- USDT contract address on BSC: `0x55d398326f99059fF775485246999027B3197955`
- **Note:** USDT on BSC uses 18 decimals (same as `parseEther`), unlike USDT on Ethereum/Tron which uses 6 decimals
- PaySolution API integration docs needed from provider
- IPFS pinning at mint time (deferred — not in this plan's scope, existing `nft.storage` dep handles it)

---

## Wave 1: Foundation (DB + Contract + R2 Upload + Chain Config)

**Goal:** All schema changes, the new smart contract, R2 upload capability, and BSC chain configuration are in place. No user-facing UI changes yet. Existing flows remain functional.

### Task 1.0: Fix Artist Cookie Path

**BLOCKER:** This task BLOCKS all artist-authenticated APIs in Waves 2-4. The current artist cookie has `Path=/artist`, which means it is NOT sent to `/api/*` endpoints. All artist session checks in API routes will fail without this fix.

**Modify:** `src/pages/api/auth/artist-login.ts` (line 77)
- Change `Path=/artist` to `Path=/`
- Add stale cookie expiry for old `Path=/artist` cookie (follow pattern from `src/pages/api/admin/login.ts:34-37` and commit `1531d58`)

Before:
```typescript
"Set-Cookie": `artist_token=${token}; Path=/artist; HttpOnly; SameSite=Lax; Max-Age=28800`,
```

After (using Headers to append multiple Set-Cookie):
```typescript
const headers = new Headers();
headers.set("Content-Type", "application/json");
// Set new cookie at Path=/
headers.append("Set-Cookie", `artist_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=28800`);
// Expire stale cookie at old Path=/artist
headers.append("Set-Cookie", "artist_token=; Path=/artist; HttpOnly; SameSite=Lax; Max-Age=0");
```

**Modify:** `src/pages/api/auth/artist-logout.ts`
- Update cookie path from `Path=/artist` to `Path=/`
- Also expire old `Path=/artist` cookie

**Acceptance criteria:**
- [ ] Artist cookie is set with `Path=/` on login
- [ ] Stale `Path=/artist` cookie is expired on login
- [ ] Logout clears both cookie paths
- [ ] Artist session is accessible from `/api/*` routes

### Task 1.1: Database Migration — `migrations/0005_artist_portal.sql`

**Create:** `migrations/0005_artist_portal.sql`

```sql
BEGIN;

-- D1 SQLite does not support ALTER COLUMN or modifying CHECK constraints.
-- Strategy: Add new columns with their own CHECK constraints.
-- The old status CHECK on 'designs' only covers ('available','reserved','sold','owned').
-- We cannot ALTER it. Instead, we drop the constraint by recreating the table.
-- BUT for safety and simplicity in brownfield, we use a pragmatic approach:
-- SQLite ignores CHECK on ALTER TABLE ADD COLUMN — so we add columns freely
-- and enforce new status values at the application layer + a trigger.

-- New columns on designs
ALTER TABLE designs ADD COLUMN selling_mode TEXT NOT NULL DEFAULT 'one-time';
ALTER TABLE designs ADD COLUMN royalty_pct REAL;
ALTER TABLE designs ADD COLUMN image_url TEXT;

-- New columns on booking_inquiries (buyer_wallet already added in 0004)
ALTER TABLE booking_inquiries ADD COLUMN status TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE booking_inquiries ADD COLUMN appointment_date INTEGER;

-- Backfill existing booking_inquiries rows that may have NULL status
UPDATE booking_inquiries SET status = 'pending' WHERE status IS NULL;

-- Resale listings table
CREATE TABLE IF NOT EXISTS resale_listings (
  id TEXT PRIMARY KEY,
  design_id TEXT NOT NULL REFERENCES designs(id),
  token_id INTEGER NOT NULL,
  seller_wallet TEXT NOT NULL,
  asking_price REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold', 'cancelled')),
  created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
  sold_at INTEGER,
  sold_tx_hash TEXT
);

CREATE INDEX IF NOT EXISTS idx_resale_status ON resale_listings(status);
CREATE INDEX IF NOT EXISTS idx_resale_design ON resale_listings(design_id);

-- Earnings tracking table
CREATE TABLE IF NOT EXISTS earnings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  artist_id TEXT NOT NULL REFERENCES artists(id),
  design_id TEXT NOT NULL REFERENCES designs(id),
  type TEXT NOT NULL,
  amount REAL NOT NULL,
  platform_fee REAL NOT NULL,
  tx_hash TEXT,
  payment_method TEXT,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);

CREATE INDEX IF NOT EXISTS idx_earnings_artist ON earnings(artist_id);

-- Application-level trigger to enforce new status values
CREATE TRIGGER IF NOT EXISTS trg_designs_status_check
BEFORE UPDATE OF status ON designs
BEGIN
  SELECT CASE
    WHEN NEW.status NOT IN ('available','reserved','sold','owned','pending','rejected','delisted')
    THEN RAISE(ABORT, 'Invalid design status')
  END;
END;

-- Application-level trigger to enforce selling_mode values
CREATE TRIGGER IF NOT EXISTS trg_designs_selling_mode_check
BEFORE INSERT ON designs
BEGIN
  SELECT CASE
    WHEN NEW.selling_mode NOT IN ('one-time','resellable')
    THEN RAISE(ABORT, 'Invalid selling_mode')
  END;
END;

-- Immutability trigger: selling_mode cannot be changed after creation
CREATE TRIGGER IF NOT EXISTS trg_designs_selling_mode_lock
BEFORE UPDATE OF selling_mode ON designs
BEGIN
  SELECT CASE
    WHEN OLD.selling_mode IS NOT NULL AND NEW.selling_mode != OLD.selling_mode
    THEN RAISE(ABORT, 'selling_mode cannot be changed after creation')
  END;
END;

INSERT OR IGNORE INTO _migrations VALUES (5, strftime('%s','now'));
COMMIT;
```

**Acceptance criteria:**
- [ ] Migration runs without error on local D1: `npx wrangler d1 execute suknid-catalog --local --file=migrations/0005_artist_portal.sql`
- [ ] Existing seed data is unaffected (all 15 designs retain current status/values)
- [ ] New columns exist: `designs.selling_mode` (NOT NULL, default 'one-time'), `designs.royalty_pct`, `designs.image_url`
- [ ] New columns exist: `booking_inquiries.status` (NOT NULL, default 'pending'), `booking_inquiries.appointment_date`
- [ ] Existing booking_inquiries rows have `status = 'pending'` after backfill
- [ ] Tables `resale_listings` and `earnings` are created
- [ ] `resale_listings.status` has CHECK constraint: must be 'active', 'sold', or 'cancelled'
- [ ] Trigger rejects invalid status values
- [ ] Trigger prevents `selling_mode` from being changed after creation

### Task 1.2: Smart Contract V2 — `contracts/src/SuknidPlatesV2.sol`

**Prerequisites:**
```bash
cd contracts && forge install OpenZeppelin/openzeppelin-contracts --no-commit && forge install foundry-rs/forge-std --no-commit
```

**Create:** `contracts/src/SuknidPlatesV2.sol`

Key changes from V1:
- Inherit `ERC721Royalty` (from OpenZeppelin) instead of plain `ERC721`
- Add `mapping(uint256 => bool) public soulbound` — set at mint, checked in `_update` override
- Accept USDT (BEP-20) via `IERC20.transferFrom` instead of native ETH `msg.value`
- Per-token royalty via `_setTokenRoyalty(tokenId, artist, royaltyBps)` at mint time
- Platform treasury address for the 3% fee split
- Updated voucher struct: add `soulbound` bool and `royaltyBps` uint96
- Resale support via `buyResale` function

```
SuknidPlatesV2 is ERC721, ERC2981, Ownable, ReentrancyGuard, EIP712
  - USDT address (immutable, set in constructor)
  - platformTreasury address (owner-settable)
  - platformFeeBps = 300 (3%)
  - mapping(uint256 => bool) soulbound
  - bool resaleEnabled (default false, owner-togglable via setResaleEnabled)

  mintWithVoucher(voucher, signature, cid):
    - verify signature, expiry, buyer
    - IERC20(usdt).transferFrom(buyer, address(this), voucher.price)
    - split: artistAmount = price - (price * 300 / 10000)
    - transfer artistAmount to voucher.artistTreasury
    - transfer remainder to platformTreasury
    - _safeMint
    - if voucher.soulbound: soulbound[tokenId] = true
    - _setTokenRoyalty(tokenId, voucher.artistTreasury, voucher.royaltyBps)
    - store CID

  buyResale(uint256 tokenId, uint256 price):
    - verify resaleEnabled flag (onlyOwner toggle)
    - verify caller is NOT current owner
    - verify token is NOT soulbound
    - IERC20(usdt).transferFrom(buyer, address(this), price)
    - (royaltyReceiver, royaltyAmount) = royaltyInfo(tokenId, price)
    - platformFee = price * 300 / 10000
    - sellerAmount = price - royaltyAmount - platformFee
    - transfer royaltyAmount to royaltyReceiver (artist)
    - transfer platformFee to platformTreasury
    - transfer sellerAmount to current ownerOf(tokenId)
    - safeTransferFrom(seller, buyer, tokenId)
    - emit ResalePurchase(tokenId, buyer, price)

  setResaleEnabled(bool enabled):
    - onlyOwner
    - resaleEnabled = enabled

  _update(to, tokenId, auth) override:
    - if soulbound[tokenId] && from != address(0): revert SOULBOUND
    - super._update(to, tokenId, auth)

  supportsInterface: override both ERC721 and ERC2981
```

**Also update:**
- `contracts/test/SuknidPlatesV2.t.sol` — new test file covering: mint with USDT, soulbound transfer revert, royalty info query, fee split verification, **resale purchase tests** (correct splits, soulbound revert, resaleEnabled guard, buyer-is-not-owner check)
- `contracts/script/DeployV2.s.sol` — deploy script for BSC

**Acceptance criteria:**
- [ ] `forge build` compiles without errors
- [ ] `forge test` passes all V2 tests (including resale tests)
- [ ] Soulbound tokens revert on `transferFrom` / `safeTransferFrom`
- [ ] `royaltyInfo(tokenId, salePrice)` returns correct artist address and royalty amount
- [ ] USDT is split correctly: artist gets (price - 3%), platform gets 3%
- [ ] `buyResale` correctly splits payment: royalty to artist, 3% to platform, remainder to seller
- [ ] `buyResale` reverts when `resaleEnabled` is false
- [ ] `buyResale` reverts when caller is current owner
- [ ] `buyResale` reverts when token is soulbound
- [ ] ERC-165 `supportsInterface` returns true for ERC-2981

### Task 1.3: BSC Chain Configuration

**Modify:** `wrangler.toml` (lines 19-23)

```toml
[vars]
PUBLIC_CHAIN_ID = "97"  # BSC Testnet (56 for mainnet)
PUBLIC_BSC_RPC_PRIMARY = "https://data-seed-prebsc-1-s1.binance.org:8545"
PUBLIC_BSC_RPC_FALLBACK = "https://data-seed-prebsc-2-s1.binance.org:8545"
PUBLIC_CONTRACT_ADDRESS = "PLACEHOLDER_FILLED_BY_DEPLOY"
PUBLIC_USDT_ADDRESS = "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd"  # BSC Testnet USDT
R2_PUBLIC_URL = "https://pub-7749af21c6f240d6b28a5f8b8711d8e3.r2.dev"
PRIVY_APP_ID = "cmq6cb76a00c20dif8ne3ubyx"
PUBLIC_PRIVY_APP_ID = "cmq6cb76a00c20dif8ne3ubyx"
```

**Note:** Server-side RPC secrets must be renamed from `BASE_RPC_*` to `BSC_RPC_*` in the Cloudflare Pages dashboard. These are not in `wrangler.toml` because they are secret bindings.

**Modify:** `src/lib/wagmi.ts`
- Replace `baseSepolia` import with `bsc` (or `bscTestnet`) from `viem/chains`
- Update transport RPCs

**Modify:** `src/lib/config/contract.ts`
- `CHAIN_ID = 97` (BSC testnet) or `56` (mainnet)
- Update `CONTRACT_ABI` to include new V2 functions: `mintWithVoucher` (updated struct), `soulbound(uint256)`, `royaltyInfo(uint256,uint256)`, `buyResale(uint256,uint256)`
- Add `USDT_ADDRESS` export

**Modify:** `src/components/WalletProvider.tsx` (line 5, 18-19)
- Replace `baseSepolia` with BSC chain
- Update `defaultChain` and `supportedChains`

**Modify:** `src/pages/api/voucher.ts` (lines 6, 77-85, 144-148)
- Replace `baseSepolia` chain reference with BSC
- Update voucher struct to include `soulbound` and `royaltyBps` fields
- Change from `msg.value` payment to USDT `transferFrom` pattern (remove `value` from contract call)

**Modify:** `src/pages/api/confirm.ts` (lines 6, 66-69)
- Replace `baseSepolia` with BSC chain

**Modify:** `src/components/CheckoutFlow.tsx` (lines 109, 209-211)
- Update chain switch label from "Base Sepolia" to "BSC"
- Add USDT approval step before mint

**Acceptance criteria:**
- [ ] `import.meta.env.PUBLIC_CHAIN_ID` resolves to BSC chain ID
- [ ] WalletProvider uses BSC chain
- [ ] Voucher API signs typed data with BSC chain ID
- [ ] CheckoutFlow prompts switch to BSC (not Base Sepolia)

### Task 1.4: R2 Upload API — `src/pages/api/upload.ts`

**Create:** `src/pages/api/upload.ts`

Pattern: Follow existing API file patterns (Astro APIRoute, structured logging, error handling).

```typescript
// POST /api/upload
// Auth: artist session required (KV token from cookie)
// Body: multipart/form-data with 'file' field
// Response: { url: string, key: string }

// Steps:
// 1. Verify artist session via getArtistSession()
// 2. Validate file: type (image/jpeg, image/png, image/webp), size (< 10MB)
// 3. Generate key: `designs/${artistId}/${uuid}.${ext}`
// 4. env.MEDIA.put(key, file.stream(), { httpMetadata: { contentType } })
// 5. Return R2 public URL
```

**Acceptance criteria:**
- [ ] Unauthenticated requests return 401
- [ ] Non-image files return 400
- [ ] Files > 10MB return 400
- [ ] Successful upload returns `{ url, key }` where URL is `${R2_PUBLIC_URL}/${key}`
- [ ] File is accessible via the returned URL

### Task 1.5: Zod Schema Updates — `src/lib/api/schemas.ts`

**Modify:** `src/lib/api/schemas.ts`

Add new schemas:

```typescript
// Update DesignSchema status enum to include new values
status: z.enum(["available", "reserved", "sold", "owned", "pending", "rejected", "delisted"])

// Add new schemas
export const CreateDesignSchema = z.object({
  title: z.string().min(1).max(200),
  style: z.string().min(1).max(100),
  price_usdt: z.number().positive(),
  placement: z.string().min(1).max(200),
  medium: z.string().min(1).max(200),
  selling_mode: z.enum(["one-time", "resellable"]),
  royalty_pct: z.number().min(5).max(15).optional(),  // required if resellable
  image_key: z.string().min(1),  // R2 object key from upload
}).refine(
  (d) => d.selling_mode === "one-time" || (d.royalty_pct !== undefined),
  { message: "royalty_pct required for resellable designs", path: ["royalty_pct"] }
);

export const ReviewDesignSchema = z.object({
  designId: z.string().min(1),
  action: z.enum(["approve", "reject"]),
});

export const ResaleListingSchema = z.object({
  designId: z.string().min(1),
  tokenId: z.number().int().positive(),
  askingPrice: z.number().positive(),
  sellerWallet: HexAddress,
});

export const BookingActionSchema = z.object({
  action: z.enum(["accept", "decline"]),
  appointmentDate: z.number().int().optional(),  // required if accept
}).refine(
  (d) => d.action === "decline" || d.appointmentDate !== undefined,
  { message: "appointmentDate required when accepting", path: ["appointmentDate"] }
);
```

**Acceptance criteria:**
- [ ] `CreateDesignSchema` rejects resellable designs without royalty_pct
- [ ] `CreateDesignSchema` accepts one-time designs without royalty_pct
- [ ] `BookingActionSchema` rejects accept without appointmentDate
- [ ] All new schemas export types

---

## Wave 2: Core Features (Listing Form, Admin Review, Portal Updates)

**Goal:** Artists can create listings, admin can review them, and the artist portal shows all new statuses and data. Depends on Wave 1 (DB schema, R2 upload, schemas).

### Task 2.1: Create Design API — `src/pages/api/designs/create.ts`

**Create:** `src/pages/api/designs/create.ts`

```typescript
// POST /api/designs/create
// Auth: artist session required
// Body: JSON matching CreateDesignSchema
// Steps:
// 1. Verify artist session
// 2. Validate body with CreateDesignSchema
// 3. Generate design ID (uuid)
// 4. Generate next 'n' value: SELECT MAX(CAST(n AS INTEGER)) FROM designs
// 5. Build image_url from R2_PUBLIC_URL + image_key
// 6. INSERT into designs with status='pending', selling_mode, royalty_pct, image_url
//    Store USDT price in the `price` column (REAL type).
//    NOTE: Do NOT use `price_usd` (INTEGER type) — it would truncate decimal values.
// 7. Return { id, status: 'pending' }
```

**Price storage clarification:** The `price` column (REAL type) stores the USDT amount directly. The `price_usd` column (INTEGER type) is for legacy ETH-era USD estimates and would truncate decimal values. All new designs must use the `price` column for USDT amounts.

**Acceptance criteria:**
- [ ] Unauthenticated requests return 401
- [ ] Valid submission creates design with `status='pending'`
- [ ] Design `selling_mode` is stored and cannot be changed after creation
- [ ] `royalty_pct` is stored when `selling_mode='resellable'`
- [ ] `image_url` is correctly constructed from R2 key
- [ ] USDT price is stored in the `price` column (REAL), NOT `price_usd` (INTEGER)

### Task 2.2: Edit Design API — `src/pages/api/designs/[id]/edit.ts`

**Create:** `src/pages/api/designs/[id]/edit.ts`

```typescript
// PUT /api/designs/[id]/edit
// Auth: artist session required, must own the design
// Body: Partial CreateDesignSchema (cannot change selling_mode)
// Pre-condition: design status must be 'rejected'
// Steps:
// 1. Verify artist session
// 2. Verify design belongs to this artist AND status = 'rejected'
// 3. Update allowed fields (title, style, price, placement, medium, image_key, royalty_pct)
// 4. Set status back to 'pending'
// 5. Return { id, status: 'pending' }
```

**Acceptance criteria:**
- [ ] Only the owning artist can edit
- [ ] Only 'rejected' designs can be edited
- [ ] `selling_mode` cannot be changed
- [ ] Edited design returns to 'pending' status

### Task 2.3: Delist Design API — `src/pages/api/designs/[id]/delist.ts`

**Create:** `src/pages/api/designs/[id]/delist.ts`

```typescript
// DELETE /api/designs/[id]/delist
// Auth: artist session required, must own the design
// Pre-condition: design status must be 'available' (unsold)
// Steps:
// 1. Verify artist session
// 2. Verify design belongs to this artist AND status = 'available'
// 3. UPDATE designs SET status = 'delisted' WHERE id = ?
// 4. Return { id, status: 'delisted' }
```

**Acceptance criteria:**
- [ ] Only the owning artist can delist
- [ ] Only 'available' designs can be delisted
- [ ] Delisted designs no longer appear on `/market`

### Task 2.4: Admin Review API — `src/pages/api/admin/review-design.ts`

**Create:** `src/pages/api/admin/review-design.ts`

```typescript
// POST /api/admin/review-design
// Auth: admin session required (isAdminAuthed)
// Body: ReviewDesignSchema { designId, action: 'approve'|'reject' }
// Steps:
// 1. Verify admin auth
// 2. Validate body
// 3. Verify design exists AND status = 'pending'
// 4. If approve: UPDATE status = 'available'
//    If reject: UPDATE status = 'rejected'
// 5. Return { designId, newStatus }
```

**Acceptance criteria:**
- [ ] Unauthenticated requests return 401
- [ ] Only 'pending' designs can be reviewed
- [ ] Approve sets status to 'available'
- [ ] Reject sets status to 'rejected'

### Task 2.5: Admin Pending Designs API — `src/pages/api/admin/pending-designs.ts`

**Create:** `src/pages/api/admin/pending-designs.ts`

```typescript
// GET /api/admin/pending-designs
// Auth: admin session required
// Returns: array of pending designs with artist name and image preview
```

**Acceptance criteria:**
- [ ] Returns only designs with `status='pending'`
- [ ] Each design includes `image_url` and artist name

### Task 2.6: NewDesignForm Component — `src/components/NewDesignForm.tsx`

**Create:** `src/components/NewDesignForm.tsx`

React island component with:
- File input for photo (drag-and-drop optional, click-to-upload required)
- Preview thumbnail after upload (upload to R2 immediately via `/api/upload`)
- Text fields: title, style (dropdown from ALL_STYLES), placement, medium
- Price field in USDT (numeric input)
- Selling mode radio: "One-time (soulbound)" / "Resellable"
- Conditional royalty slider (5-15%) when resellable is selected
- Info text explaining soulbound vs resellable, with "this cannot be changed" warning
- Submit button posting to `/api/designs/create`
- Success/error states

**Acceptance criteria:**
- [ ] Photo uploads to R2 and shows preview
- [ ] Royalty slider only visible when "resellable" is selected
- [ ] Validation prevents submission without required fields
- [ ] Successful submission shows confirmation with "pending review" message
- [ ] Form follows existing design system (CSS variables: `--ink-800`, `--line`, `--fg-dim`, etc.)

### Task 2.7: Admin Pending Review Panel — `src/components/AdminPendingReview.tsx`

**Create:** `src/components/AdminPendingReview.tsx`

React island component (loaded on `/admin/index.astro`) with:
- List of pending designs with image thumbnail, title, artist, price, selling mode, royalty %
- Approve button (green) and Reject button (red) per design
- Optimistic UI update on action
- Uses fetch to `/api/admin/review-design`

**Acceptance criteria:**
- [ ] Shows all pending designs
- [ ] Approve/reject buttons call the API and update the list
- [ ] Empty state shows "No pending designs"
- [ ] Follows admin dashboard table styling (`.tbl`, `.sec` classes)

### Task 2.8: Update Artist Portal Page — `src/pages/artist/portal.astro`

**Modify:** `src/pages/artist/portal.astro`

Changes:
- Add "List new design" button above the plates table (links to modal/section with `NewDesignForm`)
- Update stats grid: add "Pending" count, "Earnings" total
- Update plates table: add columns for `selling_mode`, `image_url` thumbnail, show new statuses (pending, rejected, delisted)
- **Update price display from ETH to USDT** throughout the portal
- Add status-based action buttons in table rows:
  - `rejected` row: "Edit & Resubmit" link
  - `available` row: "Delist" button
- Add `NewDesignForm` as `client:visible` React island
- Update D1 query to SELECT the new columns

**Acceptance criteria:**
- [ ] "List new design" button is visible and opens the form
- [ ] Stats show pending count
- [ ] Table shows selling_mode and image thumbnail
- [ ] **Prices are displayed in USDT, not ETH**
- [ ] Rejected designs show "Edit & Resubmit" action
- [ ] Available designs show "Delist" action
- [ ] New statuses (pending, rejected, delisted) have appropriate tag styling

### Task 2.9: Update Admin Dashboard — `src/pages/admin/index.astro`

**Modify:** `src/pages/admin/index.astro`

Changes:
- Add "Pending review" section between stats and bookings (with `AdminPendingReview` React island)
- Add "Pending" stat to the stats grid (making it 5 columns)
- Update "All plates" table to show new statuses
- Pass pending designs as SSR props to AdminPendingReview (or let the component fetch on mount)

**Acceptance criteria:**
- [ ] Pending review section is visible with approve/reject functionality
- [ ] Stats grid shows pending count
- [ ] All plates table shows new status values correctly

---

## Wave 3: Marketplace Updates & Payment Integration

**Goal:** The marketplace displays listings with real images, checkout supports USDT payment on BSC, and earnings are tracked. Depends on Wave 2 (designs can be created/approved).

### Task 3.1: Update Marketplace Page — `src/pages/market.astro`

**Modify:** `src/pages/market.astro` (line 17)

Update D1 query to exclude non-marketplace statuses:
```sql
SELECT * FROM designs WHERE status IN ('available', 'reserved', 'sold') ORDER BY token_id ASC
```

Also query resale_listings to merge into the marketplace:
```sql
SELECT rl.*, d.title, d.style, d.placement, d.image_url, d.selling_mode, d.royalty_pct, a.name as artist_name
FROM resale_listings rl
JOIN designs d ON rl.design_id = d.id
JOIN artists a ON d.artist_id = a.id
WHERE rl.status = 'active'
```

Pass both arrays to MarketGrid.

**Acceptance criteria:**
- [ ] Pending, rejected, and delisted designs do NOT appear on `/market`
- [ ] Resale listings appear alongside primary listings

### Task 3.2: Update MarketGrid Component — `src/components/MarketGrid.tsx`

**Modify:** `src/components/MarketGrid.tsx`

Changes:
- Accept `resaleListings` prop alongside `designs`
- Add "resale" tag on resale listing cards
- Show real image (`image_url`) instead of Plate component when available
- Show price in USDT instead of ETH
- Add filter option for "Primary" / "Resale" / "All"
- Show selling mode badge (soulbound icon or resellable icon)

**Acceptance criteria:**
- [ ] Cards show uploaded photo when `image_url` is present, fall back to Plate component when absent
- [ ] Resale listings have a "resale" badge/tag
- [ ] Filter allows toggling between primary and resale listings
- [ ] Prices display as USDT, not ETH

### Task 3.3: Update Design Detail Page — `src/pages/design/[id].astro`

**Modify:** `src/pages/design/[id].astro`

Changes:
- Show real image when `image_url` is present (lines 86-87: replace Plate component conditionally)
- Show price in USDT, not ETH (line 111)
- Show selling mode info (soulbound / resellable with royalty %)
- Add "List for resale" button if:
  1. Design status is 'sold'
  2. Connected wallet owns the NFT (check via on-chain `ownerOf`)
  3. Design selling_mode is 'resellable'
- This button requires a React island (`ResaleButton` component) for wallet interaction
- Show resale listings for this design below the main card

**Acceptance criteria:**
- [ ] Real photos display when available
- [ ] Price shown in USDT
- [ ] "List for resale" button only appears for eligible NFT owners
- [ ] Soulbound designs do NOT show resale option

### Task 3.4: Update CheckoutFlow for USDT — `src/components/CheckoutFlow.tsx`

**Modify:** `src/components/CheckoutFlow.tsx`

Changes:
- Replace ETH payment with USDT (BEP-20) approval + mint flow:
  1. Step 1: Approve USDT spending (`useWriteContract` for USDT `approve`)
  2. Step 2: Call `mintWithVoucher` (no `value` field — payment is via USDT transfer)
- Update price display from ETH to USDT
- Show platform fee as 3% (not 2.5%)
- Update voucher request to include `selling_mode` and `royalty_pct`
- Add PaySolution alternative button (links to off-chain flow)

**Acceptance criteria:**
- [ ] Checkout prompts USDT approval before minting
- [ ] Price displayed in USDT
- [ ] Platform fee shown as 3%
- [ ] PaySolution button visible (can be stub initially)
- [ ] Successful mint updates design status to 'sold'

### Task 3.5: Update Voucher API for V2 — `src/pages/api/voucher.ts`

**Modify:** `src/pages/api/voucher.ts`

Changes:
- Update voucher struct to include `soulbound` (bool) and `royaltyBps` (uint96) from design record
- Sign with BSC chain ID
- Remove `value` field from response (no native ETH payment)
- Fetch `selling_mode` and `royalty_pct` from designs table alongside existing fields
- **Per-artist treasury:** Replace `env.ARTIST_TREASURY_ADDR ?? zeroAddress` with a DB lookup: `SELECT wallet_address FROM artists WHERE id = ?` using the design's `artist_id`. Reject voucher generation with 500 if the artist has no `wallet_address` set. Pass the artist's wallet as `voucher.artistTreasury` to the contract.

**Acceptance criteria:**
- [ ] Voucher includes soulbound flag based on design selling_mode
- [ ] Voucher includes royaltyBps = royalty_pct * 100 (e.g., 10% -> 1000 bps)
- [ ] `artistTreasury` in voucher is the artist's actual wallet_address from the DB (not a hardcoded env var)
- [ ] Returns 500 if artist has no wallet_address
- [ ] Signature validates against V2 contract

### Task 3.6: Update Confirm API + Earnings Tracking — `src/pages/api/confirm.ts`

**Modify:** `src/pages/api/confirm.ts`

Changes:
- Use BSC chain for transaction verification
- After confirming mint, INSERT into `earnings` table:
  - `artist_id` from design
  - `type = 'primary_sale'`
  - `amount = price - (price * 0.03)`
  - `platform_fee = price * 0.03`
  - `tx_hash`, `payment_method = 'on_chain'`

**Acceptance criteria:**
- [ ] Earnings record created on successful primary sale
- [ ] Correct platform fee calculation (3%)
- [ ] Artist receives correct net amount in earnings record

### Task 3.7: PaySolution Integration — `src/pages/api/paysolution/`

**Create:** `src/pages/api/paysolution/create-order.ts` and `src/pages/api/paysolution/webhook.ts`

This is the off-chain payment alternative. The exact API depends on PaySolution's integration docs.

General flow:
1. `POST /api/paysolution/create-order` — creates payment order, returns payment URL/QR
2. PaySolution calls `POST /api/paysolution/webhook` on payment confirmation
3. Webhook verifies signature, triggers mint (server-side voucher + relay transaction)

**Acceptance criteria:**
- [ ] Create-order returns a PaySolution payment link
- [ ] Webhook correctly verifies PaySolution's callback signature
- [ ] Successful payment triggers the same mint + earnings flow as on-chain
- [ ] Idempotent: duplicate webhooks don't double-mint

---

## Wave 4: Secondary Market & Booking Calendar

**Goal:** NFT holders can resell, booking calendar is functional, and earnings dashboard is complete. Depends on Wave 3 (marketplace works, payments flow through).

### Task 4.1: Resale Listing API — `src/pages/api/resale/create.ts`

**Create:** `src/pages/api/resale/create.ts`

```typescript
// POST /api/resale/create
// Auth: none (wallet ownership verified on-chain)
// Body: ResaleListingSchema { designId, tokenId, askingPrice, sellerWallet }
// Steps:
// 1. Validate body
// 2. Verify design exists, status = 'sold', selling_mode = 'resellable'
// 3. Verify on-chain: ownerOf(tokenId) == sellerWallet
// 4. Check no existing active resale listing for this design
// 5. INSERT into resale_listings with status = 'active'
// 6. Return { id, status: 'active' }
```

**Acceptance criteria:**
- [ ] Soulbound designs are rejected with 400
- [ ] Non-owner wallets are rejected with 403
- [ ] Duplicate active listings are rejected with 409
- [ ] Valid listing goes live immediately (no admin approval)

### Task 4.2: Resale Purchase Flow — `src/pages/api/resale/buy.ts`

**Create:** `src/pages/api/resale/buy.ts`

```typescript
// POST /api/resale/buy
// Steps:
// 1. Verify resale listing exists and is active
// 2. Create voucher for resale purchase (different from primary — this is a transfer + payment)
// 3. The actual transfer happens on-chain via the contract's buyResale function
// 4. On confirmation:
//    - Seller receives (askingPrice - 3% platform fee - royalty%)
//    - Artist receives royalty%
//    - Platform receives 3%
//    - INSERT earnings record for artist (type = 'royalty')
//    - UPDATE resale_listing status = 'sold'
```

NOTE: Resale purchases use the contract's `buyResale(tokenId, price)` function which handles USDT splitting atomically. The seller must have approved the contract to transfer the NFT.

**Acceptance criteria:**
- [ ] Buyer pays asking price in USDT
- [ ] Seller receives correct net amount
- [ ] Artist receives royalty (5-15%)
- [ ] Platform receives 3%
- [ ] Earnings record created with type='royalty'
- [ ] Resale listing marked as sold

### Task 4.3: Resale Listing Cancellation API — `DELETE /api/resale/[id]`

**Create:** `src/pages/api/resale/[id].ts`

```typescript
// DELETE /api/resale/[id]
// Auth: none (wallet ownership verified on-chain)
// Steps:
// 1. Verify resale listing exists and status = 'active'
// 2. Verify on-chain: ownerOf(tokenId) == caller wallet (passed in body or query)
// 3. UPDATE resale_listings SET status = 'cancelled' WHERE id = ?
// 4. Return { id, status: 'cancelled' }
```

**Acceptance criteria:**
- [ ] Only the current NFT owner can cancel
- [ ] Only 'active' listings can be cancelled
- [ ] Cancelled listing no longer appears on marketplace
- [ ] Design remains in 'sold' status (unchanged)

### Task 4.4: ResaleButton Component — `src/components/ResaleButton.tsx`

**Create:** `src/components/ResaleButton.tsx`

React island component for `/design/:id` page:
- Checks if connected wallet owns the NFT (via `useReadContract` for `ownerOf`)
- Shows "List for resale" button if owner + resellable
- On click: opens price input modal
- Submits to `/api/resale/create`
- Shows confirmation on success

**Acceptance criteria:**
- [ ] Only visible to NFT owner of resellable designs
- [ ] Price input validates as positive number
- [ ] Successful listing shows confirmation message
- [ ] Non-owners see nothing (not an error state)

### Task 4.5: Booking Calendar Component — `src/components/BookingCalendar.tsx`

**Create:** `src/components/BookingCalendar.tsx`

React island component for artist portal:
- Monthly grid view (7 columns x 4-6 rows)
- Navigation: previous/next month arrows
- Dot indicators on dates:
  - Blue dot: pending inquiry
  - Green dot: accepted appointment
  - Red dot: declined inquiry
- Click on date: expand detail panel below calendar showing:
  - List of inquiries/appointments for that date
  - Each inquiry shows: name, contact, message, design reference
  - Action buttons: "Accept" (opens date picker for appointment date) / "Decline"
- Accept calls `PUT /api/bookings/[id]/accept` with chosen appointment date
- Decline calls `PUT /api/bookings/[id]/decline`

**Acceptance criteria:**
- [ ] Monthly grid renders correctly with proper day alignment
- [ ] Dots appear on dates with inquiries/appointments
- [ ] Clicking a date shows the detail panel
- [ ] Accept action prompts for appointment date and creates appointment dot
- [ ] Decline action updates inquiry status
- [ ] Month navigation works correctly

### Task 4.6: Booking Action APIs

**Create:** `src/pages/api/bookings/[id]/accept.ts`

```typescript
// PUT /api/bookings/[id]/accept
// Auth: artist session required, must own the booking
// Body: { appointmentDate: number } (unix timestamp, date only)
// Steps:
// 1. Verify artist session
// 2. Verify booking belongs to this artist AND status = 'pending'
// 3. UPDATE booking_inquiries SET status = 'accepted', appointment_date = ?
// 4. Return { id, status: 'accepted', appointmentDate }
```

**Create:** `src/pages/api/bookings/[id]/decline.ts`

```typescript
// PUT /api/bookings/[id]/decline
// Auth: artist session required, must own the booking
// Steps:
// 1. Verify artist session
// 2. Verify booking belongs to this artist AND status = 'pending'
// 3. UPDATE booking_inquiries SET status = 'declined'
// 4. Return { id, status: 'declined' }
```

**Acceptance criteria:**
- [ ] Only the owning artist can accept/decline
- [ ] Only 'pending' bookings can be acted upon
- [ ] Accepted bookings store the appointment date
- [ ] Declined bookings are marked as declined

### Task 4.7: Artist Earnings API + Dashboard

**Create:** `src/pages/api/artist/earnings.ts`

```typescript
// GET /api/artist/earnings
// Auth: artist session required
// Returns:
// {
//   totalPrimary: number,
//   totalRoyalties: number,
//   totalEarnings: number,
//   recentTransactions: Earning[]
// }
// Query: SELECT from earnings WHERE artist_id = ?
```

**Create:** `src/components/EarningsDashboard.tsx`

React island component for artist portal:
- Summary cards: Total primary sales, Total royalties, Combined total
- Recent transactions table: date, design, type (sale/royalty), amount, tx hash link
- All amounts in USDT

**Acceptance criteria:**
- [ ] Shows correct totals for primary sales and royalties
- [ ] Recent transactions list shows all earnings with type indicator
- [ ] Transaction hashes link to BSCScan
- [ ] Empty state shows "No earnings yet"

### Task 4.8: Update Artist Portal with Calendar + Earnings

**Modify:** `src/pages/artist/portal.astro`

Changes (on top of Wave 2 modifications):
- Replace the flat bookings table with `BookingCalendar` React island
- Add `EarningsDashboard` React island section
- Pass booking data as props (SSR) to BookingCalendar
- Pass artist ID as prop to EarningsDashboard (fetches on mount)

**Acceptance criteria:**
- [ ] Booking calendar replaces flat table
- [ ] Earnings dashboard shows below the plates section
- [ ] All sections load correctly with SSR data

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| BSC chain config breaks existing checkout flow | HIGH | HIGH | Wave 1 changes chain config atomically; test all existing flows against BSC testnet before moving to Wave 2 |
| D1 SQLite CHECK constraint cannot be ALTERed | MEDIUM | MEDIUM | Use application-layer triggers (in migration 0005) instead of modifying existing CHECK |
| R2 CORS/public access issues | MEDIUM | LOW | Verify R2 bucket public access settings; `R2_PUBLIC_URL` already configured in wrangler.toml |
| Smart contract USDT integration has approval UX friction | LOW | MEDIUM | Show clear 2-step flow in CheckoutFlow UI; consider infinite approval option |
| Resale mechanics require separate marketplace contract | MEDIUM | HIGH | V2 contract includes `buyResale` function for atomic resale; no separate marketplace contract needed |
| PaySolution API docs unavailable | MEDIUM | MEDIUM | Implement as a stub (create-order returns placeholder) in Wave 3; fill in when docs arrive |
| Artist cookie `Path=/artist` blocks API calls to `/api/` endpoints | HIGH | HIGH | **Fixed in Task 1.0.** Cookie path widened to `/` and stale cookie expired, following the admin fix pattern (commit `1531d58`) |

---

## Verification Steps

### Per-Wave Smoke Tests

**Wave 1:**
1. Verify artist cookie fix: login as artist, confirm cookie has `Path=/`, confirm API routes receive the cookie
2. Run migration on local D1: `npx wrangler d1 execute suknid-catalog --local --file=migrations/0005_artist_portal.sql`
3. Verify existing seed data unaffected: `SELECT count(*) FROM designs WHERE status = 'available'` should return 9
4. Verify `selling_mode` immutability trigger: attempt UPDATE should fail
5. Forge build + test pass for V2 contract (including resale tests)
6. Upload a test image via `/api/upload` with valid artist session

**Wave 2:**
1. Artist login -> portal -> "List new design" -> fill form -> submit -> see "pending" in table
2. Admin login -> dashboard -> see pending design -> approve -> verify it appears on `/market`
3. Admin reject -> artist sees "rejected" -> edit and resubmit -> goes back to "pending"
4. Artist delists an available design -> verify it disappears from `/market`

**Wave 3:**
1. Browse `/market` -> see designs with real images and USDT prices
2. Checkout flow -> approve USDT -> mint -> NFT on BSC -> design status 'sold'
3. Earnings record exists in `earnings` table after sale
4. PaySolution button visible (even if stub)
5. Verify voucher uses artist's actual wallet_address from DB (not env var)

**Wave 4:**
1. Own a resellable NFT -> go to `/design/:id` -> see "List for resale" -> set price -> listing appears on `/market` with resale tag
2. Cancel a resale listing -> verify it disappears from marketplace
3. Soulbound NFT -> no resale button visible
4. Booking calendar shows dots on correct dates
5. Accept inquiry -> choose date -> appointment dot appears
6. Earnings dashboard shows primary sale + royalty breakdown

### Integration Verification
- [ ] End-to-end: Artist lists -> Admin approves -> Buyer purchases via USDT -> Artist sees earnings
- [ ] End-to-end: Buyer resells -> Artist receives royalty -> Platform receives fee
- [ ] Soulbound guard: Soulbound NFT transfer reverts on-chain
- [ ] ERC-2981: External marketplace can query `royaltyInfo` and get correct values
- [ ] Resale cancellation: seller can cancel active listing, cancelled listings don't appear on market

---

## File Inventory

### New Files (16)
| File | Wave | Purpose |
|------|------|---------|
| `migrations/0005_artist_portal.sql` | 1 | Schema changes |
| `contracts/src/SuknidPlatesV2.sol` | 1 | New smart contract |
| `contracts/test/SuknidPlatesV2.t.sol` | 1 | Contract tests |
| `contracts/script/DeployV2.s.sol` | 1 | BSC deploy script |
| `src/pages/api/upload.ts` | 1 | R2 image upload |
| `src/pages/api/designs/create.ts` | 2 | Create design listing |
| `src/pages/api/designs/[id]/edit.ts` | 2 | Edit rejected design |
| `src/pages/api/designs/[id]/delist.ts` | 2 | Delist unsold design |
| `src/pages/api/admin/review-design.ts` | 2 | Approve/reject pending designs |
| `src/pages/api/admin/pending-designs.ts` | 2 | List pending designs |
| `src/pages/api/bookings/[id]/accept.ts` | 4 | Accept booking inquiry |
| `src/pages/api/bookings/[id]/decline.ts` | 4 | Decline booking inquiry |
| `src/pages/api/artist/earnings.ts` | 4 | Artist earnings data |
| `src/pages/api/resale/create.ts` | 4 | Create resale listing |
| `src/pages/api/resale/[id].ts` | 4 | Cancel resale listing |
| `src/pages/api/resale/buy.ts` | 4 | Purchase resale listing |
| `src/pages/api/paysolution/create-order.ts` | 3 | PaySolution order |
| `src/pages/api/paysolution/webhook.ts` | 3 | PaySolution callback |

### New Components (5)
| File | Wave | Purpose |
|------|------|---------|
| `src/components/NewDesignForm.tsx` | 2 | Artist listing form |
| `src/components/AdminPendingReview.tsx` | 2 | Admin review panel |
| `src/components/BookingCalendar.tsx` | 4 | Monthly booking calendar |
| `src/components/EarningsDashboard.tsx` | 4 | Earnings tracking |
| `src/components/ResaleButton.tsx` | 4 | Resale listing from design page |

### Modified Files (14)
| File | Wave | Changes |
|------|------|---------|
| `src/pages/api/auth/artist-login.ts` | 1 | Cookie path fix: `Path=/` + stale cookie expiry |
| `src/pages/api/auth/artist-logout.ts` | 1 | Cookie path fix: `Path=/` + stale cookie expiry |
| `wrangler.toml` | 1 | BSC chain config |
| `src/lib/wagmi.ts` | 1 | BSC chain |
| `src/lib/config/contract.ts` | 1 | V2 ABI, BSC chain ID, USDT address |
| `src/lib/api/schemas.ts` | 1 | New Zod schemas |
| `src/components/WalletProvider.tsx` | 1 | BSC chain |
| `src/pages/artist/portal.astro` | 2, 4 | New sections, React islands, USDT price display |
| `src/pages/admin/index.astro` | 2 | Pending review section |
| `src/pages/market.astro` | 3 | Exclude non-marketplace statuses, include resale |
| `src/components/MarketGrid.tsx` | 3 | Real images, USDT, resale tags |
| `src/pages/design/[id].astro` | 3 | Real images, USDT, resale button |
| `src/components/CheckoutFlow.tsx` | 3 | USDT approval + mint flow |
| `src/pages/api/voucher.ts` | 3 | V2 voucher struct, BSC chain, per-artist treasury |
| `src/pages/api/confirm.ts` | 3 | BSC chain, earnings tracking |

---

## Dependencies Between Waves

```
Wave 1 (Foundation)
  |
  v
Wave 2 (Core Features) -----> Wave 3 (Marketplace & Payments)
                                       |
                                       v
                               Wave 4 (Secondary Market & Calendar)
```

- Wave 2 depends on Wave 1: needs DB schema, R2 upload, schemas, and artist cookie fix (Task 1.0)
- Wave 3 depends on Wave 2: needs designs to exist in 'available' status
- Wave 4 depends on Wave 3: needs payment flow working for resale mechanics
- Waves 2 and 3 are mostly independent in implementation but Wave 3 needs approved designs from Wave 2 for testing
- BookingCalendar (Wave 4) has no dependency on Wave 3 and could technically start after Wave 2

---

## Estimated Effort

| Wave | Tasks | Complexity | Rough Estimate |
|------|-------|-----------|----------------|
| Wave 1 | 6 | HIGH (contract + chain migration + cookie fix) | 3-4 days |
| Wave 2 | 9 | MEDIUM (CRUD + UI) | 3-4 days |
| Wave 3 | 7 | HIGH (payment integration) | 4-5 days |
| Wave 4 | 8 | MEDIUM-HIGH (resale + calendar + cancellation) | 3-4 days |
| **Total** | **30** | | **13-17 days** |

---

## Changelog

| Change | Category | Reason |
|--------|----------|--------|
| Added Task 1.0: Artist Cookie Path Fix | CRITICAL | Artist cookie has `Path=/artist`, blocking all `/api/*` routes. Follows admin cookie fix pattern from commit `1531d58`. This is a blocker for all artist-authenticated APIs in Waves 2-4. |
| Added `buyResale` function to V2 contract (Task 1.2) | CRITICAL | Original contract design had no on-chain resale mechanism. Added `buyResale(tokenId, price)` with atomic USDT splitting (royalty to artist, 3% to platform, remainder to seller), `resaleEnabled` owner toggle, and soulbound/owner guards. |
| Added `NOT NULL` to `designs.selling_mode` and `booking_inquiries.status` (Task 1.1) | MAJOR | Columns without NOT NULL could have inconsistent NULL values. Added NOT NULL with sensible defaults. |
| Added backfill for `booking_inquiries.status` (Task 1.1) | MAJOR | Existing rows would have NULL status after migration. Backfill sets them to 'pending'. |
| Added `trg_designs_selling_mode_lock` immutability trigger (Task 1.1) | MAJOR | selling_mode must not change after creation (affects NFT soulbound semantics). Application-layer enforcement is insufficient; DB trigger provides a safety net. |
| Added CHECK constraint on `resale_listings.status` (Task 1.1) | MAJOR | Prevents invalid status values at DB level. Added 'cancelled' as valid status. |
| Updated Task 3.5 with per-artist treasury DB lookup | MAJOR | Voucher API was using `env.ARTIST_TREASURY_ADDR` (single address). Must look up `wallet_address` from artists table per-design, and reject if artist has no wallet. |
| Added `forge install` prerequisite to Task 1.2 | MAJOR | OpenZeppelin and forge-std dependencies must be installed before `forge build` will succeed. |
| Added platform fee change documentation to ADR | MAJOR | Fee increase from 2.5% to 3% is user-facing. Must be explicitly documented as a consequence. |
| Clarified price storage: use `price` (REAL) not `price_usd` (INTEGER) (Task 2.1) | MAJOR | `price_usd` is INTEGER type and would truncate USDT decimal values. The `price` column (REAL) must be used instead. |
| Added resale listing cancellation API (Task 4.3) | ADDITION | Sellers need the ability to cancel active resale listings. Added `DELETE /api/resale/[id]` endpoint. |
| Added USDT 18-decimal note for BSC | ADDITION | Unlike Ethereum/Tron USDT (6 decimals), BSC USDT uses 18 decimals. This affects all `parseUnits` calls. |
| Updated Task 2.8 to mention ETH-to-USDT price display change | ADDITION | Artist portal must show USDT prices, not ETH. This was implicit but needed explicit mention. |
| Added UUPS proxy trade-off note to ADR | ADDITION | Conscious decision NOT to use UUPS for V1 should be documented with note that V3 may require it. |
| Added RPC env var renaming note (Task 1.3) | ADDITION | Server-side `BASE_RPC_*` secrets in Cloudflare Pages dashboard need renaming to `BSC_RPC_*`. |
| Renumbered Wave 4 tasks (4.3->4.4, 4.4->4.5, etc.) | HOUSEKEEPING | Inserted Task 4.3 (resale cancellation), shifted subsequent task numbers. |
| Updated file inventory counts | HOUSEKEEPING | New files: 14->16 (added resale/[id].ts). Modified files: 12->14 (added artist-login.ts, artist-logout.ts). Total tasks: 28->30. |
| Updated plan status | META | Changed from "DRAFT -- pending consensus review" to "REVISED -- pending approval". |
