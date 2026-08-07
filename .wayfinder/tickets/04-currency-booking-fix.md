# Ticket: Flow — Currency Fix (ETH → THB) & Booking D1 Refactor

**wayfinder:task**

## Question

Two flow inconsistencies need fixing:

### 1. Currency Display Bug (ETH → THB)

The entire app uses Thai Baht (฿) for prices — ChillPay, the admin panel, the artist portal, the design detail page. But the **homepage** and **artist detail page** still show prices as "ETH":

- `src/pages/index.astro` — featured plates show `d.price.toFixed(2) ETH`
- `src/pages/artist/[id].astro` — shows `fmtEth(d.price)` which formats as `X.XXX ETH`
- `src/components/WalletOwnedPlates.tsx` — shows "0.000 ETH" as total value

**Fix:** Change all currency displays to THB (฿). The `fmtThb` helper already exists in several files — use it consistently. For the wallet page, the total value should sum THB prices, not show ETH.

### 2. Booking Page Uses Seed Data

`src/pages/booking.astro` imports artists and designs from `src/lib/catalog/seed.ts` — a hardcoded seed file. Meanwhile, the market page (`src/pages/market.astro`) loads from D1. These can be out of sync.

**Fix:** Refactor `booking.astro` to load artists and designs from D1 (same query pattern as `artists.astro` and `market.astro`). Keep the seed data as a fallback only if the DB query fails.

### 3. Booking Success State

After submitting a booking, the success state shows "Send another request" button but no link to the inbox. The booking auto-creates a conversation thread (`conversationId` is returned), but the user has no idea they can go chat.

**Fix:** Add a "Go to your inbox" link on the booking success state, pointing to `/inbox`. Show the conversation was created.

### Acceptance Criteria

- [x] Homepage featured plates show ฿ not ETH
- [x] Artist detail page shows ฿ not ETH
- [x] Wallet page shows ฿ total, not ETH
- [x] Booking page loads artists/designs from D1
- [x] Booking success shows "Go to inbox" link
- [x] Seed data is fallback only, not primary source

### Files to Change

- `src/pages/index.astro` — fix currency display
- `src/pages/artist/[id].astro` — fix fmtEth → fmtThb
- `src/components/WalletOwnedPlates.tsx` — fix total value display
- `src/pages/booking.astro` — load from D1
- `src/components/BookingForm.tsx` — add inbox link on success

## Resolution

### Currency fix

All three locations now use `fmtThb` (defined locally in each file, or inlined for the React component):

- `index.astro` — `{d.price.toFixed(2) ETH}` → `{fmtThb(d.price)}` with `fmtThb` added to the frontmatter.
- `artist/[id].astro` — `fmtEth` function replaced with `fmtThb`; template updated to call it.
- `WalletOwnedPlates.tsx` — inline `฿{totalValue.toLocaleString("th-TH", { minimumFractionDigits: 2 })}` replaces the ETH literal.

The `fmtThb` helper already existed in `design/[id].astro`; the pattern is consistent: `toLocaleString("th-TH", { minimumFractionDigits: 2 })` with the ฿ prefix.

### Booking D1 refactor

`booking.astro` now issues two parallel D1 queries (`artists` and `designs WHERE status = 'available'`), identical to the `artists.astro` query shape. The D1 rows are mapped to the `Artist` and `Design` interfaces that `BookingForm` expects. Seed data remains as the fallback default if either D1 query throws.

### Booking success inbox link

A `<a href="/inbox" className="btn-primary mt-6 inline-block">Go to your inbox</a>` link was added to the success state in `BookingForm.tsx`, above the existing "Send another request" button. The booking API already auto-creates a conversation thread, so the link gives the buyer an immediate path to chat with the artist.

### Tests added (TDD, RED→GREEN per slice)
- `tests/unit/currency-booking.test.ts` — 6 tests:
  - 3 currency tests (homepage, artist detail, wallet: no ETH, uses ฿)
  - 2 booking D1 tests (queries from D1, seed is fallback only)
  - 1 inbox link test (success state links to /inbox)
