---
name: Dispatch Ledger
description: A light violet franchise-credit console — who owes what, and how late.
colors:
  violet: "#6d4aec"
  violet-strong: "#5b37e0"
  violet-ink: "#4b32c0"
  violet-lift: "#8b6cff"
  violet-soft: "#efeaff"
  violet-softer: "#f7f4ff"
  ground: "#f4f2fb"
  card: "#ffffff"
  surface-2: "#f7f5fd"
  surface-3: "#f0edfa"
  ink: "#191533"
  text-2: "#3d3866"
  mute: "#6a6790"
  mute-soft: "#75729c"
  line: "#eae7f6"
  line-strong: "#ddd8f0"
  ok: "#0e8f66"
  ok-chart: "#12b981"
  ok-soft: "#e4f8f0"
  warn: "#a86a00"
  warn-chart: "#f5a524"
  warn-soft: "#fff4e0"
  danger: "#d42a52"
  danger-chart: "#e0335a"
  danger-soft: "#ffedf1"
  primary-foreground: "#ffffff"
typography:
  display:
    fontFamily: "Manrope Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(34px, 5vw, 50px)"
    fontWeight: 800
    lineHeight: 1.08
    letterSpacing: "-0.045em"
  headline:
    fontFamily: "Manrope Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "27px"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Manrope Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15.5px"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Manrope Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "13.5px"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "-0.011em"
  label:
    fontFamily: "Manrope Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "11.5px"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "0.04em"
rounded:
  field: "14px"
  card: "20px"
  modal: "24px"
  shell: "26px"
  pill: "999px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  shell: "18px"
  lg: "22px"
  xl: "26px"
components:
  button-primary:
    backgroundColor: "{colors.violet}"
    textColor: "{colors.primary-foreground}"
    typography: "{typography.body}"
    rounded: "{rounded.field}"
    padding: "11px 20px"
  button-primary-hover:
    backgroundColor: "{colors.violet-strong}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.field}"
    padding: "11px 20px"
  button-ghost:
    backgroundColor: "{colors.card}"
    textColor: "{colors.text-2}"
    rounded: "{rounded.field}"
    padding: "11px 20px"
  button-ghost-hover:
    backgroundColor: "{colors.violet-soft}"
    textColor: "{colors.violet-ink}"
    rounded: "{rounded.field}"
    padding: "11px 20px"
  input:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.field}"
    padding: "12px 14px"
  input-focus:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "12px 14px"
  card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "18px 20px"
  nav-item:
    backgroundColor: "transparent"
    textColor: "{colors.mute}"
    rounded: "{rounded.field}"
    padding: "11px 14px"
  nav-item-active:
    backgroundColor: "{colors.violet-soft}"
    textColor: "{colors.violet-ink}"
    rounded: "{rounded.field}"
    padding: "11px 14px"
  stamp-paid:
    backgroundColor: "{colors.ok-soft}"
    textColor: "{colors.ok}"
    rounded: "{rounded.pill}"
    padding: "4px 11px"
  stamp-overdue:
    backgroundColor: "{colors.warn-soft}"
    textColor: "{colors.warn}"
    rounded: "{rounded.pill}"
    padding: "4px 11px"
  stamp-critical:
    backgroundColor: "{colors.danger-soft}"
    textColor: "{colors.danger}"
    rounded: "{rounded.pill}"
    padding: "4px 11px"
  capture-dock:
    backgroundColor: "{colors.violet-softer}"
    textColor: "{colors.ink}"
    rounded: "18px"
    padding: "14px"
---

# Design System: Dispatch Ledger

## Overview

**Creative North Star: "The Light Violet Console"**

Dispatch Ledger is a brief-pinned Geex-style admin console: a lavender page, white cards floating at 20px, and a single violet accent. It is an operate surface for two admins who need the outstanding balance, who is past terms, and a way to record a payment without leaving the nav. The personality is airy and exact — not a dark gold ledger, not a five-tile KPI strip, not a marketing dashboard.

