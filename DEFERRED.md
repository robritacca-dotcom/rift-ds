# Deferred work

Inventory taken 2026-10-05 on the Windows machine, before resetting both computers to `origin/main`. Local `main` was already level with `origin/main`: nothing committed was ever at risk. Everything below was uncommitted or sitting on an unmerged branch.

**As of 2026-10-07 none of it exists as code.** Every branch and archive tag was deleted, on purpose. Sections 1 to 4 are write-ups of the four pieces worth rebuilding, detailed enough to redo from scratch; nothing here is pending, and nothing needs merging. Delete a section when its work is rebuilt or you decide it never will be.

## 1. Component page formula (scrapped 2026-10-07, the idea kept here)

The code is gone. It was a 473-file uncommitted working tree on Windows (last touched 2026-10-02, never verified), archived to a local tag on 2026-10-05, and the tag was deleted on 2026-10-07 along with its duplicate. Nothing of it is on GitHub or on the Mac. What follows is the formula itself, written down so it can be rebuilt from scratch or left alone.

### The idea

Every `/components/<slug>` page follows one formula, so two related components read as one family and a reader always knows where to look. The shell is code, not convention: one shared component renders everything except the page's own sections, and a validator fails the build on a page that hand-rolls any part of it.

The problem it answered: the page shell was restated by hand in every page and every page's CSS module, and it had drifted. Three pages ran a tighter section rhythm than the rest, and section commentary carried six class names in five styles.

### The skeleton, in order

1. **Header**: the h1 (the registry label, never typed by the page) and the page links.
2. **Intro**: a tagline (one short line on what the component is for, set in Sub Display under a Display 2 title) and one paragraph of 30 to 60 words saying what it is and what separates it from its nearest sibling.
3. **Overview**: the first section, always titled "Overview". The component in its most representative configuration.
4. **Variants**: one section per meaningful axis, named from the vocabulary below.
5. **In context** (optional): the component composed with the things it lives beside.
6. **Guidance**: rendered by the shell from a registry, never written into a page (see below).
7. **Install strip**: rendered by the shell.

### Section vocabulary

Titles come from one set, in this order when present: `Variants`, `Sizes` (compact is a size), `With icons`, `States` (disabled, error, loading and read only together), then the component's own axes (`Positions`, `Statuses`, `Thresholds` and the like), then `Keyboard` when the component has a keyboard model beyond Tab, and `Reduced motion` when it animates. Status-bearing components list the five status roles in their fixed order. Never a synonym for a word on the list: "Tones", "Size" and "Usage examples" each split a reader's mental index for no gain.

### The other page rules

- **Every section explains itself.** A section opens with one short lead paragraph saying what the demo below shows and why it matters, before the demo. A section with nothing to say about itself is usually not a distinct section. Captions inside a demo stage belong to the demo.
- **Families share a shape.** Pages in one family (the overlays, the form controls, the charts, the inspector rows) use the same sections in the same order, so a difference between two pages always means a difference between two components.

### The guidance zone

One hand-written entry per public component in a JSON registry, rendered at the foot of every page in a fixed order: **Usage** ("Use it when" and "Reach for something else when", which names the sibling to use instead), **Do and don't**, **Accessibility** (what the component guarantees and what the consumer must supply), and **Related** (the nearest siblings as the index page's preview cards, each linking to its page).

- Six fields: `whenToUse` (2 to 4 items), `whenNotToUse` (1 to 3), `dos`, `donts`, `accessibility`, `related` (2 to 4 each). `related` holds slugs; the rest hold sentences ending in a full stop, at most 220 characters, unique within their list.
- Principle-level: never a prop, token, pixel or hex value, because the prop contract has its own homes. A variant's design name (primary, bordered) is vocabulary, not API, and is fine.
- Voice: no subject, imperatives for habits. A sample of the register, from the accordion entry: "When the sections are peers a reader switches between rather than reads in turn, use Tabs." and "Don't hide content every reader needs, such as a required step or a warning, inside a collapsed section."
- Every accessibility guarantee must hold in the source. The scrapped draft claimed the fixes in section 2 as shipped, and they never were, so redo section 2 first or those lines are false.
- It was also served beyond the page: the usage and related lines in the chat corpus, and the whole entry beside the prop API through the shared `get_component` tool (chat and MCP).

### How it was built

