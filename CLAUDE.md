# CLAUDE.md: Design System

## What This Is

A React component library, design system and documentation website, in three connected parts:

1. **Component Library** (`/src`): React components built with Vite and TypeScript, published to npm as **`rift-ds`**. The website consumes it by name through the same `exports` subpaths any consumer would (in-repo they point at `./src`, so it is live source). The component list and count live in `src/components/registry.json`; never hardcode a count.
2. **Documentation Website** (`/website`): a Next.js app with a live page per component under `website/src/app/components/[component-name]/`.
3. **AI Layer** (spans both): the site answering questions about itself. The chat widget (`rift-ds/chat`, registry `src/chat/registry.json`) is the package's fourth kind of thing, between the components and the templates: `ChatWidget`, `ChatProvider` and `ChatLauncher` over the `useChat` engine, with `rift-ds/chat/server`, `rift-ds/chat/upstash` (guardrails) and `rift-ds/chat/demo`. The site chat (`website/src/components/SiteChat/`) is a thin configuration of it; `/api/chat` is `createChatHandler` configured in `website/src/lib/chat-model.ts`, beside `/api/chat/followups` and `/api/chat/feedback`, all rate-limited and disclosed on /privacy. The deterministic lookups in `website/src/lib/site-tools.ts` serve both the chat and `/api/mcp`, a public, auth-free, unmetered MCP endpoint that calls no model and reads only generated, published data. Agents also get the per-component markdown, the agent starter (`/AGENTS.md`) and the consumer skills, installed by `npx rift-ds init` (whose `app`, `chat` and `block <name>` subcommands scaffold from `src/cli/templates/`, never overwriting a file). Each route's and module's doc block owns its details.

**Every chat suggestion is one chip, and a chip never wraps.** Starters, follow-ups, the FAB summary chips and a `QuestionCard`'s options share one length budget, `SUGGESTION_MAX_CHARS` in `src/chat/suggestions.ts`. A suggestion that will not fit is dropped, never truncated. A suggestion asks about roles, never theme values ("the action colour", not the colour a theme gives it). `scripts/validate-chat-starters.mjs` and `scripts/validate-page-summaries.mjs` hold written copy to both rules.

The design spec lives in [`design.md`](design.md): read it before touching tokens, colours or typography. The content style guide lives in [`content-design.md`](content-design.md): read it before writing or editing any shipped prose (page copy, descriptions, README, release notes, microcopy). Dated decisions and incidents behind the rules below are recorded in `HISTORY.md`.

---

## Registries: counts are never hardcoded

**General rule:** any count of items displayed anywhere (components, skills, tokens, releases, anything countable) derives from a registry that is the single source of truth for that collection, kept in sync with reality by a build-time validator. Never write a literal number, or a hand-maintained list that implies one, into page copy, stats or docs.

Each validator's doc block owns what it checks; read it before changing a registry. One line per registry:

| Collection | Registry | Accessor | Validator |
|---|---|---|---|
| Components | `src/components/registry.json` | `src/components/registry.ts` | `scripts/validate-component-registry.mjs` |
| Component website surfaces | the component and chat registries | (derived nav) | `scripts/validate-website-surfaces.mjs` |
| Skills | `.claude/skills/registry.json` | `website/src/data/skills-registry.ts` | `scripts/validate-skills-registry.mjs` |
| Release log | `website/src/data/release-log.json` | `website/src/data/release-log.ts` | `scripts/validate-release-log.mjs` |
| Loops | `website/src/data/loops.json` | `website/src/data/loops.ts` | `scripts/validate-loops.mjs` |
| Page summaries | `website/src/data/page-summaries.json` | `website/src/data/page-summaries.ts` | `scripts/validate-page-summaries.mjs` |
| Semantic tokens | `src/tokens/registry.json` (generated) | `src/tokens/registry.ts` | `scripts/validate-token-registry.mjs` |
| Theme presets | `website/src/lib/theme/presets.ts` + `src/tokens/presets/` (generated) | `THEME_PRESETS` | `scripts/validate-preset-stylesheets.mjs`, `scripts/validate-theme-presets.mjs` |
| Ambient background | `website/src/data/shader-background.json` | `website/src/data/shader-background.ts` | `scripts/validate-shader-background.mjs` |
| Dependency graph | `website/src/data/dependency-graph.generated.ts` | `website/src/data/dependency-graph.ts` | `scripts/validate-dependency-graph.mjs` |
| Site chat corpus | `website/src/data/site-corpus.generated.ts` | same file | `scripts/validate-site-corpus.mjs`, `scripts/validate-chat-coverage.mjs`, `scripts/validate-corpus-coverage.mjs` |
| Component prop API | `website/src/data/component-api.generated.ts` | same file | `scripts/validate-component-api.mjs` |
| Consumer agent skills | `AGENT_SKILLS` in `scripts/brand.mjs` + `website/public/skill/manifest.json` (generated) | `website/src/data/agent-skills.ts` | `scripts/validate-agent-skill.mjs` |
| Chat widget | `src/chat/registry.json` | `src/chat/registry.ts` | `scripts/validate-chat-widget.mjs` |
| Blocks | `src/cli/templates/blocks/registry.json` | `website/src/data/blocks.ts` | `scripts/validate-blocks.mjs` |
| Accessibility coverage | `website/src/data/a11y-coverage.generated.ts` | `website/src/data/a11y-coverage.ts` | `scripts/validate-a11y-coverage.mjs` |
| Gestures | `scripts/gestures.json` (every drag grip a visitor can press) | (read by the script) | `scripts/validate-gestures.mjs` |

