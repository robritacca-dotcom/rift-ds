# AAA mode: codified end to end

## Context

The home-page proof of concept (POC) showed the idea works. One attribute on `<html>` restyles the site for maximum accessibility:
- every colour role resolves to a fixed AAA colour palette (vivid links, action, status, accents, chart series), every pairing held to 7:1;
- AAA type sizes, no motion, no fades or translucency;
- solid disabled states, and one hover and focus language.

But the POC is site-only and hand-patched. The library, Storybook and npm consumers never see it, and nothing stops the next component shipping without it.

Goal: make "AAA mode" a library-level contract. It overrides every semantic token in every category, gives every component an accessible version (rearranging allowed), and is enforced in CI. Nothing ships without it.

Decisions already made:
- **Lives in the library**, shipped in the npm package. The site is one consumer.
- **Every component carries a co-located `X.aaa.css`.**
- **Axe's contrast rule stays off everywhere.** This is the owner's settled rule, and it applies in AAA too. Contrast is proven by construction instead: a generated palette held to 7:1 at build time, plus a static lint that no component colour escapes the palette. Contrast is never measured on rendered stories.

## Isolation: the standard themes don't change at all

Every theme preset in light and dark, without the mode, must render exactly as it does today: visually, structurally and in its prose. Nothing intense carries over. This is a hard rule with its own enforcement, not a side effect.

- **CSS:** every AAA rule is scoped under `[data-a11y="aaa"]` (already validated in sections 1 and 3). Nothing is added to base token files or component `X.css`.
- **DOM and content:** anything AAA adds renders only when `useAaaMode()` is on:
  - breadcrumbs;
  - glossary `<dfn>`/`<abbr>`;
  - expanded link text;
  - plain-language summaries;
  - help text;
  - headings for unlabelled sections;
  - reading colour and text size controls;
  - button and stepper alternatives to drags.

  Behaviour that is invisible in standard (keyboard handlers for drags, attribute observers, ARIA that changes nothing visible) may exist in both modes, but must not change a pixel.
- **JS behaviour:** every behaviour change (timers off, no autoplay, rearranged overlays, inline tooltips) is gated on the mode. With the mode off, behaviour is unchanged.
- **Proof, in CI:**
  - **Story identity test** (default vitest project): after each story renders in standard mode, snapshot every element's computed style and the DOM, disable the AAA stylesheets, snapshot again, and require the two to be identical. That proves the AAA layer is inert when off, for every component, preset and theme the story runs in.
  - **Site identity sweep** in `validate-website-a11y.mjs`: every route in standard mode, compared with and without the AAA stylesheets (computed styles, DOM text and rendered link text). Any difference fails.
  - **Chromatic:** standard-mode snapshots stay the visual baseline. It's still dispatch-only, run before release once phase 4 lands.
- **The one intended exception:** visitors whose OS asks for more contrast (or reduced transparency) and have made no pick are put into AAA automatically. Their standard experience doesn't change; they start in the other mode, and a manual pick always wins.

## The contract

- **Mode switch:** `data-a11y="aaa"` on `<html>`, renamed from the POC's `max`.
- **Motion switch:** `data-motion="reduce"`, the library's own JS-motion switch. AAA mode always sets it, and a host can also set it alone.
- **The site's default:** a saved pick wins, otherwise follow `prefers-contrast: more`. This already works in the POC and moves into the library as the recommended pre-paint snippet.
- **Scope:** the mode is orthogonal to `data-brand` and `data-theme`. It sits above any preset, in both themes. The attribute is doubled in selectors to outrank `html[data-brand][data-theme]`, as the POC already does.
- **Published surfaces** (rows in `scripts/package-manifest.mjs` SUBPATHS, checked by `validate-package-exports.mjs`):
  - `rift-ds/tokens/aaa.css`: generated tokens plus base rules.
  - `rift-ds/behaviors/useReducedMotion` and `rift-ds/behaviors/useAaaMode`.
  - Component AAA rules ship inside each component's CSS import.

