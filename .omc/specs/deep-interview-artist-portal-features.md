# Deep Interview Spec: Artist Portal — Tattoo Listing, Selling Modes, Secondary Market, Booking Calendar & Admin Review

## Metadata
- Interview ID: artist-portal-features-2026-06-09
- Rounds: 20
- Final Ambiguity Score: 22%
- Type: brownfield
- Generated: 2026-06-09
- Threshold: 0.2 (20%)
- Threshold Source: default
- Initial Context Summarized: no
- Status: BELOW_THRESHOLD_EARLY_EXIT

## Clarity Breakdown
| Dimension | Score | Weight | Weighted |
|-----------|-------|--------|----------|
| Goal Clarity | 0.84 | 35% | 0.294 |
| Constraint Clarity | 0.75 | 25% | 0.188 |
| Success Criteria | 0.76 | 25% | 0.190 |
| Context Clarity | 0.72 | 15% | 0.108 |
| **Total Clarity** | | | **0.780** |
| **Ambiguity** | | | **0.220** |

## Topology

| Component | Status | Description | Coverage / Deferral Note |
|-----------|--------|-------------|--------------------------|
| Tattoo Listing Form | active | Artist uploads photo + fills design details from portal, submitted for admin review | Full flow defined: upload to R2, USDT pricing, selling mode selection, admin approval gate, edit/resubmit on rejection, delist unsold |
| Selling Mode Configuration | active | Per-design choice between soulbound (one-time) and resellable with artist-chosen royalty % | Locked permanently at listing time, 5-15% royalty range, soulbound = non-transferable NFT |
| Secondary Market / Resale Engine | active | NFT resale with ERC-2981 royalties on SUKNID and external marketplaces | Both platforms, resale from /design/:id page, seller sets price, no admin approval for resale, 3% platform fee |
| Booking Calendar | active | Monthly calendar on artist portal showing inquiries and appointments | Read-only grid with dot indicators, click for detail panel, accept/decline inquiries, date picker for appointments |
| Admin Listing Review | active | Admin dashboard component for reviewing pending tattoo listings | Simple approve/reject, rejection allows artist resubmit, only gates new listings (not resales) |

## Goal

Build 5 interconnected features for the SUKNID tattoo platform that enable artists to self-service list new tattoo designs through their portal, choose between one-time (soulbound) and resellable selling modes with artist-chosen royalties, manage their bookings via a visual calendar, and track their earnings — all gated by admin approval. Additionally, enable NFT holders to resell transferable tattoo NFTs on both the SUKNID marketplace and external platforms, with automatic royalty distribution to the original artist.

## Constraints
- **Blockchain:** BSC (BNB Smart Chain)
- **Payment:** Dual — on-chain USDT (BEP-20) + off-chain via PaySolution
- **Platform fee:** 3% on all sales (primary and secondary)
- **Royalty range:** 5-15%, chosen by artist per design at listing time
- **Selling mode:** Locked permanently once design is listed — cannot be changed
- **Image storage:** R2 at upload time; IPFS pinning deferred to mint time
- **Pricing:** USDT (existing `price_usd` field can be repurposed)
- **Admin approval:** Required for new artist listings only, not for resale listings
- **Rejection flow:** Artist can edit and resubmit rejected listings
- **Delist:** Artists can remove unsold designs from the marketplace
- **Calendar scope:** Date-only (no time slots), monthly grid view
- **Calendar actions:** Accept (with date picker) or decline booking inquiries
- **Resale listing:** Initiated from `/design/:id` page by wallet owner, goes live immediately
- **Resale display:** Same `/market` page with "resale" tag, seller sets own price
- **Soulbound NFTs:** Non-transferable — minted to buyer, cannot be resold

## Non-Goals
- Time-slot scheduling or availability blocking on the calendar
- Drag-and-drop calendar interactions
- Admin editing of listing details before approval
- Admin feedback/reason on rejection
- Buyer/collector portal or "My Collection" page
- Complex pricing mechanisms (auctions, dynamic pricing)
- Fiat currency display conversion
- Multi-image uploads per design (single photo per listing)
- Artist-to-artist messaging

