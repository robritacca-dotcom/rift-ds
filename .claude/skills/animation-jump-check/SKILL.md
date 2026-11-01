---
name: animation-jump-check
description: Check a page's animations frame by frame for what a screenshot cannot show. Elements that snap instead of gliding, neighbours moving out of step, and open popovers that lose their anchor. Runs scripts/check-animation-jumps.mjs, judges each finding by watching the motion, and reports. Use when asked to check an animation for jumps, find a pop or snap in some motion, or run the animation jump check. Never fixes, commits, pushes, or deploys.
icon: animation
displayDescription: "Plays a page in a headless browser and records where every visible element sits on every animation frame, then reports what a still can never show: an element that snaps instead of gliding, neighbours drifting out of step, an open popover losing its anchor. Each finding is a lead until someone has stepped through that moment and watched it, so the report separates real faults from motion that is meant to step."
invoke: ["run the animation jump check","/animation-jump-check","check this animation for jumps","find the snap in this motion"]
---

# animation-jump-check

`design-qa` judges animations after they settle, and the served-site checks do not look at motion, so a one-frame snap reaches no check. `scripts/check-animation-jumps.mjs` records every element's box on every frame of a page. This skill points it at the motion in question and judges what it finds. The script's doc block owns what each line means, what it skips, its options and its exit codes.

**Report only.** Do not fix, commit, push, or deploy unless separately asked.

## Instructions

### 1. Decide what to record

Name the route and what sets the motion off. An entrance plays on load; anything else needs `--click` or `--hover` to start it. Use `--select` for the part of the page that moves: a smaller recording stalls less and reports less noise. Set `--ms` long enough to cover the whole animation.

### 2. Run it

Prefer the production build, since a dev server adds its own stalls and reloads. With no `--origin`, the script boots the existing build, so confirm that build is of the tree under review. Keep output in the session's scratchpad.

```bash
node scripts/check-animation-jumps.mjs /some-route --select ".some-root" --click ".some-trigger" --json <scratchpad>/jumps.json
```

Exit 2 means the recording cannot be trusted, usually because too many frames stalled. Narrow `--select` and run again; never read an incomplete run as clean. Run the same recording twice before believing a single-frame finding, because headless timing varies.

### 3. Judge every finding by watching it

Step through the moment the line names, using the built-in browser or Playwright with the animation slowed down. Give each finding one verdict:

- **Defect**: a person would see it pop, or two things visibly part ways.
- **By design**: the motion is meant to step. Cite the code or design.md spec that says so.
- **Instrument error**: nothing visible happens, for example a change under something opaque, or a page layout shift unrelated to the animation.

`manual` lines are not findings. Look at them only when the swap is part of the motion in question.

### 4. Report

Repeat the full report in the final message; there is no report file.

- What was recorded: route, trigger, width, frames, and the share stalled.
- **Defects**: each with its time, the element, what is seen, and the likely cause in the source.
- **By design** and **instrument errors**: one line each.
- What it could not see: colour and opacity changes, easing that is smooth but wrong, and every state not triggered.

**"No jumps" is a valid outcome**, and it means no measurable snap in what was recorded, not that the motion is good.

## Guardrails

- Propose `data-snap` rather than adding it, and only for an element whose stepping is deliberate. It hides that element from the check for good.
- Never raise a threshold to make a run quieter without the owner's yes.
