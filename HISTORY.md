# Rift DS — history

A private reference, not a published page. It preserves two records whose original homes
were deleted when robertritacca.com stopped being a design-system site: the release log of
the predecessor package, and the build journal that ran from day one.

Nothing here regenerates. The sources are gone, so this file is the record.

---

## Predecessor releases: `@robr0/design-system`

22 versions, 2026-07-26 to 2026-09-19, published from
`robritacca-dotcom/design-system`. This prose existed only in the header comment of that
repo's `.github/workflows/release.yml`; the repo also carried a matching `v*` git tag for
every one of them, which is how this list was cross-checked.

The package was renamed to `rift-ds` on 2026-09-26 and these versions were left behind on
the old name.

- **0.1.0** · 2026-07-26 — using a granular NPM_TOKEN; that token is retired.
- **0.2.0** · 2026-07-27 — the first release via Trusted Publishing
  - *Also recorded as:* the first release authenticated by OIDC.
- **0.3.0** · 2026-07-28
- **0.4.0** · 2026-08-01 — the ai component category.
- **0.5.0** · 2026-08-09 — the chat component set that powers the site-wide chat
  - *Also recorded as:* the chat component set behind the site chat.
- **0.6.0** · 2026-08-11 — the composer radius token, ChatMessage's showActions, and the README stating the chat's UI-only boundary
  - *Also recorded as:* the composer radius token, ChatMessage's showActions, and the README's chat-boundary correction.
- **0.7.0** · 2026-08-15 — ShaderField, the WebGL2 ambient background, with Card's cover slot and the `--motion-duration-instant` token
- **0.8.0** · 2026-08-16 — five components from the dashboard gap analysis: AgentPlan, ModelPicker, NotificationCenter, DataTable, EventCalendar
- **0.9.0** · 2026-08-17 — nine components taking the registry past 100 — AnchorNav plus the Stepper, TagInput, NumberInput, TreeView, PinInput, CodeDiff, Sparkline and TimePicker set — and restored `'use client'` directives in the published dist
- **0.10.0** · 2026-08-20 — the accessible teal split — the action colour becomes theme-dependent, a deep light-mode fill inverting to a light dark-mode one, with every action pairing at WCAG AA — plus SectionTitle's optional divider and AppSidebar link rows
  - *Also recorded as:* the accessible teal split: the action colour is theme-dependent (light teal-08 fill, dark inverts to teal-05), all AA; SectionTitle's optional divider and AppSidebar link rows.
- **0.11.0** · 2026-08-23 — the maps category — Globe, MapCallout, MapLegend — plus CardStack and the `--font-overline-*` uppercase label face
  - *Also recorded as:* the maps category (Globe, MapCallout, MapLegend), CardStack, and the overline typography face.
- **0.12.0** · 2026-08-26 — the dashboard set from the labs rebuild — Panel, LegendTile, FunnelChart, ComboChart — with live var() chart colours and bare mode, Stat's trend tokens and inline delta, borderless badges, and AppSidebar's floating variant, item badges, slots and rebuilt transition
- **0.13.0** · 2026-08-29 — five composition gap-fillers — Gauge, FilterBar, SplitPane, StreamingText, AvatarGroup — plus the stream reveal's motion constant and the amended JS motion contract
- **0.14.0** · 2026-08-29 — six components taking the registry to 120 — Banner, HoverCard, ImageCompare, Meter, Rating, SplitButton — plus LinkList's `newTab` opt-out; the same JSDoc now also feeds the site's public MCP endpoint
- **0.15.0** · 2026-09-04 — UsageCard and SourceTrail join the ai category, Composer's working glow (aiGlow + streaming), and the agent-docs surfaces around the package: per-component markdown contracts, the consumer agent skill, and the MCP roster with example prompts.
  - *Also recorded as:* UsageCard and SourceTrail joining the ai category, Composer's working glow, and the agent-docs surfaces around the package: per-component markdown contracts, the consumer agent skill, and the MCP roster with example prompts
