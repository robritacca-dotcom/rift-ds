---
name: dogfood
description: "Run a dogfood round: send several agents out to build real apps from the published rift-ds package as a stranger would, each logging every place it got stuck, then verify the findings against the repo, merge them with the owner's own build report, compare who found what, and track the round in a ledger until rounds come back clean. Use when asked to dogfood rift-ds, run a dogfood round, send agents to build with the package, or find consumer-side gaps. Never fixes anything itself."
---

# dogfood

Reviewers who read the site produce opinions. Builders who install the package produce friction. This skill turns the second into a repeatable loop: N agents each build a real app from the package with consumer knowledge only, log every snag as they hit it, and the owner builds one more by hand. The run then verifies every finding against the repo, merges the reports, compares who found what, and records the round in a ledger so the next round measures progress rather than starting over.

**The skill finds and reports. It never fixes.** Fixes go through the normal skills (`new-component`, `api-consistency`, `design-qa` and so on) after the owner picks them from the triage, then ship in a release, and the next round tests that release.

## When invoked

"Run a dogfood round", "dogfood rift-ds", "send agents out to build with the package". Arguments the owner may give: how many builders (default 5), which briefs, which package source (default the published `latest`), and a round number (default: one past the ledger's last). Ask only when the ledger shows a round still open (reports in but no triage).

## The workspace

Everything lives **outside this repo**, in a sibling folder, so no consumer app ever sees the repo's source and nothing here is committed by accident:

```
<repo root>/../rift-dogfood/
├── LEDGER.md                  # every gap cluster across rounds, its status, and the round-by-round scoreboard
└── round-<N>/
    ├── ROUND.md               # package version, briefs, builders, start date
    ├── <brief>/               # one app per builder (a fresh Next.js app)
    │   ├── FRICTION.md        # the live log, written as the builder goes
    │   ├── REPORT.md          # the builder's final report
    │   └── shots/             # screenshots
    ├── owner/REPORT.md        # the owner's own build, same format
    └── TRIAGE.md              # this skill's verified, merged, compared result
```

Find the repo root with `git rev-parse --show-toplevel`.

## Package source

- **Default, the published package**: builders run `npm install rift-ds@latest`. This is what a stranger gets, and it is the honest test.
- **Unreleased work** (the owner asks to test main before a release): run `npm run build:lib` in the repo, then `npm pack ./dist --pack-destination <round folder>`, and give builders the tarball path to install instead. Record which in ROUND.md, because a finding against a tarball may already be different on npm and vice versa.

## The briefs

Each brief is a small real product with a must-use list that aims it at one area of the system. Pick briefs that spread across areas. **Keep at least two briefs the same from round to round** so the scoreboard compares like with like, and rotate the rest. Before a round, check `src/components/registry.json` and `src/chat/registry.json` so every must-use name in a brief still exists.

| Brief | The app | Aimed at |
|---|---|---|
| `ops-dashboard` | An operations dashboard: KPI row, three or four charts of mixed types, a filterable sortable table with row actions, a date range | charts, DataTable, filters, number formatting |
| `settings` | Account and settings area: profile form with validation, notification preferences, billing plan picker, danger zone with a confirm dialog, toasts on save | forms, Field, choice controls, dialogs, feedback |
| `assistant` | An AI assistant app scaffolded with the init bin's chat subcommand, run on the scripted demo transport so no key is needed, with a thread list and one custom card | the chat widget, init chat, the AI components |
| `mobile` | A phone-first app (habit tracker or similar) designed at 375px first: bottom navigation, a sheet or drawer, list and detail screens, then made to work on desktop | responsive behaviour, touch, navigation |
| `marketing` | A product's marketing site plus a docs page, in a shipped theme preset that is not the default, with at least one block from `init block` | theming, data-brand, typography, blocks, the app scaffold |
| `tracker` | A work tracker: board of columns with cards, a list view, an item detail panel, assignees and statuses | composition, status, avatars, empty states |
| `admin-crud` | An admin tool over a fake API with latency and failures: list, search, create, edit, delete, with loading, empty and error states everywhere | DataTable server mode, states, overlays |

New briefs are welcome. A good one is a product someone would really build, with screens that force a choice between composing the library and writing custom CSS.

## Running a round

### 1. Open the round

Read `LEDGER.md` (first round: create it). Note the clusters still open and the ones marked won't-fix, so the triage can recognise them. Create `round-<N>/`, write ROUND.md (date, package source and version, briefs, builder count), and give the owner the builder protocol below so their own report uses the same format.

### 2. Send the builders

Spawn one agent per brief with the Agent tool, all in one message so they run in parallel, in the background. Each prompt is the **builder protocol** below with the brief, the app folder, the package source and a unique dev-server port (3101, 3102, and so on) filled in. Tell the owner what is running and roughly what it costs: each builder is a full app build, so five builders is a large token spend. Then wait for the notifications; never poll.

### 3. Collect

When every builder is done (and the owner's report is in, or the owner says to go without it), read every REPORT.md and FRICTION.md. A builder that finished without a report or with an empty log gets one follow-up message asking for it, never a reconstruction by you.

### 4. Verify every finding against the repo

Builders cannot see the repo and will sometimes be wrong. You can. Give every finding exactly one verdict:

- **CONFIRMED**: the gap is real in the package source tested.
- **UNFOUND**: the thing exists, but the builder could not find it from the consumer surfaces (types, skills, site, markdown pages). This is still a real gap, a discoverability one; record where they looked and where it actually lives.
- **FIXED-SINCE**: real in the version tested, already different on main. Name the commit.
- **BUILDER-ERROR**: the package was fine and the builder misused it, with nothing a doc could reasonably have prevented. Say so plainly.
- **NOT-A-GAP**: a deliberate decision (check the ledger's won't-fix rows, CLAUDE.md and design.md first). Name where the decision is recorded.

Evidence for a verdict is a file and line, a command and its output, or a screenshot, never memory. A finding that cannot be checked stays out of the ranked list and goes in a short "could not verify" section.

### 5. Merge into clusters

Group findings that are the same underlying gap, even when worded differently ("no way to format the axis" and "big numbers clip on the chart" are one cluster if one fix closes both). Give each cluster a stable id. If it matches a ledger cluster, reuse that id and note it came back. Score each cluster:

- severity of its worst finding (blocker 3, friction 2, polish 1)
- times the number of independent reporters
- plus the minutes lost the reporters estimated, as a tiebreak

### 6. Compare and contrast

This is the step that makes the loop improve itself. Build a matrix of clusters against reporters, then say plainly:

- **Found by several, including the owner**: high confidence, fix first.
- **Found only by the owner**: what agents miss. Name the pattern (taste, feel, motion, copy tone, things that only look wrong) and propose a concrete change to the builder protocol or the briefs so the next round's agents catch it.
- **Found only by agents**: breadth the owner did not have time for. Check these hardest in step 4.
- **Found by one builder only**: lower confidence, unless it is a blocker.
- **What worked**: the things every builder praised or used without friction. Name them, so a fix does not break them.

### 7. Write the triage and update the ledger

`round-<N>/TRIAGE.md`: the verdict counts, the ranked cluster list (id, one-line gap, verdict, reporters, score, suggested fix, which skill would do the fix), the comparison from step 6, the protocol changes proposed, and the "could not verify" list.

`LEDGER.md`: add or update every cluster (id, gap, first round, rounds seen, status: open, fixed in a version, or won't-fix with the reason), then a scoreboard row for the round: date, package version, builders, briefs, new clusters, recurring clusters, blockers, frictions, and how many builders finished their brief without a source-level workaround.

### 8. Hand over

Report to the owner: the scoreboard row, the top clusters, what only they found, and the proposed protocol changes. End by asking which clusters to fix. **Do not start fixing.** A won't-fix answer goes in the ledger with the owner's reason so no later round raises it again.

## When it is excellent

The loop is done when **two rounds in a row** meet all of these:

- no new blocker cluster,
- no more than two new friction clusters,
- every builder finished its brief without reading package source or writing a workaround for a library gap,
- and the owner's own build found nothing the agents had not.

Say so in the hand-over when it happens. Until then, each round's hand-over says which of the four failed.

## The builder protocol

Paste this into each builder's prompt, with the bracketed parts filled in.

> You are a front-end developer who has never seen the rift-ds source. Your job is to build **[brief: the app description and must-use list]** with the `rift-ds` package, and to log every place the package or its docs made that harder than it should have been. The log matters as much as the app.
>
> **Where**: create a fresh Next.js app (TypeScript, App Router, no Tailwind) at `[app folder]`. Install the package from `[package source]`. Run your dev server on port `[port]` only.
>
> **What you may read**: the installed package (its `.d.ts` files, README and CSS), whatever `npx rift-ds init` installs, the public site at the package's homepage (append `.md` to a component page's URL for its prop contract as markdown, and `/llms.txt` lists everything), and the public MCP endpoint listed there. **What you may not read**: the rift-ds source repository, anywhere on disk or on GitHub. If you catch yourself wanting to, that is a finding: log what you were looking for.
>
> **How to build**: follow the package's own setup (start with `npx rift-ds init` and `npx rift-ds init app`). Use the library's components and semantic tokens. When the library does not cover something, write the smallest custom piece that does, with tokens only, and log it. No raw colours or pixel values without a log entry saying why.
>
> **Log as you go**, in `FRICTION.md` in the app folder, the moment you hit something, never reconstructed at the end. One entry per snag:
>
> - **Area**: component, subpath, token, CLI, docs, theming, types…
> - **Tried**: what you were trying to do and which surface you looked at (types, skill, site page, md page, MCP).
> - **Happened**: what went wrong, with the exact error, type signature or output pasted in.
> - **Workaround**: what you did instead, and the file it lives in.
> - **Cost**: minutes lost, your estimate.
> - **Severity**: blocker (could not proceed without a workaround), friction (cost time or needed custom code), polish (small and visible).
> - **Fix**: what you would change in the package or its docs.
>
> Also log the good: anything that worked first time or saved you time goes in a "Worked well" list at the bottom.
>
> **Check your work like a user would**: `npm run build` must pass. Then screenshot every screen in light and dark, at 1440px and 375px, with `npx playwright screenshot --viewport-size=<w>,<h> --color-scheme=<light|dark> <url> <file>` into `shots/`, and look at each one. Anything that looks off is a finding too, logged the same way: misaligned, clipped, wrong colour in dark mode, unreadable, ugly. Do not use any shared browser pane.
>
> **Finish with `REPORT.md`**: what you built (screens, and which components you used), the friction log sorted by severity, the three findings you would fix first if you could fix only three, the worked-well list, and anything you are unsure was the package's fault versus your own. Be specific and honest: a precise small finding beats a vague big one, and "I could not find X" is a valid finding. Do not pad the list.

## Ground rules

- **Never fix during a round.** The round measures the package; changing it mid-round makes the reports disagree about what they tested.
- **Never commit the workspace.** It sits outside the repo on purpose. Nothing from a builder's app is copied into the repo without the owner choosing it.
- **Builders are not trusted, only checked.** Their findings are leads until step 4 gives each a verdict with evidence.
- **Settled decisions stay settled.** A cluster the owner marked won't-fix is reported as recurring, not re-argued.
- **Examples in this skill are fictional.** Real component names appear only in briefs, which step 1 checks against the registries each round.
