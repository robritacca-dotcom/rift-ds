# Deferred work

Inventory taken 2026-10-05 on the Windows machine, before resetting both computers to `origin/main` (`8745bf1`, "docs(releases): log 1.3.0"). Local `main` was already level with `origin/main`: nothing committed was ever at risk. Everything below was uncommitted or sitting on an unmerged branch.

Delete each section when its work is redone, landed, or dropped for good.

## 1. Component page formula (Windows, uncommitted, the big one)

Branch `component-page-formula`, zero commits, 473 files changed in the working tree (about 11,600 lines added, 28,000 removed). Last touched 2026-10-02.

What it did:

- Added a shared `ComponentPage` shell in `website/src/components/ComponentPage/` (`ComponentPage`, `DocSection`, `SectionLead`, `ComponentPageLayout`, the guidance zone).
- Moved every component page under `website/src/app/components/` onto the shell (433 files), and deleted 19 `page.module.css` files the shell made redundant.
- Added the component guidance registry: `website/src/data/component-guidance.json` (about 4,400 lines, one entry per component: when to use, when not to, dos, don'ts, accessibility, related) plus its accessor `component-guidance.ts`.
- Added `scripts/validate-component-guidance.mjs` and extended `scripts/validate-website-surfaces.mjs` with the formula rules (Overview first, a lead under every section, titles from the vocabulary, `FORMULA_DEBT`).
- Served guidance through the chat's `get_component` tool, the MCP route and the corpus (`api/chat/route.ts`, `api/chat/persona.ts`, `api/mcp/route.ts`, `generate-site-corpus.mjs`).
- Updated `CLAUDE.md`, `design.md` (a Component pages section), `content-design.md`, eleven skills, the chat eval spec and golden set.

Unknown at inventory time: whether `npm run verify` passes on it.

To restart: begin with the shell and the guidance registry plus its validator, prove the formula on two or three pages, then convert the rest in batches by category.

## 2. Accessibility fixes in the library (Windows, uncommitted)

Worktree `claude/elastic-borg-14c992`, zero commits, 35 files. Last touched 2026-10-02.

- `Badge`: dropped `role="status"` (a badge is a static label, not a live region).
- `Tabs`: optional `content` per tab renders a `tabpanel` wired with `aria-controls` and `aria-labelledby`; new `id` base prop.
- `AiButton`: summary panel opens on keyboard focus, not hover alone.
- `Popover`, `Combobox`, `RadioButton`, `ToggleGroup`, `EmptyState`: a11y changes with new stories and play assertions.
- `design.md` spec updates and the regenerated surfaces that follow (`website/public/r/`, the per-component `.md` pages, the component API data).

The guidance JSON in section 1 already described these fixes as shipped (Badge, AiButton, the chart keyboard model), so redo this one **before** writing guidance, or the accessibility claims will be false.

## 3. Duplicate and empty worktrees (Windows, nothing to redo)

- `claude/happy-murdock-7552f2`: a copy of section 1, identical except an older draft of the guidance JSON's accessibility lines.
- `claude/sad-yalow-bdb83c`: clean, and its commit is already in `main`.

## 4. Branches on GitHub (pushed from the Mac, unmerged)

These are safe on the remote. Decide for each: land, keep, or delete.

| Branch | Date | What |
|---|---|---|
| `wip/guest-app` | 2026-10-03 | One commit on current `main`: guest app concept in labs, the assistant as shell with the marketing dashboard inside (8 files, +831) |
| `wip/parade-theme` | 2026-10-03 | One commit on current `main`: Parade theme preset and logo colour tokens (26 files, +587) |
| `wip/header-wordmark` | 2026-09-26 | Two commits, 60 behind `main`: RIFT wordmark trial in the header (`BrandWordmark`, `SiteLogo`) |
| `claude/zen-allen-exjgbd` | | Fully merged into `main`. Delete. |

## 5. The Mac (not yet inventoried)

Nothing unpushed on the Mac is visible from here. Before discarding anything there, run this in the repo and add what it shows to this file:

```bash
git fetch --all --prune && git status --short | wc -l && git branch -vv && git worktree list && git stash list && git log --oneline origin/main..HEAD
```

Then reset the Mac:

```bash
git switch main && git reset --hard origin/main && git clean -fd
```

and remove any leftover worktrees with `git worktree remove --force <path>` and local branches with `git branch -D <name>`.

## Staying in sync from here

- One piece of work, one branch, pushed the same day (`checkpoint`), even when unfinished. A pushed branch is visible from both machines; a dirty working tree is visible from neither.
- Start every session on either machine with `git fetch --all --prune` and `git status`.
- Finish or park (`park`) before switching computers.

## Recovering the archived Windows work

Sections 1 to 3 were not deleted outright. Each was committed and tagged before the reset, **on the Windows machine only** (the tags are not pushed):

| Tag | Holds |
|---|---|
| `archive/component-page-formula-2026-10-05` | Section 1 |
| `archive/a11y-fixes-2026-10-05` | Section 2 |
| `archive/component-page-formula-dup-2026-10-05` | The duplicate from section 3 |

Bring one back with `git switch -c <branch> <tag>`, or lift single files with `git checkout <tag> -- <path>`. To reach them from the Mac, push them first: `git push origin <tag>`. Delete a tag with `git tag -d <tag>` once its work is redone or dropped.
