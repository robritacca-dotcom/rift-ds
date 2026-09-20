---
name: component-doc-page
description: Create a full-quality documentation page for a design system component on the website. Use when asked to document a component on the website, add a component docs page, or create the website page for a component.
icon: article
displayDescription: "Creates a full-quality documentation page for a design system component on the website. Reads the component's props to generate a variant showcase grid (the Button page is the benchmark), writes all three page files, and adds the component's preview entry (the one hand-maintained surface). The index card, sidebar, sitemap and breadcrumbs derive from the component registry, so there is no navigation to wire."
invoke: ["document [X] on the website","add a docs page for [X]","create the website page for [X]"]
---

# component-doc-page

Create a full-quality documentation page for a design system component on the website.

## When invoked

Use this skill when asked to document a component on the website, add a component page, or create docs for a component — phrases like "document [X] on the website", "add a docs page for [X]", "create the website page for [X]".

This is a more thorough, component-specific version of `new-page`. The Button page is the quality benchmark for static variant grids; for components whose value is interaction or streaming state (the `ai` category), the chat-message page (`website/src/app/components/chat-message/page.tsx`) is the exemplar — a `"use client"` page with small stateful demos instead of a grid.

## Instructions

1. **Gather requirements** if not already provided:
   - Component name (PascalCase)
   - Figma node URL (optional — ask Rob, or omit if unknown)
   - Storybook path (optional — format: `/?path=/docs/components-<slug>--docs`)

2. **Read the source component** `src/components/ComponentName/ComponentName.tsx`:
   - Extract all props from the TypeScript interface (the entry in `website/src/data/component-api.generated.ts` has them pre-parsed with types, defaults and descriptions — the source is still worth reading for behaviour)
   - Identify all variant enumerations (e.g. `variant`, `size`, `status` props with union types)
   - Understand the component's states (default, hover, active, disabled, loading, etc.)
   - Note the BEM class names used for each variant/state

3. **Read the gold-standard reference:**
   - `website/src/app/components/button/page.tsx` — study the variant showcase grid structure (rows = states, columns = variants), the `pageHeader` block, `introSection`, and how `PageLinks` is used
   - `website/src/app/components/button/page.module.css` — CSS module structure

4. **Create `website/src/app/components/<component-slug>/page.tsx`:**
   - Mirror the Button page's layout shell exactly — same components, same nesting, same class names — and render `<ComponentsSidebar />` with no props: it resolves the active entry from the pathname and its groups from the registry. Don't improvise structure. Mirror the *structure*, not deprecated APIs: if an existing page still uses a prop marked `@deprecated` in the component source (the `priority` → `variant` rename is the precedent), write the current prop name.
   - Invariants the exemplar can't teach:
     - `subDisplay` is a *tagline* for the component (e.g. Button's "The main action element") — not the word "Components"; the breadcrumb already shows the section
     - `introBody` is a clear 1–2 sentence description of the component's purpose, inferred from its props and JSDoc if available
     - All copy on the page (tagline, intro, section labels) follows `content-design.md` — neutral, sentence case, no em dashes
     - Import the component through the package, never a relative path into `src/`: `import { X } from "@robr0/design-system/components/X/X"` (recharts-backed charts come from `@robr0/design-system/charts`) — the website is an npm-workspace consumer of the published package's exports
     - Include `PageLinks` with whichever Figma/Storybook URLs were provided
   - **Variant showcase grid**: render the component in every meaningful combination of its variants and states. For components with discrete variants × states (like Button), render a proper grid. For simpler components, render one example per meaningful state/variant.
     - If a demo renders h2 headings of its own (a heading-bearing component like SectionTitle, or Prose sample content), wrap that demo container in `data-anchor-ignore` — the site-wide floating anchor rail reads every page's h2s, and demo headings are the demo's, not sections of the page. The discovery rules live in the doc block of `website/src/components/FloatingAnchorNav/SiteAnchorRail.tsx`.

5. **Create `website/src/app/components/<component-slug>/page.module.css`:**
   - Standard layout classes: `dsLayout`, `dsContent`, `pageHeader`, `pageTitle`, `subDisplay`, `introSection`, `introBody`
   - Any additional classes needed for the variant showcase grid
   - Page assembly follows design.md's **Composition** section (rhythm ladder, spacing ownership, one level of chrome, dividers last) — the exemplar shows the pattern, the spec owns the rules
   - **Prose is never width-capped.** No `max-width` on `introBody`, section body text, or any paragraph class — page text fills the content column, exactly as the Button page does. A `max-width` is only legitimate on a *demo container* (a box that holds a rendered component, e.g. a drawer or form-control mount) where the component itself needs a bounded stage. If you find yourself capping a paragraph "for readability", don't — the column width is the layout's decision, not the page's.
   - CSS custom properties only
   - Mobile type and section rhythm collapse at the **token layer**, system-wide (`design.md`'s responsive spec owns the breakpoint) — do not add per-page `@media` overrides for tokenized values; when the showcase grid genuinely needs a breakpoint, use the canonical set in that same spec

6. **Create `website/src/app/components/<component-slug>/layout.tsx`** — it is exactly this, with no description of its own:

   ```tsx
   import { componentPageMetadata } from "@/config/navigation";

   export const metadata = componentPageMetadata("<component-slug>");

   export default function Layout({ children }: { children: React.ReactNode }) {
     return <>{children}</>;
   }
   ```

   Both the title and the description resolve from the component's entry in `src/components/registry.json` — that is the only place the one-line description lives, so do **not** pass one here. `scripts/validate-page-titles.mjs` requires this exact call and fails the build otherwise; a slug with no registry entry fails the website build with a message naming the fix.

7. **Do not touch `website/src/config/navigation.ts`.** `componentsSidebarLinks` is **derived** from the registry — there is no list to add to. Registering the component in `src/components/registry.json` (with its `label`, `slug` and `description`) is what puts it in the sidebar, and the sitemap, mega-nav and breadcrumbs follow from there. If the component is not yet registered, do that first; the `new-component` skill covers the entry's shape.

8. **Add a preview entry to `website/src/components/ComponentPreviews/ComponentPreviews.tsx`** — the one surface still hand-maintained, because each entry holds a bespoke preview:
   - Add a `"component-slug": () => (...)` entry to the `previews` map — use the real component (imported from `@robr0/design-system`) where it reads well at miniature size, as most entries do, or a small inline-styled mockup where it doesn't (see the accordion entry). The index's category section renders the entry through `ComponentCardGrid`, so there is no card to place by hand and no order to maintain.

9. **Sitemap is automatic** — `website/src/app/sitemap.ts` derives its routes from the shared sidebar configs, which for components derive from the registry. Do not edit `sitemap.ts` by hand. `scripts/validate-website-surfaces.mjs` build-enforces the showcase page, the step-8 preview entry (in both directions — an entry whose key is not a registered slug fails too), and the `design.md` spec section; the sidebar entry and its ordering are no longer checked because they can no longer drift. If the component has no `design.md` spec section yet, add one before building — see the `new-component` skill's spec step for the expected shape.
