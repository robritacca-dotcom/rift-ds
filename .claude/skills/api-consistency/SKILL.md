---
name: api-consistency
description: Review component prop interfaces across the design system, or scoped to one component or family, for naming inconsistencies, missing standard props, mixed colour vocabulary, contract violations, and descriptions that disagree with the contract. Use when asked to review component APIs, audit prop naming consistency, check a component's API, or check TypeScript interfaces for API inconsistencies.
icon: compare
displayDescription: "Reads component Props interfaces, across the library or scoped to one component and its family, and flags inconsistencies: mixed boolean naming (disabled vs isDisabled), mismatched size enums, emphasis and colour mixed in one prop, missing standard props, structural mismatches within families, and registry descriptions or specs that name a prop the contract no longer carries. Produces a grouped findings report prioritised by breaking impact."
invoke: ["review component APIs","prop consistency audit","are our component props consistent","check for API inconsistencies","check this component's API"]
---

# api-consistency

Review component prop interfaces across the design system for naming inconsistencies, missing standard props, and pattern violations.

## When invoked

Use this skill when asked to review component APIs, check prop naming consistency, or audit TypeScript interfaces — phrases like "review component APIs", "prop consistency audit", "are our component props consistent", "check for API inconsistencies", "check this component's API".

It also runs **scoped** inside other flows: `new-component` runs it on a new component before registering, and `ship` and `super-ship` run it on the components a diff touched. When run scoped inside another flow, report only findings about the components in scope (the touched components and their family). Library-wide findings the owner has already reviewed and accepted are not news to that flow, and re-raising them there buries the finding the flow exists to catch.

## Instructions

1. **Determine scope.** Accept one of:
   - **Scoped** (the cheap mode other skills call): one component, or a family. A family is the component's shared folder (the registry entry's `folder`) or its `category` in `src/components/registry.json`, plus any component that composes it or that it composes. Every check below runs, but only over these components, and the family is the comparison set for the family checks.
   - A list of specific components (e.g. `Button, CircularButton, ButtonGroup`) → compare those
   - `all` → scan all components in `src/components/`, plus the chat widget's documented exports in `src/chat/` (they ride the same generated API with `importPath` `rift-ds/chat`)
   - A category description (e.g. "all button-like components", "all form inputs") → infer the relevant components

2. **Read every component's TypeScript interface.** Start from `website/src/data/component-api.generated.ts` for the prop inventory — it holds every own prop with type, default, requiredness and description, parsed exactly as the published `.d.ts` documents them. Then read the `.tsx` files in scope for what the generated file does not capture:
   - The structural contract (`forwardRef`, `{...rest}` placement, the own-props split, `'use client'`)
   - Default values (from destructuring defaults in the function signature)

3. **First, check conformance to the published contract.** This is the highest-value part of the review and takes precedence over style preferences below. The contract is defined in the `new-component` skill and summarised in CLAUDE.md's **Component Anatomy** — read one of them rather than trusting this list, which exists to tell you *what to look for*, not to restate the rules:

   - **The ref, the rest spread and the native props.** `node scripts/validate-component-contract.mjs` build-enforces forwardRef with a `displayName`, props extending the native element's type, and the ref and `{...rest}` on one node with the root class after the spread; the props-contract story (`src/stories/Contract.stories.tsx`) proves at runtime that both reach the same element. Run the script rather than re-reading for these. What it cannot judge, and you still check: whether the node it found is the *primary* one (the panel for a portal component, the control for a form field), and whether own handlers the component sets on that node compose with the consumer's (`onMouseEnter` from rest must still fire) instead of overwriting them.
   - **`'use client'` present when the component is interactive, and absent when it is purely presentational.** A needless directive silently costs consumers Server Component rendering — flag both directions.
   - **Native event signatures keep the standard names.** `onChange` must be a `ChangeEventHandler`, never `(value) => void`. The convenience callback is named for the value's shape: `onValueChange` (string/number), `onCheckedChange` (boolean), `onValuesChange` (array) — and both fire.
   - **The controlled/uncontrolled pair convention.** State a consumer can own comes as `x` / `defaultX` / `onXChange`, and works with `x` omitted. A controlled-only prop with no `default*` partner, or a selection named `activeTab`/`onTabChange` where the convention says `value`/`onValueChange`, is a finding, unless the component's design.md spec says it is fully controlled by design.
   - **English text is a prop, announced or visible.** A literal English `aria-label` (or visually hidden text) the component writes with no `*Label` prop to replace it is a finding: a consumer cannot localise it. The same goes for visible words. `validate-accessible-names.mjs` and `validate-visible-text.mjs` catch the literal attributes and JSX text; what they cannot see, and you check, is English inside string literals and arrays: a weekday or month list, a pluralised count built in a template (`${n} results`), a status default.
   - **No Figma variant properties in the code API.** A `state` enum mixing `hover`/`active` (CSS pseudo-classes the browser owns) with `disabled` (real semantics) has two sources of truth. Prefer `variant` over `priority`/`kind`, and `disabled` as a real boolean.
   - **Labelled form controls compose inside `Field`** rather than re-implementing label/helper/required/ARIA wiring.
   - **Deprecations, not removals** — an old prop should still work and carry `@deprecated` naming its replacement.

   Where a prop deliberately shadows a native attribute with different meaning (`size` vs the native character-width attribute, `title` vs the native tooltip), that is acceptable **only if the collision is documented in the prop's JSDoc**. Flag undocumented collisions.

