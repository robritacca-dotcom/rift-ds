---
name: dependency-advisory
description: "Respond to a dependency security advisory that has turned CI's npm audit step red. Read the advisory, pick the fix route (an in-range bump or a root override), apply it, prove it took with npm ls and a clean high-level audit, run the full verify, then hand off to ship. Use when asked to fix an npm audit failure, patch a vulnerable dependency, or respond to a security advisory. Never pushes or deploys."
icon: shield
invoke: ["fix the audit failure","patch the advisory","/dependency-advisory"]
---

# dependency-advisory

CI's library job runs `npm audit --audit-level=high --omit=dev`, which judges the shipped dependency tree against the registry's advisory feed rather than the code (dev-only tooling is outside the gate; the comment beside that step in `.github/workflows/ci.yml` records why). A new advisory can therefore turn `main` red with no change in the repo, and the response is the same small ritual every time. This skill is that ritual. **It ends with a verified local fix; making it live is `ship`'s job.**

## When invoked

Run when CI's audit step fails, when `npm audit` locally reports a high or critical advisory, or when asked to patch a named vulnerable package. An advisory in dev-only tooling no longer fails CI, so a plain `npm audit` is the only place it shows: it is still worth fixing by the same routes when a fix exists, and worth leaving alone, with a note of why, when none does.

## Scope guardrails (read first)

- **Fix the advisory, nothing else.** No opportunistic upgrades of unrelated packages; a dependency refresh is its own change. A fix that rides along with other work hides the one line a reviewer needs to see.
- **Never `npm audit fix --force`.** It takes semver-major bumps without asking. A fix that needs a major is a decision for the owner, not a flag.
- **Never push, merge, or deploy.** Hand off to `ship` at the end.

## Instructions

### 1. Read the advisory

```bash
npm audit
npm audit --json   # when the human-readable output hides which path pulls the package in
```

For each high or critical finding, note: the vulnerable package, the patched range, whether it is a direct dependency of the root or a workspace or only transitive, and **which parent pins it**. Then read the advisory itself (the GHSA link `npm audit` prints) and check whether the vulnerable code path is one this repo actually reaches; that judgement goes in the commit message, so a reader knows how urgent the fix was. Example (fictional): an advisory against `glob-walker` below 4.2.1, pulled in only through a lint plugin's `^4.1.0` range, so the patched version is already inside the range a parent declares.

### 2. Pick the fix route

In order of preference:

1. **In-range, lockfile only.** The patched version satisfies every range that declares the package, so only `package-lock.json` changes. `npm audit fix` (no `--force`) handles most of these; for a single named package, `npm update <pkg>` in the workspace that declares it does the same. This is the usual case: every advisory fix so far in `git log --oneline -- package-lock.json` took this route.
2. **Bump a direct dependency's range.** The patched version sits outside the declared range of a package this repo depends on directly. Edit that range in the `package.json` that declares it, then install.
3. **Root `overrides`.** A transitive parent pins the vulnerable version exactly and has not released a fix. Add the override to the **root** `package.json`: npm honours `overrides` only in the workspace root, so a copy in `website/package.json` is silently ignored. Record why in the `$comment-overrides` note beside it, including the condition under which the pin can retire, and read that note first, since an existing pin may already be the thing to adjust.

### 3. Apply and refresh the lockfile

Routes 1 and 2 run a real install (`npm audit fix`, `npm update`, or `npm install` after the range edit), which rewrites `package-lock.json` and `node_modules` together. Reach for `npm install --package-lock-only` only when the lockfile alone needs reconciling, for instance after hand-editing an override, and follow it with a plain `npm install` so the tree you test is the tree the lockfile describes. The `release` skill's step 3 has the reverse lesson: a lockfile left out of step with `package.json` dirties every later checkout.

### 4. Prove it took

```bash
npm ls <pkg>                    # every copy in the tree is now the patched version
npm audit --audit-level=high --omit=dev    # exits clean: the exact gate CI runs
```

`npm ls` listing an old copy means some parent still resolves it; go back to step 2. The installed version is the test, not the `invalid` label: a parent that pins the package to one exact version makes `npm ls` print `invalid` beside a copy the override has correctly raised past that pin, and exit non-zero for it. That is the override working. What matters is that every copy shows the patched version and the audit below exits clean.

### 5. Verify

```bash
npm run verify
```

A patched transitive dependency can still change behaviour, and the site build exercises the paths the audit was worried about.

### 6. Commit and hand off

Commit only the manifest and lockfile changes as `chore(deps): <what was bumped> for the <package> advisory`, naming the advisory id, its severity, why it reached this repo, and whether the change was lockfile only. Then hand off: **saying `ship` makes it live.** Report the advisory, the route taken, the `npm ls` and audit results, and the verify result.
