# Bone & Blood Design System Migration — Full Frontend Redesign

## Problem Statement

SUKNID's current "Ink Noir" dark monochrome design (near-black backgrounds, Bodoni Moda + Space Mono fonts, grain/scan/hatch texture overlays) no longer aligns with the refined, tactile aesthetic the brand is evolving toward. The design feels heavy, dated, and visually aggressive rather than inviting collectors to explore one-of-one tattoo plates. The codebase has accumulated 340+ lines of dark-theme CSS that's difficult to maintain and lacks a systematic design token approach.

## Solution

Migrate the entire SUKNID frontend to the "Bone & Blood" design system: a warm cream/paper aesthetic (#FBF9F3 surface), Playfair Display + Sora typography, aggressive red accent (#E60023), and refined minimalism with tactile texture (subtle paper-fiber background). This migration will:

- Replace the dark theme with a light-only, paper-toned interface
- Install Tailwind CSS properly with a complete design token system
- Rebuild layout/structural components from scratch for clean architecture
- Restyle (not rebuild) functional components with complex logic
- Remove dark texture overlays (grain/scan/hatch) and replace with subtle paper-fiber
- Migrate page-by-page to minimize risk and allow iterative verification

## User Stories

### Navigation & Layout
1. As a collector, I want a sticky navigation bar with a warm cream background, so that branding feels consistent and premium as I scroll
2. As a collector, I want the SUKNID brand name displayed in Playfair Display serif font, so that the visual identity feels refined and editorial
3. As a collector, I want navigation links to highlight with a red underline when active, so that I always know which section I'm viewing
4. As a collector, I want a rounded "Connect Wallet" button in red, so that the primary call-to-action stands out against the cream background
5. As a collector, I want the navigation to collapse into a mobile menu on small screens, so that the interface remains usable on phones
6. As a collector, I want a footer with cream background and organized link columns, so that I can easily find secondary navigation
7. As a collector, I want consistent container widths with proper margins (64px desktop, 20px mobile), so that content feels balanced and never cramped

### Home Page — Hero Section
8. As a collector, I want to see a featured tattoo plate prominently displayed on the home page, so that I immediately understand what SUKNID offers
9. As a collector, I want the featured plate to appear in a tactile card container with rounded corners and subtle border, so that it feels like a physical artifact
10. As a collector, I want a clear headline and description explaining the featured drop, so that I understand the context and urgency
11. As a collector, I want prominent "Explore Drop" and "View Artist" buttons, so that I can take immediate action

### Home Page — Featured Plates Grid
12. As a collector, I want to see a grid of featured tattoo plates, so that I can browse multiple options at once
13. As a collector, I want each plate card to show the generative artwork, artist name, and metadata tags, so that I can quickly assess each piece
14. As a collector, I want plate cards to have rounded corners, subtle borders, and hover states, so that they feel interactive and tactile
15. As a collector, I want the grid to be responsive (3 columns desktop, 2 tablet, 1 mobile), so that it works on any device

### Home Page — How It Works
16. As a collector, I want to see a 3-step process explanation with icons and connecting lines, so that I understand how SUKNID works
17. As a collector, I want each step to be visually distinct but cohesive, so that the flow feels intentional
18. As a collector, I want the process section to use the cream background with subtle texture, so that it feels premium

### Home Page — Artists Section
19. As a collector, I want to see a grid of featured artists with their profiles, so that I can discover whose work resonates with me
20. As a collector, I want artist cards to show avatar, name, and bio snippet, so that I can quickly learn about each artist
21. As a collector, I want artist cards to be clickable and lead to full artist profiles, so that I can explore their work in depth

### Home Page — CTA Band
22. As a collector, I want a prominent call-to-action band at the bottom of the home page, so that I'm encouraged to take the next step
23. As a collector, I want the CTA to use the red accent color prominently, so that it stands out against the cream background

### Plate Generative Art
24. As a collector, I want the canvas-based generative artwork to remain unchanged, so that the artistic integrity of each plate is preserved
25. As a collector, I want the generative art to be wrapped in a Bone & Blood styled container, so that it feels integrated with the new design system
26. As a collector, I want to be able to customize font and color tweaks on plates (if TweaksPanel is kept), so that I can personalize my viewing experience

### Design System & Theming
27. As a collector, I want the entire site to use a consistent cream/paper color palette, so that the experience feels cohesive
28. As a collector, I want typography to use Playfair Display for headlines and Sora for body text, so that the visual hierarchy is clear
29. As a collector, I want a subtle paper-fiber texture in the background (1-2% opacity), so that the interface feels tactile without being distracting
30. As a collector, I want all buttons, cards, inputs, and tags to follow the Bone & Blood design tokens, so that the UI feels systematic and professional
31. As a collector, I want the site to be light-only (no dark mode toggle), so that the Bone & Blood identity is consistent

### Wallet & Authentication
32. As a collector, I want the wallet connection UI to be restyled to match Bone & Blood, so that it doesn't clash with the new design
33. As a collector, I want Privy authentication to work seamlessly within the new design, so that onboarding is smooth
34. As a collector, I want my vault (owned plates) to display in Bone & Blood styled cards, so that my collection feels premium

### Page Migration
35. As a collector, I want the home page to be fully migrated to Bone & Blood, so that my first impression aligns with the new brand
36. As a collector, I want the plate detail page to be migrated, so that I can view individual plates in the new design
37. As a collector, I want the artist profile pages to be migrated, so that I can explore artist work in the new design
38. As a collector, I want the marketplace/gallery page to be migrated, so that I can browse plates in the new design
39. As a collector, I want the booking flow to be migrated (phase 2), so that the entire experience is cohesive
40. As a collector, I want the checkout flow to be migrated (phase 2), so that the purchase experience is polished

### Developer Experience
41. As a developer, I want Tailwind CSS properly installed with a complete design token system, so that I can build new features consistently
42. As a developer, I want global CSS replaced with Tailwind utilities, so that the codebase is easier to maintain
43. As a developer, I want component utility classes (btn-primary, btn-secondary, card-bb, tag-bb, input-bb), so that I can quickly build Bone & Blood styled components
44. As a developer, I want the migration to happen page-by-page, so that I can verify each step and minimize risk
45. As a developer, I want layout components (Nav, Footer) rebuilt from scratch, so that the architecture is clean
46. As a developer, I want functional components (Plate, BookingForm, CheckoutFlow) restyled rather than rebuilt, so that complex logic isn't disrupted

### Testing & Quality
47. As a developer, I want Playwright tests updated alongside each page migration, so that visual regressions are caught early
48. As a developer, I want to run the full test suite after each page migration, so that I can verify nothing broke
49. As a developer, I want visual snapshots updated intentionally, so that the new design is properly documented

## Implementation Decisions

### Design System Foundation
- **Tailwind CSS v4.3.2** installed via `@astrojs/tailwind` integration
- **Design tokens** from `stitch_suknid_tattoo_nft_marketplace/bone_blood/DESIGN.md` mapped to `tailwind.config.mjs`:
  - Surface colors: background (#fbf9f3), surface-container (#f0eee8), surface-container-low (#f5f3ed), surface-container-high (#eae8e2), surface-container-highest (#e4e2dd)
  - Primary: primary-container (#e60023 red accent), on-primary-container (#fff7f6)
  - Text: on-surface (#1b1c18), secondary (#615e5b), tertiary (#5e5a52)
  - Borders: outline-variant (#e8bcb8), outline (#936e6b)
  - Typography scale: display-lg, headline-md/sm, body-lg/md, label-md/sm
  - Border radius: sm, DEFAULT, md, lg, xl, full
  - Spacing: gutter (24px), margin-desktop (64px), margin-mobile (20px), container-max (1280px)
- **Fonts**: Google Fonts CDN for Playfair Display (400-700) + Sora (300-700), preconnected in Base.astro
- **Global CSS**: 340-line dark theme `global.css` replaced with Tailwind directives + paper-fiber background texture (2% opacity SVG noise) + component utility classes

### Migration Strategy
- **Page-by-page migration**: Start with home page, then detail, vault, artist dashboard. Booking/checkout/admin in phase 2.
- **Hybrid rebuild approach**:
  - **Rebuild from scratch**: Nav, Footer, page chrome (layout/structural components)
  - **Restyle only**: Plate (canvas generative art), BookingForm, BookingCalendar, CheckoutFlow, WalletProvider, PrivyAuth (functional components with complex logic)
- **Light-only theme**: No dark mode. Bone & Blood identity is fundamentally light.
- **Stitch references as design direction**: Extract tokens from DESIGN.md, use code.html files as layout references, write clean Astro/React+Tailwind (not copy-paste CDN code)

### Component Decisions
- **Plate generative art**: Canvas-based generative art logic stays unchanged. Wrap in new Bone & Blood card components (rounded corners, subtle borders, gradient overlays).
- **TextureLayer.tsx**: Remove dark textures (grain/scan/hatch). Replace with subtle paper-fiber CSS background on body (1-2% opacity).
- **TweaksPanel.tsx**: Remove or repurpose. If kept, restyle to match Bone & Blood.
- **Container layout**: `max-w-container-max mx-auto` with 64px desktop margins, 20px mobile. Negative space IS the design.
- **Wallet UI**: Restyle wrapper components, theme Privy where possible, don't fight Privy's built-in UI. Stitch vault reference guides custom wallet display views.

### Phased Rollout
- **Phase 1** (current): Install Tailwind, create theme config, replace global CSS, migrate home page
- **Phase 2**: Migrate remaining browsing pages (market, detail, artist profiles, vault)
- **Phase 3**: Migrate booking/checkout flow (too critical to rush, no stitch reference)
- **Phase 4**: Migrate admin pages (minimal restyle, after all public pages)
- **Final**: Delete `global.css` entirely once all pages migrated

### Key Files
- `tailwind.config.mjs` — Full Bone & Blood design tokens
- `src/styles/global.css` — Tailwind directives + paper-fiber + utility classes
- `src/layouts/Base.astro` — Font loading (Playfair Display + Sora)
- `src/pages/index.astro` — Home page (first migration target)
- `src/components/Nav.tsx` — Navigation (rebuild)
- `src/components/Footer.astro` — Footer (rebuild)
- `src/components/Plate.tsx` — Generative art (restyle container only)
- `src/components/TextureLayer.tsx` — Remove
- `src/components/TweaksPanel.tsx` — Remove or restyle

## Testing Decisions

### What Makes a Good Test
- Test external behavior, not implementation details
- Verify visual appearance matches Bone & Blood design tokens
- Ensure responsive layouts work across breakpoints (mobile, tablet, desktop)
- Confirm interactive elements (buttons, links, forms) function correctly
- Validate that generative art rendering is unchanged

### Which Modules Will Be Tested
- **Navigation**: Sticky behavior, mobile menu toggle, active link highlighting, wallet button
- **Home page sections**: Hero, featured plates grid, how-it-works, artists grid, CTA band
- **Plate cards**: Rendering, hover states, click navigation
- **Artist cards**: Rendering, click navigation
- **Forms**: Inputs, focus states, validation (if any on home page)
- **Responsive layouts**: Mobile (320px+), tablet (768px+), desktop (1280px+)

### Prior Art
- Existing Playwright tests in the codebase (if any) should be updated alongside each page migration
- Visual snapshot testing to document the new Bone & Blood design
- Run full test suite after each page migration to catch regressions

## Out of Scope

- **Dark mode**: Not implementing. Bone & Blood is light-only.
- **Booking/checkout flow migration**: Deferred to phase 2. Too critical to rush, no stitch reference.
- **Admin pages migration**: Deferred to phase 4. Minimal restyle needed.
- **Rebuilding functional components**: Plate generative art, BookingForm, CheckoutFlow, WalletProvider, PrivyAuth will be restyled, not rebuilt.
- **Privy UI customization beyond theming**: Don't fight Privy's built-in UI. Restyle wrappers only.
- **Adding new features**: This is a design migration, not a feature addition.

## Further Notes

### Stitch References
- `stitch_suknid_tattoo_nft_marketplace/bone_blood/DESIGN.md` — Full design system tokens
- `stitch_suknid_tattoo_nft_marketplace/suknid_home_bone_blood/code.html` — Home page reference (Tailwind CDN prototype)
- `stitch_suknid_tattoo_nft_marketplace/design_detail_bone_blood/code.html` — Detail page reference
- `stitch_suknid_tattoo_nft_marketplace/the_vault_bone_blood/code.html` — Wallet/vault reference
- `stitch_suknid_tattoo_nft_marketplace/artist_dashboard_bone_blood/code.html` — Artist dashboard reference

### Current State
- ✅ Tailwind installed and configured
- ✅ Design tokens mapped to Tailwind config
- ✅ Global CSS replaced with Bone & Blood foundation
- ✅ Fonts updated to Playfair Display + Sora
- 🔄 Ready to migrate home page (index.astro)

### Risk Mitigation
- Page-by-page migration minimizes risk
- Hybrid approach (rebuild layout, restyle functional) preserves complex logic
- Playwright tests updated alongside each page
- Full test suite run after each migration step

### Success Criteria
- Home page fully migrated to Bone & Blood design
- All design tokens consistently applied
- Responsive layouts working across all breakpoints
- Generative art rendering unchanged
- Playwright tests passing
- Visual snapshots updated

---

**Labels**: `ready-for-agent`, `design-migration`, `bone-and-blood`
