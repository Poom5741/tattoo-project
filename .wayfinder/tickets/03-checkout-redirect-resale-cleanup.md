# Ticket: Flow — Checkout Disabled, Booking Redirect & Resale Cleanup

**wayfinder:task**

## Question

Payments are disabled (no ChillPay credentials, money happens off-platform). The checkout flow and resale flow need to be disabled with clear UX, and the buyer's path should redirect to booking.

### Changes Required

1. **Redirect `/checkout/[id]` to `/booking?designId=[id]`.** The checkout page (`src/pages/checkout/[id].astro`) shows a ChillPay payment form. Since payments are disabled, redirect to the booking form pre-filled with that design. This keeps the conversion funnel: "Acquire" → "Reserve this plate" → booking form.

2. **Update design detail page CTA.** In `src/pages/design/[id].astro`, change the "Acquire the plate" button text to "Reserve this plate" and keep the link to `/checkout/[id]` (which now redirects to booking). This makes the intent clear: you're reserving, not paying.

3. **Fix checkout reservation auto-release bug.** `src/pages/checkout/[id].astro` has logic that resets `reserved` → `available` on every page load. This is dangerous — if a buyer navigates away and comes back, the reservation is gone. Remove this auto-release logic. The reservation should only be released by timeout (the existing `reserved_until` check on the design detail page handles this).

4. **Disable ResaleButton with "coming soon" notice.** `src/components/ResaleButton.tsx` uses `useAccount` from wagmi (RainbowKit), which is orphaned from the old auth system. Instead of trying to fix it, show a disabled state: "Resale coming soon" text. Keep the component but remove the wagmi dependency. The resale listing table on the design detail page can stay (it shows real data from DB), but the buy action should be disabled.

5. **Disable resale API endpoints gracefully.** `POST /api/resale/create` and `POST /api/resale/buy` should return `503 { error: "Resale is not yet available" }` instead of processing.

### Acceptance Criteria

- [ ] `/checkout/[id]` redirects to `/booking?designId=[id]`
- [ ] Design detail "Acquire" button says "Reserve this plate"
- [ ] No auto-release of reservations on checkout page load
- [ ] ResaleButton shows "Resale coming soon" instead of wagmi connect
- [ ] Resale API endpoints return 503
- [ ] No wagmi/RainbowKit imports in ResaleButton

### Files to Change

- `src/pages/checkout/[id].astro` — redirect to booking
- `src/pages/design/[id].astro` — update CTA text, remove auto-release
- `src/components/ResaleButton.tsx` — disable with notice
- `src/pages/api/resale/create.ts` — return 503
- `src/pages/api/resale/buy.ts` — return 503
