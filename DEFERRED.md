# Deferred work

Inventory taken 2026-10-05 on the Windows machine, before resetting both computers to `origin/main` (`8745bf1`, "docs(releases): log 1.3.0"). Local `main` was already level with `origin/main`: nothing committed was ever at risk. Everything below was uncommitted or sitting on an unmerged branch.

Delete each section when its work is redone, landed, or dropped for good.

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
- Every accessibility guarantee must hold in the source. The scrapped draft claimed the fixes in section 2 as shipped, so redo section 2 first or those lines are false.
- It was also served beyond the page: the usage and related lines in the chat corpus, and the whole entry beside the prop API through the shared `get_component` tool (chat and MCP).

### How it was built

- **Shell**: `website/src/components/ComponentPage/`. `ComponentPage` took `slug`, `tagline`, `intro`, and optional `storybookPath` and `figmaUrl`, and rendered the mega nav, sidebar, breadcrumb, header, intro, the page's children, the guidance zone and the install strip. `DocSection` (a `section` with a `SectionTitle` h2, so the floating anchor rail picks it up) and `SectionLead` (the one style for a section's explanatory paragraph, never width-capped) were what a page composed its body from.
- **Guidance wiring**: each component's `layout.tsx` rendered `ComponentPageLayout` with its slug, a server component that read the registry and handed the page only its own entry through context, so no page bundled the whole file.
- **Enforcement as debt, not by review**: `validate-website-surfaces.mjs` checked three rules on every page (Overview first, a lead under every section, literal titles from the vocabulary). Pages that predated a rule sat on that rule's `FORMULA_DEBT` list, pinned to a ceiling so a list could only shrink: a page that now met a rule failed until struck off, and no page could join. A separate `validate-component-guidance.mjs` held coverage in both directions, the field shape and bounds, the related slugs, and the layout wiring.
- **Docs it touched**: a Component pages section in `design.md`, a registry row and new-component step in `CLAUDE.md`, a register row in `content-design.md`, and the `component-doc-page` skill.

### Where it stood

Every page was on the shell, but the formula rules were far from met: 58 pages still owed an Overview, 100 owed section leads and 42 owed vocabulary fixes. The `ai-button` page met the full formula and was the reference; `composer` was the state-driven equivalent. All guidance entries were drafted.

If rebuilt: start with the shell and prove the formula on two or three pages in one family before converting anything else, then go a category at a time. Converting every page to the shell first and leaving the rules as debt is what produced a 473-file tree that never reached a verify.

## 2. Accessibility fixes in the library (Windows, uncommitted)

Worktree `claude/elastic-borg-14c992`, zero commits, 35 files. Last touched 2026-10-02.

- `Badge`: dropped `role="status"` (a badge is a static label, not a live region).
- `Tabs`: optional `content` per tab renders a `tabpanel` wired with `aria-controls` and `aria-labelledby`; new `id` base prop.
- `AiButton`: summary panel opens on keyboard focus, not hover alone.
- `Popover`, `Combobox`, `RadioButton`, `ToggleGroup`, `EmptyState`: a11y changes with new stories and play assertions.
- `design.md` spec updates and the regenerated surfaces that follow (`website/public/r/`, the per-component `.md` pages, the component API data).

The guidance draft in section 1 described these fixes as shipped (Badge, AiButton, the chart keyboard model), so if the formula is rebuilt, redo this one **before** writing guidance, or the accessibility claims will be false.

## 3. Branches on GitHub (unmerged)

These are safe on the remote. Decide for each: land, keep, or delete.

| Branch | Date | What |
|---|---|---|
| `wip/icon-colour-rules` | 2026-09-26 | One commit, based on a `main` nine days old: icon colour carve-outs across 17 component stylesheets and a new `scripts/validate-icon-colour-rules.mjs` (39 files). Unverified; regenerate the generated surfaces after rebasing |
| `wip/button-equal-height` | 2026-09-30 | One commit, based on an older `main`: every Button variant wears a transparent border so all share one height (7 files). Its `design.md` hunk conflicts with the theme-agnostic rewrite |

`claude/zen-allen-exjgbd` was fully merged and has been deleted from the remote.

Dropped on 2026-10-07, deleted from GitHub with no archive tag: `wip/parade-theme` (`13d154c`), `wip/guest-app` (`db9d85a`), `wip/member-graph` (`878f546`) and `wip/header-wordmark` (`480a142`).

## 4. The Mac (inventoried and reset 2026-10-05)

The Mac held three pieces of uncommitted work, none of it on GitHub: the member graph page in the main working tree, and two idle agent worktrees. Each was committed as found and pushed as a `wip/` branch, listed in section 3. Nothing was landed and nothing was discarded.

Removed after that, because they carried nothing else: the two worktrees and their merged `claude/*` branches, and two stashes holding older copies of the member graph registration lines. The stashes are tagged on the Mac only, `archive/member-graph-stash-2026-09-30` and `archive/member-graph-stash-2026-10-02`, and can be deleted now: `wip/member-graph` was dropped on 2026-10-07 (`git tag -d <tag>` on the Mac).

The Mac's `main` is clean and level with `origin/main` at `8745bf1`.

## Staying in sync from here

- One piece of work, one branch, pushed the same day (`checkpoint`), even when unfinished. A pushed branch is visible from both machines; a dirty working tree is visible from neither.
- Start every session on either machine with `git fetch --all --prune` and `git status`.
- Finish or park (`park`) before switching computers.

## Recovering the archived Windows work

One archive tag is left, **on the Windows machine only** (it is not pushed): `archive/a11y-fixes-2026-10-05`, holding section 2 as it was committed before the reset.

Bring it back with `git switch -c <branch> <tag>`, or lift single files with `git checkout <tag> -- <path>`. To reach it from the Mac, push it first: `git push origin <tag>`. Delete it with `git tag -d <tag>` once its work is redone or dropped.

The two component page formula tags (the work and its duplicate from an agent worktree) were deleted on 2026-10-07 when section 1 was scrapped.
