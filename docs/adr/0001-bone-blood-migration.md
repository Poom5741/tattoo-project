# ADR-0001: Bone & Blood Visual Identity Migration

## Status
Accepted

## Date
2026-07-02

## Context
SUKNID currently uses a dark monochrome "Ink Noir" design (near-black backgrounds, Bodoni Moda + Space Mono fonts, grain/scan/hatch textures). The project is migrating to a "Bone & Blood" identity — warm cream/paper tones with an aggressive red accent, Playfair Display + Sora fonts, and refined minimalism.

The existing design system is encoded in a 340-line `global.css` with hardcoded dark theme values. The codebase uses Astro 5 + React + Tailwind CDN (via stitch prototypes). Production needs properly installed Tailwind with theme configuration.

## Decision

### Visual Direction
- **Light-only theme** — No dark mode toggle. "Bone & Blood" is fundamentally light.
- **Color palette**: Cream background (#FBF9F3), blood red accent (#E60023), bone white (#FFFFFF), ink black for text (#1A1A1A)
- **Typography**: Playfair Display (display/serif) + Sora (body/sans) via Google Fonts CDN
- **Texture**: Remove dark grain/scan/hatch overlays. Add subtle paper-fiber background (1-2% opacity)
- **Layout**: Contained with `max-w-container-max mx-auto`, 64px desktop margins, 20px mobile

### Implementation Strategy
- **Install Tailwind properly** via `@astrojs/tailwind` with theme config from DESIGN.md tokens
- **Hybrid rebuild**: Rebuild layout/structural components from scratch (Nav, Footer, page chrome). Restyle functional components with complex logic (BookingForm, Plate, BookingCalendar, CheckoutFlow, WalletProvider, PrivyAuth)
- **Keep Plate generative art** — Canvas-based generative art stays, wrap in new Bone & Blood card components
- **Page-by-page migration** — Home → Detail → Vault → Artist Dashboard → Booking/Checkout → Admin
- **Update Playwright tests** alongside each page migration

### Stitch References
- `stitch_suknid_tattoo_nft_marketplace/bone_blood/DESIGN.md` — Design system tokens
- `stitch_suknid_tattoo_nft_marketplace/suknid_home_bone_blood/code.html` — Home reference
- `stitch_suknid_tattoo_nft_marketplace/design_detail_bone_blood/code.html` — Detail reference
- `stitch_suknid_tattoo_nft_marketplace/the_vault_bone_blood/code.html` — Vault reference
- `stitch_suknid_tattoo_nft_marketplace/artist_dashboard_bone_blood/code.html` — Dashboard reference

## Consequences

### Positive
- Clean separation between old dark theme and new light theme
- Tailwind theme config becomes single source of truth for design tokens
- Page-by-page migration allows incremental testing and rollback
- Preserves complex logic in functional components (booking, checkout, wallet)

### Negative
- Temporary coexistence of old and new styles during migration
- Booking/checkout flow remains on old design until phase 3 (potential visual inconsistency)
- Admin pages last means internal tools stay dark until final phase

### Neutral
- Google Fonts CDN approach preserved (already preconnected in Base.astro)
- Privy wallet UI themed where possible, but built-in UI not fully controllable
- Paper-fiber texture is subtle (1-2% opacity) — may need tuning in production
