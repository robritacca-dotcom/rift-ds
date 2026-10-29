---
name: responsive-sweep
description: Sweep every page of the built website at every breakpoint width for layout breaks a person would otherwise have to find by hand. Content running off the screen, text cut off or spilling out of its box, and controls drawn on top of each other. Runs scripts/check-responsive-layout.mjs, judges each finding from its screenshot, fixes the real breaks at their source, and reports. Use when asked to sweep the site, check every page at every size, run the responsive sweep, or QA the layout before a release. Never commits, pushes, or deploys.
icon: devices
displayDescription: "Loads every page of the site at every breakpoint width, from a small phone to a wide desktop, and measures what a person would otherwise have to spot: content running off the screen, text cut off or spilling out of its box, and controls stacked on top of each other. Each finding comes with a marked screenshot, is judged by eye before it is called a defect, and is fixed where it starts: in the component when the component breaks, with a story at the width that broke it."
invoke: ["run the responsive sweep","/responsive-sweep","check every page at every size","sweep the site for layout breaks"]
---

# responsive-sweep

The served-site checks in `verify` render at one desktop width, apart from the hydration smoke's phone pass, which catches only a page that scrolls sideways on its handful of routes, so an element that breaks on a phone or a tablet reaches no check. This skill closes that gap. `scripts/check-responsive-layout.mjs` loads every static route at every width step the breakpoint modules declare and measures the layout; this skill judges what it finds, fixes the real breaks, and reports. The script's doc block owns the routes, the width ladder, what each kind of finding means, its options, and the `ACCEPTED` list.

**Never commit, push, or deploy.** Fixes land in the working tree for the owner to review, unless `super-ship` invoked this skill, in which case its rules on committing apply.

## When invoked

Run when asked to "run the responsive sweep", "check every page at every size", or QA the layout before a release, and as a step of `super-ship`. For one page or component, `visual-review` is faster.

## What it can and cannot see

It sees geometry: where boxes and text sit relative to the viewport, their own boxes and each other. It does **not** see colour or contrast, dark-mode-only problems, alignment and spacing taste, states that need an interaction first (an open menu, an expanded drawer, a filled form), or dynamic routes. `visual-review` and `design-qa` own those. A clean sweep means no measurable layout break, not that every page looks right.

## Instructions

### 1. Build

The sweep reads `website/.next/`, so the build must be of the tree under review:

```bash
npm --prefix website run build
```

A build already made from this tree in the same session (for example by `verify`) can be reused. If another session is working in the same checkout, say so before building, since the build replaces its `.next`.

### 2. Sweep

Run it in the background; a full sweep takes several minutes. Keep the output outside the repo, in the session's scratchpad:

```bash
node scripts/check-responsive-layout.mjs --shots <scratchpad>/responsive-sweep --json <scratchpad>/responsive-sweep.json
```

`--routes` narrows to route prefixes and `--quick` uses a five-step ladder, both for re-checking a fix, never for the sweep of record. The output is grouped: one line per element and kind, with every route and width it shows at, so a break in shared chrome is one finding, not two hundred.

If the run reports `error` findings (a page that failed to load), stop and report them first: a page that does not load at all is worse than any layout break, and `smoke-hydration.mjs` is the place to look.

### 3. Judge every finding by eye

Open each finding's screenshot (the measured element is outlined in red) and give it one verdict. A finding is a lead until it has been looked at.

- **Defect**: a person on that screen would see something broken: content cut off by the screen edge, a word or label missing its end, text drawn over something else, a control they cannot reach or tell apart.
- **By design**: a deliberate crop, a decorative spill, a floating layer doing its job. The code says so, usually in a comment beside the rule; cite it.
- **Instrument error**: the measurement is wrong (the screenshot shows nothing amiss and nothing deliberate explains it). The fix is in the script, not an entry in `ACCEPTED`.

`truncated` findings end in an ellipsis or a line clamp, which is usually deliberate. Call one a defect only when the cut hides the meaning and nothing else on screen carries it, such as a column header whose last letters are the word, or when the box has room the text is not given.

With many findings (more than about fifteen groups), split the screenshots between up to four subagents, each handed this section and the script's doc block, and check every defect they call yourself before acting on it.

### 4. Fix at the source

- **Find where the break starts.** A component class (`ds-*`) breaking on several routes is the component's defect: fix it in `src/components/`, and add a story at the width that broke it (the story tests then hold it). A page or template class (a CSS module) is the page's.
- **Follow the system's rules while fixing**: tokens, logical properties, the breakpoint constants. CLAUDE.md's Token Architecture and Component Anatomy sections apply as they would to any change.
- **Prove each fix** by re-running the script on the affected routes with `--routes`, after rebuilding the website, and by opening the new screenshot.

Stop and ask rather than fix when the right answer is a design decision: a layout that needs a new arrangement at a width, not a repair, or a fix that would change a component's published behaviour.

### 5. Record what is by design

Every by-design verdict becomes an entry in `ACCEPTED` in the script, with its kind, the shortest label substring that matches it, any route narrowing, and the reason, citing where the code says so. **Propose the entries and wait for the owner's yes**: an accepted finding is never reported again, so a wrong entry hides a real break for good. Fix instrument errors in the script's `inspect` function, re-run, and say what changed.

### 6. Report

Repeat the full report in the final message; there is no report file.

- The sweep: routes, widths, and the findings by kind.
- **Fixed**: each defect, where it showed (routes and widths), the cause, the fix, and the story added.
- **Proposed acceptances**: each by-design finding with its reason, waiting for approval.
- **Left for the owner**: defects that need a design decision.
- **Instrument changes**, if any.

**"No layout breaks at any width" is a valid outcome.** Say so briefly, with the route and width counts, and stop.

## Guardrails

- Never widen `ACCEPTED`, raise a tolerance, or drop a width to make the sweep quieter without the owner's yes. Quieter is not the goal; true is.
- The width ladder comes from the breakpoint modules. A new step belongs in `src/tokens/breakpoints.ts` or `website/src/config/breakpoints.ts`, never as a literal in the script.
- A finding at the small-phone width counts. The site promises to work on a phone, and the narrowest phones are where most breaks start.
- Labs routes are fidelity benches. A break in a library component there is a library defect; a break in the bench's own chrome is low priority, and the report says which is which.
