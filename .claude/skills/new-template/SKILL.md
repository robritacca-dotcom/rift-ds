---
name: new-template
description: Build a new template screen — a complete product screen composed from the design system alone — and wire it into every surface that tracks templates. Use when asked to add, create, or build a template screen.
icon: space_dashboard
displayDescription: "Builds a full-viewport template screen from the library alone, then registers it everywhere templates are tracked: the nav entry the index carousel and sitemap derive from, the chromeless list, and the chat-corpus exclusion. Owns the checklist so a screen never ships half-wired."
invoke: ["add a [X] template","build a template screen for [X]","new template"]
---

# new-template

Build a new template screen — a complete product screen composed from the design system alone — and register it everywhere the site tracks templates.

## When invoked

Use this skill when asked to add, create, or build a template screen — phrases like "add a [X] template", "build a template screen for [X]", "the templates need a [X]".

A template is a **website surface, not a library component**: it lives in `website/src`, imports the published package, and gets no `design.md` component spec, no Storybook story, and no registry entry in `src/components/registry.json`. If the work is really a new *component* the screen needs, do that first with the `new-component` skill.

## Instructions

### 1. Read the conventions before composing anything

- **design.md's Template screens section owns the family's composition rules** — read it in full; it exists so the next screen lands right without re-learning the review rounds that produced it.
- design.md's **Composition** section owns the page-assembly rules the family sits on (parent owns spacing, one level of chrome, a component that brings its own bordered chrome sits directly on the page).
- All demo data is **fictional** — an invented product with an invented name, never a real company's screen with the serial numbers filed off. content-design.md's template-screens register row owns the copy rules.

### 2. Read the exemplars

The live implementations under `website/src/components/templates/` are the source of truth for structure — pick the one nearest the new screen's shape and mirror it rather than improvising:

- A data view (table or board as the stage) — the sales pipeline
- A timeline or scheduling stage — the roadmap planner or team calendar
- An analytics shell — the marketing dashboard
- A conversation-centred screen — the agent workbench
- An instrument with one subject in two projections (a map or globe stage, a stage-mounted toolbar, full-width content) — the relay console
- A phone-only app screen (platform chrome, drawn as a framed device on the dotted stage at wider widths) — the mobile dashboard

Each implementation's doc comment records its own composition decisions; read the chosen exemplar's before writing.

### 3. Build the implementation

Create `website/src/components/templates/<Name>/` with `<Name>.tsx` + `<Name>.module.css`:

- Open the `.tsx` with a doc comment in the exemplars' shape: what the screen is, the fictional product, the composition calls made and which design.md rules they follow, and the corpus-exclusion pointer.
- **Size the shell from `--layout-viewport-height`** (`height:` or `min-height: calc(var(--layout-viewport-height, 100vh))`, whichever the screen's flow needs), never bare `100vh`: the templates index carousel and the canvas board render pages in scaled same-origin iframes and pin that variable to give viewport-tall shells a fixed size.
- **The assistant panel**, three shapes: a screen that wants a mock chat uses the shared `TemplateAssistant` (`website/src/components/templates/TemplateAssistant/`), docked at the viewport's right edge by default or re-seated through its `className` (the mobile dashboard hosts it as a full-screen sheet inside its phone); a screen that is *itself* a chat surface builds its conversation pane inline (the agent workbench); and a screen whose subject **is** the chat hosts the real `SiteChat` on the simulated transport, inside its own `SiteChatProvider` (the payroll console). Reach for the third only when the widget's own behaviour is the thing being shown — it brings the live component's state with it, so the screen has to own the open/closed handling too, and it should pass `contextLabel={null}` so the staged assistant does not announce this site's page name.
- Every control is a library component, every value a semantic token — the standard component and token rules apply unchanged. Demo humans render through Avatar's initials fallback, never portrait imagery.
- Dates and times in demo data are pinned strings formatted by hand, so the statically built HTML and the hydrating client can never disagree over a locale or a clock (the exemplars' convention).

### 4. Create the route

Create `website/src/app/templates/<slug>/` with two files, mirroring a live template's:

- **`page.tsx`** — a doc comment (why the route is chromeless and corpus-excluded, pointing at both lists) and a default export that renders the implementation. Nothing else.
- **`layout.tsx`** — `export const metadata = pageMetadata("/templates/<slug>", "<description>")` (import from `@/config/navigation`). The description is real page metadata, so it follows content-design.md like any shipped copy.

### 5. Register the screen — three lists, in one change

- **`templatesSidebarLinks` in `website/src/config/navigation.ts`** — add `{ href, label, description }`, plus `mobileOnly: true` for a screen with no tablet or desktop layout (the carousel then keeps its slide in the phone frame at every device size; the field's doc on `NavLink` owns the contract): the index link stays first, then one entry per screen in the family's curated order. This is the one authoritative list of templates: the index carousel, the sidebar, the sitemap, llms.txt, and the chat corpus's Templates list all derive from it. **No validator holds it**, so a skipped entry fails silently — the screen simply never appears anywhere.
- **`CHROMELESS_ROUTES` in `website/src/config/chromeless.ts`** — the shared footer, chat panel, and palette would otherwise render inside the app shell being shown. Build-enforced indirectly: `validate-page-summaries.mjs` reads this list as its coverage exemption, so a template route left out fails the build demanding a page summary the screen should not have.
- **`EXCLUDED_ROUTES` in `scripts/generate-site-corpus.mjs`** — with a written reason in the existing entries' shape (fictional demo data; the screen's name and summary reach the corpus through the site map's Templates list, drawn from the sidebar entry). This one **is a gate**: `validate-chat-coverage.mjs` fails the build for an uncovered route.

Nothing else needs registering. Chromeless routes are automatically exempt from the AI-summary panel (`validate-page-summaries.mjs`) and the anchor rail; breadcrumbs and page title derive from the sidebar entry; the canvas board shows only section landing pages, so an individual template never joins it.

### 6. Verify

Load the route in the browser and confirm: the shell fills the viewport with no shared chrome inside it, both themes render, and the templates index carousel picked the screen up (it derives from the sidebar entry — an empty slide or a missing one means step 5 went wrong). For a `mobileOnly` screen, also check the route at a phone width (the app edge to edge) and at 600px or wider (the framed device), and that its carousel slide stays in the phone frame with the device toggle on Desktop and Tablet. Then run the corpus generator or `npm run validate-registry` to prove the exclusion entry satisfies the coverage gate.
