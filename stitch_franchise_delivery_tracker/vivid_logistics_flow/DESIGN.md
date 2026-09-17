---
name: Vivid Logistics Flow
colors:
  surface: '#f9f9ff'
  surface-dim: '#d3daef'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f3ff'
  surface-container: '#e9edff'
  surface-container-high: '#e1e8fd'
  surface-container-highest: '#dce2f7'
  on-surface: '#141b2b'
  on-surface-variant: '#484556'
  inverse-surface: '#293040'
  inverse-on-surface: '#edf0ff'
  outline: '#797588'
  outline-variant: '#c9c3d9'
  surface-tint: '#5e35f1'
  primary: '#5323e6'
  on-primary: '#ffffff'
  primary-container: '#6c47ff'
  on-primary-container: '#f1ebff'
  inverse-primary: '#c9beff'
  secondary: '#5a5f62'
  on-secondary: '#ffffff'
  secondary-container: '#dce0e4'
  on-secondary-container: '#5e6367'
  tertiary: '#006040'
  on-tertiary: '#ffffff'
  tertiary-container: '#007b54'
  on-tertiary-container: '#acffd4'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e6deff'
  primary-fixed-dim: '#c9beff'
  on-primary-fixed: '#1b0063'
  on-primary-fixed-variant: '#4500d8'
  secondary-fixed: '#dfe3e7'
  secondary-fixed-dim: '#c3c7cb'
  on-secondary-fixed: '#171c1f'
  on-secondary-fixed-variant: '#43474b'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#f9f9ff'
  on-background: '#141b2b'
  surface-variant: '#dce2f7'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '800'
    lineHeight: 44px
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '800'
    lineHeight: 36px
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 30px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 28px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 14px
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  gutter: 1rem
  margin: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style
This design system establishes a high-clarity, modern enterprise visual language tailored for franchise logistics, fleet routing, and operational delivery management. The personality balances operational precision with approachable consumer-grade polish—eliminating cognitive fatigue for fleet managers, franchise dispatchers, and drivers on the move.

The design movement synthesizes **Modern Corporate Clarity** with **Vibrant Ambient Minimalism**. Drawing inspiration from contemporary fintech layouts, it pairs ultra-clean white and soft lilac structural containers with radiant violet focal points. Visual hierarchy relies on generous micro-spacing, crisp hairline borders, and pill-shaped touch targets that provide tactile certainty in fast-paced operational workflows.

## Colors
The palette is built upon high-contrast information layering:

- **Primary (`#6C47FF`)**: Used for focal actions, selected states, route waypoints, and priority CTAs. Tints like `#F5F3FF` serve as luminous backdrop fills for active tracking cards.
- **Secondary (`#EEF2F6`)**: Subtle neutral-slate surface tint that establishes background division without harsh lines, keeping the enterprise view restful over long shifts.
- **Status Accents**:
  - **Delivered / On-Schedule**: Emerald Green (`#10B981`) with a `#ECFDF5` chip background.
  - **In-Transit / En Route**: Indigo Blue (`#3B82F6`) with an `#EFF6FF` chip background.
  - **Delayed / Attention Required**: Warm Amber (`#F59E0B`) with a `#FFFBEB` chip background.
  - **Critical Issue / Exception**: Rose Red (`#EF4444`) with a `#FEF2F2` chip background.
- **Neutrals**: Crisp pure white (`#FFFFFF`) card surfaces sit over neutral canvas backdrops (`#FAFAFC`), anchored by deep carbon slate text (`#111827`) and muted metadata typography (`#6B7280`).

## Typography
This design system uses **Plus Jakarta Sans** across all typographic tiers to ensure structural rhythm, optimal digit legibility, and geometric clarity across operational dashboards and dense logistical status tables.

Tabular figures (`tnum`) must be enforced on numerical readouts, tracking IDs, ETAs, and currency/metric cards to prevent jitter during real-time telemetric updates. Headings are weighted between bold (700) and extra-bold (800) with tightened letter tracking (-0.02em) for authority, while metadata labels use semi-bold (600) uppercase with slightly expanded tracking (+0.04em) for immediate scanning under sunlight or motion.

## Layout & Spacing
The layout architecture is configured around an 8pt base grid with a 4pt sub-grid for tight metric displays, badges, and icon alignments. 