## Acceptance Criteria
- [ ] Artist can open portal, click "List new design", upload photo, fill in details (title, style, price in USDT, placement, medium), choose selling mode (soulbound or resellable), set royalty % (5-15%) if resellable, and submit
- [ ] Uploaded photo is stored in Cloudflare R2 and displayed as preview
- [ ] Submitted design appears as "pending" status in artist's portal table
- [ ] Admin dashboard shows list of pending designs with preview and approve/reject buttons
- [ ] Admin approve → design status changes to "available", appears on `/market` marketplace
- [ ] Admin reject → design status changes to "rejected", artist can edit and resubmit
- [ ] Resubmitted design returns to "pending" status for re-review
- [ ] Artist can delist (remove) an unsold "available" design from the marketplace
- [ ] Artist portal displays earnings tracking: total primary sales, total royalties earned from resales
- [ ] Booking calendar shows monthly grid with dot indicators for inquiry dates and appointment dates
- [ ] Clicking a date on calendar expands detail panel showing inquiries/appointments for that day
- [ ] Artist can accept an inquiry from the detail panel (date picker appears to set appointment date)
- [ ] Artist can decline an inquiry from the detail panel
- [ ] Accepted inquiry creates appointment dot on the chosen future date
- [ ] Buyer can purchase a design on `/market` via on-chain USDT (BEP-20) or PaySolution (off-chain)
- [ ] Buyer receives NFT on BSC — soulbound (non-transferable) or transferable based on selling mode
- [ ] Artist receives payment minus 3% platform fee
- [ ] For resellable designs: `/design/:id` page shows "List for resale" button if connected wallet owns the NFT
- [ ] NFT holder can set resale price and list for resale — listing goes live immediately (no admin approval)
- [ ] Resale listings appear on `/market` page with "resale" tag alongside primary listings
- [ ] On resale: original artist receives royalty % (5-15%), platform takes 3%, seller receives remainder
- [ ] ERC-2981 royalty standard implemented in smart contract for external marketplace compatibility
- [ ] Soulbound NFTs cannot be transferred or listed for resale

## Assumptions Exposed & Resolved
| Assumption | Challenge | Resolution |
|------------|-----------|------------|
| Designs are created by admin | "What does the artist actually provide when listing?" | Artists upload photo and fill in all details themselves |
| Pricing in ETH | "You want pricing in USDT — on-chain or off-chain?" | USDT pricing with dual payment: on-chain BEP-20 + PaySolution off-chain |
| One-time sale = no NFT | "Does buyer still get NFT on one-time sale?" | Yes, soulbound NFT — buyer owns it but can't transfer |
| Fixed royalty rate | "Who sets the royalty %?" | Artist chooses per design, 5-15% range |
| Designs go live immediately | "Does admin need to approve?" | Yes, admin review required for new listings |
| Rejection is final | "Can artist resubmit after rejection?" | Yes, edit and resubmit flow |
| Calendar = just inquiry dates | "What about scheduled appointments?" | Both inquiry dates and appointment dates |
| Complex scheduling needed | "What's the simplest valuable calendar?" | Read-only monthly grid, accept/decline, date-only |
| Separate secondary marketplace | "Same page or separate?" | Same `/market` page with resale tag |
| Resale needs a collector portal | "Where does holder list for resale?" | From `/design/:id` page directly |
| Resale needs admin approval | "Approve again or go live?" | Go live immediately — already approved once |
| Selling mode can change | "Can artist switch mode after listing?" | Locked permanently once listed |
| Ethereum mainnet | "Which chain?" | BSC (BNB Smart Chain) |

## Technical Context

### Existing Codebase (Brownfield)
- **Framework:** Astro 5 + React 18 + Cloudflare Pages
- **Database:** Cloudflare D1 (SQLite)
- **Storage:** Cloudflare R2 (bound, available for image upload)
- **Auth:** Privy OAuth with embedded wallets + KVNamespace sessions
- **Smart Contract:** ERC-721 with lazy minting via EIP-712 vouchers
- **Artist Portal:** `/src/pages/artist/portal.astro` — currently read-only (stats, design table, booking table)
- **Marketplace:** `/market` with `MarketGrid` React component, reservation pattern with 15-min expiry
- **Admin Dashboard:** Existing routes at `/api/admin/` for artist registration and wallet management
- **Design Detail:** `/design/:id` page exists

