<a href="https://dragonspine.vercel.app"><img src=".github/readme-banner.jpg" alt="Dragonspine DS, the AI-ready React design system" width="100%"></a>

# Dragonspine DS

<!-- npm-badge:start -->
[![npm](https://img.shields.io/npm/v/@robr0%2Fdesign-system?logo=npm&color=CB3837)](https://www.npmjs.com/package/@robr0/design-system)
<!-- npm-badge:end -->
[![license: MIT](https://img.shields.io/badge/license-MIT-4c1)](LICENSE)

An open source React design system built for AI products and coding agents: components on a three-tier token architecture, complete theme presets that restyle everything with one attribute, and machine surfaces (an MCP endpoint, per-component contracts, an installable agent skill) so your coding agent knows the library as well as you do.

## Why Dragonspine DS

- **One package, zero dependencies.** React is the only required peer dependency; recharts is optional and only for the charts entry. No configuration API, no providers, no build-tool integration: theming is plain CSS custom properties, so it works in any bundler, in any stack, beside anything you already use.
- **Whole themes behind one attribute.** A shipped theme is a complete look: both colour modes, a heading and body type pairing with self-hosted fonts, radius, density, motion, elevation, the ambient background, and the chart palette. Setting `data-brand` on the root element applies all of it with zero runtime JavaScript, and the build holds every theme's action colours to WCAG AA in both modes.
- **The AI product set, free.** Composer, streaming chat thread, tool calls, reasoning, thread panel and tabs: the components an assistant UI needs, the same set this repo's own site chat is built from, all MIT with no pro tier.
- **Legible to coding agents.** One command installs the agent skill and prints the MCP connect line, and the MCP tools and per-component markdown are generated from the same JSDoc that builds the shipped `.d.ts`: an agent reads the exact contract npm ships, no key, no account.
- **Docs that cannot lie.** Every count, list, and prop table is generated from source registries and build-validated; CI fails on drift, and every component story ships through an accessibility audit. What the docs say is what ships.

## Documentation

Everything deep lives on the docs site: **[dragonspine.vercel.app](https://dragonspine.vercel.app/)**, with live examples, foundations, templates, the playground, and the **[get-started guide](https://dragonspine.vercel.app/docs/get-started)**. **[Storybook](https://dragonspine-storybook.vercel.app/?path=/docs/dragonspine-ds--docs)** is the interactive component explorer.

## Install

```bash
npm install @robr0/design-system
```

Import the token stylesheet once, then use components:

```tsx
import '@robr0/design-system/tokens/tokens.css';
import { Button, Card, Badge } from '@robr0/design-system';
```

React 19+ is a peer dependency. The package is ESM-only and resolved via `exports` subpaths: use a bundler that handles CSS and font imports from `node_modules` (Vite, Next.js, webpack) and set TypeScript's `moduleResolution` to `"bundler"` or `"nodenext"`. The Recharts-backed charts live behind `@robr0/design-system/charts`, so the optional `recharts` peer dependency is only needed if you use them. Prefer owning the source? Clone this repo and build on it directly; all of it is MIT.

## Set up your agent

One command teaches a coding agent the system: it installs the generated agent skill into your project and prints the MCP connect line.

```bash
npx @robr0/design-system init
```

The MCP endpoint serves the component catalogue, per-component prop APIs, the token registry, install setup, and docs search to any client. No key, no account, no model calls: every tool reads only published, generated data, built from the same JSDoc that produces the shipped `.d.ts`, so an agent reads the exact contract npm ships.

```bash
claude mcp add --transport http dragonspine-ds https://dragonspine.vercel.app/api/mcp
```

Every component's prop contract is also plain markdown (append `.md` to its docs URL), and [llms.txt](https://dragonspine.vercel.app/llms.txt) indexes every machine surface. Then just ask: "Build a settings page with Dragonspine components."

## Theming

Theming is CSS custom properties; there is no configuration API and no provider (one exception: wrap your tree in `ToastProvider` if, and only if, you use the toast queue via `useToast`). Complete looks ship as generated stylesheets: import the aggregate once and one attribute rethemes everything, light and dark, typefaces included (each preset self-hosts its faces).

```tsx
import '@robr0/design-system/tokens/presets/presets.css';

<html data-brand="terminal">
```

- **Dark mode**: `data-theme="dark"` on the root element; light is the default.
- **Your own brand**: every semantic token chains to a primitive, so overriding one primitive re-themes everything built on it. The [playground](https://dragonspine.vercel.app/playground) restyles the system live and copies out a complete, paste-ready override.
- **Fonts**: no text face is bundled and the whole scale chains to `--font-family-primary` (split heading and body faces via `--font-family-heading` and `--font-family-body`); point them at any font you load.
- **Icons**: a Material Symbols Rounded variable font is bundled and components import it themselves, with every Google axis exposed as a custom property. Every icon prop also takes your own element, so any icon set drops in.

## Components

<!-- component-count -->132<!-- /component-count --> components, including a chat set for AI products (Chat thread, Composer, Tool call, Reasoning, Thread panel) and Shader field, a WebGL2 ambient background whose light sources read your colour tokens at runtime, so it re-themes with everything else. Details and live examples are on the [docs site](https://dragonspine.vercel.app/components).

<details>
<summary>The full list</summary>

<!-- component-list:start -->
Accordion · Agent plan · Agent status · AI button · Alert · Alert dialog · Anchor nav · Animated number · App layout · App sidebar · Area chart · Avatar · Avatar group · Badge · Banner · Bar chart · Breadcrumb · Button · Button group · Card · Card stack · Carousel · Chat header · Chat marker · Chat message · Chat thread · Checkbox · Chip · Circular button · Code block · Code diff · Colour picker · Combo chart · Combobox · Command palette · Composer · Contact card · Context menu · Contribution graph · Data table · Date input · Date picker · Dialog · Divider · Document chip · Drawer · Dropdown · Dropdown menu · Empty state · Entity card · Event calendar · Field · Figure · File input · Filter bar · Funnel chart · Gantt chart · Gauge · Globe · Hover card · Image compare · Input · Instructions · Interrupt card · Kbd · Legend tile · Lightbox · Line chart · Link list · Map callout · Map legend · Message actions · Message card · Meter · Model picker · Nav · Nav list · Notification centre · Number input · Pagination · Panel · Pie chart · Pin input · Popover · Progress bar · Prompt suggestions · Prose · Quote · Radar chart · Radial chart · Radio button · Rating · Reasoning · Rich dropdown · Scatter chart · Section title · Segmented control · Selection card · Shader field · Skeleton · Slider · Source chip · Source trail · Sparkline · Spinner · Split button · Split pane · Stacked bar chart · Stat · Status dot · Stepper · Streaming text · Swatch · Table · Tabs · Tag input · Textarea · Thread panel · Thread tabs · Time picker · Timeline · Toast · Toggle group · Toggle switch · Tool call · Toolbar · Tooltip · Tree view · Treemap · Usage card · Waveform · World map
<!-- component-list:end -->

</details>

## Tech

- **React 19 + TypeScript**: component library
- **Vite 7**: dev server and library build
- **Next.js 16**: the documentation site
- **Storybook 10**: component explorer
- **Vitest + Playwright + axe**: every Storybook story runs as a render test in headless Chromium, with an accessibility audit on each
- **CSS custom properties**: all theming via semantic tokens, no CSS-in-JS

The [overview](https://dragonspine.vercel.app/overview) shows the generate-and-validate pipeline behind the docs.

## Running locally

```bash
npm install                         # once, at the root (the website is an npm workspace)
npm run storybook                   # component explorer at http://localhost:6006
npm run dev --workspace website     # docs site at http://localhost:3000
npm run verify                      # the full local quality gate, mirroring CI
```

## License

MIT, the whole repository: components, tokens, scripts, the website, and the docs. Use it in anything. See [`LICENSE`](LICENSE) for the full terms.
