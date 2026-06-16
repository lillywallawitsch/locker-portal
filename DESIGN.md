---
version: alpha
name: GLS Locker Portal
description: Out-of-Home portal for managing GLS parcel lockers, carriers, and reservations. Built on a two-layer system — Unity (generic primitives) and OOH Kit (portal-specific).
colors:
  primary: "#061ab1"
  secondary: "#f2f4f7"
  tertiary: "#ffe100"
  neutral: "#fcfcfd"
  surface: "#ffffff"
  foreground: "#191919"
  muted: "#667085"
  border-default: "#e4e7ec"
  border-active: "#191919"
  success: "#00ad73"
  success-surface: "#d1fadf"
  success-text: "#054f31"
  warning: "#fdb022"
  warning-surface: "#fef0c7"
  warning-text: "#92400e"
  error: "#eb323b"
  error-surface: "#fee4e2"
  error-text: "#b42318"
  info-surface: "#e0efff"
  on-primary: "#ffffff"
  tooltip: "#191919"
typography:
  display:
    fontFamily: Newson GLS DTP
    fontSize: 1.5rem
    fontWeight: 600
    lineHeight: 2rem
    letterSpacing: "-0.02em"
  h1:
    fontFamily: Newson GLS DTP
    fontSize: 1.25rem
    fontWeight: 600
    lineHeight: 1.75rem
    letterSpacing: "-0.01em"
  h2:
    fontFamily: Newson GLS DTP
    fontSize: 1rem
    fontWeight: 600
    lineHeight: 1.5rem
  body-md:
    fontFamily: Newson GLS DTP
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.25rem
  body-sm:
    fontFamily: Newson GLS DTP
    fontSize: 0.75rem
    fontWeight: 400
    lineHeight: 1rem
  label:
    fontFamily: Newson GLS DTP
    fontSize: 0.875rem
    fontWeight: 500
    lineHeight: 1.25rem
    letterSpacing: "-0.01em"
  button:
    fontFamily: Newson GLS DTP
    fontSize: 0.875rem
    fontWeight: 500
    lineHeight: 1.25rem
    letterSpacing: "-0.01em"
rounded:
  sm: 6px
  md: 8px
  lg: 10px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  "2xl": 32px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.md}"
    typography: "{typography.button}"
    height: 40px
    padding: 20px
  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    typography: "{typography.button}"
    height: 40px
    padding: 20px
  button-outline:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    typography: "{typography.button}"
    height: 40px
    padding: 20px
  button-ghost:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    typography: "{typography.button}"
    height: 40px
    padding: 20px
  card:
    backgroundColor: "{colors.neutral}"
    rounded: "{rounded.lg}"
    padding: 24px
  badge-primary:
    backgroundColor: "{colors.info-surface}"
    textColor: "{colors.primary}"
    rounded: "{rounded.full}"
    typography: "{typography.body-sm}"
    padding: 8px
  badge-success:
    backgroundColor: "{colors.success-surface}"
    textColor: "{colors.success-text}"
    rounded: "{rounded.full}"
    typography: "{typography.body-sm}"
    padding: 8px
  badge-warning:
    backgroundColor: "{colors.warning-surface}"
    textColor: "{colors.warning-text}"
    rounded: "{rounded.full}"
    typography: "{typography.body-sm}"
    padding: 8px
  badge-error:
    backgroundColor: "{colors.error-surface}"
    textColor: "{colors.error-text}"
    rounded: "{rounded.full}"
    typography: "{typography.body-sm}"
    padding: 8px
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    typography: "{typography.body-md}"
    height: 40px
    padding: 12px
  tooltip:
    backgroundColor: "{colors.tooltip}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.sm}"
    typography: "{typography.body-sm}"
    padding: 8px
---

## Overview

The GLS Locker Portal is an operational dashboard for carriers, network operators, and partner staff who manage parcel lockers in the field. The visual identity is **utilitarian-precise**: a dense information surface that prioritises legibility over decoration, with brand colour reserved for action and status — never for ornament.

The aesthetic borrows from logistics control rooms — clean white surfaces, generous tabular space, monochrome text, and a single saturated GLS Blue used sparingly to mark "what to do next". Yellow appears only as the GLS brand accent (logo, strict identity contexts), never in the working UI.

The portal is built as **two layered design systems**:

- **Unity** — generic, brand-agnostic primitives (`Button`, `Badge`, `Input`, `Dialog`, `Tooltip`, `SegmentControl`, …). Reusable across any product.
- **OOH Kit** — Locker Portal–specific components built on Unity (`PageHeader`, `VerticalNav`, `TableHeader`, `Pagination`, `StatusBadge`, `CompartmentBadge`, `TableJourneyStep`, …). These encode the portal's information patterns.

UI work always reaches for an existing component first; new primitives are built only when no existing one fits, and they live in the layer (Unity vs. OOH Kit) that matches their reusability.

## Colors