- **0.16.0** · 2026-09-06 — the shared overlay behavior layer under the modal components — with `useScrollLock` published as `./behaviors/useScrollLock` for host chrome — AiButton's summary panel, Composer's context note, the status icon step tokens, and overlay listener/timer fixes
- **0.17.0** · 2026-09-09 — ThreadPanel, the session-history rail for chat products (AppSidebar's collapse choreography, server-renderable), plus EventCalendar's selectedDate and whole-cell interactivity on its own calendar colour family, and the toast exit timer on the motion constant.
- **0.18.0** · 2026-09-11 — ThreadTabs, the animated strip of open chat sessions, with ThreadPanel's detail rows, pin marks and projects section; PromptSuggestions' pending shimmer and entrance stagger; and CommandPalette's trailing slot for a non-interactive row badge.
- **0.18.1** · 2026-09-12 — the section-divider rhythm fix — SectionTitle's rule clearance drops to `--padding-lg` (a token since renamed `--padding-500`) so every divider header runs heading, 20px, rule, 40px, content — with the rule width and Table's hairlines moved onto the border tokens
  - *Also recorded as:* the section-divider rhythm fix: SectionTitle's rule clearance drops to --padding-lg (heading, 20px, rule, 40px, content everywhere), and the rule width and Table's hairlines move onto the border tokens.
- **0.19.0** · 2026-09-16 — GanttChart and RichDropdown, the heading and body font family roles for split-face theming, AiButton's signature refresh, Dropdown's typeface preview, the micro-animation pass (SegmentedControl's sliding pill, Button's trailing-icon nudge), and ToggleSwitch labels hugging the track.
- **0.20.0** · 2026-09-18 — six components taking the registry to 132 — WorldMap, the flat companion to Globe, plus Toolbar, Lightbox, Waveform, AnimatedNumber and StatusDot — with Lightbox the first overlay born on the shared behavior layer and the count-up budget joining the motion constants
  - *Also recorded as:* six components to 132: WorldMap, the flat companion to Globe, plus Toolbar, Lightbox, Waveform, AnimatedNumber and StatusDot; Lightbox is the first overlay born on the shared behavior layer, and the count-up budget joins the motion constants.
- **0.21.0** · 2026-09-19 — the package's first bin: npx @robr0/design-system init fetches the consumer agent skill from the live site into .claude/skills/ and prints the MCP connect line.

---

## Rift DS releases

Published from this repo. The live log at `website/src/data/release-log.json` is
authoritative and starts here; the section above is what precedes it.

- **1.0.1** · 2026-09-26 — A readable package page
- **1.0.0** · 2026-09-26 — The first Rift DS release

---

## Build journal

28 entries covering February 13–14, 2026 to September 1–12, 2026.
Written as the work happened and published at `/project-journal` on the old site, which
is being deleted. Newest first, as it was displayed.

### The site chat gets tools, a model choice, and a spending policy
*September 1–12, 2026*

The chat's answering machinery grew up over the fortnight. Every page now carries a short pre-written summary behind the chat button, with prompt chips that open the chat mid-answer. The composer's model label became a working picker: visitors choose between two models, and a spending policy steps the default down to the cheaper one as the day's budget runs low. The model also carries two lookup tools for what its reading material deliberately leaves out, the exact prop contract of any component and the token registry, and a written behaviour spec now maps every rule the chat is held to onto the check that enforces it.

The component library shipped the pieces a chat product needs across four releases, 0.15.0 through 0.18.0: usage and source cards, a session-history rail with pins and projects, a tab strip of open conversations, and suggestion chips that shimmer while their questions generate. Two new template screens, an agent workbench and a team calendar, put the set to work. Component pages also gained a markdown twin for coding agents, and a generated skill file now teaches a consumer's own agent the whole library.

### A blank-site outage leads to round-the-clock checks
*September 6–7, 2026*

On September 6 a rendering bug left every page blank while every existing check stayed green: the build passed and the server answered, but a visitor saw nothing. The fix was small. The response was structural: a browser-based smoke test now loads the built site before anything ships and probes the live site every four hours, and the build gained new gates for internal links, an accessibility scan of every page in both themes, and the npm package as a consumer would install it. Three new recurring maintenance loops joined the roster on the loops page: chat quality, link rot, and AI visibility.

### AI assistants can now query the site directly
*August 29, 2026*

The site now serves a public MCP endpoint at /api/mcp, and any AI client can connect with nothing but the URL. Five tools sit behind it: the component list, the full prop details for any component, the design tokens, install setup, and search over the site's content. Everything it serves is already public, and new build checks keep the data exact.

### The library grows from 79 to 120 components
*August 15–29, 2026*

Five releases over the fortnight added 41 components. Most were found by building real screens with the system and filling what was missing: a dashboard set, the maps set with the globe, composition pieces like the gauge and split pane, and a final six this week. A new design QA pass now reviews every component in both themes before it joins the library.

### A new page background and redrawn cover images
*August 10–14, 2026*

The colour blobs behind every page were rebuilt as a WebGL field that reads its colours from the design tokens, with the old CSS version kept as a fallback. The thirteen case-study cover screens were redrawn in code so they can follow light and dark mode, then shipped as pre-rendered images so they hold up on phones. The robr0 DS case study was rewritten around six lessons in the same stretch.

### The playground and the chat come together
*August 9–14, 2026*

The chat's test bench merged into the playground, now one tool with two views over the same theming levers: Components and Chat. The chat itself gained smooth resizing between its docked and full-screen shapes, links into the site's own pages, feedback buttons, and three suggested follow-up questions after each answer. The licence split too: the code stays MIT, the writing is now all rights reserved. Releases 0.5.0 and 0.6.0 carried the chat components to npm.

### The site gets an AI chat
*August 8–9, 2026*

Built over two days and mounted on every page: a floating chat that answers questions about the site, the design system, and Rob's work. It reads only what the site already publishes, and a set of 78 test questions measures whether the answers are right. Conversations are kept for thirty days, disclosed in the widget itself.

### A style guide for the site's writing
*July 28–August 1, 2026*

content-design.md now sets how every shipped sentence reads, and each public page was rewritten against it. The same week, /design-system became a real landing page with a live component collage, the home page settled on three case-study cards, and the playground moved to its own top-level address.

### The library is reworked for outside users
*July 27–August 1, 2026*

Eighteen components were rebuilt so the package behaves like one built for strangers: refs, native attributes, and form-library support throughout. Forty-nine accessibility issues were fixed, and accessibility checks now run on every build. Releases 0.2.0 and 0.3.0 went out, with four new components alongside.

### A live theming playground
*July 26, 2026*

A new Customization section shows theming rather than describing it: a get-started guide, and a playground where colour, radius, and font levers restyle the whole page live, then hand over the CSS to paste into your own project.

### The design system publishes to npm
*July 26, 2026*

The library is now on npm as @robr0/design-system, installable by anyone, with version 0.1.0 out the same day. The site became the package's first consumer, importing it exactly the way a stranger would.

### Better metadata for search engines and AI
*July 22–23, 2026*

Every page now declares its canonical address, case studies emit structured data, and the sitemap carries real last-modified dates. The site also serves an index at /llms.txt for AI agents, plus branded preview images for link sharing.

### Motion and icon tokens, and the spec backlog cleared
*July 22–23, 2026*

Motion timings became twelve duration and easing tokens with a reduced-motion guard, and icons moved onto a four-step size scale; both got their own foundations pages. Five components joined the library, and the 27 components with no written spec all got one.

### Automated testing on every change
*July 21, 2026*

Every push now runs a full pipeline: lint, the builds, and a render test of every Storybook story (434 at the time), so a broken component can no longer land unnoticed. One verify script mirrors the whole pipeline locally.

### A faster page background
*July 21, 2026*

The blurred colour blobs behind every page were redrawn as radial gradients that look identical but cost the GPU almost nothing, ending the visible blanking while scrolling on desktop.

### Divider, Pagination, and Dialog join the library
*July 20, 2026*

A gap analysis against mature design systems ranked what was missing, and the three highest-impact components shipped together, each with stories, a showcase page, and a spec. The site's About cluster was renamed Docs the same day.

### A security review of the public repo
*July 18–20, 2026*

The repo and site were audited end to end: security headers added, feed HTML sanitised, dependency vulnerabilities patched, stray identifiers removed from published content, and a security policy published. The audit closed clean.

### The first automation loop, and counts that update themselves
*July 17–18, 2026*

The growth loop shipped: a weekly scheduled task that reads the site's analytics, proposes one copy change on a branch, and reports for approval. Underneath it, every count shown on the site started coming from registry files checked at build time, so no number can quietly go stale. Six content components shipped in support, including Timeline, which this page is built with.

### SEO, repaired analytics, and a Writing section
*July 1–9, 2026*

A technical SEO pass hardened how the site presents itself, the analytics setup was repaired and gained an on-demand reporting script, and a new Writing section now syncs articles from Substack. The logo picked up an animated variant.

### Colour names, a flicker fix, and bookings
*June 1–9, 2026*

The accent colours took on evocative names, the long-standing theme-toggle flicker was finally fixed, and the contact page gained a Stripe consultation-booking section. The site also moved to the robertritacca.com domain.

### The site becomes a portfolio
*May 21–30, 2026*

The project's biggest identity shift: the site stopped being a component showcase with an about page and became Robert Ritacca's portfolio, with the design system as its flagship exhibit. A MegaNav, breadcrumbs, a contact page, and six case studies arrived in one push.

### The design spec becomes a public page
*Apr 27 – May 6, 2026*

design.md, the full spec for tokens, colour, typography, and every component rule, was written down and published on the site, with CLAUDE.md joining it under a Blueprints section soon after. The documents that govern the build became content in their own right.

### The first Claude skills
*April 6–13, 2026*

Three repeatable QA checks (heuristic analysis, accessibility audit, and API consistency review) were packaged as skills an AI agent can run, published on a new Skills page with copyable source. They grew into the scheduled skills system that runs parts of the site today.

### Charts, dashboards, and app shells
*February 18–22, 2026*

Eight chart components, application shell pieces, and two dashboard demo pages that compose them: proof the system could build real product screens. The overlay tier filled out in the same push, with an accessibility sweep across the board.

### The component sprint
*February 16, 2026*

A single day took the library from a handful of components to a real system: inputs, tabs, tables, badges, menus, and a dozen more, each with stories and a showcase page. Consistency passes on icons, spacing, and focus states kept the sprint from producing a pile of parts. Google Analytics went in the same day.

### The documentation website goes live
*February 14–15, 2026*

A separate Next.js site went up on Vercel to show the system, importing the real components so every example is live. Home, About, Components, and Foundations appeared immediately, with links from each page to its Figma frame and Storybook story.

### Day one: tokens, a Button, and Storybook
*February 13–14, 2026*

The project began with its rules, not its components: a three-tier token architecture with light and dark values from the first commit, self-hosted icons, and a Storybook wired to the tokens. Button arrived from Figma as the first component. The constraints set in these 48 hours still govern everything since.

### Two npm releases in one week, both about AI
*September 6, 2026*  
> Recovered from the unmerged `site-updates/2026-09-06` branch, where it was the only copy.


Versions 0.15.0 and 0.16.0 of the component library shipped on September 4 and 6. The first added two agent-facing components, a usage meter card and a research source trail, and turned the documentation into something AI assistants can read directly: every component page now has a plain-markdown twin, and consumers can download a ready-made skill file that teaches their coding agent the whole library.

The second release rebuilt the foundations under the modal overlays, so dialogs, drawers and the command palette now share one system for focus, dismissal and scroll locking instead of four hand-rolled copies. It also gave the AI button a hover-summoned summary panel, which the site puts to work at once: hover the chat button on any page and a pre-written TLDR appears, with prompt chips that drop you into the chat mid-answer.

---

## Provenance

Extracted 2026-09-26 from `robritacca-dotcom/design-system` at `dc211dab`, immediately
before the migration that removed the design system from that repo. A complete archive of
that repository and its deployed site was taken the same day and is described in
`~/Developer/archive/robertritacca-pre-rift/MANIFEST.md`.
