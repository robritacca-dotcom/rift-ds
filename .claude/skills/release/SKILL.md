---
name: release
description: Cut a new npm release of @robr0/design-system. Bump the version, dry-run, publish via the Release workflow, then tag the published commit. Use when asked to cut a release, publish a new version, or ship the package to npm.
icon: rocket_launch
displayDescription: "Cuts an npm release of the component library: bumps the single source-of-truth version, runs the Release workflow in dry-run to prove a real consumer can install and build the tarball, publishes with signed provenance, then tags and writes the GitHub Release against the exact commit that shipped. Knows the two things that bite on release day: a version number can never be reused, and the registry lags a green publish by minutes."
invoke: ["cut a release","publish a new version","ship the package to npm","release [version]"]
---

# release

Cut a new npm release of `@robr0/design-system` — bump, dry-run, publish, tag.

## When invoked

Use this skill when asked to cut a release, publish a new version, or ship the package to npm — phrases like "cut a release", "publish the next version", "ship the package".

**This is the one workflow in this repo where a mistake is permanent.** npm never lets a version number be reused, even after unpublishing, so a botched publish burns that version forever. Read the guardrails before starting.

## Instructions

### 1. Decide the version

Read `PACKAGE_VERSION` in `scripts/package-manifest.mjs` — that constant is the *authoritative* version; two other files mirror it (see step 3) and `validate-package-exports.mjs` fails the build when they disagree (the root package.json version is a hand-maintained mirror; `dist/package.json` is generated from the manifest). Then pick the next version from what actually changed since the last release:

- **patch** — bug fixes, internal refactors, docs
- **minor** — new components, new exports, new tokens (additive)
- **major** — a renamed/removed prop, export, or token; anything a consumer must edit code for

Check what shipped since the last tag to justify the choice, and confirm it with Rob before bumping:

```bash
git log $(git describe --tags --abbrev=0)..HEAD --oneline
```

Be deliberate about breaking changes: components are exported both from the barrel and from `./components/*` deep paths, so a renamed component folder breaks consumers even if the barrel still exports the old name.

### 2. Pre-flight

- **Working tree must be clean and pushed.** The workflow builds from the repo, not your disk — anything uncommitted will not be in the release. `git status --short` and `git log origin/main..HEAD` should both be empty.
- **CI on `main` must be green.** A release from a red main ships known-broken code.
- Run `npm run verify` if anything at all is uncommitted or you haven't verified since the last change.

### 3. Bump and commit

**Three files carry the version — edit the first two, regenerate the third:**

