---
name: robr0-design-system
description: Build React UI with @robr0/design-system. Use when installing the package, composing its components, theming with its design tokens, or reading a component's exact prop contract.
---

# Using @robr0/design-system

Generated from the library's registries at version 0.21.0, alongside every deploy of https://robertritacca.com. The library is 132 React components across 11 categories, themed by 235 semantic design tokens, published to npm.

## Install

```bash
npm install @robr0/design-system
```

Import the token stylesheet once, then components from the barrel or by deep subpath:

```tsx
import '@robr0/design-system/tokens/tokens.css';
import { Button } from '@robr0/design-system';
import { Input } from '@robr0/design-system/components/Input/Input';
```

The package is ESM-only, resolved via exports subpaths: use a bundler that handles CSS and font imports from node_modules (Vite, Next.js, webpack) and set TypeScript's `moduleResolution` to `"bundler"` (or `"nodenext"`). Components are provider-free with one exception: wrap the tree in `ToastProvider` if (and only if) the toast queue is used via `useToast`.

## Dark mode

Set `data-theme="dark"` on the root element. Every semantic colour token has a light and a dark value; components never query `prefers-color-scheme` themselves.

## Theming

Components read semantic tokens (`--color-*`, `--radius-*`, `--font-*`, `--motion-*`, ...), and every semantic colour token references a `--primitive-*` value. Re-theme by overriding primitives: one override cascades through both themes at once. Never hardcode a colour beside the components; override the token it should come from. The full token reference lives at https://robertritacca.com/foundations, and the MCP endpoint's `list_tokens` tool serves the registry.

## Charts

Components that import recharts ship from `@robr0/design-system/charts` and need the optional recharts peer dependency. Everything in the main barrel is dependency-free.

## Fonts

The primary typeface is not bundled: set `--font-family-primary` to your own (the system is designed around Nunito Sans). The Material Symbols icon font ships inside the package, and any component import loads it.

## Timings in JavaScript

Timer-driven timings (hover delays, toast auto-dismiss, the streaming reveal's pacing) are exported as constants from `@robr0/design-system/tokens/motion`. Import the constant rather than writing a literal millisecond value.

## The catalog

references/components.md lists every component with its import line and description. The categories:

- Actions (6): Buttons, button groups, and toggles for triggering actions and switching modes.
- AI (25): Chat, agent, and model surfaces for building AI products, from the composer to the reasoning trace and the diff an agent proposes.
- Charts (16): Data visualisation components for plotting series and activity over time.
- Data display (25): Cards, tables, lists, and badges for presenting structured content.
- Effects (1): Ambient and decorative surfaces that sit behind or around the interface.
- Feedback (10): Alerts, toasts, progress, and empty states that tell people what is happening.
- Forms (21): Inputs, pickers, and selection controls for collecting and editing values.
- Layout (7): Page scaffolding: app shells, sidebars, dividers, and section headings.
- Maps (4): Geographic surfaces for showing where things are and what connects them: a globe, a flat world map, and the callout and key that explain them.
- Navigation (7): Top bars, breadcrumbs, tabs, steppers, and pagination for moving through a product.
- Overlays (10): Dialogs, drawers, menus, and tooltips that float above the page.

## Exact prop contracts

Do not guess props. Three equivalent sources, all generated from the same JSDoc that ships in the package:

- The `.d.ts` files in `node_modules/@robr0/design-system` once installed.
- `https://robertritacca.com/components/<slug>.md` — one markdown contract per component, next to its live docs page.
- The MCP endpoint at `https://robertritacca.com/api/mcp` — the `get_component` tool returns the full contract for one component.
