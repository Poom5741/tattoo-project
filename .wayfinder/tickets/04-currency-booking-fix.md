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

- [ ] Homepage featured plates show ฿ not ETH
- [ ] Artist detail page shows ฿ not ETH
- [ ] Wallet page shows ฿ total, not ETH
- [ ] Booking page loads artists/designs from D1
- [ ] Booking success shows "Go to inbox" link
- [ ] Seed data is fallback only, not primary source

### Files to Change

- `src/pages/index.astro` — fix currency display
- `src/pages/artist/[id].astro` — fix fmtEth → fmtThb
- `src/components/WalletOwnedPlates.tsx` — fix total value display
- `src/pages/booking.astro` — load from D1
- `src/components/BookingForm.tsx` — add inbox link on success
