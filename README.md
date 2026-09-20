# robr0: portfolio + AI-ready design system

[![CI](https://github.com/robritacca-dotcom/design-system/actions/workflows/ci.yml/badge.svg)](https://github.com/robritacca-dotcom/design-system/actions/workflows/ci.yml)
<!-- npm-badge:start -->
[![npm](https://img.shields.io/npm/v/@robr0%2Fdesign-system?logo=npm&color=CB3837)](https://www.npmjs.com/package/@robr0/design-system)
<!-- npm-badge:end -->

A personal portfolio site, the AI-ready React design system behind it, and the AI layer that lets the site answer questions about itself. Claude Code builds all of it from the written specs in this repo (`CLAUDE.md` for the rules, `design.md` for the design language, `content-design.md` for how every word reads), and generated registries keep this README and the docs site from drifting. The design system is the backbone every portfolio page is built on, so the work is presented consistently and to the same craft standards throughout.

**[→ Live site](https://robertritacca.com/)** · **[→ Storybook](https://design-system-iota-one.vercel.app/?path=/docs/robr0-ds--docs)**

The **live site** is the portfolio built on the design system. **Storybook** is the interactive component explorer for the design system itself. They deploy separately: two Vercel projects from one repo.

---

## Three parts, one repo

| Part | Description |
|---|---|
| **Portfolio website** (`/website`) | Next.js app with case studies, work history, writing, and about pages, all built exclusively with the design system components below. **[Live site →](https://robertritacca.com/)** |
| **Design system** (`/src`) | <!-- component-count -->132<!-- /component-count --> React components, a three-tier token architecture, dark mode, a WebGL2 ambient background that themes itself from your tokens, and a full documentation site. Built to production standards. **[Storybook →](https://design-system-iota-one.vercel.app/?path=/docs/robr0-ds--docs)** |
| **AI layer** (`ai` components in `/src`, chat in `/website`, `/evals`) | A site-wide chat that answers questions about the work: built from the library's own `ai` components, grounded in a corpus generated from the site's published content plus lookup tools over the generated prop and token contracts, and scored by a golden-set eval. An MCP endpoint serves the same public data to any agent. |

---

## Design system

### Components

<!-- component-list:start -->
Accordion · Agent plan · Agent status · AI button · Alert · Alert dialog · Anchor nav · Animated number · App layout · App sidebar · Area chart · Avatar · Avatar group · Badge · Banner · Bar chart · Breadcrumb · Button · Button group · Card · Card stack · Carousel · Chat header · Chat marker · Chat message · Chat thread · Checkbox · Chip · Circular button · Code block · Code diff · Colour picker · Combo chart · Combobox · Command palette · Composer · Contact card · Context menu · Contribution graph · Data table · Date input · Date picker · Dialog · Divider · Document chip · Drawer · Dropdown · Dropdown menu · Empty state · Entity card · Event calendar · Field · Figure · File input · Filter bar · Funnel chart · Gantt chart · Gauge · Globe · Hover card · Image compare · Input · Instructions · Interrupt card · Kbd · Legend tile · Lightbox · Line chart · Link list · Map callout · Map legend · Message actions · Message card · Meter · Model picker · Nav · Nav list · Notification centre · Number input · Pagination · Panel · Pie chart · Pin input · Popover · Progress bar · Prompt suggestions · Prose · Quote · Radar chart · Radial chart · Radio button · Rating · Reasoning · Rich dropdown · Scatter chart · Section title · Segmented control · Selection card · Shader field · Skeleton · Slider · Source chip · Source trail · Sparkline · Spinner · Split button · Split pane · Stacked bar chart · Stat · Status dot · Stepper · Streaming text · Swatch · Table · Tabs · Tag input · Textarea · Thread panel · Thread tabs · Time picker · Timeline · Toast · Toggle group · Toggle switch · Tool call · Toolbar · Tooltip · Tree view · Treemap · Usage card · Waveform · World map
<!-- component-list:end -->

### Ambient background

The package ships more than components. **Shader field** is a WebGL2 canvas that sums soft Gaussian light sources into an ambient field of colour, and every source reads a semantic colour token at runtime. Override a primitive and the background re-themes with the rest of the system, in both themes, with nothing wired up:

```tsx
import { ShaderField, type ShaderFieldStatus } from '@robr0/design-system';

const [status, setStatus] = useState<ShaderFieldStatus>('pending');

<div style={{ position: 'fixed', inset: 0, zIndex: -1 }}>
  {status === 'unavailable' && <YourCssFallback />}
  <ShaderField params={{ streak: 0.4 }} onStatusChange={setStatus} />
</div>
```

Eight parameters describe the look, and a composition is a table of token names with positions and drift periods, so a negative weight cuts a shadow through the field instead of adding light to it.

It asks two things of you, both deliberate. It fills a positioned ancestor you provide, because where a background sits is a layout decision rather than a rendering one. And it never decides what to paint instead of itself: it reports `pending`, `active` or `unavailable`, and one fallback covers every way it can fail (no WebGL2, a blocked or lost GPU context, a renderer that stalls before its first frame, or `enabled={false}` as a kill switch). `pending` is the state worth handling. Paint neither layer while the context comes up, or the swap a frame later reads as two backgrounds loading in sequence.

It checks `prefers-reduced-motion` in JavaScript rather than through the motion tokens, because the CSS guard cannot see a JS-driven loop. Set the preference and it draws a single static frame.

The background behind this site is that component, with eight blurred CSS discs kept painted underneath as its fallback. The **[component page](https://robertritacca.com/components/shader-field)** is a live demo, and the **[setup guide](https://robertritacca.com/docs/get-started)** has the wiring.

### Using the package

The design system is published as [`@robr0/design-system`](https://www.npmjs.com/package/@robr0/design-system) (React 19+ is a peer dependency). The **[full setup guide](https://robertritacca.com/docs/get-started)** expands on everything in this section:

```bash
npm install @robr0/design-system
```

The package is ESM-only and resolved via `exports` subpaths: use a bundler that handles CSS and font imports from `node_modules` (Vite, Next.js, webpack), and set TypeScript's `moduleResolution` to `"bundler"` (or `"nodenext"`).

Import the token stylesheet once (it carries the primitives, semantic tokens, and both themes), then use components:

```tsx
import '@robr0/design-system/tokens/tokens.css';
import { Button, Card, Badge } from '@robr0/design-system';
```

Deep imports work too (`@robr0/design-system/components/Button/Button`). The Recharts-backed charts live behind a separate entry so the optional `recharts` peer dependency is only needed if you use them; the dependency-free charts export from the main barrel with everything else:

```tsx
import { BarChart, LineChart } from '@robr0/design-system/charts';
```

**Theming and customisation** happen through CSS variables; there is no configuration API. Components are provider-free, with one exception: wrap your tree in `ToastProvider` if (and only if) you use the toast queue via `useToast`.

- **Dark mode**: set `data-theme="dark"` on the root element (light is the default).
- **Font**: the whole type scale chains to one token. Load any font you like and override it:
  ```css
  :root { --font-family-primary: 'Inter', sans-serif; }
  ```
  To pair a heading face with a body face, override the two family roles instead: display and heading styles read one, body styles the other, and both default to the primary token.
  ```css
  :root {
    --font-family-heading: 'Fraunces', serif;
    --font-family-body: 'Inter', sans-serif;
  }
  ```
- **Colours, radius, spacing**: every semantic token chains to a primitive, so overriding a primitive re-themes everything built on it. The action colour is theme-split by design (light fills run teal-08/09/10, dark inverts to teal-05/04/03), and the six fill steps below are the core of a rebrand:
  ```css
  :root {
    --primitive-teal-08: #6D31D3;  /* light fill */
    --primitive-teal-09: #4C2293;  /* light hover */
    --primitive-teal-10: #2E1560;  /* light active, dark label */
    --primitive-teal-05: #A78BFA;  /* dark fill */
    --primitive-teal-04: #C4B5FD;  /* dark hover */
    --primitive-teal-03: #DDD6FE;  /* dark active */
    --primitive-radius-full: 12px; /* pill buttons become rounded rectangles */
  }
  ```
  A complete rebrand re-keys the whole teal ramp (01-10): the remaining steps carry the primary label, active icons, hover/selected input borders, and the AI gradient, so stopping at the six fills leaves those teal. The easiest way to get all of it right is the [playground](https://robertritacca.com/playground): restyle the system live and copy out a complete, paste-ready override.

Icons use a bundled Material Symbols Rounded variable font (woff2): components import it themselves, so they need no extra setup. If you render raw `.material-symbols-rounded` spans of your own, import `@robr0/design-system/fonts/material-symbols.css` once. Nunito Sans, the system's default typeface, is intentionally *not* bundled: load it yourself (e.g. Google Fonts or `next/font`) or override `--font-family-primary`.

### Token architecture

Tokens flow in one direction, and primitives are never referenced directly in components:

```
tokens-primitives.css      --primitive-teal-08: #0E6E8F
        ↓
tokens-light/dark.css      --color-action-primary-bg: var(--primitive-teal-08)
        ↓
Component CSS              background-color: var(--color-action-primary-bg)
```

Dark mode is driven by `data-theme="dark"` on the root element, with no `prefers-color-scheme` queries in components.

### Design principles

Stated as token roles on purpose. What each role resolves to is the theme, and yours to override:

- **Style with semantic tokens, never raw values**: that is what makes one primitive override cascade through everything
- **One typeface**, hierarchy carried by weight contrast
- **The primary-action token means "click here"**: CTAs and focus only, never decoration
- **Shape is a per-element-type token**, not a per-instance choice
- **Five status roles** (info, positive, warning, error, neutral) shared by every status-bearing component
- **Depth is token-owned**: the container ramp plus the system's elevation tokens, and components don't bring their own shadows

The defaults behind each role, and every component spec, live in [`design.md`](design.md).

---

## AI layer

The library's `ai` category is the interface half: chat primitives (Chat thread, Chat message, Composer), agent-state components (Tool call, Reasoning, Agent status), and the session surfaces around a conversation (Thread panel, Thread tabs, Usage card). Those components ship in the npm package; the rest of the chat does not. The conversation state hook, the streaming transport, the backend route, the corpus, and the shared lookup-tool module are this site's own code under `website/`, and a consumer builds their own equivalents, with their LLM API key held server-side, never in the client. The site's own chat, robr0 GPT, is built from the shipped primitives, so it doubles as a live demo of the components it is made of.

The answering half is a Claude-backed route (`website/src/app/api/chat/route.ts`) with a persona and guardrails. `scripts/generate-site-corpus.mjs` compiles the prose in every published page's route folder, the data registries, and the root specs into one corpus at build time, and the model reads it whole. For what the corpus deliberately omits, the component prop API and the token registry, the model carries two deterministic lookup tools, implemented once in `website/src/lib/site-tools.ts` and shared with the MCP endpoint below. The corpus is public-only, the tools read only generated, already-published data, and a validator enforces the boundary. Nothing reaches the model that is not already on the site, so a prompt injection has nothing private to leak. The route also deploys ahead of its keys, so an unconfigured deploy answers with a polite notice rather than throwing.

Answers are measured, not assumed. `evals/chat` holds a golden set that runs through the real route (persona, corpus, guardrails, all of it) with `npm run eval:chat`; it costs real API calls, so it runs on demand and never in CI. A second validator fails the build when a golden-set fact is missing from the corpus, which keeps the eval and the site describing the same system.

The AI layer also serves machines directly. The live site exposes a Model Context Protocol endpoint at `https://robertritacca.com/api/mcp`: a stateless Streamable HTTP server with five tools covering the component list, per-component prop APIs, the design tokens, install setup, and full-text search over the same corpus the chat reads. No key, no account; every tool reads only published, generated data. The prop API is built from the same JSDoc that produces the published `.d.ts`, so an agent consuming the package reads the exact contract npm ships:

```bash
claude mcp add --transport http robr0-ds https://robertritacca.com/api/mcp
```

The same generated data is served as files too: every component's prop contract lives at `https://robertritacca.com/components/<slug>.md` beside its docs page, and a generated agent skill (a `SKILL.md` plus its `references/components.md` catalogue, under `https://robertritacca.com/skill/robr0-design-system/`) can be saved as a pair into a project's own skills folder so a coding agent carries the library's install, theming and catalogue rules into every session. One command does it, fetching the current pair from the live site and printing the MCP connect line:

```bash
npx @robr0/design-system init
```

The [setup guide](https://robertritacca.com/docs/get-started) has the details and a curl fallback.

---

## Tech

- **React 19 + TypeScript**: component library
- **Vite 7**: dev server and library build
- **Next.js 16**: portfolio site and design system documentation
- **Storybook 10**: component explorer
- **Vitest + Playwright + axe**: every Storybook story runs as a render test in headless Chromium, with an accessibility audit on each and interaction assertions where a story carries a play function
- **CSS custom properties**: all theming via semantic tokens, no CSS-in-JS

---

## Quality & CI

Every push and pull request runs a GitHub Actions pipeline ([`ci.yml`](.github/workflows/ci.yml)) with four jobs: lint + library build + the package-publish lint, story tests, Storybook build, and website lint + build followed by the built-HTML checks (rendered spacing, chat-corpus coverage, internal links) and the served-site checks: a hydration smoke that loads the built site in a real browser, and a page-level axe pass over the served pages in both themes. The story tests render every Storybook story in headless Chromium via Vitest and run an axe accessibility audit on each, so a violation fails the build exactly like a render error; the overlay stories also assert their keyboard and focus behaviour with play functions, enforced the same way. A scheduled workflow ([`uptime.yml`](.github/workflows/uptime.yml)) re-runs the hydration smoke against production every four hours, because incremental regeneration means the served site can change with no deploy. The same checklist runs locally with one command:

```bash
npm run verify   # lint + library type-check + package build + publish lint + story tests + Storybook build + website lint + build + the built-HTML and served-site checks
```

CI also guards against documentation drift: every generated surface (the `validate-registry` entry in the root `package.json` is the authoritative list, from this README's component count to the per-component markdown and the consumer agent skill) is rebuilt from its source registries on every build, and CI fails if the committed copies are stale. The numbers on the site are never hand-written.

---

## Running locally

```bash
npm install              # once, at the root: the website is an npm workspace, so this installs both

# Storybook (the library's dev sandbox)
npm run storybook        # http://localhost:6006

# Portfolio + documentation website
npm run dev --workspace website   # http://localhost:3000
```

---

## License

Two licenses, one repository. The **software** (components, tokens, scripts, and the website's application code) is MIT, so use it in anything. The **content** (page prose, case studies, essays, images, and the name and likeness of Rob Ritacca) is all rights reserved and not licensed for reuse. See [`LICENSE`](LICENSE) for the full terms.

The npm package contains the software only.