4. **Then check these style-level inconsistencies:**

   **Boolean prop naming:**
   - Should follow `is*`/`has*` convention OR plain adjective — not both (e.g. `isDisabled` on one component, `disabled` on another doing the same thing)
   - Flag: mixed usage within the same component family

   **Event handler naming:**
   - Must be `on*` (e.g. `onClick`, `onChange`, `onDismiss`)
   - Flag: `handleClick`, `clickHandler`, `onClickHandler`, or similar

   **Content prop naming:**
   - `label` for display text, `children` for slot content
   - Flag: `text`, `title`, `copy`, `content` used interchangeably across components for the same purpose

   **Size enum values:**
   - Should use a consistent vocabulary across components
   - Flag: `"sm"/"md"/"lg"` on one component and `"small"/"medium"/"large"` on another, or `"compact"/"default"` on one and `"small"/"medium"` on another

   **Colour vocabulary:**
   - **Emphasis and colour are separate axes.** `variant` holds emphasis (`primary`/`secondary`/`tertiary`); `tone` holds colour (`default`/`neutral`/`destructive`). Flag a `variant` union that mixes the two without the colour values marked as legacy aliases beside a `tone` prop (CLAUDE.md's Component Anatomy states the rule; design.md's Components intro owns the details; `scripts/validate-prop-vocabulary.mjs` enforces the mechanical half). Its `SANCTIONED_TONES` and `LEGACY_VALUES` tables are the record of the deliberate exceptions, a `tone` in another vocabulary and a labelled legacy alias, so read them before flagging either
   - **One status set.** A status-bearing component carries the five status roles on `variant`, the same five every other status component uses. Flag a sixth role, a missing one, or a synonym (`success` for `positive`, `danger` for `error`)
   - **One word for danger: `destructive`.** Flag `danger`, `negative` and other strays naming the same thing, unless the value is a labelled legacy alias in `LEGACY_VALUES`
   - **Data entries take a boolean, components take a tone.** An item inside a data array (a menu item, a command row) marks danger with `destructive?: boolean`; a component marks it with `tone`. Flag the two crossed

   **Missing standard props on interactive components:**
   - All components rendering clickable/interactive elements should have `className?: string`
   - All components with visual disabled states should have `disabled?: boolean`
   - All form-like components should have `id?: string`
   - `name` only belongs on a component that renders a **native** form control. Several controls here render a `div` with an ARIA role (Checkbox, RadioButton, Dropdown), where `name` cannot participate in form submission — on those it is a documented no-op, not a missing prop. Flag an *undocumented* `name`, not its absence.

   **Family consistency:**
   - Components in the same family (e.g. Button / CircularButton / ButtonGroup) should share `size` enum values
   - If one component accepts `iconLeft`/`iconRight`, siblings in the same family should follow the same pattern
   - Default values: if `size` defaults to `"default"` on a Gadget, it should not default to `"medium"` on a related Sprocket

5. **Then check the contract agrees with its description.** For each component in scope, read its entry in `website/src/data/component-api.generated.ts` (exactly what `/api/mcp`'s `get_component` serves, so this is the contract strangers' agents see), then read the two prose descriptions of it against that entry:
   - its registry `description` (`src/components/registry.json`, or `src/chat/registry.json` for the widget), which also ships through the site chat's corpus, the consumer agent skill and the page metadata
   - its `###` spec section in `design.md`

   Flag any prop or value a description names that the contract does not carry, or carries only as `@deprecated` (a description still saying "neutral and destructive variants" after those moved to `tone` is the classic case). A design.md spec is not a props list and is not expected to name every prop: the prop JSDoc is the one home of the full contract, and the generated component API, the per-component `.md` pages and the MCP endpoint all serve it, so restating it in design.md would be a second copy to drift. Flag a spec that omits a prop only when the prop changes what the component looks like or how it behaves (a variant, a size, a mode) and a reader of the spec would design wrongly without it. The fix goes in the source of the description, never in a generated file.

6. **Output a grouped findings report.** The component names in this example are **fictional by design** — findings about real components go stale the moment someone fixes them, so this block only demonstrates the format:

   ```
   ## API Consistency Report

   ### Contract violations (highest impact)
   - Gadget — no forwardRef; a consumer cannot take a ref
   - Sprocket — props do not extend ComponentPropsWithoutRef<'span'>; data-* unreachable
   - MetricPod — has 'use client' but no hooks or handlers; blocks Server Component rendering

   ### Boolean prop naming
   - Gadget: uses `disabled` (plain adjective)
   - Doodad: uses `isDisabled` (is* prefix)
   → Standardise to `disabled` across all interactive components

   ### Size enum values
   - Gadget: "compact" | "default" | "large"
   - Whatsit: "small" | "medium" | "large"
   → Standardise to the enum of the most-used component in the family

   ### Colour vocabulary
   - Whatsit: `variant` holds "primary" | "danger"; danger is a colour, and a stray word for destructive
   → Move it to `tone="destructive"`, keep `variant="danger"` as a deprecated alias

   ### Description disagrees with contract
   - Doodad — registry description names a "ghost variant"; the contract has no such value

   ### Missing className prop
   - Doodad — no className passthrough
   - Gadget — no className passthrough

   ### Summary
   X naming inconsistencies · Y missing props · Z structural mismatches
   ```

7. **Prioritise fixes** by impact:
   - **High:** Renames that would require consuming code changes — flag these clearly so the owner can decide whether to batch into a breaking release
   - **Medium:** Missing props that are commonly needed by consumers
   - **Low:** Style preferences with no breaking impact