Density is generous. The shell sits in 18px of ground; cards lift with a violet-tinted shadow rather than a hard offset. Manrope at extra-bold carries titles and rupee figures; the same family at medium carries body copy. Money is INR, full figures, tabular. When the ledger has no movements, charts do not draw empty axes — they say so in muted copy.

The operating light is the only light. `color-scheme` is locked to light; there is no shipped dark theme.

**Key Characteristics:**

- Lavender ground with floating white cards (20px radius)
- One violet accent, used sparingly on actions, active nav, and the DL mark
- Sticky white sidebar with a capture dock (franchise, amount, method)
- Three dashboard metric cards with sparklines — not five equal KPIs
- Tabular rupees in full INR; empty charts speak in copy, not fake geometry
- Light only

## Colors

A cool lavender field, white paper, one violet voice, and three ageing inks (settled, late, critical).

### Primary
- **Ledger Violet** (#6d4aec): The only accent. Primary buttons, active nav ink, focus rings, sparkline for Dispatched, area/bar fill when a chart has data, toast, DL mark, avatars. Hover deepens to **Violet Strong** (#5b37e0). Text-on-tint uses **Violet Ink** (#4b32c0).
- **Violet Lift** (#8b6cff): Gradient start on the DL mark and avatars (`145deg` into Ledger Violet, then Violet Strong). Not a second accent — a highlight on the same stone.
- **Violet Soft** (#efeaff) / **Violet Softer** (#f7f4ff): Active nav pill, capture-dock wash, input focus ring, row hover. These keep violet present without painting the page.

### Neutral
- **Lavender Ground** (#f4f2fb): The page. Ambient glows sit on it; they never replace it.
- **White Card** (#ffffff): Every floating surface — sidebar, metric card, panel, rail card, login card, modal.
- **Surface Two** (#f7f5fd) / **Surface Three** (#f0edfa): Recessed wells (inputs at rest, table headers, segmented track, capture-dock fields).
- **Ink** (#191533): Titles, rupee figures, active copy.
- **Text Two** (#3d3866): Secondary body and table cells.
- **Mute** (#6a6790) / **Mute Soft** (#75729c): Subtitles, placeholders, empty-state copy, nav at rest.
- **Line** (#eae7f6) / **Line Strong** (#ddd8f0): Hairline borders; hover on cards steps to Line Strong.

### Semantic (ageing, not decoration)
- **Settled Green** (#0e8f66) on **Ok Soft** (#e4f8f0): Paid stamps, Received sparkline (#12b981), up-deltas.
- **Term Amber** (#a86a00) on **Warn Soft** (#fff4e0): Overdue stamps, Outstanding sparkline (#f5a524).
- **Critical Rose** (#d42a52) on **Danger Soft** (#ffedf1): Critical stamps, alert badges, destructive copy. Chart/badge solid is (#e0335a).

### Named Rules
**The One Violet Rule.** One accent. Ledger Violet and its tints (ink, strong, soft, lift) are the same voice. Do not add a second brand color.

**The Light-Only Rule.** The console is light. Do not introduce a dark theme, invert the ground, or gold-on-cream the ledger.

## Typography

**Display Font:** Manrope Variable (with ui-sans-serif, system-ui, sans-serif)
**Body Font:** Manrope Variable (same stack)
**Label/Mono Font:** Manrope Variable — money and counts use tabular figures on this family, not a second face

**Character:** One geometric sans, extra-bold for the question and the rupee, medium for the explanation. Tracking is tight on titles so 27px still reads as a headline, not a poster.

### Hierarchy
- **Display** (800, clamp 34–50px, 1.08, −0.045em): Login hero only (“Track every franchise, every payment.”).
- **Headline** (800, 27px desktop / 23px at 768px / 21px at 480px, 1.15, −0.035em): Page titles in the top bar. Stat values sit beside this rank at 25px (20px on mobile), extra-bold, −0.04em, nowrap ellipsis so a rupee never wraps.
- **Title** (800, 15.5px, −0.025em): Product name in the sidebar, panel headings, login card title.
- **Body** (500, 13.5px, 1.5, −0.011em): Subtitles (max ~62ch in the top bar), table cells, empty-state copy, form text. Buttons use this size at 700.
- **Label** (700, 11.5px, 0.04em, uppercase): Metric card labels. Table headers and ledger column titles drop to 10.5px / 0.08em uppercase in Mute.

### Named Rules
**The Tabular Rupee Rule.** Amounts that a decision depends on are full INR (`₹` + `en-IN` grouping, no paise, no Cr/L/k abbreviation). They use `font-variant-numeric: tabular-nums`. Chart axes may compact (`₹1.2L`); the figure a person acts on does not.

## Layout

The chrome is a flex shell: 18px padding, 18px gap, sticky white sidebar (244px × `calc(100vh − 36px)`, 26px radius) and a main column capped at 1520px. The sidebar holds the DL mark, nav, the capture dock, and the signed-in account with Log out. The top bar is title + subtitle, a 280px pill search, an alert bell, and the account avatar.

The dashboard first viewport is three equal metric cards (`card-grid--hero`), then a wide dispatched-vs-received panel, then a two-column pair (weekly bars + ageing donut), with a 300px sticky right rail (Needs chasing, Latest activity, signed-in account). Other routes reuse the shell and top bar without that rail.

Rhythm: 16px between metric cards, 18px between board columns, 20px below a card grid, 26px below the top bar. Internal panel padding is 18–22px.

At 1280px the rail drops under the board as three columns, then one. At 1024px hero metrics stack; the top-bar search hides. At 768px the sidebar becomes a 290px left drawer over a blurred overlay, a sticky frosted mobile top bar appears, metrics stack, tables become mobile cards, and modals become bottom sheets (26px top radius).

## Elevation & Depth

Hybrid: a lavender ground with three slow, blurred glows (violet, sky, rose), then white cards that actually lift. Depth is the card shadow, not a second surface color. Hover on a metric card steps from shadow-sm to shadow-md and translates −3px.

### Shadow Vocabulary
- **Hairline** (`box-shadow: 0 1px 2px rgba(25, 21, 51, 0.05)`): Search pill, icon pill, segmented active thumb.
- **Card rest** (`box-shadow: 0 1px 2px rgba(25, 21, 51, 0.04), 0 2px 8px rgba(78, 52, 180, 0.05)`): Sidebar, stat cards, panels, rail cards. Default lift.
- **Card hover** (`box-shadow: 0 2px 5px rgba(25, 21, 51, 0.04), 0 8px 24px rgba(78, 52, 180, 0.08)`): Metric card hover.
- **Modal / login** (`box-shadow: 0 5px 12px rgba(25, 21, 51, 0.05), 0 20px 48px rgba(78, 52, 180, 0.14)`): Login card, dialogs.
- **Accent** (`box-shadow: 0 2px 5px rgba(109, 74, 236, 0.2), 0 8px 22px rgba(109, 74, 236, 0.28)`): Primary buttons, DL mark, avatars, toasts. Hover on primary deepens the same violet, not a black drop.

### Named Rules
**The Floating Card Rule.** White on lavender, 20px corners, Card-rest shadow. Do not flatten cards into the ground, and do not replace the tinted lift with a hard offset slab.

## Shapes

Cards and panels are continuously rounded at 20px. Fields, primary buttons, and nav items share 14px. Chrome that frames the session — sidebar and login card — opens to 26px; modals sit at 24px (26px top-only as a mobile sheet). Pills (stamps, search, alert counts) are fully round. The DL mark is a 13px-radius square with a 145° violet gradient. Avatars are circles. Segmented controls are a 14px track with a 10px thumb.

Borders are 1px Line, not drawn frames. Focus is a 2px Ledger Violet outline, 2px offset — or, on fields, a 3px Violet Soft ring plus a violet border.

## Components

### Buttons
- **Shape:** 14px corners (11px on `.btn-sm`); 13.5px / 700; 11px 20px padding; 7px icon gap.
- **Primary:** Ledger Violet fill, white label, Accent shadow. Hover: Violet Strong, −1px translate, deeper violet shadow. Disabled: Surface Three, Mute, no shadow.
- **Ghost:** White fill, Line border, Text Two. Hover: Violet Soft fill, violet border, Violet Ink. Used for Log out and New delivery in the dock.
- **Link:** Violet Ink, 700, no chrome; hover shifts the icon gap 6px → 9px.
- **Focus:** 2px violet outline, 2px offset.

### Cards / Containers
- **Corner Style:** 20px (`--r-card`)
- **Background:** White Card
- **Shadow Strategy:** Card rest; metric cards hover to Card hover and −3px
- **Border:** 1px Line
- **Internal Padding:** 18px 20px on metric cards; 16px on rail cards; panel heads 18px 22px
- Metric cards on the dashboard are a 3-column hero: uppercase label, tabular rupee, delta chip + note, optional 96×56 sparkline (violet / green / amber). Franchise detail uses a four-up grid of the same card language, not a fifth equal KPI on the dashboard.

### Inputs / Fields
- **Style:** Surface Two well, 1px Line, 14px radius, 12px 14px, 13.5px / 500
- **Focus:** White fill, violet border, 3px Violet Soft ring
- **Capture-dock fields:** White wells at 40px height, 12px radius, stacked above Log payment
- **Error:** Danger at 12.5px / 600; warm server-wake copy uses Warn on Warn Soft

### Navigation
- Sidebar items: 14px / 600, 11px 14px, 14px radius, Mute at rest. Hover: Surface Two + Ink. Active: Violet Soft + Violet Ink.
- Section labels (if used): 10.5px / 700 / 0.1em uppercase Mute Soft.
- Alerts carry a Danger Chart count pill.
- Mobile: hamburger 42px, frosted top bar (`color-mix` ground 88% + 18px blur).

### Status stamps
Pill (fully round) with a 6px currentColor dot. Paid / pending / overdue / critical map to the semantic pairs above. **None** (“No Activity”) is Mute Soft on Surface Two with the dot removed — an account with no deliveries has no standing to report.

### Capture dock (signature)
Lavender-softer well (18px radius) pinned at the bottom of the sidebar, above the account. Title 13.5px / 800 “Record a payment”; hint in Mute. Franchise select, amount, method (Cash / Cheque / Online), optional reference, then a block primary “Log payment” and a block ghost “New delivery”. Recording stays in the nav on every route.

### Charts and empty states
When the ledger has no movements, the dispatched-vs-received panel, weekly bars, ageing donut, and month-wise report render centered Mute copy (13.5px / 500, 46px padding) — e.g. “No deliveries or payments in this period. Record a dispatch against a franchise and the trend appears here.” Do not draw empty axes, placeholder series, or a zero donut.

When data exists, dispatched is Ledger Violet and received is Ok Chart; ageing slices are violet / amber / rose. Sparklines on the three dashboard metrics still draw from those series even at ₹0 (a flat line is honest; a fake trend is not).

### Login
Centered on Ground. Display headline, then a 400px / 26px-radius white card (Modal shadow) with the DL mark, username/password, and a block primary Sign in. Trust line in Mute Soft below the card.

## Do's and Don'ts

### Do:
- **Do** sit every operate screen on Lavender Ground with 20px white cards and Card-rest shadow.
- **Do** use Ledger Violet as the single accent — buttons, active nav, focus, DL mark.
- **Do** set money in full tabular INR (`₹1,23,456`) on any figure a person acts on.
- **Do** keep the capture dock (franchise, amount, method) in the sidebar so a payment can be logged without leaving the nav.
- **Do** replace empty charts with Mute copy that tells the admin what to record next.

### Don't:
- **Don't** ship a dark theme or restore the released gold-and-cream ledger.
- **Don't** put five equal KPI tiles on the dashboard; the first viewport is three (Dispatched, Received, Outstanding).
- **Don't** abbreviate rupees on decision figures, or wrap a rupee onto two lines.
- **Don't** draw empty chart geometry when there are no movements.
- **Don't** add a second accent, a kicker above the page title, or a hard offset shadow.
