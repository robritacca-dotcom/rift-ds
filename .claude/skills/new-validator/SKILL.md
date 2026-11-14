---
name: new-validator
description: Author a new validator or generator script and chain it into the validate-registry build chain. Use when asked to add a validator, add a generator, build-enforce an invariant, or wire a new check into the build.
icon: rule
displayDescription: "Walks a new validator or generator script through the ritual the existing scripts follow: the doc block that records what it guards and why it runs where it runs, the CRLF and path conventions that keep Windows checkouts green, and the surface a generator exports so one check holds its files fresh. Ends with the wiring: the row in the chain manifest, its site mark, and the closing CLAUDE.md entry."
invoke: ["add a validator","new validator script","add a generator","build-enforce this","chain a script into validate-registry"]
---

# new-validator

Author a new script under `scripts/` — a validator that fails the build on a broken invariant, or a generator that owns a derived surface — and wire it in so the invariant can never drift silently again.

## When invoked

Use this skill when asked to add a validator or generator, to build-enforce a rule that is currently only prose, or to give a new registry or generated surface its guard — phrases like "add a validator for X", "make the build catch this", "generate this file from the registry".

## Instructions

CLAUDE.md's **Registries** section is the philosophy: every displayed fact has one authoritative home, and a validator is how a home stays authoritative. Read the section first, then skim one reference of each shape before writing a line — `scripts/validate-doc-refs.mjs` for a standalone validator, `scripts/generate-component-md.mjs` with its `surface()` for a generated surface, and `scripts/validate-rendered-spacing.mjs` for a built-HTML check.

1. **Decide the shape.** A *validator* checks an invariant and fails the build; a *generator* owns a derived file and exports the surface that the one freshness check holds the disk to. If the fact being guarded is countable or displayed, it probably wants a registry + generator + validator, not a lone check — CLAUDE.md's Registries intro owns that call. A generated JSON surface in a shape this repo defines also wants a hand-written JSON Schema beside it and a row in `BINDINGS` in `scripts/validate-json-schemas.mjs`, which proves every document against its schema on each build (the component schemas and `src/tokens/values.json` are the pattern); a surface in a standard format (the DTCG token files, the shadcn registry) is held to that format's own shape by its generator's validator instead.

2. **Decide where it runs.** Four slots exist, and the source of the data decides:
   - **The `validate-registry` chain** (`CHAIN` in `scripts/chain.mjs` is the authoritative list, run by `scripts/run-chain.mjs`): for anything that reads source files, registries, or generated data. It runs before every build via `prebuild`/`prestorybook`/`prebuild-storybook`, so nothing here may depend on build output.
   - **The post-website-build slot** in `verify` (root `package.json`) and CI's website job (`.github/workflows/ci.yml`): for checks that need the finished build. The tail of the `verify` entry is the authoritative list of residents; each one's doc block argues why source-level checking would over- or under-report, and a new arrival owes the same argument. The slot has two sub-shapes: validators that read the prerendered HTML from disk, and served-site checks that start a real server (and, for the smokes, a real browser) — the latter share `scripts/served-site.mjs` for the server lifecycle and the registry-derived route sample, so a new served-site check starts there rather than rolling its own.
   - **The git-history slot** in `verify` and CI's library job, never in `validate-registry`: for a check whose baseline is an earlier revision, which needs the repository's tags. `scripts/validate-api-compat.mjs` is the one resident: Vercel's tag-less shallow clone runs the registry chain before every deploy, so a missing baseline there must not block the site, and the script warns rather than fails outside CI (where `fetch-depth: 0` makes a missing tag a real failure, so the gate cannot pass vacuously).
   - **Run-on-demand, in no chain**: a script whose source is the network or a running server never joins the build — it is invoked by hand (or by a loop skill), commits its output, and records the exclusion with a written reason in its own doc block. `scripts/sync-worldmap-land.mjs` and `scripts/check-external-links.mjs` are the reference set. A generator in this class still gets a header in its output pointing back at the script, but no `surface` for the freshness check — CI cannot re-fetch the network, so step 7's determinism rules apply to chain generators only.

3. **Write the doc block.** Every script opens with `#!/usr/bin/env node` and a `/** ... */` header that states, in this order: the filename; what it guards and why the failure matters (numbered checks if there are several); and why it runs where it runs. The doc block is the script's authoritative record — sanctioned exceptions live in it (or in a named constant beside it) with a written reason a stranger could audit, the way `CONDENSED_ROUTES` in `validate-corpus-coverage.mjs` does it. Never enumerate facts another file owns; point at the owner.