- **Mobile Viewports (< 640px)**: 4-column fluid layout with `1rem` (16px) margins and gutters. Edge-to-edge interactive card stacks utilize full screen width minus margin buffers.
- **Tablet / In-Cab Dashboard (640px - 1024px)**: 8-column layout with `1.5rem` margins. Split view allows map telemetry on the left 5 columns and shipment queues on the right 3 columns.
- **Desktop Dispatch Console (> 1024px)**: 12-column layout with fixed navigation rail, fluid map zone, and persistent order detail inspectors.

Spacing tokens prioritize generous component internal breathing room (`space-md` to `space-lg`) to guarantee tap accuracy for field operators wearing work gloves or operating handheld terminals.

## Elevation & Depth
Elevation mimics the soft, high-end ambient diffusion seen in modern fintech applications. Harsh, dark drop shadows are strictly avoided in favor of violet- and slate-tinted ambient glows:

- **Level 0 (Flat / Canvas)**: `rgba(0, 0, 0, 0)` background on `#FAFAFC` canvas. Boundaries are maintained via hairline dividers (`#E5E7EB` or `#F3F4F6`).
- **Level 1 (Resting Cards & Modules)**: `box-shadow: 0px 4px 20px -2px rgba(108, 71, 255, 0.05), 0px 2px 6px -1px rgba(17, 24, 39, 0.03)`. Surface remains pure `#FFFFFF` with a 1px solid border in `#F3F4F6`.
- **Level 2 (Active Tracking & Hovered Items)**: `box-shadow: 0px 12px 28px -4px rgba(108, 71, 255, 0.12), 0px 4px 10px -2px rgba(17, 24, 39, 0.04)`.
- **Level 3 (Modals, Dispatch Sheets & Floating Route Navigators)**: `box-shadow: 0px 24px 48px -12px rgba(17, 24, 39, 0.14), 0px 0px 1px rgba(0, 0, 0, 0.08)`.

Floating map overlays and bottom sheets feature subtle background backdrop-filter blur (`blur(16px)`) over a 90% semi-opaque white surface.

## Shapes
A roundedness tier of **3 (Pill-shaped)** defines the system's friendly, ergonomic visual signature. 

- **Pills (`rounded-full`)**: Applied to all primary CTA buttons, filter chips, operational status tags, metric badges, and floating bottom navigation tabs.
- **Cards & Modules (`rounded-xl` / 24px - 32px)**: Content containers, delivery status summaries, and map popovers feature expansive, softened corners that echo the modern reference interface.
- **Inputs & Nested Selectors (`rounded-lg` / 12px - 16px)**: Form fields and drop-off address inputs adopt moderately rounded corners to maintain clear text baseline bounds.

## Components

- **Primary Buttons**: Fully pill-shaped (`9999px`), rendered in vibrant `#6C47FF` with pure white text, bold font weighting, and subtle purple glow on press. Secondary buttons feature a 1px border (`#E5E7EB`) over white with `#111827` text.
- **Tracking Chips & Status Pills**: Ultra-clean capsules with a 10px-12px padding. Status pills pair a 6px circular glowing indicator with semibold text (e.g., `#ECFDF5` background with `#065F46` label and `#10B981` dot for 'Delivered').
- **Logistics Delivery Cards**: White surface background with `1.25rem` internal padding, rounded-2xl geometry, hairline borders (`#F3F4F6`), and ambient shadow. Top bar contains vehicle/consignment ID and status badge; body hosts origin-destination timeline linked by dashed primary-tinted route lines; bottom displays recipient and direct call CTAs.
- **Input Fields**: Crisp `#FFFFFF` surfaces with subtle `#E5E7EB` borders. Upon focus, fields transition to a 1.5px `#6C47FF` stroke with a 3px outer ring tinted in `#6C47FF15`.
- **Checkboxes & Radios**: 20px controls with smooth 6px corners (checkbox) or circular rims (radio). Selected states fill with `#6C47FF` displaying crisp white vector marks.
- **Route Progress Stepper**: Vertical or horizontal connected nodes where completed milestones showcase filled `#6C47FF` check marks, current active stops feature a pulsing animated outer ring, and upcoming waypoints remain soft muted gray circles.