Notes an agent needs while editing them:

- **Generated files are never hand-edited.** Edit the source and rebuild; a byte-comparing validator fails on a hand edit.
- **Release log**: one entry per published npm version, written by the `release` skill at publish time and never otherwise.
- **Page summaries**: a new static page needs a summary and a starters pool, or must be chromeless; component pages derive theirs.
- **Theme presets**: `presetOverrides` in `presets.ts` is the one composer the stylesheets and the playground export are written from; every preset sets every lever and passes the contrast gate.
- **Ambient background**: the site's config for the library's `ShaderField`; tune it with `?tune=1` in dev. `BlurBackground` mounts once, in the root layout.
- **Gestures**: every new drag grip on the site needs an entry with the setup that reaches it. No validator notices a missing one.
- **Blocks** are source the consumer owns, never components; design.md's Blocks section owns the conventions.

**Built-HTML and served-site checks** (`validate-rendered-spacing`, `validate-corpus-coverage`, `validate-internal-links`, the hydration smoke, the gesture check, the page-level axe pass) need the finished build, so they run in `verify` and CI after the website build, never in `validate-registry`.

### Generated surfaces

Never hand-edit these; edit the source, and commit what a build regenerates. Each generator's doc block owns the details.

- **Package barrels and exports**: `src/index.ts` and `src/charts.ts` by `scripts/generate-library-barrel.mjs` (recharts modules only in `charts.ts`, since recharts is an optional peer). Name, version, subpaths and bin by `scripts/package-manifest.mjs`, held by `scripts/validate-package-exports.mjs`.
- **Renames are mechanical**: `PACKAGE_NAME`, `RETIRED_PACKAGE_NAMES` and `RETIRED_HOSTS` in `scripts/brand.mjs` with `scripts/rename-package.mjs`. Never restate a retired name or write a site URL from memory; derive it from `SITE_URL`.
- **README.md regions** (component count and list, npm badge, banner link, author credit) by `scripts/generate-readme-content.mjs`, which also holds the Tech section's major versions and both install surfaces (README and `src/stories/Configure.mdx`). README ships in the npm tarball, so its prose is production copy.
- **The author credit**: `AUTHOR_NAME` and `AUTHOR_URL` in `scripts/brand.mjs` are its only home.
- **Screenshot surfaces with no generator**: re-shoot the README banner (`scripts/capture-readme-banner.mjs`) and the playground's template stills (`scripts/capture-template-thumbnails.mjs`) by hand whenever what they show changes.
- **Website files**: the /blueprints spec copies (`scripts/sync-blueprints.mjs`, whose `FILES` array is the list), per-component markdown (`scripts/generate-component-md.mjs`), the shadcn registry in `website/public/r/` (`scripts/generate-shadcn-registry.mjs`; fetches counted by `website/src/proxy.ts`), per-theme DESIGN.md files (`scripts/generate-theme-design-md.mjs`), the consumer skills and `AGENTS.md` (`scripts/generate-agent-skill.mjs`; its manifest is the one home of the file list the init bin installs), and the /skills page data (`scripts/generate-skills-content.mjs`; never hand-add a card).

### The chat corpus security boundary

