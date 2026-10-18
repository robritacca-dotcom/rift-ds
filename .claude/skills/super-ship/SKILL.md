---
name: super-ship
description: The bulletproof ship for structural work. Run the full drift audit and a scoped API consistency audit, fix the broken and stale findings, then ship the combined result live via the ship flow. Use when asked to super ship, audit and ship, or ship bulletproof, or when shipping a structural change where the docs and skills may have gone stale. For a small change, plain ship is enough.
icon: rocket_launch
displayDescription: "Chains the drift audit and an API consistency audit into the ship flow for structural work. Runs the full drift audit, then the API audit over the components the work touched, fixes the broken and stale findings both surface, stops to ask if any audit section was skipped, then ships the combined result: full verify, merge into main, push, CI watched to green, and the live site proven rendering. Gap findings and new-validator recommendations are reported as follow-ups, never built mid-ship."
invoke: ["super ship","super ship it","audit and ship","bulletproof ship","audit the API and ship"]
---

# super-ship

Drift audit, API audit, fix, re-check, ship — one invocation. A higher-order skill: it composes `drift-audit`, `api-consistency` and `ship` and owns only the rules of the composition. Everything about *how* to audit lives in `.claude/skills/drift-audit/SKILL.md` and `.claude/skills/api-consistency/SKILL.md`; everything about *how* to ship lives in `.claude/skills/ship/SKILL.md`. Read all three and follow them; this file only says how they connect.

## When invoked

Use this skill when asked to "super ship", "audit and ship", or ship "bulletproof" — typically after structural or architectural work (a moved directory, a new build step, a renamed surface, a changed dependency model) where the repo's self-descriptions may have gone stale and a plain ship would deploy them stale.

**Not for small changes.** A colour tweak, a copy fix, a single-component change: that's plain `ship`. The audit sweeps every skill and doc, and running it for a one-line change is ceremony, not safety. If invoked on something clearly small, say so and offer plain `ship` instead.

**Invoking this skill is the ask to ship.** `ship`'s guardrail says never to chain into it automatically from other work, and `drift-audit`'s says the report is the deliverable and fixes wait for approval. This skill is the sanctioned exception to both: by invoking it, the owner has pre-approved fixing the drift the audit finds *and* deploying the result. The carve-outs below say where that pre-approval stops.

## Instructions

### 1. Audit

Run the full `drift-audit` flow per its SKILL.md — every section, not a lightened pass. The one behavioural change: at its final step, do not stop to ask whether to apply fixes. The full report still gets produced; it becomes part of the final report here.

If the audit finds `validate-registry` itself broken, stop the whole flow and report — its own rule, and nothing downstream is trustworthy until it's fixed.

**Coverage gate.** Read the coverage table at the end of the drift-audit report. If any section is marked skipped, or was narrowed to less than the change-type playbook calls for given the kinds of change in the session's diff, stop and ask before going further. The owner may accept a narrow audit for a small change; that is their call to make with the table in front of them, never the flow's to make silently. A narrowed audit that deployed is exactly how stale descriptions have shipped before.

### 1b. API audit

Run `api-consistency` in its scoped mode over every component the session's diff touched (any file under `src/components/` or `src/chat/`) plus each one's family. Widen to the whole library only when the change is library-wide (a token change, or a change to a convention every component follows), and say in the report that you did. If the diff touches no component, record that the API audit had nothing in scope and move on.

### 2. Fix

Apply the **Broken** and **Stale** findings in-session. All of `drift-audit`'s guardrails still hold while fixing: never edit a generated file to resolve a finding, never weaken a validator.

For **API findings**, the line is the published contract:

- **Fix in-session** the drift-like ones, which change no consumer's code: a stale registry description or design.md spec, an internal caller on a deprecated spelling, a showcase page or story demoing a deprecated name.
- **Stop and ask** on anything that changes the published contract: a rename, a new prop, a new deprecation. Each of those moves semver, and the version is the owner's call.

Two categories of finding are **reported, not acted on**:

- **Gaps** (missing skill coverage, a recommended new validator): these are new work, not drift repair. Building a validator mid-ship is scope creep; list them as follow-ups.
- **Judgement calls**: a finding that might be deliberate scope, or whose fix could reasonably go two ways, or that touches a decision recorded elsewhere (e.g. a settled decision with an authoritative comment). Stop and ask rather than resolving it silently to keep the pipeline moving. A super ship that pauses on a real question is working as designed.

### 3. Re-check

Re-run the audit's mechanical checks over whatever the fixes touched (at minimum `npm run validate-registry`), so a fix can't itself introduce a dangling reference, and re-run the scoped API audit over any component a fix changed. Then check the combined change against drift-audit's change-type playbook: every surface it names for the kinds of change present has moved. There's no need to repeat the full prose read.

### 4. Ship

Follow the `ship` flow per its SKILL.md, from its step 0, with everything that entails — tree survey, full verify, logical commits, merge if on a branch, push, CI watched to green, and the live render proven with the deployed-site smoke. Two composition rules on top:

- **Commit the drift fixes separately** from the session's own work — they are a different concern, and ship's one-commit-per-concern rule already implies it. Something like `docs: repair drift found by pre-ship audit` with the findings named in the body.
- **Ship the combined result or nothing.** Never push the session work while leaving audit fixes uncommitted, or the reverse — the whole point is that what deploys and what describes it move together. If verify goes red on an audit fix, that fix is in scope to repair, same as session work.

### 5. Report

One combined final message:

- The audit summary in `drift-audit`'s report format (broken / stale / gaps / verified counts), with its coverage table, and any narrowing the owner accepted at the coverage gate
- An API consistency section: the components in scope (and whether it was widened to the whole library, and why), the findings fixed, and the contract changes left for the owner
- Which findings were fixed and shipped, and which are left as follow-ups (gaps, judgement calls)
- Everything `ship`'s report requires: commits pushed, verify and CI results, files left out, what visibly changes on the live site

## Guardrails

- This file never restates a step from `drift-audit` or `ship` — a change to either flows through automatically. If a conflict appears between this file and one of them, theirs wins for their own steps; this file wins only on the composition rules above.
- The pre-approval covers fixing drift and deploying; it does not cover changing the published contract, shipping past a skipped audit section, resolving judgement calls, building new validators, or resolving merge conflicts — those stop and ask, per the rules above and ship's own guardrails.
- If the audit comes back completely clean and there is nothing to ship, say so and stop — a clean audit is a valid outcome, not a failure to find something.
