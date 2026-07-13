---
name: Bone & Blood
colors:
  surface: '#fbf9f3'
  surface-dim: '#dcdad4'
  surface-bright: '#fbf9f3'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3ed'
  surface-container: '#f0eee8'
  surface-container-high: '#eae8e2'
  surface-container-highest: '#e4e2dd'
  on-surface: '#1b1c18'
  on-surface-variant: '#5e3f3c'
  inverse-surface: '#30312d'
  inverse-on-surface: '#f3f1eb'
  outline: '#936e6b'
  outline-variant: '#e8bcb8'
  surface-tint: '#c0001b'
  primary: '#b7001a'
  on-primary: '#ffffff'
  primary-container: '#e60023'
  on-primary-container: '#fff7f6'
  inverse-primary: '#ffb3ad'
  secondary: '#615e5b'
  on-secondary: '#ffffff'
  secondary-container: '#e5dedb'
  on-secondary-container: '#65625f'
  tertiary: '#5e5a52'
  on-tertiary: '#ffffff'
  tertiary-container: '#77726a'
  on-tertiary-container: '#fff8f1'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad7'
  primary-fixed-dim: '#ffb3ad'
  on-primary-fixed: '#410004'
  on-primary-fixed-variant: '#930012'
  secondary-fixed: '#e7e1de'
  secondary-fixed-dim: '#cbc5c2'
  on-secondary-fixed: '#1d1b19'
  on-secondary-fixed-variant: '#494644'
  tertiary-fixed: '#e9e1d8'
  tertiary-fixed-dim: '#ccc5bc'
  on-tertiary-fixed: '#1e1b15'
  on-tertiary-fixed-variant: '#4a463f'
  background: '#fbf9f3'
  on-background: '#1b1c18'
  surface-variant: '#e4e2dd'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-sm:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Sora
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Sora
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Sora
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Sora
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 20px
  container-max: 1280px
---

## Brand & Style

This design system is built on a "High-Contrast Gallery" aesthetic, blending the intellectual weight of an editorial publication with the vibrant energy of a contemporary art space. The brand personality is sophisticated yet visceral, utilizing a warm monotone foundation to make the primary accent color feel intentional and impactful.

The visual direction follows a **refined minimalism** approach with a **tactile** twist. It prioritizes expansive whitespace, crisp typography, and subtle layering to create a sense of physical depth—as if the interface were constructed from high-quality paper stocks. The target audience values curation, precision, and a premium digital experience that feels both classic and forward-looking.

## Colors

The palette is rooted in organic, warm neutrals that mimic physical materials—paper, bone, and stone.

- **Backgrounds:** The base layer uses a warm cream (#F8F6F0). Secondary panels use a slightly deeper "Dim" tone (#F0EDE5) to create structural hierarchy without relying on harsh shadows.
- **Accents:** A singular, aggressive Red (#E60023) is used exclusively for calls to action, active states, and critical paths. This ensures the "Blood" of the system remains a focal point against the "Bone" foundation.
- **Contrast:** Typography is grounded in a deep charcoal black (#1A1816) for maximum legibility, with a muted taupe (#757068) reserved for secondary information and metadata.

## Typography

The typography system relies on a high-contrast pairing: **Playfair Display** for editorial expression and **Sora** for functional utility.

- **Headlines:** Use Playfair Display to evoke a sense of tradition and authority. Large display sizes should use tighter letter spacing to maintain a cohesive visual block.
- **UI Text:** Sora provides a clean, technical counterpoint. It should be used for all body copy, navigation, and form elements.
- **Scale:** Maintain a strict hierarchy. Ensure that editorial headings are significantly larger than functional labels to guide the eye through curated content.

## Layout & Spacing

This design system utilizes a **fixed grid** approach for desktop views to maintain the "gallery" feel, ensuring content remains centered and composed like a framed piece of art.

- **Grid:** A 12-column grid system with 24px gutters.
- **Margins:** Large horizontal margins (64px+) on desktop to provide visual breathing room. On mobile, margins compress to 20px.
- **Spacing Rhythm:** All spatial relationships should be multiples of 4px. Use generous vertical padding between sections (80px–120px) to reinforce the minimalist aesthetic and prevent visual clutter.

## Elevation & Depth

Depth is achieved through **tonal layers** and **subtle outlines** rather than heavy shadows. 

- **Surface Tiers:** Use the palette hierarchy (Neutral -> Dim -> Card) to stack elements. Higher-order elements (like cards) sit on the `#EDE9DF` surface.
- **Borders:** Use the subtle warm border (`rgba(26, 24, 22, 0.08)`) to define boundaries. Avoid shadows for a flatter, more modern editorial look.
- **Interactive Depth:** On hover, cards may transition to a slightly lighter background color or gain a very soft, diffused ambient shadow to indicate interactivity without breaking the flat aesthetic.

## Shapes

The shape language balances modern geometry with approachable soft edges.

- **Cards & Containers:** Follow a "Rounded" (0.5rem - 1.5rem) logic. Main content cards use a consistent 16px (1rem) radius to soften the high-contrast layout.
- **Buttons & Chips:** Use a **pill-shape** (fully rounded) to differentiate interactive elements from static content containers. This provides a "friendly" tactile contrast to the sharper serif typography.
- **Inputs:** Maintain the 8px (0.5rem) radius for a structured, professional appearance.

## Components

### Buttons
Primary buttons are pill-shaped with the Primary Accent (#E60023) background and white text. Secondary buttons use the Secondary color (#1A1816) or a ghost style with a subtle border. Use Sora Semi-bold for button labels.

### Cards
Cards use the `#EDE9DF` background with a 16px corner radius. They should feature no shadow, relying on the `border_subtle` for definition against the page background.

### Input Fields
Inputs use the `#F0EDE5` (Surface Dim) background with a 1px `border_subtle`. On focus, the border color transitions to the Primary Accent. Labels should always be visible above the field in Sora Semi-bold.

### Chips & Tags
Small, pill-shaped elements using the Tertiary color (#757068) for text on a Surface Dim background. These should be used for metadata and categories.

### Navigation
Top navigation should be minimal, utilizing the secondary black for links. The "active" state is indicated by a small Primary Accent dot below the text or a color change to Primary Red.