**The site chat corpus is public-only and owner-authored-only, and both halves are security boundaries, not style choices.** `scripts/generate-site-corpus.mjs` may only read sources that are already published: page prose, the data registries, the blueprint specs. The corpus becomes the model's context, so anything in it can be repeated to any visitor; keeping it public-only means the worst case of a prompt injection out of the chat is off-brand prose, not a leak. The second half guards the other direction: third-party words (a client quote, a testimonial, a review) would be an injection surface into the chat. Today every word on the site is the owner's; the day a page carries third-party text, it needs an explicit decision (and probably an `EXCLUDED_ROUTES` entry) before the next build ships it to the model. Contact-shaped details may enter only through a page's `corpus-facts()` directive, and `scripts/validate-site-corpus.mjs` fails the build on any other route in. The `/api/mcp` tools inherit the same rule.

### Keeping facts in one place

**Every fact has exactly one authoritative home**: all other mentions derive from it (generated), are checked against it (validated), or point at it.

- **Point, don't enumerate.** "The `validate-registry` entry in the root `package.json` is the authoritative list" beats a hand-copied list.
- **Self-descriptions stay in sync.** When a change makes a statement in README.md, design.md, this file or the overview and foundations pages false, fix that prose in the same change. If the fact is countable or mechanically checkable, route it through a registry and validator instead.
- **A new countable collection** gets a registry file beside it, a small accessor module exporting the count, and a validator chained into `validate-registry` (the `new-validator` skill walks it).
- **A new skill**: write `.claude/skills/<name>/SKILL.md` and register it in `.claude/skills/registry.json` (`displayed`, `unlisted`, or `external`, which also needs `website/src/data/external-skills/<name>.md`).
- **Examples in skills are fictional.** A factual claim about a real component inside an example rots silently.
- **No counts outside registries; no machine-local paths.** Derive the repo root with `git rev-parse --show-toplevel`. Size claims in design.md are held by `scripts/validate-design-counts.mjs`.
- **Off-token CSS values are sanctioned at the site**, never in a skill: `/* ds-allow(<category>): <reason> */` (file-wide: `ds-allow-file`), categories owned by `scripts/validate-css-directives.mjs`.
- **References are build-checked**: `scripts/validate-doc-refs.mjs` fails on a repo path, `npm run` script or API symbol in a doc that does not exist (its `sources` list is the set of docs).
- **Prose checks**: no em dashes in shipped copy (`scripts/validate-shipped-prose.mjs`; the rest of `content-design.md` is the `content-audit` skill's job), no width cap on a component page paragraph (`scripts/validate-page-prose-width.mjs`), and a literal ’ “ ” rather than an HTML entity after an inline closing tag (`scripts/validate-rendered-spacing.mjs`).

---

## Quick Start

```bash
npm install                    # once, at the root: the website is an npm workspace, so this installs both

# Storybook (the library's dev sandbox)
npm run storybook              # http://localhost:6006

# Documentation website
cd website && npm run dev      # http://localhost:3000
```

Other useful commands:
```bash
npm run build           # type-check the library
npm run build:lib       # build the publishable package into dist/
npm run lint            # ESLint
npm run build-storybook # export static Storybook
npm run test            # every Storybook story as a render, axe and interaction test (headless Chromium)
npm run verify          # the full local quality gate, mirroring CI
npm run eval:chat       # site-chat answer-quality eval against a running dev server (real API calls, never in CI)
npm run registry-downloads # print the shadcn registry's download tally (read-only; needs KV credentials)
npm run graph           # regenerate the /graph data; `-- tree <name>` / `-- who-uses <name>` trace dependencies
```

---

## CI & Local Verify

`.github/workflows/ci.yml` runs on every push to `main` and every PR: the library (lint, build, the API compatibility gate, the package-publish lint, the dependency audit, the drift guard), the story tests, the Storybook build, and the website (lint, build, then the built-HTML checks and the served-site checks). The full chain (`npm run validate-registry`) runs before every root build via `prebuild`/`prestorybook`/`prebuild-storybook`; the website's own `prebuild` runs a subset, and `website/package.json` is authoritative for which.

`npm run verify` is the **single local mirror of CI**. **When CI gains a check, add it to `verify` in the same change**; skills and docs reference `verify`, never individual commands. Three deliberate exceptions stay CI-only:
- **Chromatic** (`.github/workflows/chromatic.yml`): bills cloud snapshots, so it is dispatch-only and never proof the pixels are unchanged.
- **The dependency audit** (`npm audit --audit-level=high --omit=dev`): news from outside, not something a local run could catch; dev-only tooling is outside it by a decision the workflow comment records.
- **The drift guard** (`git diff --exit-code` after the generators run): a local tree is dirty with work in progress.

**Story tests** run every story as a render test, with axe in `'error'` mode. One rule, `color-contrast`, is switched off by the owner's settled decision: the comment beside that override in `.storybook/preview.ts` is its only record. Never re-enable it, restyle what it covers, or raise it as a finding without asking the owner first. Everything else in AA is enforced.

**The served-site checks** exist because a green build and an HTTP 200 have both held while the live site was blank: `scripts/smoke-hydration.mjs` (also the `ship` skill's post-deploy check, and run against production every four hours by `.github/workflows/uptime.yml`), `scripts/validate-gestures.mjs` (every grip in `scripts/gestures.json` under a throttled pointer flood), and `scripts/validate-website-a11y.mjs` (axe on the served pages in both themes, plus forced colors). Each doc block owns its details.

**The published API only grows.** `scripts/validate-api-compat.mjs` compares the working tree with the latest `v*` tag: no prop, export, wildcard file or bin may vanish or narrow. A deliberate break is a row in its `SANCTIONED_BREAKS` table. It runs in `verify` and CI, never in `validate-registry`.

### Releases

Manual, following the `release` skill. The `Release` workflow (`.github/workflows/release.yml`, dry-run by default) builds `dist/`, runs `scripts/smoke-consumer.mjs`, then publishes **from `dist/`** with provenance. The root package.json stays `private` forever.
- **The version lives in three places that move together**: `PACKAGE_VERSION` in `scripts/package-manifest.mjs` (authoritative), the root package.json's `version`, and `package-lock.json` (refresh with `npm install --package-lock-only`). `validate-package-exports.mjs` fails when they disagree.
- **A published version can never be reused**, even after unpublishing.
- **The registry lags the workflow by minutes**: a 404 right after a green publish is propagation; never re-run on it.
- **Auth is Trusted Publishing (OIDC)**, keyed to the workflow **filename**: renaming `release.yml` breaks publishing, and `permissions: id-token: write` is load-bearing. A dry run never authenticates.

### Infrastructure

- **Deployment**: the site is live at `SITE_URL` in `scripts/brand.mjs` (Vercel, root directory `website`, push-to-deploy from `main`). Storybook is a second Vercel project at `STORYBOOK_URL`. What is still outstanding for go-live is the `first-deploy` skill's checklist to state, and only its.
- **Analytics**: `GA_ID` in `scripts/brand.mjs` (emptying it is the off switch); /privacy discloses it, so the two change together. Site events live only in `website/src/lib/analytics.ts` (`SITE_EVENTS`, `trackEvent`), held by `scripts/validate-analytics-events.mjs`. A call never carries a visitor's text.
- **Fonts**: the base theme's face is not bundled: the website loads it through `next/font`, Storybook through a Google Fonts link, and consumers bring their own. Material Symbols and the presets' faces ship as self-hosted woff2 inside the package; `scripts/sync-preset-fonts.mjs` is a deliberate by-hand fetch, never in the build, and owns the contract.

### Shipping vocabulary

Skills are named for their end state, because a push to `main` deploys the live site (`.claude/skills/registry.json` lists what exists):
- **`ship`**: make it live. Full verify, merge into `main` if needed, push, watch CI, prove the deployed site renders.
- **`super-ship`**: the bulletproof ship for structural work. Full `drift-audit`, a scoped `api-consistency`, a coverage gate, fix the findings, a `responsive-sweep` of every page at every breakpoint width with its breaks fixed, then `ship`. For a small change, plain `ship` is enough.
- **`checkpoint`**: save progress to a remote branch. Never touches `main`, never deploys.
- **`park`**: checkpoint, then return to a clean `main`.
- **`land`**: triage all pending work (worktrees, branches, stashes) as land / keep / delete, merge into a **local, unpushed** `main`, verify. Deleted work is archived to an `archive/*` tag first.

If asked to "merge and push" (a retired skill name), confirm the intended end state (`ship`, `checkpoint` or `land`) instead of guessing.

---

## Project Structure

- `design.md`, `content-design.md`, `HISTORY.md`, `SECURITY.md`: the specs, the history and the security policy.
- `scripts/`: generators and validators (the `validate-registry` chain) and release tooling. `evals/chat/`: the chat eval.
- `src/components/`: one folder per component, plus `registry.json`. `src/index.ts` and `src/charts.ts` are GENERATED barrels.
- `src/chat/`: the chat widget over its engine, with its own registry and hand-written barrels. `src/cli/`: the init bin and its scaffold templates.
- `src/behaviors/`: the internal behaviour layer (layer stack, focus scope, scroll lock, anchored position, top layer, link provider, locale provider, keyboard shortcuts, reading direction, `ScrollRegion`, `warnOnce`, the visually-hidden class). Not a published subpath, except the scroll lock, the link provider, the locale provider and the shortcut listener (`scripts/package-manifest.mjs` is the list); each module's doc block owns its contract.
- `src/tokens/`: the token CSS, the GENERATED `presets/` and `registry.json`, and `motion.ts` and `breakpoints.ts`. `src/fonts/`: Material Symbols and the presets' faces. `src/stories/`: Storybook foundation docs and the props-contract story.
- `website/` (npm workspace): `website/src/app/` pages; `website/src/config/` (`navigation.ts` is the nav source of truth, `chromeless.ts` the routes without shared chrome); `website/src/data/` registries and accessors; `website/src/lib/` non-UI modules (chat model, site tools, the theme levers, analytics); `website/src/components/` site UI (header, sidebar, footer, SiteChat, the Cmd+K palette, the anchor rail, the backgrounds, the error fallback, the template screens).

Before working in an area:
- **Templates**: `templatesSidebarLinks` in `website/src/config/navigation.ts` is the list; design.md's Template screens section owns the conventions (the `new-template` skill).
- **Playground** (`website/src/app/playground/`): the theme export, image palette and DESIGN.md importer are pure functions in `website/src/lib/theme/` whose doc blocks own every rule. Dropped files are read in the browser and never uploaded. It never changes the system: no token is added and no colour skips a tier.
- **Page backgrounds**: `BlurBackground` mounts once from the root layout and its doc block owns the four background modes; pick exactly one per page.
- **Labs** (`website/src/app/labs/`): hidden, noindex, chromeless fidelity tests, deliberately outside the nav, sitemap and corpus.
- **A drag renders nothing until the pointer lets go**: write size or position to the DOM per frame and commit React state once on release. Per-move state has crashed the live site; every new grip follows this rule and gets a `scripts/gestures.json` entry.

---

## Token Architecture

Three tiers. **Never skip a tier** (a theme re-keys the primitives and re-points the semantic layer, but the tiers never change):

```
tokens-primitives.css       --primitive-teal-08: #0E6E8F
        ↓
tokens-light/dark.css       --color-action-primary-bg: var(--primitive-teal-08)
        ↓
Component CSS               background-color: var(--color-action-primary-bg)
```

- **Primitives** (`--primitive-*`): raw values. Never referenced in components.
- **Semantic tokens** (`--color-*`, `--radius-*`, `--gap-*`, `--font-*`, `--motion-*`, `--layer-*` and the rest; `CATEGORY_PREFIXES` in `scripts/generate-token-registry.mjs` is the list): always use these in components.
- **Dark mode** is driven by `data-theme="dark"` on the root element. Every colour token has a light and dark value; no `prefers-color-scheme` queries in components.

Key invariants, each build-enforced (the validator's doc block owns the sanctioned exceptions):
- **The action colour** (`--color-action-primary-bg`) is only for primary CTAs, focus rings, active input borders, the checked or on state of a form control, the selected item of a mutually exclusive set, and the hover signal of a surface that is itself a control; charts reach it through `--color-chart-series-1`. Never decorative. `scripts/validate-action-colour.mjs`.
- **No literal values in component CSS**: colour, motion timing, type and off-scale spacing or radius go through tokens, or carry a `ds-allow` directive. `scripts/validate-raw-values.mjs`.
- **Semantic colour tokens reference primitives** through `var()`, never a hex, so a primitive override cascades: `scripts/validate-token-references.mjs`. Every hand mirror of token data outside CSS is held to its tokens by that script, `scripts/validate-theme-mirrors.mjs` and `scripts/validate-foundation-mirrors.mjs`.
- **Every `var(--…)` a component references must resolve** (a fallback marks a deliberate override hook): `scripts/validate-token-usage.mjs`.
- **Buttons are always `--radius-pill`; inputs are always `--radius-300`.** The token is the rule, its value the theme's. design.md's Border Radius Scale owns the sanctioned departures.
- **JavaScript timer delays** come from `src/tokens/motion.ts` (published as `rift-ds/tokens/motion`), never a literal: `scripts/validate-js-timings.mjs`.
- **Breakpoints** come from `src/tokens/breakpoints.ts` (and `website/src/config/breakpoints.ts` for the site); JS builds queries with `mediaBelow`/`mediaAbove`, CSS keeps a literal from the set: `scripts/validate-breakpoints.mjs`.
- **Every z-index of 10 or more names a `--layer-*` token** (or `--layer-site-*` in the site): `scripts/validate-stacking.mjs`.

---

## Component Anatomy

Every component lives in its own folder under `src/components/`:

```
src/components/Button/
├── Button.tsx            # TypeScript implementation + exported interface
├── Button.css            # Scoped CSS using semantic token vars
└── Button.stories.ts     # Storybook stories (Meta + named Story exports)
```

The only exceptions to self-containment are imports from `src/behaviors/`. Modal overlays take its dismissal stack, focus scope and scroll lock; non-modal popups take the stack with light dismiss and are placed by `src/behaviors/useAnchoredPosition.ts`; no component adds a document or window key or press listener of its own, and every app-level key binding is a `useShortcut` call over the one listener in `src/behaviors/shortcuts.ts`, in the library and the site alike (`scripts/validate-overlay-listeners.mjs`). A component that handles Escape itself calls `event.preventDefault()`, so a Dialog around it stays open. design.md's Components intro owns the contract.

**Shared primitives are drawn once, and surfaces belong to families.** The form-control indicators, `CheckIcon` and `MinusIcon`, `ChosenMark`, `ds-visually-hidden`, CircularButton for every close and SegmentedControl for every exclusive set are composed, never redrawn (`scripts/validate-shared-primitives.mjs`). A component takes its surface family's fill, border, radius, hover, selected and disabled treatment, and a departure is a sentence in its design.md spec (the `component-consistency-audit` skill reviews it). design.md's Components intro owns both lists.

Components are imported in the website through the package's public exports (the barrel also works):
```tsx
import { Button } from 'rift-ds/components/Button/Button';
```

CSS class naming: `ds-{component}` base class, `ds-{component}--{modifier}` for variants (`ds-button`, `ds-button--primary`). `scripts/validate-class-names.mjs` holds it.

**The props interface is a published contract.** Full details are in the `new-component` skill; `Button.tsx` (button-or-anchor) and `Input.tsx` (form control) are the reference implementations. `scripts/validate-component-contract.mjs` and the props-contract story in `src/stories/Contract.stories.tsx` enforce the mechanical half; the `api-consistency` skill audits the rest.

- `'use client'` on the first line **only** when the component uses hooks, handlers or browser APIs. Presentational components omit it so they render from a Server Component.
- Own props as a `type`, then `export interface XProps extends XOwnProps, Omit<React.ComponentPropsWithoutRef<'el'>, keyof XOwnProps> {}`.
- A ref onto the primary node (the **panel** for portal components): React 19's plain `ref` prop for new components; existing `forwardRef` + `displayName` ones stay. `{...rest}` goes on the same node before the component's own attributes; a consumer-overridable default goes before the spread.
- Native event signatures keep their names. `onChange` is a `ChangeEventHandler`; the convenience callback is `onValueChange`, `onCheckedChange` or `onValuesChange`, and both fire.
- **State a consumer can own is a controlled/uncontrolled pair**: `x`, `defaultX`, `onXChange` (`value`, `checked`, `values`, `open` and their partners). A component fully controlled by design says so in its design.md spec. `scripts/validate-prop-vocabulary.mjs`.
- **Every English string the component writes, announced or visible, is a prop** with the English text as its default (`*Label` for accessible names), so it can be localised. `scripts/validate-accessible-names.mjs`, `scripts/validate-visible-text.mjs`.
- `variant` not `priority`/`kind`; `disabled` as a real boolean. Figma variant properties such as hover and active are CSS states, not props.
- **`variant` is emphasis, `tone` is colour.** `primary`/`secondary`/`tertiary` ride `variant`; `default`/`neutral`/`destructive` ride `tone`. Status-bearing components keep the five status roles on `variant`; a data entry marks danger with `destructive?: boolean`. A moved value stays as a `@deprecated` alias, and internal callers migrate in the same change. `size` is `default`/`compact`.
- **A link goes through the link component, never a raw `<a href>`**: an optional `linkComponent` prop, resolved with `useLinkComponent` from `src/behaviors/LinkProvider.tsx` in a client component, or `linkComponent ?? 'a'` in a server one.
- **A number, a date or a time is written in the resolved locale, never the runtime's**: an optional `locale` prop, resolved with `useLocale` from `src/behaviors/LocaleProvider.tsx` in a client component, or `locale ?? DEFAULT_LOCALE` in a server one. It formats and never translates (`scripts/validate-locale-formatting.mjs`; design.md's "Numbers and dates are written in the consumer's locale").
- **Layout follows the reading direction**: logical properties, inline motion multiplied by `--ds-inline-sign`, arrow keys through `logicalArrowKey`, popups asked for `start`/`end`, and directional glyphs mirrored; a side that belongs to the screen carries `ds-allow(physical)` (`scripts/validate-logical-properties.mjs`; design.md's "Layout follows the reading direction").
- **Deprecate, never remove** (`scripts/validate-api-compat.mjs`). Document intentional native-name collisions (`size`, `title`) in the prop's JSDoc.

**Every own prop needs a JSDoc description**: it feeds Storybook's props tables, the shipped `.d.ts` and the MCP surface (`scripts/validate-prop-docs.mjs`, whose doc block and `scripts/component-docgen.mjs` own the parser settings). Three rules follow:
- **Never put a prop description in a story's `argTypes`**: it shadows the JSDoc. Stories set `control` and `options` only.
- **A re-export in a component file goes below the component**, or the parser names it after the component and empties the props table.
- **On a deprecated prop, put a sentence before the `@deprecated` tag**, or the description renders blank.

---

## How to Add a New Component

A new component is not done until it appears in **every** place the system documents itself: the library, Storybook, and the website. The `new-component` skill has the operational detail.

1. **Create the folder**: `src/components/MyComponent/`
2. **Write `MyComponent.tsx`**: a named component and its props interface, following the contract in **Component Anatomy**. Class names use semantic tokens, never inline styles.
3. **Write `MyComponent.css`**: semantic token vars only. No hardcoded hex, primitive px values or magic numbers.
4. **Write `MyComponent.stories.tsx`**: a `meta` with `title: 'Components/MyComponent'` and `tags: ['autodocs']`, a `Default` story and one per meaningful variant.
5. **Add a website showcase page**: `website/src/app/components/my-component/page.tsx`, `page.module.css` and `layout.tsx`, following `website/src/app/components/button/page.tsx`. The layout is exactly `export const metadata = componentPageMetadata("my-component");`.
6. **Register it**:
   - `src/components/registry.json`: an entry in `components` (alphabetical by `name`) with `name`, `label`, `slug`, `description`, `category` and `client`. Nav, sitemap, breadcrumbs, mega-nav and page metadata derive from it.
   - `website/src/components/ComponentPreviews/ComponentPreviews.tsx`: a preview entry under the slug (the one hand-maintained surface).
7. **Document it in `design.md`**: a short spec section (class name, tokens used, key behaviours).

Steps 5 to 7 are build-enforced by `scripts/validate-website-surfaces.mjs` and `scripts/validate-page-titles.mjs`.

Checklist before shipping a component:
- [ ] Every rule in **Component Anatomy** holds: the props contract, links, ownable state, English strings as props, numbers and dates in the resolved locale, layout from the reading direction (checked with Storybook's Direction toolbar), overlays through `useLayer`, keys through `useShortcut`, shared primitives and its surface family
- [ ] `'use client'` present if interactive, and **absent** if purely presentational
- [ ] All colours via semantic tokens
- [ ] Dark mode verified (toggle `data-theme="dark"` in Storybook)
- [ ] Disabled state at `opacity: 0.4`, `cursor: not-allowed` (a control held inert by a loading contract keeps full colour with `cursor: progress`; design.md owns the exception)
- [ ] Interactive elements have ARIA roles and keyboard navigation
- [ ] At least one Storybook story per variant
- [ ] Steps 5 to 7 done, with `client` in the registry matching the `'use client'` directive

---

## How to Add a New Token

A token that exists only in CSS is incomplete. The `new-token` skill has the operational detail.

1. **The file follows the category** (`SEMANTIC_FILES` in `scripts/generate-token-registry.mjs` is the list):
   - Colour: `src/tokens/tokens-light.css` **and** `src/tokens/tokens-dark.css` (parity is build-enforced), referencing a primitive through `var()`. Add the primitive to `tokens-primitives.css` first if none fits.
   - Shadow: **both** theme files (parity is not enforced for shadows, so a light-only shadow ships unchanged in dark mode).
   - Spacing, radius, border, icon size, control height: `tokens-light.css` only (a control-height step is also a row of `CONTROL_HEIGHT_STEPS` in `website/src/lib/theme/theme-overrides.ts`).
   - Typography: `tokens-typography.css` (a new type style is also a row of `TYPE_STYLES` in `theme-overrides.ts`). Motion: `tokens-motion.css`.
   - Only colour and shadow are theme-split; anything else in `tokens-dark.css` is dead weight.
2. **Document it in `design.md`**: its role and how it relates to its neighbours, never its colour value (design.md is theme-agnostic).
3. **Add it to the foundations pages** (the printed values are build-checked against the CSS, so type what the token resolves to):
   - Semantic colours: `website/src/app/foundations/colour-mode/page.tsx` (every colour token needs a swatch, build-enforced in both directions)
   - Primitives: `website/src/app/foundations/colour-primitives/page.tsx`
   - Spacing, radius, border, control height: `website/src/app/foundations/spatial/page.tsx`
   - Shadows: `website/src/app/foundations/elevation/page.tsx`
   - Typography: a type style is a row in `website/src/app/foundations/typography/TypographyView.tsx`; a new ladder step needs nothing
   - Icon sizes: `website/src/app/foundations/icons/page.tsx`
   - Motion: `website/src/app/foundations/motion/page.tsx`
   - Stacking (`--layer-*`): nothing to add; write the trailing comment `scripts/validate-stacking.mjs` requires
4. **Update the Storybook token docs**: `src/stories/Tokens.stories.tsx`, in the matching story.
5. **Counts take care of themselves**: `src/tokens/registry.json` regenerates on every build. A new prefix fails generation until it is added to `CATEGORY_PREFIXES`.

---

## Design Principles

Stated at the level of **token roles**: which colour, radius, typeface or shadow a role resolves to is the theme's decision, and can change without any of these becoming false. design.md owns each in full.

- **One face per family role, one weight per tier.** Heading and body faces chain through `--font-family-heading` and `--font-family-body`; which weight each tier carries is the theme's call.
- **The logo and each type tier can take a tone apart from the action colour**; a display or heading rule never uses the primary text colour (`scripts/validate-tier-colours.mjs`).
- **The primary-action token is reserved for actions**, or it stops meaning "click here".
- **Shape is a per-element-type token, never a per-instance choice.** Change the token, not the component.
- **Five status roles** (`info`, `positive`, `warning`, `error`, `neutral`), shared through the `--color-status-*` set.
- **Depth is token-owned**: surfaces separate through the container ramp, and the only shadows are the elevation tokens.
- **Platform fidelity is the one sanctioned departure** from the type and depth rules: the iOS and Android variants of the mobile navigation components, under the `platform` directive category.
- **Icons sit on the `--icon-size-*` scale**: set the scale variable, never `font-size` on an icon.
- **Every AI chat follows the chat widget's responsive pattern** (docked, modal overlay, full-viewport takeover, at the thresholds in `src/chat/queries.ts`), with `ChatLauncher` as the reference; a host reserves the panel's width only at the dock threshold. design.md's ChatWidget spec owns placement and the exceptions.
- **File-format colours are fixed, not themed**: the `--color-file-*` roles only fill an attachment's type mark.
- **Tables are one family, drawn from one set of tokens** (`--color-table-*`). On a doc page, use `Table` with `bordered` or markdown through `MarkdownTable`, never new table CSS (`scripts/validate-table-styles.mjs`).

---

## Key Files

| File | Purpose |
|---|---|
| [`HISTORY.md`](HISTORY.md) | Release history, the build journal, and the dated decisions behind these rules |
| [`src/tokens/tokens-primitives.css`](src/tokens/tokens-primitives.css) | Raw hex/px values |
| [`src/tokens/tokens-light.css`](src/tokens/tokens-light.css) | Semantic token definitions (light) |
| [`src/tokens/tokens-dark.css`](src/tokens/tokens-dark.css) | Semantic token overrides (dark) |
| [`src/tokens/tokens-typography.css`](src/tokens/tokens-typography.css) | Font size, weight and line-height scale |
| [`src/tokens/tokens-motion.css`](src/tokens/tokens-motion.css) | Duration and easing tokens, reduced-motion guard |
| [`src/components/Button/Button.tsx`](src/components/Button/Button.tsx) | Reference implementation for a component |
| [`src/components/Button/Button.stories.ts`](src/components/Button/Button.stories.ts) | Reference for story structure |
| [`website/src/app/components/button/page.tsx`](website/src/app/components/button/page.tsx) | Reference for a website showcase page |
| [`website/src/config/navigation.ts`](website/src/config/navigation.ts) | Nav links: update when adding pages |
| [`.storybook/main.ts`](.storybook/main.ts) | Storybook config: addons, stories glob, docgen settings |

---

## Known Gaps

- **Figma parity**: the system originates in a Figma file that lags the coded system, so every Figma link is hidden behind `SHOW_FIGMA_LINKS` in `website/src/config/social.ts` (its doc comment lists the guarded surfaces). Keeping Figma and the tokens in sync is manual.
- **Visual regression**: Chromatic runs dispatch-only, but this repo has no Chromatic project yet (the `first-deploy` skill owns that step). axe catches roughly a third of WCAG issues, so keyboard order outside the asserted overlay stories and meaningful alt text still need human review.
