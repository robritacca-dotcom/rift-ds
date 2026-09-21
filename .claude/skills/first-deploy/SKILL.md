---
name: first-deploy
description: The one-time go-live checklist — everything between this repo building green and the site, package, and monitoring actually existing in public. Use when asked to go live, deploy for the first time, or set up the public phase.
icon: rocket_launch
displayDescription: "The one-time path from a green private repo to a live public product: the Vercel projects, the placeholder URL becoming real, the parked uptime cron waking up, the npm Trusted Publishing registration this repo does not yet have, the first publish, and the wiring the chat and analytics wait on. Ordered so nothing ships pointing at a thing that does not exist yet."
invoke: ["go live","first deploy","set up the public phase","take the site public"]
---

# first-deploy

The one-time sequence from a repo that builds green to a site, package, and monitoring that exist in public. Once every box here is ticked, this skill is history — the `ship` and `release` skills own everything recurring.

## When invoked

Use this skill when asked to go live, do the first deploy, or start the public phase — the site is already live on Vercel, so what remains here is the rest of the public phase (npm, GA, chat wiring, repo visibility).

## The governing idea

Order is the whole content of this checklist: the init bin stamps `SITE_URL` at package build time, the install surfaces are validator-held to the real package, and the smoke tests need a production to smoke — so each step below unlocks the ones after it, and doing one early ships a pointer at nothing. **Steps marked (owner) happen in dashboards only the owner can reach**; stop and hand over rather than working around them.

## Instructions

### 0. Decide the identity first

The package rename is the gate: publishing under a name that is about to change burns version numbers on a placeholder. Confirm with the owner whether the real name has landed. If it has, run rename day first — the `PACKAGE_NAME` doc block in `scripts/brand.mjs` owns that recipe. If the codename is shipping deliberately, record that decision and continue.

### 1. The site exists — DONE

The Vercel project serves `SITE_URL`, Storybook serves `STORYBOOK_URL` (both in `scripts/brand.mjs`), and the hydration smoke proved the first deploy.

### 2. Monitoring wakes up — DONE

The cron in `.github/workflows/uptime.yml` runs on schedule against production, and the "inoperable until first deploy" notes in `ship` and `pre-deploy` are retired.

### 3. The package exists

- **(owner)** Register Trusted Publishing on npmjs.com for THIS repo and the workflow filename `release.yml` verbatim — the current registration names the predecessor repo, and a dry run never authenticates, so nothing but a real publish proves the path.
- Cut the first release with the `release` skill (it already carries the first-release branches: no tags to describe, the whole history is the changelog, and the release log's first entry lands with it).
- Prove the consumer path end to end: `npx <package> init` against the live site must install the agent skill and print the MCP connect line.

### 4. The optional wiring, each its own decision (owner)

- **Chat**: an Upstash/Redis store and the env vars the route reads; until then the widget stays in its switched-off state by design.
- **Analytics**: a GA4 property; setting `GA_ID` in brand.mjs turns the snippet on, and the privacy page's analytics section must be updated in the same change — it currently states analytics is off.
- **Chromatic**: a project and its token secret; until then the dispatch-only workflow stays unused.
- **Repo visibility**: flip public when the owner says so — SECURITY.md's advisory link assumes it eventually is.
- **README banner URL**: before the first npm publish, switch the README's banner `src` from the relative `.github/readme-banner.jpg` to the absolute raw.githubusercontent.com URL (built from the repo URL in brand.mjs) — the README ships inside the npm tarball, and npmjs.com cannot resolve a relative image path. Relative is deliberate until then: it renders on the private repo, where an absolute raw URL would not.

### 5. Close the loop

Grep the repo for "until the first deploy" and "does not exist yet" phrasings and retire each one that stopped being true, then update this skill's own registry entry: once everything above is done, `first-deploy` moves to `unlisted` history or is deleted — a completed one-time setup left looking current is exactly the drift the audits exist to catch.

## Guardrails

- Never work around a (owner) step with credentials or dashboard access you were not explicitly given
- Never publish before the identity decision in step 0 is made on purpose
- A 404 minutes after a green first publish is registry propagation — never re-run the workflow on it