### Schema Changes Needed
```sql
-- designs table modifications
ALTER TABLE designs ADD COLUMN selling_mode TEXT NOT NULL DEFAULT 'one-time' CHECK (selling_mode IN ('one-time', 'resellable'));
ALTER TABLE designs ADD COLUMN royalty_pct REAL CHECK (royalty_pct >= 5 AND royalty_pct <= 15);
ALTER TABLE designs ADD COLUMN image_url TEXT;  -- R2 URL for uploaded photo

-- Update status CHECK to include new states
-- status: available, reserved, sold, owned, pending, rejected, delisted

-- booking_inquiries modifications
ALTER TABLE booking_inquiries ADD COLUMN status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined'));
ALTER TABLE booking_inquiries ADD COLUMN appointment_date INTEGER;  -- Unix timestamp, date only
ALTER TABLE booking_inquiries ADD COLUMN buyer_wallet TEXT;

-- New table for resale listings
CREATE TABLE resale_listings (
  id TEXT PRIMARY KEY,
  design_id TEXT NOT NULL REFERENCES designs(id),
  seller_wallet TEXT NOT NULL,
  asking_price REAL NOT NULL,  -- USDT
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold', 'cancelled')),
  created_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);

-- New table for earnings tracking
CREATE TABLE earnings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  artist_id TEXT NOT NULL REFERENCES artists(id),
  design_id TEXT NOT NULL REFERENCES designs(id),
  type TEXT NOT NULL CHECK (type IN ('primary_sale', 'royalty')),
  amount REAL NOT NULL,  -- USDT
  platform_fee REAL NOT NULL,  -- 3%
  tx_hash TEXT,
  payment_method TEXT CHECK (payment_method IN ('on_chain', 'paysolution')),
  created_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);
```

### Smart Contract Changes Needed
- Deploy on BSC (BNB Smart Chain)
- Add ERC-2981 royalty standard support
- Add per-token soulbound flag (non-transferable override on `_beforeTokenTransfer`)
- Add per-token royalty percentage storage
- USDT (BEP-20) payment integration in mint function
- Consider using OpenZeppelin's ERC721Royalty extension

### New API Endpoints Needed
- `POST /api/designs` — artist creates new design (upload photo to R2, insert DB record as pending)
- `PUT /api/designs/[id]` — artist edits rejected design
- `DELETE /api/designs/[id]` — artist delists unsold design
- `POST /api/admin/review-design` — admin approves/rejects pending design
- `GET /api/admin/pending-designs` — list pending designs for admin review
- `PUT /api/bookings/[id]/accept` — accept inquiry with appointment date
- `PUT /api/bookings/[id]/decline` — decline inquiry
- `GET /api/artist/earnings` — artist earnings summary
- `POST /api/resale` — create resale listing
- `GET /api/resale` — list active resale listings (for marketplace)

### Frontend Components Needed
- `NewDesignForm` — React component for artist listing form (photo upload, fields, selling mode, royalty slider)
- `AdminPendingReview` — React component for admin review panel
- `BookingCalendar` — React component with monthly grid, dot indicators, detail panel
- `EarningsDashboard` — React component showing sales + royalty earnings
- Update `MarketGrid` — show resale listings with "resale" tag
- Update `/design/:id` — "List for resale" button for NFT owners

## Ontology (Key Entities)