## 1. Token layer: every token, every category

**`scripts/generate-aaa-tokens.mjs`** (replaces the POC's `generate-a11y-max-stylesheet.mjs`) writes `src/tokens/tokens-aaa.css` from `src/tokens/registry.json`. It must map **every** token in all nine categories, and fails on any it doesn't:
- **Colour:** the POC's role-to-hue rules, moved to data.
- **Typography:** the AAA scale:
  - 16px floor;
  - 18px reading text;
  - line height at least 1.5 for body styles, 1.2 for display;
  - one plain face for every family role;
  - display weights at least 600;
  - tracking never negative.
- **Spacing:** density at least one step up, so controls reach 44×44 (target size, 2.5.5).
- **Radius:** 0.
- **Border:** each step thickened, 2px minimum.
- **Shadow:** none.
- **Icon size:** 24px minimum.
- **Motion:** every duration at 0.01ms, every easing linear.
- **Stacking:** declared as a pass-through, so it's explicit.

It also emits AAA versions of the two 768px blocks (spacing and display type), so narrow screens hold the same floors.

**The site has colour; it's AAA colour.** The mode isn't monochrome with accents. It's a full colour theme in which every pairing clears AAA. Colour is wanted wherever it carries meaning or orientation:
- **Links:** vivid, unmistakable blue. Classic link blue `#0000EE` is 9.4:1 on white; a bright sky blue on black. Visited links get their own clear purple. Underlines are thick.
- **Action:** a vivid action colour.
- **Status:** colours, and status fills may be tinted.
- **Also:** accents, charts, file types, trends, and tinted section and card surfaces where they help.

**`src/tokens/aaa-palette.json`** becomes the palette's one home. It holds:
- hues per theme;
- tinted surfaces per hue;
- the series order;
- role maps for link, visited, action, status (fill, text, border, icon), accent, file, pixel and trend. The POC's role rules become this data.

**Generation checks pairings, not just hue against paper.** Every foreground/surface pair a role can produce is listed in a pairings table (the `ACTION_PAIRINGS` pattern from `validate-theme-presets.mjs`), and generation fails when:
- text on its surface is under 7:1 (1.4.6). This covers labels on action and status fills, status text on its own tint, links on every surface they appear on, and body text on every tinted surface;
- a non-text mark or edge is under 4.5:1 against what it sits on. That's past 1.4.11's 3:1, deliberately "ridiculous";
- a link is told apart from the text around it by colour alone. It must also be underlined, which the base rules guarantee;
- two series hues fall under the ΔE floor in normal, protanopia, deuteranopia or tritanopia simulation. The simulation code comes from the POC's scratch palette script.

**`scripts/validate-aaa-tokens.mjs`** (in the `validate-registry` chain):
- regenerates in memory and byte-compares;
- checks every registry token is mapped (both directions);
- checks the type invariants hold after every `@media` block: every resolved size at least 16, body line-height ratio at least 1.5. It reuses `parseCss` / `resolveTokenValues` from `scripts/token-values.mjs`.

**Hand-written base rules** move from `website/src/app/a11y-max.css` to `src/tokens/aaa-base.css`. Each rule cites the success criterion it serves:
- motion collapse;
- no backdrop-filter, filter or mask;
- gradient stops opaque, so fades become hard fills;
- focus appearance (2.4.13): 3px solid ring, inset inside clipping containers;
- one hover indicator (dashed) and pressed (solid);
- disabled shown solid with a dashed edge;
- links unmistakable: vivid link blue, a distinct visited colour, a thick underline offset from the text, and every text link styled this way, not just ones inside `main`;
- no line clamp, ellipsis text wraps;
- control labels bold;
- icons filled at weight 700;
- no transforms on controls;
- `scroll-padding-top` so a sticky header never covers focus (2.4.12);
- `max-inline-size: 80ch` and no justified text on prose (1.4.8).

`tokens/aaa.css` is the aggregate of both.

**Lessons to encode:**
- **The pipeline drops prefixed twins.** Never hand-write `-webkit-` twins next to `backdrop-filter`/`mask`, or the pipeline drops the property. The lint below fails on them.
- **Content colour stays.** Logos and swatches keep their colours. Only fades and dimming become hard fills.

## 2. JS motion and JS colour, one switch

- **One reduced-motion check.** Move the remaining components onto `src/behaviors/useReducedMotion.ts`: `Carousel.tsx`, `ShaderField/useShaderField.ts`, `StreamingText/useStreamReveal.ts` and `src/chat/useChat.ts`.
- **Timers stand down too.** Make the `src/tokens/motion.ts` schedule constants honour it: no toast auto-dismiss (2.2.3) and no carousel autoplay (2.2.2) under AAA.
- **Mirror the CSS guards.** All 11 component `@media (prefers-reduced-motion)` blocks get a `:root[data-motion="reduce"]` twin. Better: refactor them to one shared selector form the lint accepts.
- **JS colour readers watch the mode.** Treemap (`Treemap.tsx:147`) and `useShaderField.ts:567` add `data-a11y` to their MutationObserver filters.
- **New `src/behaviors/useAaaMode.ts`** for structural rearranges that CSS can't express, such as rendering a tooltip's content inline or a carousel as a stacked list.
- **New `scripts/validate-motion-switch.mjs`:**
  - no `matchMedia('(prefers-reduced-motion` outside the behaviour;
  - every reduced-motion media block has its attribute twin;
  - every observer that watches `data-theme` also watches `data-a11y`.

## 3. Every component: `X.aaa.css`

**What each file contains.** Every folder in `src/components/` (all 152, `COMPONENT_COUNT`) and `src/chat/` gets `X.aaa.css`. `X.tsx` imports it after `X.css`, so it ships wherever the component does, including the shadcn registry closure. Each file starts with `/* aaa: <what changes and why> */`. A component the shared rules fully cover still gets a file, with `/* aaa-covered: <why> */` and no rules. That way an author always has to decide.

**Rearranging is explicitly allowed.** Named targets from the POC:
- **Modal overlays:** Dialog, AlertDialog, Drawer, CommandPalette, Lightbox and AttachmentViewer become full-page takeovers.
- **Hover-only content:** Tooltip, HoverCard and swatch tips become inline or click-to-open (1.4.13).
- **Charts:**
  - dashed and dotted series;
  - the area wash removed;
  - legends at 16px;
  - colour never the only cue.
- **Bounded scroll regions:**
  - a visible scrollbar;
  - stacks with uneven lengths sit inside one frame.
- **Explicit state on controls:**
  - Toggle: off is an outlined track, and the thumb glyph sits clear of the thumb;
  - Slider: the track gets an edge;
  - neutral SegmentedControl: the selected segment gets an edge;
  - ContributionGraph levels: rings in the heatmap colour.
- **The rest:**
  - Gantt rows grow so labels wrap;
  - Composer: the shell is the focus ring;
  - AiButton: the ring is dropped;
  - Globe: the far side is dashed;
  - DatePicker: outside-month days at full strength.

**New `scripts/validate-aaa-components.mjs`** (in `validate-registry`). It uses a real rule parser: add `postcss` as a direct devDependency, since the existing regex scanners can't tell which selector owns a declaration. It checks:
1. Every registered folder (from the registry) has `X.aaa.css`, and `X.tsx` imports it (both directions; an orphan fails).
2. Every selector in an `X.aaa.css` is scoped under the mode attribute, and the header is present.
3. **Escape-hatch inventory.** The validator scans `X.css` for:
   - raw px font-size under 16;
   - fractional opacity outside disabled;
   - `color-mix` / `rgba` / hex / `transparent` gradients;
   - `mask`, `backdrop-filter`, `filter: blur`;
   - transforms or `scale` on `:hover`/`:active`;
   - `text-overflow: ellipsis`, `line-clamp`;
   - literal `box-shadow`;
   - literal `font-variation-settings`;
   - prefixed twins.

   Each hit must be neutralised by a rule on the same selector and property in `X.aaa.css`, or sanctioned in place with a new `ds-allow(aaa): <reason>` category (added to `CATEGORIES` in `validate-css-directives.mjs`). The research counted the current hits as: 28 raw font sizes, about 39 dimmings, 49 gradients, 18 masks, 23 backdrop-filters, 13 hover transforms, 46 truncations and 11 shadow literals.
4. The same lint runs over `website/src` CSS modules, with site rules living in-module as `:global(html[data-a11y="aaa"]) …`. This already happens in MegaNav, SiteFooter, FadeDivider and page.module.

## 4. Storybook and story tests: every story, rendered in AAA

**`.storybook/preview.ts`:**
- imports `tokens/aaa.css`;
- adds an `a11y` toolbar global (Standard / AAA) whose decorator sets `data-a11y` and `data-motion`, the way `withBrand` already does;
- adds Chromatic modes for AAA light and dark. Chromatic stays dispatch-only.

**`vite.config.ts`:** add two vitest projects beside the existing one, `storybook-aaa-light` and `storybook-aaa-dark`. Each has a setup file overriding `initialGlobals`, so **every story renders in AAA in both themes** with axe in `'error'` mode. The axe rule set is the default plus the `wcag2aaa` tags, minus colour contrast per the owner's rule.

**New `.storybook/aaa-audit.ts`** runs after each story in the AAA projects. It's the POC's browser audit made permanent, with non-contrast checks only:
- text at least 16px;
- body line-height ratio at least 1.5;
- no fractional opacity outside disabled;
- no translucent fill;
- no backdrop-filter, mask or filter;
- no running animation or transition;
- no truncated text (scroll width larger than client width);
- interactive targets at least 44×44 (2.5.5);
- a focused element shows an outline at least 2px (2.4.13);
- text spacing tolerance (1.4.12): inject the criterion's spacing and assert nothing clips;
- the same checks under forced hover and active states, using the POC's stylesheet-clone technique.

It skips visually hidden elements and the recharts measuring span (POC false positives). A story may opt out only with `parameters.aaa.skip: '<reason>'`, and `validate-aaa-components.mjs` lists and counts those opt-outs so they stay visible.

**Order:** the AAA projects first run report-only to produce a baseline, then flip to error once the migration lands.

## 5. Site

- **Imports and naming.** `layout.tsx` imports `rift-ds/tokens/aaa.css`. The POC's site files shrink to the site's own module rules.
- **The toggle moves onto the contract.** `A11yToggle` / `a11y-mode.ts` switch to the `aaa` attribute.
- **`scripts/validate-website-a11y.mjs`** gains the AAA axis: routes × light/dark × standard/AAA. In AAA it runs the same `aaa-audit` checks on **every route** from `scripts/site-routes.mjs`, not just `SMOKE_ROUTES`. It runs in CI's website job and `verify`.
- **New AAA section on `/foundations/accessibility`.** It renders the palette table, the role map and the criteria-to-mechanism list from `aaa-palette.json` and the generated data, so no number is typed. It also adds the mode's counts to `a11y-coverage.generated.ts`: AAA files, sanctioned exceptions and story opt-outs.

## 6. Beyond visuals: every WCAG 2.2 AAA criterion, plus extras

Sections 1–5 make the mode look AAA. Being AAA needs the criteria below too. Each one gets a mechanism and an enforcement. Every mechanism here exists **only in AAA mode**, under the isolation rule above. Where a criterion is about content, AAA mode switches on a content layer the standard site never shows.

**Perceivable**
| Criterion | Gap today | Mechanism | Enforced by |
|---|---|---|---|
| 1.2.6–1.2.9 media (sign language, extended audio description, full alternative) | No media yet, but nothing stops it arriving | Media gate: any `<video>`/`<audio>`/embed needs a transcript, captions and a sign-language track declared beside it | New `validate-media-alternatives.mjs` over the built HTML |
| 1.3.6 identify purpose | Icons, regions and form fields carry purpose only visually | Every landmark labelled, every input with an `autocomplete`/purpose, every icon-only control named, decorative icons `aria-hidden` | `aaa-audit` + axe `wcag2aaa`; a static check that `material-symbols` spans are labelled or hidden |
| 1.4.8 visual presentation: reader-chosen colours | No way to choose foreground or background | An AAA-only **reading colours** control offering pre-checked AAA ink/paper pairs (cream, dark on yellow, light on navy…), all generated pairs | The pairs live in `aaa-palette.json` and pass the pairing checks |
| 1.4.8 text resize to 200% without horizontal scrolling | Unproven | An AAA **text size** control (100–200%, scaling the AAA ladder), plus 320px reflow | Site sweep at 200% text and a 320px viewport: no horizontal scroll, no clipping |
| 1.4.8 width, justification, spacing | Partly in the POC | `80ch` prose measure, no justify, paragraph spacing at least 1.5× line spacing | `aaa-audit` |
| 1.4.9 images of text | The README banner is a screenshot of text (not on site pages); OG cards aren't on-page | Ban on-page images of text, logos exempt | Built-HTML check: every content `<img>` sits on an allowlist or has empty alt |

**Operable**
| Criterion | Gap today | Mechanism | Enforced by |
|---|---|---|---|
| 2.1.3 keyboard, no exception | Pointer drags (chat card move and resize, playground stage resize, globe spin, slider) | Every drag gets a keyboard equivalent; in AAA, drag-only affordances become buttons and steppers | Static check: handlers on `pointerdown`/`mousedown` need a key handler in the same component; play tests drive the keyboard path |
| 2.2.3 / 2.2.4 / 2.2.2 timing and interruptions | Toast auto-dismiss, carousel autoplay, streaming chat announcements | AAA kills every timer (via `motion.ts`), adds a **pause announcements** setting for live regions, and drops all autoplay | `validate-motion-switch` plus a test that each schedule constant reads the mode |
| 2.3.2 three flashes | Spinners and shimmer | Motion off; nothing flashes | Covered by the motion collapse; `aaa-audit` asserts no running animation |
| 2.4.8 location | Breadcrumbs only on some pages | Breadcrumb and "you are here" on every route in AAA | Every-route sweep: a `nav[aria-label="Breadcrumb"]` with `aria-current` |
| 2.4.9 link purpose, link only | Demo cards' links ("Pie chart", "Globe") and repeated labels to different targets | Link text self-descriptive in AAA (visually hidden context expanded to visible text); new-tab links say so in text | Built-HTML check for generic or duplicate link text with different targets, and for `target=_blank` without the visible "opens in a new tab" |
| 2.4.10 section headings | Some sections are labelled `aria-label` regions with no heading | Every section has a real heading, with no skipped levels | Built-HTML heading-outline check on every route |
| 2.4.12 focus not obscured, enhanced | The sticky header and the docked chat can cover focus | `scroll-padding` for the header; the docked chat reserves its width | Keyboard sweep: tab through each route and assert the focused element is fully unobscured |
| 2.4.13 / 2.5.5 | Already in sections 1 and 4 | | |
| 2.5.6 concurrent input | The chat's summary panel only exists on hover-capable devices | Every input-gated feature reachable by any input in AAA | Every-route sweep under emulated touch: same features present |

**Understandable**
| Criterion | Gap today | Mechanism | Enforced by |
|---|---|---|---|
| 3.1.3 unusual words / 3.1.4 abbreviations / 3.1.6 pronunciation | Heavy jargon (tokens, primitives, MCP, shadcn, ISR) and unexpanded abbreviations | A **glossary registry** (`website/src/data/glossary.json`): term, definition, expansion, pronunciation where ambiguous. In AAA, the first use of each term on a page is a `<dfn>`/`<abbr>` linked to `/glossary` | `validate-glossary.mjs`: every abbreviation-shaped token (2+ capitals) and every listed term in shipped prose is in the registry, and every entry is used somewhere (both directions) |
| 3.1.5 reading level (lower secondary) | Most page prose is above it | In AAA every page opens with a plain-language summary. `page-summaries.json` already has one per route, so it becomes the AAA lead, rewritten to the level | `validate-page-summaries.mjs` adds a readability score ceiling (grade 9) on every summary |
| 3.2.5 change on request | Rotating subtitle, auto-opening panels, automatic route changes | AAA removes every unrequested context change | Static and story checks: no auto-open on mount in AAA |
| 3.3.5 help / 3.3.6 error prevention | Chat composer and forms have no contextual help, and submissions aren't confirmable | Help text on every form control in AAA; sends that can't be undone get a review step | Story play tests in the AAA projects |

**Past WCAG (the "ridiculous" layer)**
- **Atkinson Hyperlegible** (OFL, designed for low vision) as the AAA face, self-hosted through the existing preset-font pipeline (`scripts/sync-preset-fonts.mjs`).
- **Forced colours (Windows High Contrast):** every component checked with `forced-colors: active`, so no state relies on a background that forced colours erase. This is an extra Storybook project emulating forced colours, running the same audit.
- **`prefers-reduced-transparency`** and **`prefers-contrast: more`** both opt into AAA automatically, alongside a manual pick.
- **Keyboard-only smoke on every route:** every focusable element reachable, focus always visible, no traps, and Escape closes every overlay. The overlay play tests extend to every route.
- **Screen-reader pass:** landmarks are unique and labelled, live regions are polite and pausable, and the language is declared. This adds the manual NVDA/VoiceOver checklist to the `accessibility-audit` skill. CI can't run a screen reader, so the skill owns it and the release checklist requires it.

## 7. Codify (docs and skills): each phase lands its own part

- **`design.md`:** a new "AAA mode" section covering the contract, palette roles, type and target sizes, motion and timing, the fades-to-hard-fills rule, the content-colour rule, and per-component rearranges. Each component's spec section gets one AAA line.
- **`CLAUDE.md`:** registry rows for the AAA palette, AAA tokens and component AAA files (validators named), the contract in Token Architecture, and the new-component checklist item.
- **Skills:**
  - `new-component`: write `X.aaa.css` and pass the AAA story projects.
  - `new-token`: AAA mapping required (enforced).
  - `new-preset`: AAA sits above presets.
  - `accessibility-audit`: run AAA.
  - `design-qa`: judge the AAA render too.
- **README:** the published subpaths. Self-description prose follows.

## Phases and gates

**Each phase ends at a gate. Nothing starts after a gate until it is green and you've signed off. The plan pauses after phase 1.**

A phase lands as its own branch and its own `ship`, with its docs (section 7) in the same change. Each gate:
- is run by `npm run verify`;
- is proved by a deliberate-break check, where the new guard fails on purpose before the phase is called done;
- requires standard themes to be unchanged. From phase 1 on, the identity test proves it.

### Phase 1: the visual system (themes, fonts, colour, motion), as far as it goes

**Scope:** sections 1 and 2, plus the parts of section 4 needed to see and guard it.
- **Contract:** the `max` → `aaa` rename, `data-motion`, the published `rift-ds/tokens/aaa.css`, `useReducedMotion` and `useAaaMode` subpaths.
- **Colour:** `aaa-palette.json` with the full AAA colour roles (vivid link blue, visited, action, status with tints, accents, file, pixel, trend, chart series), the pairings table and the CVD checks.
- **Fonts and type:** Atkinson Hyperlegible synced and self-hosted, one AAA face, the 16/18 floors, leading, weights, tracking, both 768px blocks, and icon axes (filled, 700).
- **Every other token category:** spacing and density to 44px targets, radius, border, shadow, icon size, motion durations and easings, stacking pass-through. The generator fails on any token in any category it doesn't map.
- **Base rules:** `aaa-base.css` covering motion collapse, no blur, mask or filter, fades as hard fills, focus, hover, pressed and disabled, links, wrapping, bold labels, still controls, `80ch`, and no justify.
- **Motion everywhere:** the remaining JS motion onto the shared check, timers off under the mode, the CSS reduced-motion blocks twinned, the colour observers, and `validate-motion-switch`.
- **Seeing it:** the Storybook Standard/AAA toolbar, and the site toggle moved onto the library contract.
- **Guarding standard:** the story identity test and the site identity sweep (the isolation section).

**Gate 1:**
- `validate-aaa-tokens` green (every token mapped, every pairing at 7:1 or above, CVD floors);
- `validate-motion-switch` green;
- identity tests green, so standard themes are byte-for-byte unchanged in computed style;
- `verify` green.

**Deliberate breaks:**
- an unmapped token;
- a 6.9:1 pairing;
- a stray `matchMedia` call;
- an unscoped AAA rule.

**Review:** you walk the Storybook AAA toolbar across the component list and the site in both themes.

**→ Pause.**

### Phase 2: the AAA test harness (report-only)
- **Scope:** the AAA vitest projects (light, dark), axe `wcag2aaa` (contrast stays off), `aaa-audit` with forced hover and active states, and `parameters.aaa.skip` bookkeeping.
- **Gate 2:** the harness runs in CI and produces a per-component baseline failure list, committed as a tracked report. Nothing is red yet.

### Phase 3: every component's accessible version
- **Scope:**
  - `X.aaa.css` for every registered component and the chat widget, with the escape-hatch lint (`validate-aaa-components`, postcss);
  - the per-component rearranges (overlays as takeovers, hover content inline, charts, bounded regions, explicit control states);
  - the new-component skill and checklist.
- **How it runs:** in category batches. Each batch is independent and can run as its own session.
- **Gate 3:**
  - the baseline list from phase 2 is at zero;
  - the AAA projects flip to `'error'`;
  - a new component without an `X.aaa.css`, or with an unneutralised escape hatch, fails CI.

  From here on, nothing ships without its accessible version.

### Phase 4: the site in AAA
- **Scope:** site module rules, the every-route AAA sweep (both themes), the AAA section on `/foundations/accessibility` and its counts.
- **Gate 4:** the every-route sweep is green in CI and `verify`.

### Phase 5: interaction and navigation criteria
- **Scope:**
  - keyboard alternatives for every drag;
  - the announcements setting;
  - breadcrumbs and "you are here";
  - the heading outline;
  - link purpose and new-tab wording;
  - focus never obscured;
  - concurrent input;
  - reading-colour and text-size controls with 200% and 320px reflow;
  - forced colours;
  - `prefers-reduced-transparency`;
  - the keyboard-only route smoke.
- **Gate 5:** each criterion's check from section 6 is in CI and green.

### Phase 6: the content layer
- **Scope:** the glossary registry and `validate-glossary`, `<dfn>`/`<abbr>` in AAA, plain-language summaries rewritten to grade 9 with the readability ceiling, help text and review steps, and the media gate.
- **Gate 6:** the content validators are green, and the screen-reader checklist has been run once and recorded in the `accessibility-audit` skill.

## Verification (cumulative; each gate runs the parts its phase added)

- `npm run validate-registry`: the new validators pass, and deliberately breaking one causes a failure. Test cases:
  - a token unmapped in the generator;
  - a pairing at 6.9:1 (for example, a status text on its tint);
  - a component folder without `X.aaa.css`;
  - a raw `opacity: .5` with no AAA neutraliser;
  - a `matchMedia('(prefers-reduced-motion` outside the behaviour.
- `npm run test`:
  - all three projects (default plus AAA light and dark) render every story;
  - axe plus `aaa-audit` report zero;
  - the identity test proves standard mode is unchanged by the AAA layer.
- Deliberately leak an AAA rule unscoped, or render an AAA-only element without the gate, and confirm the identity test and the site sweep both fail.
- `npm run verify`: includes the AAA every-route site sweep. CI mirrors it, with the AAA story projects in the test job and the sweep in the website job.
- Manual: the built site in AAA, both themes, with home, a component page, the mega menu, a dialog, the chat and a chart, checked against the POC findings list.