- **Shell**: `website/src/components/ComponentPage/`. `ComponentPage` took `slug`, `tagline`, `intro`, and optional `storybookPath` and `figmaUrl`, and rendered the mega nav, sidebar, breadcrumb, header, intro, the page's children, the guidance zone and the install strip. `DocSection` (a `section` with a `SectionTitle` h2, so the floating anchor rail picks it up) and `SectionLead` (the one style for a section's explanatory paragraph, never width-capped) were what a page composed its body from.
- **Guidance wiring**: each component's `layout.tsx` rendered `ComponentPageLayout` with its slug, a server component that read the registry and handed the page only its own entry through context, so no page bundled the whole file.
- **Enforcement as debt, not by review**: `validate-website-surfaces.mjs` checked three rules on every page (Overview first, a lead under every section, literal titles from the vocabulary). Pages that predated a rule sat on that rule's `FORMULA_DEBT` list, pinned to a ceiling so a list could only shrink: a page that now met a rule failed until struck off, and no page could join. A separate `validate-component-guidance.mjs` held coverage in both directions, the field shape and bounds, the related slugs, and the layout wiring.
- **Docs it touched**: a Component pages section in `design.md`, a registry row and new-component step in `CLAUDE.md`, a register row in `content-design.md`, and the `component-doc-page` skill.

### Where it stood

Every page was on the shell, but the formula rules were far from met: 58 pages still owed an Overview, 100 owed section leads and 42 owed vocabulary fixes. The `ai-button` page met the full formula and was the reference; `composer` was the state-driven equivalent. All guidance entries were drafted.

If rebuilt: start with the shell and prove the formula on two or three pages in one family before converting anything else, then go a category at a time. Converting every page to the shell first and leaving the rules as debt is what produced a 473-file tree that never reached a verify.

## 2. Accessibility fixes in the library (scrapped 2026-10-07, the fixes kept here)

The code is gone. It was uncommitted work in an agent worktree on Windows (last touched 2026-10-02, never verified), archived to a local tag on 2026-10-05, and the tag was deleted on 2026-10-07. Nothing of it is on GitHub or on the Mac. What follows is each fix, written so it can be redone from scratch. None of these is in `main`: every problem below still exists in the shipped library.

Eight components, 20 source files (about 500 lines, half of it stories), plus `design.md` spec edits and the generated surfaces that follow a component change.

### Badge: stop announcing itself

- **Problem:** the badge renders `role="status"`, a live region, so every badge on a page announces itself to a screen reader whenever it changes.
- **Fix:** drop the role. A badge is a static label. Where a change must be heard, the consumer wraps the badge in a live region.

### Tabs: optional panels, wired to their tabs

- **Problem:** Tabs renders the tab list only, so nothing ties a tab to the panel it controls unless the consumer does it by hand.
- **Fix:** an optional `content` on each tab. When any tab has content, Tabs renders the active tab's panel after the strip as a `role="tabpanel"` with `aria-labelledby` pointing at its tab, and the active tab carries `aria-controls` (only the active one, because only the active panel exists in the DOM).
- The panel takes `tabIndex={0}` so Tab moves from the strip into it even when the content holds no control, and it gets the standard focus ring.
- A new `id` prop sets the base for generated ids (`<id>-tab-<value>`, `<id>-panel-<value>`, whitespace in a value becoming a hyphen), so a panel rendered outside the component can still be labelled by its tab. Defaults to `useId()`.
- Strip-only use keeps its exact markup: the tablist stays the root node.

### AiButton: the summary panel opens for keyboard users

- **Problem:** the summary panel opens on hover only, so a keyboard user never sees it.
- **Fix:** keyboard focus on the button opens the panel at once, and focus leaving the host closes it. Only `:focus-visible` opens it, because a pointer click also focuses the button and would flash the panel ahead of the hover delay.
- Mouse-leave no longer closes the panel while keyboard focus is still inside.

### Popover: the hover trigger gets a keyboard path

- **Problem:** with `trigger="hover"` and plain (non-interactive) content as the trigger, nothing can take focus, so the popover is unreachable by keyboard.
- **Fix:** focus reaching the trigger opens the panel, and focus leaving the whole popover closes it. Mouse-leave does not close it while focus is inside.
- When the trigger content cannot carry the popover semantics, the hover trigger now gets the same synthesised `<button>` the click trigger already had, styled to draw nothing but a focus ring (`ds-popover__trigger-button`).

### Combobox: loading and no-results are spoken

- **Problem:** the "Loading" and empty-message rows sit inside the listbox, which a screen reader does not read while focus stays in the text field.
- **Fix:** a visually hidden `role="status"` region beside the list that says the same thing. It stays mounted and only its text changes, because a region must exist before its content changes for the change to be announced.

### RadioGroup: one tab stop, arrow keys move selection

- **Problem:** every radio in a group is its own tab stop, and the arrow keys do nothing. The WAI-ARIA radio group pattern expects the opposite.
- **Fix:** roving tabindex. The group is one tab stop (the checked option, else the first enabled one). Arrow keys move focus and selection together, wrapping at the ends and skipping disabled options.
- `RadioButton` now honours a passed `tabIndex` (it used to hardcode 0), which is what lets the group rove.

