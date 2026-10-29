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
- An analytics screen on `TemplateShell` — the marketing dashboard
- A conversation-centred screen — the agent workbench
- An assistant home (the real chat as the page, a board of tiles under the composer) — the chat home
- An instrument with one subject in two projections (a map or globe stage, a stage-mounted toolbar, full-width content) — the relay console
- A phone-only app screen (platform chrome, drawn as a framed device on the dotted stage at wider widths) — the mobile dashboard
- A single centred form with no app shell — the sign-in screen
- A marketing page with no app shell (a hero, sections and a footer, a hamburger drawer at narrow widths and a bottom tab bar on a phone) — the landing page

Each implementation's doc comment records its own composition decisions; read the chosen exemplar's before writing.

### 3. Build the implementation

Create `website/src/components/templates/<Name>/` with `<Name>.tsx` + `<Name>.module.css`:

- Open the `.tsx` with a doc comment in the exemplars' shape: what the screen is, the fictional product, the composition calls made and which design.md rules they follow, and the corpus-exclusion pointer.
- **A screen with a sidebar lays out through `TemplateShell`** (`website/src/components/templates/TemplateShell/`): pass `sidebar` (the rail's own props, without layout, expanded state or footer), `chatOpen`, `frame`, `tabBar`, `assistant`, `contentClassName` and, for an instrument or board whose panes scroll themselves, `fill="viewport"`. The shell owns the rail and its footer switchers, the floating or inset layout the visitor picks (stored by `website/src/lib/templateLayout.ts`), viewport sizing, the docked assistant's width reservation and the Mobile-preview swap; the template styles only its content column (its padding, gap and floating max width). The shell runs the rail in panel mode with the side panel closed, so give two or three nav items demo `children`. Wrap the top bar (search, then `AiButton` and the notifications `CircularButton`, both at the default size) in `StickyTopBar` from the shell's folder, with no `Divider` under it. design.md's Template screens section owns the two layouts and these conventions.
- **A screen without a sidebar sizes its shell from `--layout-viewport-height`** (`height:` or `min-height: calc(var(--layout-viewport-height, 100vh))`, whichever the screen's flow needs), never bare `100vh`: the templates index carousel renders pages in scaled same-origin iframes and pins that variable to give viewport-tall shells a fixed size.
- **The assistant panel**, three shapes: a screen that wants a mock chat uses the shared `TemplateAssistant` (`website/src/components/templates/TemplateAssistant/`), which owns the site chat's responsive modes (docked at the dock threshold, a modal overlay below it, a takeover at phone widths; design.md's Template screens rule 7). Inside `TemplateShell` the host passes `chatOpen` and the shell reserves the width, and the assistant reads the shell's layout (docked flat at the shell gap in the inset layout, with the site chat's widen grip); a screen outside it gates its own reservation on `@media (min-width: 1440px)`; a host that seats the panel inside a frame of its own passes `placement="contained"` and places it through `className` (the mobile dashboard hosts it as a full-screen sheet inside its phone; that prop is the assistant's own and unrelated to the site chat's Chat position menu, which a template does not offer — leave `placementEnabled` off on a hosted `ChatWidget`, design.md's ChatWidget spec owns the rule); a screen that is *itself* a chat surface builds its conversation pane inline (the agent workbench); and a screen whose subject **is** the chat hosts the package's real `ChatWidget` (`rift-ds/chat`) on the scripted demo transport (`createDemoTransport()` with `DEMO_RENDERERS` from `rift-ds/chat/demo`), inside its own `SiteChatProvider` (the chat home). Reach for the third only when the widget's own behaviour is the thing being shown — it brings the live component's state with it, so the screen has to own the open/closed handling too, and it leaves `contextLabel` unset so the staged assistant does not announce this site's page name. When the chat is the page itself rather than a panel beside one (the chat home), seat it as the whole viewport: `closeEnabled={false}` and `fullscreenEnabled={false}`, `setOpen(true)` on mount, `phone` and `compact` from `useTakeoverViewport()`, the built-in history rail with `threads` (seeded through the provider's `threads` option), and the screen's board in the `widgets` slot (design.md's ChatWidget spec owns the slot and the exception).
- **A sidebar shell previews as an app in a Mobile preview** (the carousel's Mobile mode and the playground's Mobile stage both set the flag; design.md's Template screens rule 8 owns it). Pass `frame` (the large-title bar's title and subtitle) and `tabBar` (an `AppFrameTabBar` from the same nav sections, with the assistant on its circle) to `TemplateShell`, which does the swap; inside the content, read `useAppFrame()` from `website/src/components/templates/AppFrame/` to skip the web top bar and the page-title block. The marketing dashboard is the reference wiring. A screen with no tab-bar shape on a real phone (a chat session, a sign-in) skips this.
- Responsive steps come from the breakpoint modules: the template family's `BREAKPOINT_TEMPLATE_COMPACT_PX` / `BREAKPOINT_TEMPLATE_NARROW_PX` in `website/src/config/breakpoints.ts`, the chat dock and takeover and the layout set in `src/tokens/breakpoints.ts`. A screen whose own grid breaks somewhere else says why with a `ds-allow(breakpoint)` directive above the query (`scripts/validate-breakpoints.mjs` enforces it)
- Every control is a library component, every value a semantic token — the standard component and token rules apply unchanged. The product's name wears the shared `ProductMark` (`website/src/components/templates/ProductMark/`), a publisher or identity provider the screen names takes its mark from `PublisherMarks` (`website/src/components/templates/PublisherMarks/`), and demo humans are Avatar initials; design.md's Template screens section owns all three.
- Dates and times in demo data are pinned strings formatted by hand, so the statically built HTML and the hydrating client can never disagree over a locale or a clock (the exemplars' convention).

### 4. Create the route

Create `website/src/app/templates/<slug>/` with two files, mirroring a live template's:

- **`page.tsx`** — a doc comment (why the route is chromeless and corpus-excluded, pointing at both lists) and a default export that renders the implementation. Nothing else.
- **`layout.tsx`** — `export const metadata = pageMetadata("/templates/<slug>", "<description>")` (import from `@/config/navigation`). The description is real page metadata, so it follows content-design.md like any shipped copy.

### 5. Register the screen — three lists and the playground stills, in one change (a fourth list when the screen has a grip)

- **`templatesSidebarLinks` in `website/src/config/navigation.ts`** — add `{ href, label, description }`, plus `mobileOnly: true` for a screen with no tablet or desktop layout (the carousel then keeps its slide in the phone frame at every device size; the field's doc on `NavLink` owns the contract), and `hideFromShowcase: true` only if the screen should stay out of the index carousel while keeping its page, sidebar entry and sitemap row: the index link stays first, then one entry per screen in the family's curated order. This is the one authoritative list of templates: the index carousel, the sidebar, the sitemap, llms.txt, the chat corpus's Templates list, and the playground's Templates rail all derive from it. **No validator holds it**, so a skipped entry fails silently — the screen simply never appears anywhere.
- **`CHROMELESS_ROUTES` in `website/src/config/chromeless.ts`** — the shared footer, chat panel, and palette would otherwise render inside the app shell being shown. Build-enforced indirectly: `validate-page-summaries.mjs` reads this list as its coverage exemption, so a template route left out fails the build demanding a page summary the screen should not have.
- **`EXCLUDED_ROUTES` in `scripts/generate-site-corpus.mjs`** — with a written reason in the existing entries' shape (fictional demo data; the screen's name and summary reach the corpus through the site map's Templates list, drawn from the sidebar entry). This one **is a gate**: `validate-chat-coverage.mjs` fails the build for an uncovered route.
- **The playground's template stills**, unless the screen is `mobileOnly`: run `node scripts/capture-template-thumbnails.mjs` and look at the two new pictures before committing them. The script serves the built site, and for a new template the website's `npm run build` cannot finish yet: its prebuild runs `validate-template-thumbnails`, which fails until the stills exist. Build with `npx next build` inside `website/` for the capture (the prebuild chain is what you are skipping, so run it afterwards). Passing a running dev server as the origin instead puts Next's dev indicator into every still. The script shoots every listed template, so restore the unchanged ones (`git checkout -- website/public/images/templates/`, which leaves the new, untracked pair alone) and commit only the stills that should change. This one **is a gate**: `validate-template-thumbnails.mjs` fails the build for a listed template with no still in either mode, but only for a missing file: a still also goes stale when an existing screen changes what it shows, so re-run the script then too (CLAUDE.md's Screenshot surfaces entry owns the rule).
- **`scripts/gestures.json`**, only when the screen carries a grip a visitor can drag (a resizable pane, a docked rail's widen grip): one entry per grip with the setup that reaches it, so the gesture stress check drives it in `verify` and CI (CLAUDE.md's Gestures row owns the registry). No validator notices a missing entry.

Nothing else needs registering. Chromeless routes are automatically exempt from the AI-summary panel (`validate-page-summaries.mjs`) and the anchor rail; breadcrumbs and page title derive from the sidebar entry.

### 6. Verify

Load the route in the browser and confirm: the shell fills the viewport with no shared chrome inside it, both themes render, and the templates index carousel picked the screen up (it derives from the sidebar entry — an empty slide or a missing one means step 5 went wrong). For a `mobileOnly` screen, also check the route at a phone width (the app edge to edge) and at 600px or wider (the framed device), and that its carousel slide stays in the phone frame with the device toggle on Desktop and Tablet. For a sidebar shell, switch the carousel to Mobile and confirm the slide shows the large-title bar and the tab bar, and that the route itself at a phone width still shows its own narrow layout. Then run the corpus generator or `npm run validate-registry` to prove the exclusion entry satisfies the coverage gate.
