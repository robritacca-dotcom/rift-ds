---
name: api-consistency
description: Review component prop interfaces across the design system for naming inconsistencies, missing standard props, and pattern violations. Use when asked to review component APIs, audit prop naming consistency, or check TypeScript interfaces for API inconsistencies.
icon: compare
displayDescription: "Reads all component Props interfaces and flags inconsistencies across the library: mixed boolean naming (disabled vs isDisabled), mismatched size enums, missing standard props (className, disabled), and structural mismatches within component families. Produces a grouped findings report prioritised by breaking impact."
invoke: ["review component APIs","prop consistency audit","are our component props consistent","check for API inconsistencies"]
---

# api-consistency

Review component prop interfaces across the design system for naming inconsistencies, missing standard props, and pattern violations.

## When invoked

Use this skill when asked to review component APIs, check prop naming consistency, or audit TypeScript interfaces — phrases like "review component APIs", "prop consistency audit", "are our component props consistent", "check for API inconsistencies".

## Instructions

1. **Determine scope.** Accept one of:
   - A list of specific components (e.g. `Button, CircularButton, ButtonGroup`) → compare those
   - `all` → scan all components in `src/components/`
   - A category description (e.g. "all button-like components", "all form inputs") → infer the relevant components

2. **Read every component's TypeScript interface.** Start from `website/src/data/component-api.generated.ts` for the prop inventory — it holds every own prop with type, default, requiredness and description, parsed exactly as the published `.d.ts` documents them. Then read the `.tsx` files in scope for what the generated file does not capture:
   - The structural contract (`forwardRef`, `{...rest}` placement, the own-props split, `'use client'`)
   - Default values (from destructuring defaults in the function signature)

3. **First, check conformance to the published contract.** This is the highest-value part of the review and takes precedence over style preferences below. The contract is defined in the `new-component` skill and summarised in CLAUDE.md's **Component Anatomy** — read one of them rather than trusting this list, which exists to tell you *what to look for*, not to restate the rules:

   - **`forwardRef` onto the primary DOM node**, plus a matching `displayName`. A component that cannot take a ref cannot be focused, measured, or registered by a form library.
   - **`{...rest}` spread onto that same node**, placed first so the component's own attributes win.
   - **Props extend the native element's type** — `Omit<React.ComponentPropsWithoutRef<'el'>, keyof OwnProps>`. Without it, `data-*`, `aria-*`, `autoComplete` and friends are unreachable.
   - **`'use client'` present when the component is interactive, and absent when it is purely presentational.** A needless directive silently costs consumers Server Component rendering — flag both directions.
   - **Native event signatures keep the standard names.** `onChange` must be a `ChangeEventHandler`, never `(value) => void`. The convenience callback is named for the value's shape: `onValueChange` (string/number), `onCheckedChange` (boolean), `onValuesChange` (array) — and both fire.
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

   **Missing standard props on interactive components:**
   - All components rendering clickable/interactive elements should have `className?: string`
   - All components with visual disabled states should have `disabled?: boolean`
   - All form-like components should have `id?: string`
   - `name` only belongs on a component that renders a **native** form control. Several controls here render a `div` with an ARIA role (Checkbox, RadioButton, Dropdown), where `name` cannot participate in form submission — on those it is a documented no-op, not a missing prop. Flag an *undocumented* `name`, not its absence.

   **Family consistency:**
   - Components in the same family (e.g. Button / CircularButton / ButtonGroup) should share `size` enum values
   - If one component accepts `iconLeft`/`iconRight`, siblings in the same family should follow the same pattern
   - Default values: if `size` defaults to `"default"` on Button, it should not default to `"medium"` on a related component

5. **Output a grouped findings report.** The component names in this example are **fictional by design** — findings about real components go stale the moment someone fixes them, so this block only demonstrates the format:

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

   ### Missing className prop
   - Doodad — no className passthrough
   - Gadget — no className passthrough

   ### Summary
   X naming inconsistencies · Y missing props · Z structural mismatches
   ```

6. **Prioritise fixes** by impact:
   - **High:** Renames that would require consuming code changes — flag these clearly so Rob can decide whether to batch into a breaking release
   - **Medium:** Missing props that are commonly needed by consumers
   - **Low:** Style preferences with no breaking impact
