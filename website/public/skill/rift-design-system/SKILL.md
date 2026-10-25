---
name: rift-design-system
description: Build React UI with rift-ds. Use when installing the package, composing its components, theming with its design tokens, or reading a component's exact prop contract.
---

# Using rift-ds

Generated from the library's registries at version 1.13.0, alongside every deploy of https://rift-ds.com. The library is 158 React components across 12 categories, themed by 293 semantic design tokens, published to npm. Designed and built by Robert Ritacca (https://robertritacca.com), MIT licensed.

## Install

```bash
npm install rift-ds
```

Import the token stylesheet once, then components from the barrel or by deep subpath:

```tsx
import 'rift-ds/tokens/tokens.css';
import 'rift-ds/tokens/base.css'; // the reset and page the components are tuned against
import { Button } from 'rift-ds';
import { Input } from 'rift-ds/components/Input/Input';
```

In a Next.js app router project, `npx rift-ds init app` scaffolds the root wrapper (`LinkProvider` with Next's `Link`), the colour-mode script and the base theme's font, and prints the root layout to use; then `npx rift-ds init block dashboard` adds a first page. Start a new screen from a block (`npx rift-ds init block` lists them) rather than from a blank file.

The package is ESM-only, resolved via exports subpaths: use a bundler that handles CSS and font imports from node_modules (Vite, Next.js, webpack) and set TypeScript's `moduleResolution` to `"bundler"` (or `"nodenext"`). Components are provider-free with one exception: wrap the tree in `ToastProvider` if (and only if) the toast queue is used via `useToast`. One more is optional: in a routed app, `LinkProvider` from `rift-ds/behaviors/LinkProvider` hands every client-rendered component your router's link, so its links navigate without a reload (in Next.js, mount it from a `'use client'` file, since the root layout is a Server Component); a component rendered on the server takes `linkComponent` on the instance instead.

## Dark mode

Set `data-theme="dark"` on the root element. Every semantic colour token has a light and a dark value; components never query `prefers-color-scheme` themselves.

The token stylesheet defines custom properties and styles no element, so paint the page yourself or a dark theme renders dark components on a white page: set `background: var(--color-bg-page-primary)`, `color: var(--color-text-primary)` and `font-family: var(--font-family-primary)` on `body`.

## Theming

Components read semantic tokens (`--color-*`, `--radius-*`, `--font-*`, `--motion-*`, ...), and every semantic colour token references a `--primitive-*` value. Re-theme by overriding primitives: one override cascades through both themes at once. Never hardcode a colour beside the components; override the token it should come from. references/tokens.md lists every semantic token with the value it resolves to in light and dark; the live reference is at https://rift-ds.com/foundations, and the MCP endpoint's `list_tokens` tool serves the registry.

## Charts

Components that import recharts ship from `rift-ds/charts` and need the optional recharts peer dependency. Everything in the main barrel is dependency-free.

## Fonts

The primary typeface is not bundled: set `--font-family-primary` to your own (the system is designed around Nunito Sans). The Material Symbols icon font ships inside the package, and any component import loads it.

## The chat widget

The whole AI chat: the panel, the streaming replies, the history, the cards and questions a reply can carry and the server handlers, set up with props. It is the package's one widget, separate from the components: `ChatWidget`, `ChatProvider` and `ChatLauncher` over a `useChat` engine, with the server half as web-standard request handlers. Scaffold it into a Next.js app router project with one command, which writes the three routes, the mount and an env example and never overwrites a file:

```bash
npx rift-ds init chat
```

Its subpaths, each with the optional peers it needs:

- `rift-ds/chat`: The widget, the provider, the launcher and the engine under them. Peers: react-markdown, remark-gfm.
- `rift-ds/chat/server`: The streaming chat handler, with an opt-in tool for asking the visitor questions, and its follow-ups and feedback siblings, for any web-standard route. Peers: @anthropic-ai/sdk.
- `rift-ds/chat/upstash`: Rate limits, a daily budget and the exchange log over Upstash Redis, as the handlers' guardrails. Peers: @upstash/ratelimit, @upstash/redis.
- `rift-ds/chat/demo`: A scripted conversation with rich cards and fixtures, for a preview that needs no key. Peers: recharts.
- `rift-ds/chat/chat.css`: The widget's stylesheet.

Every prop is documented at https://rift-ds.com/components/ai-chat (the contract as markdown at https://rift-ds.com/components/ai-chat.md, and through the MCP `get_component` tool by the name `ChatWidget`); how to add it, the protocol and the server options are at https://rift-ds.com/docs/chat. A scripted transport (`scriptChat()`, and the ready-made story in `rift-ds/chat/demo`) runs the widget with no model, route or key, for previews and tests.

## Timings in JavaScript

Timer-driven timings (hover delays, toast auto-dismiss, the streaming reveal's pacing) are exported as constants from `rift-ds/tokens/motion`. Import the constant rather than writing a literal millisecond value.

## Breakpoints

The widths the library's layouts switch at are exported from `rift-ds/tokens/breakpoints`, each the last width of the narrower side. In JavaScript, build a query with `mediaBelow(BREAKPOINT_MOBILE_PX)` or `mediaAbove(...)` rather than writing the string. In CSS, a media query cannot read a variable, so write the number from that module, and match the library's steps where your layout meets its components.

## The catalog

references/components.md lists every component with its import line and description. The categories:

- Actions (9): Buttons, button groups, and toggles for triggering actions and switching modes.
- AI (34): Chat, agent, and model surfaces for building AI products, from the composer to the reasoning trace and the diff an agent proposes.
- Charts (16): Data visualisation components for plotting series and activity over time.
- Data display (28): Cards, tables, lists, and badges for presenting structured content.
- Effects (2): Ambient and decorative surfaces that sit behind or around the interface.
- Feedback (10): Alerts, toasts, progress, and empty states that tell people what is happening.
- Forms (21): Inputs, pickers, and selection controls for collecting and editing values.
- Inspector (7): One-row controls for tool panels and settings rails, each carrying its name inside the control and sized to match Button.
- Layout (8): Page scaffolding: app shells, sidebars, dividers, and section headings.
- Maps (4): Geographic surfaces for showing where things are and what connects them: a globe, a flat world map, and the callout and key that explain them.
- Navigation (9): Top bars, breadcrumbs, tabs, steppers, and pagination for moving through a product.
- Overlays (10): Dialogs, drawers, menus, and tooltips that float above the page.

## Exact prop contracts

Do not guess props. Three equivalent sources, all generated from the same JSDoc that ships in the package:

- The `.d.ts` files in `node_modules/rift-ds` once installed.
- `https://rift-ds.com/components/<slug>.md`: one markdown contract per component, next to its live docs page.
- The MCP endpoint at `https://rift-ds.com/api/mcp`: the `get_component` tool returns the full contract for one component.

## Related skills

The other skills `npx rift-ds init` installs beside this one read this skill's references:

- `rift-apply-theme`: Restyles existing screens onto the tokens and components.
- `rift-style-audit`: Audits a project's styles for hardcoded values that should be tokens.
