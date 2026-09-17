# Stackt — Permanent Rules

## 1. Shared header/nav — one component, never per-screen

The Stackt logo, header, and bottom navigation live in ONE shared component: [src/components/Layout.tsx](src/components/Layout.tsx). Every screen renders inside `<Layout />` via the router's `<Outlet />` and gets the logo/header/nav from it.

Never recreate or restyle the logo/header/bottom nav inside an individual screen component. A screen may have its own in-page nav element (e.g. the back-arrow + "STACKT" label at the top of [LogSession.tsx](src/pages/LogSession.tsx)) if the design calls for it, but that is additional to the shared `Layout`, not a replacement for it — don't remove or fork `Layout`'s header/nav on a per-screen basis.

## 2. Figma frames never override the shared header/nav

When restyling or building a screen from a Figma reference, ignore whatever logo/header/nav treatment is shown in that specific frame if it differs from what's already defined in `Layout.tsx`. The shared component is always the source of truth for those elements — pull layout, colors, copy, and content structure for the rest of the screen from the Figma frame, but not the logo/header/bottom nav.

## 3. Reusable UI elements are shared components, not one-off markup

Buttons, input fields, discipline chips/pills, toggle switches, cards, etc. are built once as shared components and reused across screens. Before writing new markup for one of these on a new screen, check whether a matching component already exists (e.g. [src/components/DisciplinePicker.tsx](src/components/DisciplinePicker.tsx), the icon set in [src/assets/icons.tsx](src/assets/icons.tsx)) and reuse/extend it instead of writing a new inline version.

## 4. Colors and fonts come from the Tailwind theme — never hardcoded

All colors and fonts come from the theme tokens already configured in [src/index.css](src/index.css) (`@theme` block: `ink`, `accent`, `warning`/`warning-bg`, `success`/`success-bg`, `discipline-strength`, `discipline-run`, `discipline-bike`, `discipline-swim`, `discipline-hyrox`) or Tailwind's built-in palette (e.g. `gray-*`, `slate-*`). Never hardcode a hex color (`text-[#111827]`, `bg-[#4F46E5]`, etc.) or a font directly in a component — if a design calls for a color not yet in the theme, add it to the `@theme` block in `index.css` first, then reference it by name.

`warning` is reserved for conflict-flagging UI only — never use it for anything else (see comment above its definition in `index.css`).

## 5. Linked sessions are exempt from "insufficient rest" conflict detection

Sessions can share a `linkGroupId` (see [src/types.ts](src/types.ts)) to mark them as intentionally back-to-back with zero rest — e.g. a triathlon brick (bike immediately followed by run). This is a lightweight display-only grouping tag; linked sessions remain fully independent records (editing, completing, or deleting one never touches the others).

When conflict-detection logic (recovery/rest-gap warnings) is built, it **must** exempt any pair of sessions that share a `linkGroupId` from an "insufficient rest between sessions" rule. Zero rest between a linked pair is intentional, not a risk to flag.
