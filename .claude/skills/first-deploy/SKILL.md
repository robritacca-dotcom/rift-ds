---
name: first-deploy
description: The one-time go-live checklist — everything between this repo building green and the site, package, and monitoring actually existing in public. Use when asked to go live, deploy for the first time, or set up the public phase.
icon: rocket_launch
displayDescription: "The one-time path from a green private repo to a live public product: the Vercel projects, the placeholder URL becoming real, the parked uptime cron waking up, the npm Trusted Publishing registration, the first publish, and the wiring the chat and analytics wait on. Ordered so nothing ships pointing at a thing that does not exist yet. Nearly all of it is done: what remains is analytics and Chromatic."
invoke: ["go live","first deploy","set up the public phase","take the site public"]
---

# first-deploy

The one-time sequence from a repo that builds green to a site, package, and monitoring that exist in public. Once every box here is ticked, this skill is history — the `ship` and `release` skills own everything recurring.

## When invoked

Use this skill when asked to go live, do the first deploy, or start the public phase. Most of it is history: the site, the package, the chat and the public repo all exist. What remains is analytics and Chromatic, both in step 4.

## The governing idea

Order is the whole content of this checklist: the init bin stamps `SITE_URL` at package build time, the install surfaces are validator-held to the real package, and the smoke tests need a production to smoke — so each step below unlocks the ones after it, and doing one early ships a pointer at nothing. **Steps marked (owner) happen in dashboards only the owner can reach**; stop and hand over rather than working around them.

## Instructions

### 0. Decide the identity first

**DONE.** The identity was settled on 2026-09-26: the brand is Rift DS, the package is the unscoped `rift-ds`, the domain is rift-ds.com and the repo matches. The reasoning stands for any future rename, so keep it: publishing under a name that is about to change burns version numbers on a placeholder, and a rename is far cheaper before a version exists than after. The `PACKAGE_NAME` doc block in `scripts/brand.mjs` owns the rename-day recipe.

### 1. The site exists — DONE

The Vercel project serves `SITE_URL`, Storybook serves `STORYBOOK_URL` (both in `scripts/brand.mjs`), and the hydration smoke proved the first deploy.

### 2. Monitoring wakes up — DONE

The cron in `.github/workflows/uptime.yml` runs on schedule against production, and the "inoperable until first deploy" notes in `ship` and `pre-deploy` are retired.

### 3. The package exists — DONE

`rift-ds` 1.0.0 published 2026-09-26, provenance-signed, tagged `v1.0.0`. The consumer path is proven: `npx rift-ds init` against the live site installs the agent skill and prints the MCP connect line.

The ordering trap this step existed to catch, worth keeping for any future new package: **a trusted publisher can only be attached to a package that already exists**, so a first publish cannot use OIDC however carefully it is registered. npm says so outright, returning `404 ... OIDC token exchange error - package not found`. The workflow's `bootstrap_token` input covers exactly that case and is off by default; the registration happens after the name exists, and the token is revoked immediately.

### 4. The optional wiring, each its own decision (owner)

- **Chat** — DONE. An Upstash Redis is connected and the route's env vars are set, so the widget answers and its guardrails are armed.
- **Analytics**: a GA4 property; setting `GA_ID` in brand.mjs turns the snippet on, and the privacy page's analytics section must be updated in the same change — it currently states analytics is off.
- **Chromatic**: a project and its token secret; until then the dispatch-only workflow stays unused.
- **Repo visibility** — DONE. The repo is public, so SECURITY.md's advisory link resolves.
- **README banner URL** — DONE, but late: 1.0.0 published with the relative path still in place, so that version's package page carries a broken banner. The banner is now a generated region in `scripts/generate-readme-content.mjs`, built from the repo URL in brand.mjs, so it cannot regress. Left here as the record of why the region exists.

### 5. Close the loop

Grep the repo for "until the first deploy" and "does not exist yet" phrasings and retire each one that stopped being true, then retire this skill: it is already `unlisted` in the registry, and once everything above is done it is deleted — a completed one-time setup left looking current is exactly the drift the audits exist to catch.

## Guardrails

- Never work around a (owner) step with credentials or dashboard access you were not explicitly given
- Never publish before the identity decision in step 0 is made on purpose
- A 404 minutes after a green first publish is registry propagation — never re-run the workflow on it