The palette is high-contrast monochrome with a single saturated brand blue for action. Status colours (success / warning / error) come in matched surface + text pairs so badges, banners, and inline indicators stay legible without manual tuning.

- **Primary (`#061ab1`) — GLS Blue.** The single driver for interaction: primary buttons, active links, focus rings, selected nav items, primary KPI accents. Never decorative.
- **Secondary (`#f2f4f7`) — Cool grey.** Surface for secondary buttons, filter chips, and quiet UI containers.
- **Tertiary (`#ffe100`) — GLS Yellow.** Brand accent. Reserved for the logo and explicit brand surfaces. **Do not use in functional UI** — use Primary for action, status colours for state.
- **Neutral (`#fcfcfd`) — Card background.** Off-white, slightly warmer than the page surface, used to lift cards above the surface without a heavy border.
- **Surface (`#ffffff`) — Page background.** Pure white. The portal sits on white; cards sit on near-white.
- **Foreground (`#191919`) — Ink.** Default body and heading text.
- **Muted (`#667085`) — Slate.** Secondary text, captions, table metadata, placeholder text.
- **Border-default (`#e4e7ec`).** All standard dividers, card outlines, table rules.
- **Border-active (`#191919`).** Selected/active state on inputs and toggles.

### Status colours

Each status has a paired *surface* (badge/banner background) and *text* (badge label, icon) so they always meet contrast requirements when used together.

| Status   | Surface     | Text/Icon   | Border      |
|:---------|:------------|:------------|:------------|
| Success  | `#d1fadf`   | `#054f31`   | `#29a383`   |
| Warning  | `#fef0c7`   | `#92400e`   | `#fdb022`   |
| Error    | `#fee4e2`   | `#b42318`   | `#f04438`   |
| Info     | `#e0efff`   | `#061ab1`   | `#061ab1`   |

## Typography

The portal ships in **Newson GLS DTP** — the GLS corporate sans — with `Inter` and the system stack as fallbacks. Newson's slightly condensed metrics let dense tables breathe without sacrificing readability.

Weights in active use: 400 (regular body), 500 (labels, buttons, table headers), 600 (page titles, KPI numbers), 700 (rare emphasis).

Line height runs tight (1.25–1.5×) because the portal is information-dense. Letter spacing is *negative* on display sizes (`-0.02em`) and labels (`-0.01em`) to compensate for Newson's natural width.

| Style       | Use                                           |
|:------------|:----------------------------------------------|
| `display`   | Page-level KPI numbers, hero stats             |
| `h1`        | Page titles in `PageHeader`                    |
| `h2`        | Card titles, section headings                  |
| `label`     | Form labels, table headers, side-panel fields  |
| `button`    | All button copy — same metrics as `label`      |
| `body-md`   | Default body, table cells, descriptions        |
| `body-sm`   | Captions, metadata, badge labels, timestamps   |

## Layout

The portal uses an **8-pixel base grid** with a 4 px half-step. Spacing tokens follow this scale (`xs: 4`, `sm: 8`, `md: 12`, `lg: 16`, `xl: 24`, `2xl: 32`). Card padding is always `xl` (24 px); page gutters are `2xl` (32 px).

Page structure is a fixed left **VerticalNav** (sidebar) and a scrolling content column. Top of the content column: `NavBreadcrumb` → `PageHeader` → page body. Section primitives are tabular: filter row + insight tiles row + data table + pagination.

Side panels (parcel detail, locker detail, carrier detail) all use the same width: **`w-[95vw] max-w-[500px]`**. They slide in from the right and never resize per-flow. This is a hard rule — divergent widths feel inconsistent and the user has been burned by it before.

Tables are dense by default. Row height is **48 px**, header row **40 px**. Column dividers are omitted; the horizontal `border-default` rule between rows carries the structure.

## Elevation & Depth

