---
name: perf-audit
description: Measure what the website and the published package cost, find where the weight and the slow frames come from, fix them without changing a pixel, and lock each saving into a budget. Runs the route budget and size budget reports, the bundle breakdown, the lab timings and the pixel comparison. Use when asked to run the performance audit, make the site or a page faster, shrink a component or the package, or prove a change made things lighter. Never commits, pushes, or deploys.
icon: speed
displayDescription: "Measures what a first visit to each page costs and what each component costs a consumer, then traces the weight to the modules behind it. Every fix is timed before and after in a real browser under a throttled phone profile, proven to leave the pixels alone by photographing every page before and after, and locked in by lowering the budget the build enforces, so a saving cannot drift back."
invoke: ["run the performance audit","/perf-audit","make this page faster","why is this component so heavy"]
category: review
metadata:
  internal: true
---

# perf-audit

Two budgets hold what the system costs, and both are enforced by the build: `scripts/validate-size-budget.mjs` for the published package and `scripts/validate-route-budget.mjs` for the website. Each script's doc block owns what it measures and its rules. This skill is the work between two readings of those budgets: find the weight, remove it, prove nothing visible changed, and lower the ceiling so the saving holds.

**Never commit, push, or deploy.** Fixes land in the working tree for the owner to review.

## When invoked

Run when asked to "run the performance audit", make the site, a page or a component faster or smaller, or show what a change did to load cost. For a layout or visual question, `responsive-sweep` and `design-qa` are the right skills.

## What it can and cannot see

It sees bytes (exactly, from the build) and load timings (approximately, from a throttled browser on this machine). It does **not** see how a real visitor's device behaves, and no timing here is a gate: timings move with the machine and its load, so compare only runs taken close together on the same machine, and treat a difference under a tenth as noise.

## Instructions

### 1. Take the before

Build both halves from the tree under review, then record the baseline. Keep every output outside the repo, in the session's scratchpad.

```bash
npm run build:lib
npm --prefix website run build
node scripts/validate-size-budget.mjs --report
node scripts/validate-route-budget.mjs --report
node scripts/measure-perf.mjs --json <scratchpad>/perf-before.json
node scripts/compare-screens.mjs shoot <scratchpad>/screens-before
```

Run the timings with nothing else heavy running, and say so in the report if that was not possible. If another session is working in the same checkout, say so before building, since a build replaces its output.

### 2. Find where the weight is

- **A component or subpath**: `node scripts/validate-size-budget.mjs --why <entry>` lists the modules in its bundle, largest first. Look for a module the entry only needs on a rare path (an editor behind a menu, data for one variant), and for a shared module drawn in by one small use.
- **A page**: the route report separates scripts, stylesheets and the document. A heavy document is inline markup or serialised data; heavy scripts on a page that shows little are imports that could wait for the press or the scroll that needs them.
- **A slow frame**: the lab timings give long-task time per route. Profile the page in the browser to name the work before changing anything.

State each finding with its figure and its file before fixing it. A guess about what is slow is a lead, not a finding.

### 3. Fix, and codify the pattern

A performance fix that is applied once comes back. When a finding names a pattern (work done before it is needed, a loop that never pauses, the same helper written twice), the fix is in three parts, landed together:

1. the shared primitive or rule that makes the right way the easy way, in `src/behaviors/` or the site's own shared code;
2. every existing caller moved onto it, not only the one that was measured;
3. a check that fails on the old way, written with the `new-validator` skill, with existing exceptions sanctioned in its table and each one given its reason.

design.md and CLAUDE.md state the rule in the same change.

### 4. Prove nothing visible changed

Rebuild, shoot again, and compare:

```bash
node scripts/compare-screens.mjs shoot <scratchpad>/screens-after
node scripts/compare-screens.mjs compare <scratchpad>/screens-before <scratchpad>/screens-after --diffs <scratchpad>/screens-diff
```

Open every picture it lists. A difference is either a regression to fix or an intended change the owner must be told about; never wave one through. A picture reported as only partly compared was not proven, so check that page by eye in both themes.

### 5. Take the after and lower the ceilings

Run the reports and timings from step 1 again (`--compare <scratchpad>/perf-before.json` prints each timing beside its earlier figure). Then lock the saving in: both budgets fail when a ceiling sits far above its measure, so lower each one this change moved, in `scripts/size-budget.json` by hand and in `scripts/route-budget.json` by hand or with `--write` when many routes moved. Refresh the published component sizes with `node scripts/validate-size-budget.mjs --write` when a component moved.

### 6. Verify and report

Run `npm run verify`. Report, per finding: what it was, the figure before and after, the primitive and the check that now hold it, and anything measured but left alone with the reason.