4. **Follow the output conventions.** Collect failures into an `errors` array rather than stopping at the first, then end with `finish(header, errors, okLine)` from `scripts/lib/report.mjs`: on failure it prints the `✗ <what> validation failed:` header and each error on its own line and fails the step; on success it prints the one `✓` line with a count. Never call `process.exit` in a chain script: the runner imports validators into one process, so the only ways out are `finish` and `failStep`. Every error message names the fix. For a stale generated file that is the exact regeneration command.

5. **Normalize CRLF.** Every text file the script reads for parsing, matching, or byte-comparing goes through `read` (or `readRel`, `readJson`) from `scripts/lib/fs.mjs`, which normalizes CRLF so Windows checkouts validate identically to CI. Never call `readFileSync` on a text file directly.

   This is the convention most often missed: a script that passes on macOS and CI but fails every Windows checkout (`core.autocrlf=true`) has been fixed repeatedly in this repo — `git log --grep=CRLF` finds the history. Normalize on the *read*, once, not scattered through the checks.

6. **Keep paths portable.** Take the repo root from `scripts/lib/fs.mjs` (`repoRoot`, `fromRoot`), which derives it from the script's own location, never from `process.cwd()` assumptions or a machine-local path. Walk a folder with its `walk`, and before comparing a path to another string (a glob, a registry slug, a relative display path) normalize separators with its `display`. On Windows, `join()` hands back backslashes; a comparison that assumes `/` fails only there.

   The same portability discipline covers child processes: a `node_modules/.bin` shim cannot be `spawnSync`ed on Windows, and `spawn('npm', …)` fails there without a shell. A script that shells out resolves the tool's real bin entry and runs it under `process.execPath` instead — `scripts/validate-package-publish.mjs` and `scripts/served-site.mjs` are the two references (the latter also owns the Windows `taskkill` stop).

7. **For a generator, export its surface.** The generator exports its assemble function, does its writing in an exported `async function main()`, and ends with `if (isEntryScript(import.meta.url)) await main();` (from `scripts/lib/report.mjs`), so the chain runner can call `main` and a validator can import the builders without side effects. It also exports `surface()`, which returns what it writes: the regeneration command, each file with its content, and any folder it owns (`scripts/lib/fresh.mjs` documents the shape). `scripts/validate-generated-files.mjs` holds the disk to every surface in both directions, so a generator needs no freshness validator of its own, and one without a `surface` fails that check. It must be deterministic (no network, no timestamps, nothing not already derivable from the sources), or the comparison flaps. A build that is expensive and pure is wrapped in `memo` from `scripts/lib/memo.mjs`, so every step in the chain shares it. A companion validator is only for what the surface must be beyond fresh (no leaked details, a valid shape): `scripts/validate-site-search.mjs` and `scripts/validate-token-values.mjs` are the references.

8. **Wire it in.**
   - Add a row to `CHAIN` in `scripts/chain.mjs`: generators run first, validators after, so keep a generator ahead of everything that imports it. Add its one line to `website/src/data/quality-gate.json` in the same change, or the build fails.
   - If it is website-relevant, give the row its site mark (a library-only check takes none): `'dev'` for a generator, which then runs before `next dev` and before the website build, and `'build'` for a validator, which runs before the build only. `predev` exists to start dev from fresh data, and a validator there would fail `next dev` on exactly the stale state the generators are about to fix.
   - A post-build check goes at the end of `verify` in the root `package.json` **and** into CI's website job in the same change — CLAUDE.md's CI & Local Verify section owns the keep-in-sync rule.

9. **Close the loop in the docs.** A script guarding a new countable collection gets a one-line row in CLAUDE.md's Registries table (registry, accessor, validator — follow the existing rows), with the mechanism detail in the script's own doc block rather than in CLAUDE.md; a script extending an existing surface amends that surface's row; a standalone invariant gets a sentence in the CLAUDE.md section that owns its subject. `scripts/validate-doc-refs.mjs` will hold every path and npm script the new prose names to reality.

10. **Verify.** Run the new script directly first (`node scripts/<name>.mjs`), break the invariant on purpose to see it fail with a useful message, and keep that break: add it to `scripts/fixtures/chain-plants.json` as a plant (one per check), so `node scripts/chain-selftest.mjs <name>` proves the check can still fail after any later refactor. Restore, then `npm run validate-registry` end to end. A post-build check needs `npm run verify` instead, since nothing shorter builds the HTML it reads.

## Guardrails

- Never hand-edit a generated file to make a validator pass — regenerate it, and commit the regenerated content with the change (CI's drift guard diffs after the generators run)
- No counts, no hand-copied script lists, no machine-local paths in the doc block or the docs — point at the authoritative home
- A check that reads build output never goes in the `validate-registry` chain; it runs before any HTML exists
- A validator with no failure mode is decoration — if you cannot make it fail by breaking the invariant, it is not guarding it