| Entity | Type | Fields | Relationships |
|--------|------|--------|---------------|
| Artist | core domain | id, name, handle, wallet_address, city, style, bio | Has many Designs, has many Earnings, has many BookingInquiries |
| Design | core domain | id, title, style, price_usdt, placement, medium, status, selling_mode, royalty_pct, image_url, ipfs_cid, token_id | Belongs to Artist, has many BookingInquiries, has many ResaleListings |
| NFT/Token | core domain | token_id, soulbound_flag, royalty_pct, owner_wallet | Represents a minted Design on BSC |
| Buyer/Collector | supporting | wallet_address | Owns NFTs, creates BookingInquiries |
| BookingInquiry | core domain | id, artist_id, design_id, name, contact, message, status, appointment_date | Belongs to Artist, optionally references Design |
| Appointment | supporting | date (derived from accepted inquiry) | Created when inquiry is accepted |
| ResaleListing | core domain | id, design_id, seller_wallet, asking_price, status | References Design, created by NFT owner |
| Earning | core domain | id, artist_id, design_id, type, amount, platform_fee, tx_hash | Belongs to Artist, references Design |
| PendingListing | supporting (status) | pending status on Design | Design awaiting admin review |
| AdminReview | supporting (action) | approve/reject action | Changes Design status |
| Royalty | supporting | percentage (5-15%), enforced via ERC-2981 | Set per Design, paid to Artist on resale |
| PlatformFee | supporting | 3% of all transactions | Deducted from all primary and secondary sales |
| SoulboundToken | supporting (variant) | non-transferable NFT | Variant of NFT for one-time sale designs |
| PaySolution | external system | off-chain payment gateway | Alternative to on-chain USDT payment |
| USDT (BEP-20) | external system | on-chain payment token on BSC | Primary payment method |
| R2 Storage | external system | Cloudflare object storage | Stores uploaded design images |

## Ontology Convergence

| Round | Entity Count | New | Changed | Stable | Stability Ratio |
|-------|-------------|-----|---------|--------|----------------|
| 1 | 5 | 5 | - | - | N/A |
| 5 | 9 | 4 | 0 | 5 | 56% |
| 10 | 13 | 4 | 0 | 9 | 69% |
| 15 | 15 | 2 | 0 | 13 | 87% |
| 20 | 16 | 1 | 0 | 15 | 94% |

Ontology converged strongly from round 15 onwards — the core domain model stabilized with only minor additions in later rounds.

## Interview Transcript
<details>
<summary>Full Q&A (20 rounds)</summary>

### Round 0 — Topology Confirmation
**Q:** I'm reading 3 top-level components. Is that right?
**A:** Add booking calendar as 4th component.
**Topology locked:** 4 components (Tattoo Listing Form, Selling Mode, Secondary Market, Booking Calendar)

### Round 1
**Q:** When you say "resold on secondary market with partial profit" — is this NFT resale with royalties, or multiple buyers purchasing prints?
**A:** NFT resale — buyer resells the digital ownership token, original artist earns royalty.
**Ambiguity:** 78% (Goal: 0.30, Constraints: 0.10, Criteria: 0.10, Context: 0.40)

### Round 2
**Q:** Current `booking_inquiries` table only has `created_at` (submission time), no appointment date. Does "full calendar" mean inquiry timeline, scheduled appointments, or both?
**A:** Both.
**Ambiguity:** 78% (Goal: 0.30, Constraints: 0.10, Criteria: 0.10, Context: 0.40)

### Round 3
**Q:** What does the artist actually provide when listing? Upload photo? What details?
**A:** Yes photo and fill all info alongside with price in USDT.
**Ambiguity:** 75% (Goal: 0.40, Constraints: 0.10, Criteria: 0.10, Context: 0.40)

### Round 4 (Contrarian Mode)
**Q:** Does "one-time sale" buyer still get an NFT (soulbound), or is it a non-NFT purchase?
**A:** Buyer still gets NFT but can't resell — soulbound.
**Ambiguity:** 68% (Goal: 0.55, Constraints: 0.15, Criteria: 0.10, Context: 0.45)

### Round 5
**Q:** What royalty model? Fixed, artist-chosen, or tiered?
**A:** Artist chooses the royalty % per design.
**Ambiguity:** 67% (Goal: 0.55, Constraints: 0.15, Criteria: 0.12, Context: 0.45)

### Round 6 (Simplifier Mode)
**Q:** What's the simplest valuable calendar? Read-only with dots, or full scheduling?
**A:** Choose for me.
**Resolution:** Read-only monthly grid, click date for details, accept/decline inquiries with date picker.
**Ambiguity:** 62% (Goal: 0.60, Constraints: 0.25, Criteria: 0.15, Context: 0.48)

