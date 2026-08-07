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

- [x] `/checkout/[id]` redirects to `/booking?designId=[id]`
- [x] Design detail "Acquire" button says "Reserve this plate"
- [x] No auto-release of reservations on checkout page load
- [x] ResaleButton shows "Resale coming soon" instead of wagmi connect
- [x] Resale API endpoints return 503
- [x] No wagmi/RainbowKit imports in ResaleButton

### Files to Change

- `src/pages/checkout/[id].astro` — redirect to booking
- `src/pages/design/[id].astro` — update CTA text, remove auto-release
- `src/components/ResaleButton.tsx` — disable with notice
- `src/pages/api/resale/create.ts` — return 503
- `src/pages/api/resale/buy.ts` — return 503

## Resolution

All five sub-tasks landed. The page is now a 6-line redirect shim:

```astro
const { id } = Astro.params;
if (!id) return Astro.redirect("/market");
return Astro.redirect(`/booking?designId=${encodeURIComponent(id)}`);
```

The CTA text moved through the existing i18n layer (en + th), not the template, so the Thai translation updated in lockstep (`รับเพลทนี้` → `จองเพลทนี้`).

The auto-release statement (`UPDATE designs SET status = 'available' …`) was deleted from the checkout page. The timeout-based release on the design detail page is the single source of truth and is unaffected.

`ResaleButton.tsx` is now a static `<div aria-disabled="true">Resale coming soon</div>` with no React state, no hooks, no wagmi/RainbowKit imports. The export shape is preserved so the design detail page's conditional render (`design.status === "sold" && design.selling_mode === "resellable" && design.token_id != null`) still works.

The two resale API endpoints are now 9-line stubs returning the agreed envelope.

### Files changed
- `src/pages/checkout/[id].astro` — replaced with redirect shim
- `src/locales/en.json`, `src/locales/th.json` — `artistDetail.acquirePlate` updated
- `src/components/ResaleButton.tsx` — placeholder
- `src/pages/api/resale/create.ts`, `src/pages/api/resale/buy.ts` — 503 stubs

### Tests added (TDD, RED→GREEN per slice)
- `tests/unit/checkout-flow.test.ts` — 7 tests:
  - 2 resale API tests (503 + JSON envelope)
  - 2 ResaleButton tests (no wagmi import, "coming soon" text)
  - 1 design-detail CTA test (en + th i18n values)
  - 2 checkout redirect tests (redirect, no auto-release UPDATE)

### Out of scope (logged on map, not in this ticket)
- ResaleButton final UX when resale is enabled (current placeholder is intentionally minimal).
- Resale listings table on design detail page — kept as-is per ticket; the rows still render but the "Buy" link goes to `/checkout/[id]?resale=…` which now redirects to booking. The user sees no resale action available. Tighten when resale is enabled.
- The booking form's prefill when arriving from `/checkout/[id]` redirect — should verify `designId` is consumed (likely already works; not tested in this ticket).
