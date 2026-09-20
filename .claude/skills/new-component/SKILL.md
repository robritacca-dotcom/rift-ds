---
name: new-component
description: Scaffold a new design system component with all required files and registration steps. Use when asked to add, create, or scaffold a new design system component.
icon: widgets
displayDescription: "Scaffolds a new design system component (a typed React component, a token-only CSS stylesheet, and a Storybook stories file), then registers it in the build-enforced component registry and design.md. Enforces the ds- BEM naming prefix, semantic token usage, and the correct stories format without needing reminders."
invoke: ["add a [Name] component","create a [Name] component","scaffold [Name]"]
---

# new-component

Scaffold a new design system component: the three component files plus the build-enforced registration steps.

## When invoked

Use this skill any time you are asked to add or create a new component to the design system — phrases like "add a [Name] component", "create a [Name] component", "scaffold [Name]".

## Instructions

1. **Ask** for the component name (PascalCase) and a one-sentence description of its purpose, if not already provided.

2. **Read these reference files before writing anything:**
   - `src/components/Button/Button.tsx` — structural reference for a button-or-anchor component (own-props split, forwardRef, rest spread, BEM class usage, conditional rendering)
   - `src/components/Input/Input.tsx` — structural reference for a form control (native `onChange` + `onValueChange` convenience callback, label/helper/error wiring)
   - `src/components/Badge/Badge.css` — CSS token reference (no raw hex/pixels, semantic token usage)
   - `src/components/Badge/Badge.stories.tsx` — stories file reference (`satisfies Meta`, `StoryObj`, autodocs)
   - `src/tokens/registry.json` — the generated index of every semantic token by category (which CSS file owns which category is the `new-token` skill's step 2, backed by `SEMANTIC_FILES` in `scripts/generate-token-registry.mjs`; the registry is the one place that lists all of them)
   - `.claude/skills/design-qa/SKILL.md` — read its "The craft checks" rubric **before writing any CSS** (and "The eye" for when the component lands on a page): the component faces that pass as a gate before it can register (step 4), and polish built in beats polish patched on after

3. **Create the directory** `src/components/ComponentName/` and write these three files. For an **overlay component** (anything that dismisses, traps focus, or locks scroll), first read CLAUDE.md's Component Anatomy exception and design.md's Components-intro overlay contract: import the shared behavior hooks from `src/behaviors/` rather than registering your own document listeners — Dialog is the reference consumer. Three files is the norm, not a limit: a component may split extra modules out beside them (`ShaderField` keeps its hook and its shader source in sibling `.ts` files). If you do, read the packaging note in step 5 — a sibling `.ts` module does **not** get a deep-import subpath for free. One family-shaped exception: when the component belongs to an established shared-folder family (most of the recharts-backed charts live as single `.tsx` files inside `src/components/Chart/` — the registry entries with `folder: "Chart"` are the authoritative membership list), add the file to that folder instead of creating a new directory, and set the registry entry's `folder` field to the shared folder's name — CLAUDE.md's registry row documents the field, and the existing `Chart/` entries are the pattern to copy. Two independent axes, not one: `folder` records where the implementation lives, and the registry's `recharts` flag records which barrel it ships from — FunnelChart is the precedent for a recharts-backed chart in its own folder (it composes the family's `Chart.css` chrome without living in `Chart/`). Joining the shared folder is a fit call, not a dependency test. A multi-series chart takes its default colours from `getChartSeriesColors()` in `Chart/palette.ts` — which emits `var()` references to the `--color-chart-series-*` ramp, so series colours follow a live theme switch — never a local palette array. And every panel-scale chart — recharts-backed or not — wears the family's shared card chrome by importing `Chart.css` and composing its `ds-chart` wrapper/header/body classes, and takes a `bare` prop (chrome off: no border, padding, or fill) so it can drop straight into a Panel that supplies the surface; a new chart ships the same way (only inline-scale pieces like a sparkline or a legend tile stay chromeless).

### File 1: `ComponentName.tsx`
- Named export (not default)
- BEM class naming with `ds-componentname` root prefix (e.g. `ds-button`, `ds-badge`)
- Modifier classes follow `ds-componentname--variant` pattern
- Imports CSS: `import "./ComponentName.css"`
- If the component renders as `<a>` when an `href` prop is passed, follow the Button pattern of conditional element rendering

**The component API contract — every one of these, no exceptions.** This package is published to npm, so the props interface is a public contract. Getting it wrong is a breaking change later. `src/components/Button/Button.tsx` (button-or-anchor) and `src/components/Input/Input.tsx` (form control) are the reference implementations.

1. **`'use client'` on the first line** — if and only if the component uses hooks, event handlers, or browser APIs. **Purely presentational components must NOT have it** (see `src/components/Table/Table.tsx`), or consumers lose the ability to render them from a React Server Component.

2. **Split the props type in two.** Own props as a `type`, then an exported `interface` that merges in the native element's props:
   ```ts
   type ComponentNameOwnProps = { /* ...props this component owns... */ };

   export interface ComponentNameProps
     extends ComponentNameOwnProps,
       Omit<React.ComponentPropsWithoutRef<'div'>, keyof ComponentNameOwnProps> {}
   ```
   Add `| 'type'` (or any other attribute the component hardcodes) to the `Omit` list.

3. **`React.forwardRef`** onto the primary DOM node, with `ComponentName.displayName = 'ComponentName'` after it. If the component already keeps an internal ref (focus trap, click-outside, picker trigger), merge them:
   ```ts
   const setRef = (node: HTMLDivElement | null) => {
     internalRef.current = node;
     if (typeof ref === 'function') ref(node); else if (ref) ref.current = node;
   };
   ```

4. **Spread `{...rest}` onto that same node**, placed *first* so the component's own attributes win. This is what makes `data-testid`, `aria-*`, `autoComplete`, `maxLength` and form-library registration work.

5. **Event handlers keep native React signatures.** `onChange` must be `React.ChangeEventHandler`, never `(value: string) => void` — that shape breaks react-hook-form, Formik and TanStack Form. Put the convenience callback under a name matching the value's shape, and fire both:

   | Value shape | Convenience prop |
   |---|---|
   | string / number | `onValueChange` |
   | boolean | `onCheckedChange` |
   | array | `onValuesChange` |

   ```ts
   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     onChange?.(e);
     onValueChange?.(e.target.value);
   };
   ```

6. **Never invent a prop that shadows a native one with different semantics.** Prefer `variant` (not `priority`/`kind`) and `disabled` (a real boolean, never a value inside a `state` enum). **Figma variant properties are not code props** — `hover` and `active` belong to CSS pseudo-classes, so a `state` prop that includes them has two sources of truth. Where a collision is unavoidable and intentional (`size` vs the native character-width attribute, `title` vs the native tooltip), say so in the prop's JSDoc.

7. **Discard props that would be invalid on the rendered node** rather than spreading them — e.g. `name` on a `<div role="radio">`. Destructure with a `_` prefix (`name: _name`) and document why in the JSDoc; the ESLint config allows `^_`.

8. **Deprecate, never remove.** Keep the old prop working and mark it `@deprecated` with the replacement named — and put a description sentence **before** the tag, or the prop renders as a blank cell (see 9). `className` stays wherever it already is (usually the wrapper) — moving it is a silent visual break.

9. **Give every own prop a JSDoc description — this is build-enforced.** That JSDoc is the single source for Storybook's props table, the `.d.ts` consumers get, and the machine-readable prop API the site's `/api/mcp` route serves to any agent and the site chat's `get_component` tool repeats to visitors (`website/src/data/component-api.generated.ts`) — so a prop description is public copy strangers' agents and site visitors both read, and `scripts/validate-component-api.mjs` leak-screens it (a hit there is a leak in the npm tarball too). All three consumers see the same parse: the settings live in `scripts/component-docgen.mjs`, mirroring `.storybook/main.ts`. `scripts/validate-prop-docs.mjs` fails the build on a prop without a description. Two traps it catches:

   ```ts
   /** Visual treatment */
   variant?: 'primary' | 'secondary';

   /**
    * Legacy alias for `variant`.      ← without this line the row renders blank:
    *                                     the parser moves the tag and everything
    * @deprecated Use `variant` instead.  after it into a separate `tags` field
    */
   priority?: 'primary' | 'secondary';
   ```

   And **never write a prop `description` into the story's `argTypes`.** Those entries override docgen, so a description there shadows the JSDoc and drifts from it. Stories set `control` and `options` only; the source owns the words.

**If the component is a labelled form control, compose it inside `Field`** (`src/components/Field/Field.tsx`) rather than re-implementing the scaffolding. Field owns the label and its `htmlFor`, the required marker, the helper/error text, the generated ids, and the `aria-describedby` / `aria-invalid` wiring — several components each rolled their own before it existed, and two of them silently diverged (Dropdown announced neither its helper text nor its error state). Pass `className` (your own root classes), `label`, `helperText`, `error`, `required`, `disabled`, `size` and `id`; render the control as children. Field owns no layout, so your root class keeps its own flex/gap.

Two details worth knowing before you reach for it:
- `htmlFor` only associates with **labelable** elements (input, select, textarea, button…). If your control is a composite built from a `div` — a `role="combobox"` trigger, say — point `aria-labelledby` at `` `${id}-label` `` instead, which is the id Field puts on its label.
- Content that belongs *opposite* the helper text (a character counter, a unit) goes in Field's `aside` prop, not a hand-rolled footer.

### File 2: `ComponentName.css`
- CSS custom properties exclusively — **no hardcoded hex colours**, no raw `rgb()`/`rgba()`
- Icons are sized by setting `--icon-size: var(--icon-size-sm|md|lg|xl)` on the icon element — never `font-size` or raw pixel dimensions on an icon (the scale's values live in the token files)
- Transitions/animations compose `--motion-duration-*` with `--motion-ease-*` from `tokens-motion.css` — never literal timings like `0.2s ease` (new code must use the motion tokens from the start)
- The same rule has a TypeScript half: a JS timer (a hover delay, an auto-dismiss, a settle timeout) takes its default from the shared constants in `src/tokens/motion.ts` — import the matching constant, or add a named one there deliberately, never a literal ms value in the component. Schedule timings are deliberately left alone by the reduced-motion guard; a constant that paces an animation must be guarded by its component in JS instead (design.md's Motion section records the contract and the exceptions)
- All other spacing, padding, gap, border-radius, font sizes must use semantic tokens from `tokens-light.css` / `tokens-typography.css`
- **If a value genuinely cannot use a token** (colour-space physics, a glyph inside a control's geometry, decorative timing tuned by eye), sanction it *at the site*: a `/* ds-allow(<category>): <reason> */` line inside a comment at the value (`ds-allow-file(...)` in the header for file-wide cases), plus a sentence in the component's design.md spec. The category set is the closed list in `scripts/validate-css-directives.mjs` (grammar is build-enforced). **Never add an exception to the token-audit skill** — it reads the directives; it maintains no list
- Section comments grouping related rules (e.g. `/* Base */`, `/* Variants */`, `/* States */`)
- **No dark-theme overrides and no `prefers-color-scheme` queries** — dark mode comes entirely from the semantic tokens (every token has a light and dark value). The rare sanctioned exception is recorded in the component's own `design.md` spec, never assumed

### File 3: `ComponentName.stories.tsx`
- Import: `import type { Meta, StoryObj } from '@storybook/react-vite'`
- Meta uses `satisfies Meta<typeof ComponentName>`
- `title: 'Components/ComponentName'`
- `tags: ['autodocs']`
- `parameters: { layout: 'centered' }` for compact components; `'padded'` for full-width ones (cards, layouts, nav)
- One named `StoryObj` export per meaningful variant or state combination
- Story names are descriptive (e.g. `Default`, `WithIcon`, `Disabled`, `Small`)
- A component whose contract is *behavior* (dismissal, focus, keyboard) gets a `play` function asserting it — `Dialog.stories.tsx` is the reference (stories run as tests, so the assertion is CI). End the play in the component's resting state so snapshots stay stable

4. **Pass design QA before registering.** Invoke the `design-qa` skill on the new component (its "Inside new-component" section defines gate mode): render every story in both themes, magnify the joins, corners, and states, line the component up against its nearest rendered siblings, and loop on fixes until a full pass yields no defect or polish findings. One mechanical note for this pass: `npm run storybook` cannot cold-start here, because its `prestorybook` hook runs the `validate-registry` chain, which correctly fails on the still-unregistered folder — use a Storybook that is already running, or start the `storybook-raw` configuration in `.claude/launch.json` (port 6016; it invokes Storybook directly, bypassing the `prestorybook` hook, and exists for exactly this pre-registration case). Fold any open direction calls into the hand-off in step 7. Rendering correctly is necessary and nowhere near sufficient — this step is where "the buttons aren't good enough" gets caught without anyone having to say it.

5. **Register the component** in `src/components/registry.json` — add an **object** to the `components` array (alphabetical by `name`):

   ```json
   { "name": "MyComponent", "label": "My component", "slug": "my-component",
     "description": "One line, ending in a full stop, under 160 characters.",
     "category": "forms", "client": true }
   ```

   The `description` is shipped copy (it feeds the sidebar, page metadata, and README): a verbless one-line fragment ending in a full stop, written per the register table in `content-design.md`. `category` must be one of the registry's `categories` — add a new one deliberately rather than inventing one per component. The `label` has a build-enforced length ceiling from an unexpected direction: `scripts/validate-page-summaries.mjs` derives a "How do I use <label>?" chip for every component's TLDR panel and holds it to the suggestion budget, so a long label fails the build there — keep labels short and the failure never appears. `client` must match whether the file declares `'use client'`; the validator compares them and fails on a mismatch, so the registry can never document a component as server-renderable when it isn't. A component that imports recharts also sets `"recharts": true` — the flag records which barrel it ships from, and the doc block in `src/components/registry.ts` owns the field list. **The sidebar nav entry, sitemap, breadcrumbs, mega-nav and the page's title and description all derive from this entry** — never hand-add a nav link. This file is the single source of truth for the component count; `scripts/validate-component-registry.mjs` runs before every build and **fails if the folder is unregistered**. Confirm the registration itself with `node scripts/validate-component-registry.mjs` — the full `npm run validate-registry` chain stays red by construction until the website page and `design.md` section exist (`scripts/validate-website-surfaces.mjs` requires both for every registered component), so the full chain runs at the end of step 7, not here. Its leading generator scripts (the authoritative list is the `validate-registry` entry in the root `package.json`) regenerate every derived surface a new component touches: the README's component count/list, the package barrels (`src/index.ts`, or `src/charts.ts` if the component imports recharts — the generator routes by detecting the import and **fails when the registry entry's `recharts` flag disagrees with what the module actually imports**, so set the flag when the import is real; never hand-edit either barrel), the component prop API (`website/src/data/component-api.generated.ts`), the component's markdown twin (`website/public/components/<slug>.md`), the consumer agent skill's catalogue (`website/public/skill/robr0-design-system/`), and the site chat's corpus (`website/src/data/site-corpus.generated.ts` — it carries the component site map and every registry description), and the dependency graph's data (`website/src/data/dependency-graph.generated.ts` — the new component becomes a node, with its token uses and imports as edges). **Commit every file those generators rewrote in the same push as the registration** — alongside it, or as a separate `chore(generated):` commit when the regeneration would bury the real change (both are sanctioned; the `ship` skill's step 2 owns the rule). CI's drift guard diffs the tree after the generators run, so a regenerated file left uncommitted fails the build. The component is then automatically part of the published `@robr0/design-system` API — both the barrel and the `./components/*` deep-import subpath. **That wildcard maps `.tsx` only.** A sibling `.ts` module in the same folder (a hook, a data table, a shader source) reaches consumers through the barrel if the `.tsx` re-exports it, but has no deep-import path of its own until you add one — and a subpath has three homes, not one: `SUBPATHS` in `scripts/package-manifest.mjs` (the authoritative record of the ones that exist), the root `package.json` `exports` field it is mirrored into by hand, and the dist entry list in `vite.lib.config.ts` (the `new-token` skill's step 5 is the same recipe). `scripts/validate-package-exports.mjs` fails the build if any of the three disagree, so a subpath cannot reach npm with no built module behind it. Decide deliberately: a module that is genuinely internal wants no subpath, and one you document as an escape hatch needs one. `scripts/validate-package-exports.mjs` checks the answer either way — an unexported `.ts` sibling must be re-exported by the component or named in that script's `INTERNAL_MODULES` list with a reason. If the component needs a new runtime dependency, stop and ask: the package's only runtime deps are the react peer and the optional recharts peer, and adding one is a packaging decision.

   One exception: a **docs-only helper** (a component that exists purely for the website/Storybook docs — the registry's `docOnlyHelpers` array is the authoritative list; note the public `Swatch` component is *not* one of them) goes in the registry's `docOnlyHelpers` array instead of `components` — it gets no showcase page, no barrel export, and doesn't count. Putting it in `components` fails the build for a missing website page.

6. **Document it in `design.md`** — add a short component spec section (class name, tokens used, key behaviours), following the format of the existing component sections.

7. **Hand off the website work.** A component is not done until it has a showcase page: a `page.tsx`, a `page.module.css`, a `layout.tsx` containing exactly `export const metadata = componentPageMetadata("<slug>");`, and a preview entry under its slug in `website/src/components/ComponentPreviews/ComponentPreviews.tsx`. The preview is the only surface still hand-maintained — each entry holds a bespoke live miniature. Everything else (the index's category section, sidebar accordion, sitemap, breadcrumbs, title, description) derives from the registry entry. All of it is build-enforced by `scripts/validate-website-surfaces.mjs` and `scripts/validate-page-titles.mjs`. Ask Rob: "Should I add the website documentation page now? (invokes the `component-doc-page` skill)" — and whoever does that work must complete every registration above, then run `npm run validate-registry`: with the page and the `design.md` section in place, this is the first point in the flow where the whole chain can go green.