The portal is **flat by intention.** Elevation comes from contrast — a card on the page is `neutral` (#fcfcfd) on `surface` (#fff) — not from drop shadows. The single exceptions:

- **Popovers, dropdowns, dialogs** — use a single soft shadow (`0 4px 12px rgba(16, 24, 40, 0.08)`) plus a `border-default` ring. This is the only true elevation in the system.
- **Tooltips** — opaque dark surface (`#191919`) with no shadow. Contrast carries the elevation.

Hover affordances use opacity (`hover:opacity-90`) or a `surface-card-hover` swap (`#f9f9fb`) — never shadow lifts.

## Shapes

Rounding is restrained:

- **`sm` (6 px)** — small inline chips, micro-affordances.
- **`md` (8 px)** — buttons, inputs, filter chips, badges with text. The default.
- **`lg` (10 px)** — cards, panels, table containers.
- **`full` (9999 px)** — status pills, avatars, icon-only buttons, the segment-control thumb.

Sharp 0-radius corners are not used. The portal reads as a single family of soft-cornered rectangles.

## Components

The portal is composed of two layers. Always check both before hand-coding UI.

### Unity (generic primitives — `src/lib/unity/components/`)

| Component        | Use                                                |
|:-----------------|:---------------------------------------------------|
| `Button`         | All actions. Variants: `primary` / `secondary` / `ghost` / `outline` / `destructive`. Sizes: `sm` / `md` / `lg`. |
| `Badge`          | Inline status pills. Variants: `primary` / `success` / `error` / `warning` / `neutral`. |
| `Dialog`         | Modal dialogs (title, body, footer slots).         |
| `Input`          | Form text input, with label and error state.       |
| `SegmentControl` | Tab-style toggle with sliding pill thumb.          |
| `SelectMenu`     | Dropdown select.                                   |
| `SelectTile`     | Selectable card tile (settings, mode pickers).     |
| `Toggle`         | On/off switch.                                     |
| `Radio`          | Radio button.                                      |
| `Tooltip`        | Hover tooltip. Dark surface, white text.           |
| `InformationBox` | Inline info / warning callout.                     |
| `CopyButton`     | One-click copy with success state.                 |
| `DatePicker`     | Date / range picker.                               |

### OOH Kit (portal-specific — `src/lib/ooh-kit/components/`)

| Component             | Use                                                       |
|:----------------------|:----------------------------------------------------------|
| `VerticalNav`         | Sidebar nav with sections + user profile footer.          |
| `NavBreadcrumb`       | Page breadcrumb with sidebar toggle.                      |
| `PageHeader`          | Page title + subtitle + actions.                          |
| `SegmentedControl`    | Multi-tab segments with count badges.                     |
| `SearchInput`         | Search field with clear button.                           |
| `FilterButton`        | Table filter dropdown trigger.                            |
| `FilterChip`          | Active-filter chip with remove affordance.                |
| `AdvancedFilterPopover` | Multi-criteria filter builder.                          |
| `ColumnsPopover`      | Show/hide table columns.                                  |
| `SavedViewsPopover`   | Saved-filter view manager.                                |
| `InsightTile`         | KPI tile (value + label + delta).                         |
| `Card`                | Lifted content container.                                 |
| `Field`               | Label + value pair for detail panels.                     |
| `OpeningHoursField`   | Locker opening-hours editor.                              |
| `TableHeader`         | Sortable column header with sort indicator.               |
| `Pagination`          | Table pagination with page numbers.                       |
| `TableJourneyStep`    | Timeline step indicators (7 variants).                    |
| `Avatar`              | Locker / parcel / user avatar with status ring.           |
| `LocationMap`         | Locker location map embed.                                |
| `ProviderLogo`        | Provider brand logos.                                     |
| `CarrierLogo`         | Carrier brand logos.                                      |
| `StatusBadge`         | Generic carrier/provider status label.                    |
| `LockerStatusBadge`   | Locker availability state.                                |
| `ParcelStatusBadge`   | Parcel lifecycle state.                                   |
| `UserStatusBadge`     | User account state.                                       |
| `ReservationTypeBadge`| Reservation flow type.                                    |
| `ShipmentTypeBadge`   | Shipment direction / class.                               |
| `CompartmentBadge`    | Compartment size pill (XS – XL).                          |
| `NeutralTag`          | Generic non-status tag.                                   |

### Icons

Icons come from **three sources only**: the Unity DS, the OOH Kit DS, or **lucide-react**. Existing custom icons (the `LockerIcon`, shipment SVGs, brand assets) are intentional and kept as-is. Do not pull icons from other Figma libraries or icon packs.

## Do's and Don'ts

### Do

- **Use Unity / OOH Kit components first.** Always check both layers before writing markup.
- **Use design tokens.** `bg-surface-card`, `text-text-foreground`, `border-border-default` — never hardcoded hex.
- **Reserve Primary blue for action.** Buttons, links, focus, selected nav. If it isn't interactive, it isn't blue.
- **Pair status surfaces with their matching text colour** (`success-surface` + `success-text`, etc.). Don't mix.
- **Keep side-panels at `w-[95vw] max-w-[500px]`.** Same width, every flow.
- **Use the 8 px grid.** All spacing is a multiple of 4 px; default to multiples of 8 px.
- **Lean on whitespace and contrast for hierarchy** before reaching for shadows or extra colour.

### Don't

- **Don't hand-code primitives the system provides.** No raw `<button>`, no manual badge markup, no bespoke modal scaffolding.
- **Don't use GLS Yellow in functional UI.** It is a brand accent, not a status or action colour.
- **Don't introduce new font families.** Newson GLS DTP only; Inter / system stack as fallback.
- **Don't add drop shadows for elevation.** Use surface contrast. Shadows are reserved for popovers, dialogs, and dropdowns.
- **Don't pull icons from arbitrary Figma libraries.** Unity DS, OOH Kit, or lucide-react only.
- **Don't size side-panels per-flow.** One width, no exceptions.
- **Don't introduce sharp-cornered surfaces.** Everything is `sm` / `md` / `lg` / `full` rounded.
- **Don't use Primary blue as a background tint for non-interactive surfaces.** It signals action; misuse drains its meaning.