1. `PACKAGE_VERSION` in `scripts/package-manifest.mjs` — the source of truth for what ships.
2. `"version"` in the root `package.json` — **must be kept in sync by hand.** No generator writes it. The root package.json stays `private: true` forever; only the generated `dist/package.json` is published, but the parity check still gates every build.
3. `package-lock.json` — npm records the version there too. Refresh it with `npm install --package-lock-only` and commit it with the bump; a stale lockfile dirties every later plain `npm install` (the 0.3.0 bump shipped without this and broke the worktree-based skills' cleanup).

`scripts/validate-package-exports.mjs` fails the build when any of the three disagree.

**Two hand-maintained release-history mentions ride along with the bump** — nothing generates or validates either, so this step is the only thing keeping them true: the release-history sentence in `CLAUDE.md` (CI & Local Verify section) and the history comment at the top of `.github/workflows/release.yml`. Add the new version, date, and a short what-shipped clause to both in the bump commit.

Then:

```bash
npm run validate-registry
```

This re-runs the three-way version parity check and regenerates the derived surfaces — and two generated trees stamp `PACKAGE_VERSION` into their output, so the bump rewrites every per-component markdown page under `website/public/components/` and the consumer agent skill under `website/public/skill/robr0-design-system/`. The diff is large by design. Commit all of it together as the bump commit (`chore(release): <version>`) and push — a bump pushed without the restamped files fails CI's drift guard (that exact split produced the 0.15.0 cleanup commit), and the commit you push here is the commit that will be published and tagged.

### 4. Dry run — never skip this

```bash
gh workflow run release.yml -f dry_run=true
```

Watch it to completion — but confirm you are watching the run you just dispatched, not the previous one. Registration lags the dispatch by a few seconds, so `--limit 1` immediately after `gh workflow run` can return the prior run (at step 5 that prior run is the green dry run, and watching it reads as a successful publish):

```bash
sleep 10
gh run list --workflow=release.yml --limit 3 --json databaseId,createdAt,displayTitle   # newest first — check createdAt is after your dispatch
gh run watch <the-new-databaseId> --exit-status
```

The dry run does everything except upload: builds `dist/`, packs the tarball, installs it into a scratch Vite + React app and **builds that app without recharts installed** (the optional-peer path — the regression this catches), then prints the publish preview. It needs no npm token, so it is free to run as often as you like. Read the preview's file count and package size and sanity-check them against the previous release; a sudden jump means something got swept into the tarball. Expect `LICENSE`, `README.md` and `bin/robr0-design-system.mjs` (the init bin, origin-stamped and executable) alongside the build output; anything else new is not deliberate.

### 5. Publish

```bash
gh workflow run release.yml -f dry_run=false
```

Watch it the same way (the same watch-the-right-run caution applies, and matters more here). The publish step runs `npm publish --access public --provenance --loglevel verbose` from `dist/` — the verbose flag is deliberate, because its log lines are the only visible evidence of the OIDC token exchange the auth guardrails below tell you to look for — and signs a provenance attestation tying the tarball to this repo, commit, and workflow run.

### 6. Verify — and do not panic at a 404

**The registry lags a successful publish by several minutes.** A `404` from `npm view` right after a green workflow is propagation, not failure. Confirm the workflow's publish step actually ran (`gh run view <id> --json jobs`) and look for `+ @robr0/design-system@<version>` in its log — if that line is there, it published. **Never re-run the workflow on a 404**; the version is already consumed and the rerun will fail with `EPUBLISHCONFLICT`.

Once it propagates, confirm the registry serves the new version:

```bash
npm view @robr0/design-system version --prefer-online
```

The real consumer-shaped check already ran before publish: `scripts/smoke-consumer.mjs` packs the tarball into a scratch Vite app and builds it (bare `node` can't import the barrel because components import their own CSS; that needs a bundler). To repeat it against the *published* artifact rather than the local tarball, scaffold a scratch Vite app, `npm install @robr0/design-system@<version>`, import the barrel plus `tokens/tokens.css`, and run its build.

### 7. Tag the published commit

Tag the commit that was **published**, not necessarily current HEAD — the provenance attestation names that commit, so the tag, attestation, and tarball should all agree:

```bash
git tag -a v<version> <published-sha> -m "v<version> — <one-line summary>"
git push origin v<version>
gh release create v<version> --verify-tag --title "v<version> — <short title>" --notes-file <notes>
```

Write the notes for a consumer, not a maintainer: what's new, anything breaking with the migration step spelled out, and the install snippet. The previous release is the format reference; the prose follows `content-design.md`.

### 8. Report

Version published, the npm URL, the tagged commit, the release URL, and anything a consumer must do to upgrade.

## Guardrails

- **Never** publish from a local machine (`npm publish` by hand) — releases go through the workflow so every release is provenance-signed and smoke-tested
- **Never** re-run the publish workflow after a successful publish, even if the registry 404s
- The version's three homes must agree — step 3 above is the procedure and `CLAUDE.md`'s Release section owns the fact. Never bump `package.json` alone — the manifest is what ships
- Never publish from a dirty tree, an unpushed commit, or a red CI
- **Auth is Trusted Publishing (OIDC) — there is no npm token to expire or rotate.** If the publish step fails to authenticate, the cause is one of: `actions/setup-node` was given a **`registry-url:`** (see below); the `id-token: write` permission was dropped from `release.yml`; the workflow file was **renamed or moved** (the trusted-publisher registration on npmjs.com is keyed to the filename `release.yml`); the npm CLI on the runner is older than 11.5.1; or the registration itself was removed. Rob owns anything that has to change on npmjs.com.
- **A `404` on `PUT` during publish is an AUTH failure, not a missing package.** npm returns 404 instead of 403 so it doesn't leak whether a package exists — the message even says "or you do not have permission to access it". Do not go hunting for a missing package; check the auth path.
- **Never add `registry-url:` to `actions/setup-node` in this workflow.** It writes an `.npmrc` with `_authToken=${NODE_AUTH_TOKEN}` *and* exports a placeholder `NODE_AUTH_TOKEN`, so npm thinks it is already authenticated, skips the OIDC exchange entirely, and gets rejected. The tell in the log: no mention of `oidc`/`trusted` anywhere, and `NODE_AUTH_TOKEN: XXXXX-XXXXX-XXXXX-XXXXX` in a step's env block. Provenance signing still succeeds in this state — that is GitHub→Sigstore and proves nothing about npm accepting the token.
- **A dry run never authenticates**, so it cannot prove OIDC is working — it exercises the build and the tarball, nothing else. After any change to `release.yml`'s auth, permissions, or filename, the only real proof is a genuine publish. Treat that as a reason to make the *next* release a small patch, not a reason to skip the dry run.
- The npm README is the package README — if the release changes install or usage, fix `README.md` in the same release, since it ships inside the tarball. Fix `src/stories/Configure.mdx` too: it carries the same install snippet on the Storybook landing page, deploys separately, and is where people evaluating a component arrive. `generate-readme-content.mjs` enforces that both mention the package name, but it cannot tell whether the *snippet* is still correct
