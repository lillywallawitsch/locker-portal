# GLS Locker Portal — Development Guidelines

## Tech Stack

- React 19 + TypeScript 5.9 + Vite 8 + Tailwind CSS v4
- Storybook 10 for component documentation
- Figma MCP for design-to-code workflow

## Design System Architecture

This project has a **two-layer design system**. Always use these components — never hand-code UI primitives.

### Layer 1: Unity (Base UI Kit) — `src/lib/unity/components/`

Low-level, generic components. Use these as building blocks.

| Component        | Purpose                                      |
|------------------|----------------------------------------------|
| `Button`         | Primary/secondary actions (`variant`, `size`, `icon`) |
| `Badge`          | Status pills (`variant`: primary/success/error/warning/neutral) |
| `Dialog`         | Modal dialogs with title, body, footer       |
| `Input`          | Form text input with label and error state   |
| `SegmentControl` | Tab-style toggle with pills                  |
| `SelectMenu`     | Dropdown select                              |
| `SelectTile`     | Selectable card tiles                        |
| `Toggle`         | On/off switch                                |
| `Radio`          | Radio button                                 |
| `Tooltip`        | Hover tooltip                                |
| `InformationBox` | Info/warning callout box                     |

### Layer 2: OOH Kit (Portal-specific) — `src/lib/ooh-kit/components/`

Higher-level components built on Unity, specific to the Locker Portal.

| Component          | Purpose                                         |
|--------------------|------------------------------------------------|
| `Avatar`           | Locker/parcel/user avatars with status          |
| `CompartmentBadge` | Compartment size indicator (XS–XL)              |
| `FilterButton`     | Table filter dropdown trigger                   |
| `NavBreadcrumb`    | Page breadcrumb with nav toggle                 |
| `PageHeader`       | Page title + subtitle + actions                 |
| `Pagination`       | Table pagination with page numbers              |
| `ProviderLogo`     | Provider brand logos                            |
| `SearchInput`      | Search field with clear button                  |
| `SegmentedControl` | Multi-tab segment with count badges             |
| `StatusBadge`      | Carrier/provider status labels                  |
| `TableHeader`      | Sortable table column header                    |
| `TableJourneyStep` | Journey timeline indicators (7 variants)        |
| `VerticalNav`      | Sidebar navigation with sections + user profile |

## Rules for Building UI

### 1. Always use design system components first

Before writing any UI, check if an existing component from Unity or OOH Kit covers the need:

- **Buttons** → `Button` (Unity), never raw `<button>` with hand-coded styles
- **Badges/tags** → `Badge` (Unity), `StatusBadge` / `CompartmentBadge` (OOH Kit)
- **Modals/popups** → `Dialog` (Unity) as the base
- **Search fields** → `SearchInput` (OOH Kit)
- **Form inputs** → `Input` (Unity)
- **Tabs/segments** → `SegmentControl` (Unity) or `SegmentedControl` (OOH Kit)
- **Tables** → `TableHeader` (OOH Kit) for columns, `Pagination` (OOH Kit) for paging
- **Page layout** → `NavBreadcrumb` + `PageHeader` (OOH Kit)
- **Navigation** → `VerticalNav` (OOH Kit)

### 2. If no component exists, create one

When a design requires UI that no existing component covers:

1. **Determine the layer**: Is it generic/reusable across any project → Unity. Is it specific to the Locker Portal → OOH Kit.
2. **Create the component** in the appropriate directory:
   - Unity: `src/lib/unity/components/ComponentName.tsx`
   - OOH Kit: `src/lib/ooh-kit/components/ComponentName.tsx`
3. **Export it** from the layer's index file:
   - Unity: `src/lib/unity/components/` (import directly, no barrel)
   - OOH Kit: `src/lib/ooh-kit/index.ts`
4. **Document in Storybook**: Create a story file at:
   - `src/lib/ooh-kit/components/__stories__/ComponentName.stories.tsx`
   - or `src/components/__stories__/ComponentName.stories.tsx` for app-level components
5. **Use design tokens** — never hardcode colors. Use token classes like `bg-surface-card`, `text-text-foreground`, `border-border-default`.

### 3. Never hand-code what the design system provides

Violations to watch for:
- Raw `<button>` with inline Tailwind instead of `<Button>`
- Raw `<input>` instead of `<Input>` or `<SearchInput>`
- Manually styled badges/pills instead of `<Badge>` or `<StatusBadge>`
- Custom modal/dialog markup instead of `<Dialog>`
- Hand-coded breadcrumbs instead of `<NavBreadcrumb>`

## Design Tokens

All colors use CSS custom properties defined in `src/index.css` under `@theme`. Use Tailwind token classes:

- **Surfaces**: `surface-surface` (#fff), `surface-card`, `surface-secondary`, `surface-primary`
- **Text**: `text-foreground`, `text-light`, `text-header`, `text-button`, `text-error`
- **Borders**: `border-default`, `border-light`
- **Page background**: Always `bg-surface-surface`
- **Card backgrounds**: Always `bg-surface-card`

## Figma Integration

- OOH Kit DS Library: file key `dtQUKzXW89A3erDNHXBIZR`
- Locker Overview/Detail: file key `GPcya4a7qHNSSD9anaC9n2`
- Parcel Overview/Detail: file key `vmPomwigSbSFmbuXY7OLjw`

When implementing from Figma, use `get_design_context` to get the reference code, then **adapt it to use existing design system components** rather than copying the raw Tailwind output.

## Storybook

Run with `npx storybook dev -p 6006`. All new UI components must have stories demonstrating their variants.