### Round 7
**Q:** Does a new listing go live immediately or require admin review?
**A:** Wait for admin review — need new admin dashboard component.
**Topology updated:** Added 5th component (Admin Listing Review).
**Ambiguity:** 65% (Goal: 0.55, Constraints: 0.22, Criteria: 0.14, Context: 0.45)

### Round 8
**Q:** What can admin do? Approve/reject only, or also edit and send feedback?
**A:** Simple approve/reject.
**Ambiguity:** 57% (Goal: 0.68, Constraints: 0.30, Criteria: 0.17, Context: 0.49)

### Round 9 (Ontologist Mode)
**Q:** Does resale happen on SUKNID, external marketplaces like OpenSea, or both?
**A:** Both.
**Ambiguity:** 56% (Goal: 0.69, Constraints: 0.33, Criteria: 0.17, Context: 0.50)

### Round 10
**Q:** Platform fee? Royalty bounds?
**A:** Platform fee 3%. Reasonably min max for royalty.
**Resolution:** 3% platform fee on all sales. Royalty range 5-15%.
**Ambiguity:** 53% (Goal: 0.69, Constraints: 0.42, Criteria: 0.19, Context: 0.51)

### Round 11
**Q:** Walk through the ideal end-to-end flow from listing to buyer owning NFT.
**A:** Confirmed the 7-step flow (list → pending → admin review → live → purchase → NFT → resale).
**Ambiguity:** 41% (Goal: 0.75, Constraints: 0.48, Criteria: 0.49, Context: 0.55)

### Round 12
**Q:** How does USDT payment work? On-chain, off-chain, which chain?
**A:** Both on-chain and off-chain. Off-chain via PaySolution. BSC chain.
**Ambiguity:** 40% (Goal: 0.75, Constraints: 0.51, Criteria: 0.50, Context: 0.55)

### Round 13
**Q:** When artist accepts inquiry, how does appointment date get set?
**A:** Choose for me.
**Resolution:** Accept → date picker (date only) → appointment dot on calendar.
**Ambiguity:** 36% (Goal: 0.78, Constraints: 0.54, Criteria: 0.57, Context: 0.57)

### Round 14
**Q:** Uploaded photo → R2 only or R2 + IPFS?
**A:** R2 only. IPFS at mint time.
**Ambiguity:** 35% (Goal: 0.79, Constraints: 0.55, Criteria: 0.58, Context: 0.60)

### Round 15
**Q:** Rejected listing — can artist edit and resubmit, or is rejection final?
**A:** Edit and resubmit.
**Ambiguity:** 33% (Goal: 0.80, Constraints: 0.60, Criteria: 0.59, Context: 0.61)

### Round 16
**Q:** Can selling mode be changed after design is listed?
**A:** Locked permanently once listed.
**Ambiguity:** 31% (Goal: 0.81, Constraints: 0.64, Criteria: 0.60, Context: 0.62)

### Round 17
**Q:** Resale listings on same `/market` page or separate page? Who sets price?
**A:** Same page with resale tag. Seller sets own price.
**Ambiguity:** 29% (Goal: 0.83, Constraints: 0.66, Criteria: 0.66, Context: 0.65)

### Round 18
**Q:** Where does NFT holder go to list for resale? New page or from design detail?
**A:** Design detail page — keep it simple.
**Ambiguity:** 28% (Goal: 0.83, Constraints: 0.66, Criteria: 0.66, Context: 0.65)

### Round 19
**Q:** Do resale listings need admin approval or go live immediately?
**A:** Go live immediately.
**Ambiguity:** 25% (Goal: 0.83, Constraints: 0.73, Criteria: 0.70, Context: 0.69)

### Round 20
**Q:** Anything we missed? Earnings tracking? Delist capability?
**A:** Yes, add earnings tracking and allow delist.
**Ambiguity:** 22% (Goal: 0.84, Constraints: 0.75, Criteria: 0.76, Context: 0.72)

</details>