### ToggleGroup: one tab stop, arrow keys move focus

- **Problem:** every toggle in the group is its own tab stop.
- **Fix:** roving tabindex, the toolbar pattern. The group is one tab stop, landing on the item last focused, else the first active item, else the first item. Arrow keys, Home and End move focus without toggling; Enter and Space toggle, as native buttons do.

### EmptyState: the headline is a real heading

- **Problem:** the title renders as a `<p>`, so it is missing from the page outline.
- **Fix:** render it as a heading, with a new `headingLevel` prop (2 to 6, default 3, for an empty state inside a section headed at level 2).

### If redone

- Each fix came with stories and `play` assertions (focus order, arrow-key behaviour, the roles and ids). Rewrite those with the fix, since they are what keeps it fixed.
- Update each component's spec in `design.md`, then let the build regenerate the per-component markdown, the component API data and the shadcn registry.
- Tabs and EmptyState gain props, and RadioGroup and ToggleGroup change keyboard behaviour, so this is a minor release with a release-log entry, not a patch.
- The component page formula in section 1 drafted its accessibility guidance as though these had shipped. If that is rebuilt, do this first.

## 3. Button equal height (scrapped 2026-10-07, the change kept here)

The code is gone. It was one unverified commit on `wip/button-equal-height` (`aa3615d`, parked from an idle session on 2026-09-30, 7 files), deleted from GitHub on 2026-10-07 with no archive tag. Not in `main`.

- **Problem:** the outlined Button variants (`secondary`, `destructive`) carry a 1px border and the filled ones (`primary`, `tertiary`, `neutral`) carry none, so an outlined button is 2px taller and wider than a filled one beside it.
- **Fix:** every variant wears a `--border-025` border, transparent on the borderless ones, and the padding gives that width back, so the hairline replaces 1px of padding instead of adding to it. All variants then share one height and width per size (40px default, 32px compact in the base theme), and content sits where the padding token says.
- **In `Button.css`:** the base rule becomes `border: var(--border-025) solid transparent` with `padding: calc(var(--padding-200) - var(--border-025)) calc(var(--padding-500) - var(--border-025))`; compact does the same with `--padding-150` and `--padding-300`; the three borderless variants change `border: none` to `border-color: transparent`.
- **In `SplitButton.css`:** the main segment overrides Button's inline-end padding, so both overrides subtract `--border-025` as well. The comment about secondary's border moving the segment height no longer applies.
- **In `design.md`:** the Button variant table's Border column reads "transparent 1px" for the three filled variants, and the Sizes line states the shared height and why. That table has since been rewritten theme-agnostic in `main`, so write the edit fresh against the current text.
- **If redone:** check every component that overrides Button's padding or assumes its height (SplitButton was the only one found, but the search was not exhaustive), then look at it in both themes. It changes the rendered size of the outlined variants by 2px, so it is a visible change and wants a release-log entry.

## 4. Icon colour carve-outs (scrapped 2026-10-07, the rule kept here)

The code is gone. It was one unverified commit on `wip/icon-colour-rules` (`f38eaf6`, parked from an idle session on 2026-09-26, 39 files, 72 commits behind `main`), deleted from GitHub on 2026-10-07 with no archive tag. Not in `main`: the bug below is still in the shipped library, read from `main`'s stylesheets rather than confirmed in a browser.

### The bug

The icon font sets no colour, so an icon inherits from whatever it sits in, and the default belongs to the consumer. This repo's website supplies one in `globals.css` (`.material-symbols-rounded { color: … }`), and a global like that breaks inheritance for every icon under it. So about 29 components restore it with a blanket rule, written last in the file:

```css
.ds-alert .material-symbols-rounded { color: inherit; }
```

That is two classes, specificity (0,2,0), the minimum that beats a consumer's (0,1,0) global. The same weight is the hazard: it outranks every single-class icon rule and ties with every two-class one, and coming last it wins the tie. Whatever it covers loses its own colour and falls back to the surrounding text colour. Two things get hit:

- **The component's own icons.** Where a component puts its own class on the icon element (`ds-alert__icon material-symbols-rounded`) and colours it, the blanket rule overrides that. Alert and Toast lose all five status icon colours (an info alert's icon renders as body text, not the status colour), and CommandPalette's search and command icons lose `--color-icon-primary`.
- **Nested components.** A component dropped into a slot colours its own icons the same way and is outranked by the host. On a filled control that is a contrast defect, not only a wrong hue.

### The fix

Every blanket rule carves out both cases inside `:not(:where(…))`. `:where()` adds no specificity, so the rule stays (0,2,0) and still beats the consumer's global:

```css
.ds-tool-call .material-symbols-rounded:not(:where(
  .ds-tool-call__chevron,        /* carries its own colour rule */
  .ds-tool-call__content *,      /* consumer slot */
  .ds-tool-call__actions *       /* consumer slot */
)) { color: inherit; }
```

The line for slots: a slot that holds the consumer's *components* is carved out, because those colour their own icons; a slot that holds the consumer's *text* stays covered, because a bare glyph there should follow the surrounding colour. Two consequences. A carve-out is not transitive: if A carves out a slot but sits inside B, B's rule still reaches in, so B must carve out A too. And an icon that is *wrapped* (`__media > span`) rather than classed needs no carve-out, since the wrapper holds the colour and the icon inherits it.

### The carve-outs it made

| Component | Excluded from the blanket rule |
|---|---|
| AgentPlan | `__chevron` |
| Alert | `__icon` |
| AppSidebar | `__btn-icon`, `__btn-chevron`, the top slot, the footer slot |
| Carousel | the slide slot |
| Chip | `__icon` |
| Combobox | `__search-icon`, `__chevron`, `__check` |
| CommandPalette | `__search-icon`, `__command-icon`, the trailing slot |
| ContactCard | `__icon`, `__chevron` |
| EmptyState | the action slot |
| FileInput | `__dropzone-icon`, `__file-icon` |
| FilterBar | `__option-check` |
| InterruptCard | `__answer-icon`, the detail slot |
| MessageCard | the media slot, the actions slot |
| NotificationCenter | the item actions slot, any nested EmptyState |
| SourceTrail | `__chevron` |
| Toast | `__icon` |
| ToolCall | `__chevron`, the content slot, the actions slot |

This list is 17 of the roughly 29 components with a blanket rule. The others were judged to need nothing, but `main` has gained components since, so recount rather than trust it.

### The validator

`scripts/validate-icon-colour-rules.mjs` enforced the mechanical half. For each component with a blanket rule it read the TSX for BEM classes sitting on the same element as `material-symbols-rounded`, checked whether the CSS gave that class a colour of its own, and failed the build if the blanket rule did not exclude it, or if an exclusion was written without `:where()` and so changed the rule's specificity. The slot half stayed a human decision recorded in each rule's comment. A `design.md` section, "Icon colour and the blanket rule", owned the convention.

### If redone

- Start from the validator: write it first and let it list the offenders on the current `main`, since the component list has moved.
- Fix Alert, Toast and CommandPalette first. Those are the visible defects; the rest are latent.
- Each stylesheet change regenerates that component's shadcn registry item.
- It changes rendered icon colours, so check both themes and give it a release-log entry.

## 5. Branches dropped without a write-up

Deleted from GitHub with no archive tag and nothing recorded beyond this line: `claude/zen-allen-exjgbd` (fully merged, so nothing was lost), and on 2026-10-07 `wip/parade-theme` (`13d154c`, a Parade theme preset and logo colour tokens), `wip/guest-app` (`db9d85a`, a guest app concept in labs), `wip/member-graph` (`878f546`, the `/labs/member-graph` concept page) and `wip/header-wordmark` (`480a142`, a RIFT wordmark trial in the header).

## 6. The Mac (inventoried and reset 2026-10-05)

The Mac held three pieces of uncommitted work, none of it on GitHub: the member graph page in the main working tree, and two idle agent worktrees. Each was committed as found and pushed as a `wip/` branch. All three were later dropped: the button and icon changes are written up in sections 3 and 4, and the member graph page is listed in section 5.

Removed after that, because they carried nothing else: the two worktrees and their merged `claude/*` branches, and two stashes holding older copies of the member graph registration lines. The stashes are tagged on the Mac only, `archive/member-graph-stash-2026-09-30` and `archive/member-graph-stash-2026-10-02`, and can be deleted now: `wip/member-graph` was dropped on 2026-10-07 (`git tag -d <tag>` on the Mac).

The Mac's `main` is clean and level with `origin/main` at `8745bf1`.

## Staying in sync from here

- One piece of work, one branch, pushed the same day (`checkpoint`), even when unfinished. A pushed branch is visible from both machines; a dirty working tree is visible from neither.
- Start every session on either machine with `git fetch --all --prune` and `git status`.
- Finish or park (`park`) before switching computers.

## The archived Windows work

Nothing is archived any more. Sections 1 and 2 were each committed and tagged on the Windows machine before the 2026-10-05 reset, and all three tags (the formula, its duplicate from an agent worktree, and the accessibility fixes) were deleted on 2026-10-07 when the work was scrapped. The write-ups in sections 1 and 2 are all that remains.
