---
name: new-validator
description: Author a new validator or generator script and chain it into the validate-registry build chain. Use when asked to add a validator, add a generator, build-enforce an invariant, or wire a new check into the build.
icon: rule
displayDescription: "Walks a new validator or generator script through the ritual the existing scripts follow: the doc block that records what it guards and why it runs where it runs, the CRLF and path conventions that keep Windows checkouts green, and the regenerate-and-byte-compare pattern for generated surfaces. Ends with the wiring: the validate-registry chain, the website's subset, and the closing CLAUDE.md entry."
invoke: ["add a validator","new validator script","add a generator","build-enforce this","chain a script into validate-registry"]
---

# new-validator

Author a new script under `scripts/` — a validator that fails the build on a broken invariant, or a generator that owns a derived surface — and wire it in so the invariant can never drift silently again.

## When invoked

Use this skill when asked to add a validator or generator, to build-enforce a rule that is currently only prose, or to give a new registry or generated surface its guard — phrases like "add a validator for X", "make the build catch this", "generate this file from the registry".

## Instructions

CLAUDE.md's **Registries** section is the philosophy: every displayed fact has one authoritative home, and a validator is how a home stays authoritative. Read the section first, then skim one reference of each shape before writing a line — `scripts/validate-doc-refs.mjs` for a standalone validator, the `scripts/generate-component-md.mjs` + `scripts/validate-component-md.mjs` pair for a generated surface, and `scripts/validate-rendered-spacing.mjs` for a built-HTML check.

1. **Decide the shape.** A *validator* checks an invariant and fails the build; a *generator* owns a derived file and gets a companion validator that holds disk to source. If the fact being guarded is countable or displayed, it probably wants a registry + generator + validator, not a lone check — CLAUDE.md's Registries intro owns that call.

2. **Decide where it runs.** Three slots exist, and the source of the data decides:
   - **The `validate-registry` chain** (the entry in the root `package.json` is the authoritative list): for anything that reads source files, registries, or generated data. It runs before every build via `prebuild`/`prestorybook`/`prebuild-storybook`, so nothing here may depend on build output.
   - **The post-website-build slot** in `verify` (root `package.json`) and CI's website job (`.github/workflows/ci.yml`): for checks that need the finished build. The tail of the `verify` entry is the authoritative list of residents; each one's doc block argues why source-level checking would over- or under-report, and a new arrival owes the same argument. The slot has two sub-shapes: validators that read the prerendered HTML from disk, and served-site checks that start a real server (and, for the smokes, a real browser) — the latter share `scripts/served-site.mjs` for the server lifecycle and the registry-derived route sample, so a new served-site check starts there rather than rolling its own.
   - **Run-on-demand, in no chain**: a script whose source is the network or a running server never joins the build — it is invoked by hand (or by a loop skill), commits its output, and records the exclusion with a written reason in its own doc block. `scripts/sync-worldmap-land.mjs` and `scripts/check-external-links.mjs` are the reference set. A generator in this class still gets a header in its output pointing back at the script, but no regenerate-and-byte-compare companion — CI cannot re-fetch the network, so step 7's determinism rules apply to chain generators only.

3. **Write the doc block.** Every script opens with `#!/usr/bin/env node` and a `/** ... */` header that states, in this order: the filename; what it guards and why the failure matters (numbered checks if there are several); and why it runs where it runs. The doc block is the script's authoritative record — sanctioned exceptions live in it (or in a named constant beside it) with a written reason a stranger could audit, the way `CONDENSED_ROUTES` in `validate-corpus-coverage.mjs` does it. Never enumerate facts another file owns; point at the owner.

4. **Follow the output conventions.** Collect failures into an `errors` array rather than exiting on the first; on failure print a `✗ <what> validation failed:` header, each error on its own line, and `process.exit(1)`; on success print one `✓` line with a count. Every error message names the fix — for a stale generated file, the exact regeneration command.

5. **Normalize CRLF.** Every text file the script reads for parsing, matching, or byte-comparing gets `.replace(/\r\n/g, '\n')` immediately after `readFileSync`, with the comment:

   ```js
   // Normalize CRLF so Windows checkouts validate identically to CI.
   const read = (path) => readFileSync(path, 'utf8').replace(/\r\n/g, '\n');
   ```

   This is the convention most often missed: a script that passes on macOS and CI but fails every Windows checkout (`core.autocrlf=true`) has been fixed repeatedly in this repo — `git log --grep=CRLF` finds the history. Normalize on the *read*, once, not scattered through the checks.

6. **Keep paths portable.** Derive the repo root from the script's own location — `join(dirname(fileURLToPath(import.meta.url)), '..')` — never from `process.cwd()` assumptions or a machine-local path. Build paths with `join()`, and before comparing a path to another string (a glob, a registry slug, a relative display path) normalize separators the way `scripts/component-docgen.mjs` does: `path.replaceAll('\\', '/')`. On Windows, `join()` hands back backslashes; a comparison that assumes `/` fails only there.

   The same portability discipline covers child processes: a `node_modules/.bin` shim cannot be `spawnSync`ed on Windows, and `spawn('npm', …)` fails there without a shell. A script that shells out resolves the tool's real bin entry and runs it under `process.execPath` instead — `scripts/validate-package-publish.mjs` and `scripts/served-site.mjs` are the two references (the latter also owns the Windows `taskkill` stop).

7. **For a generator, use the regenerate-and-byte-compare pattern.** The generator exports its assemble function and `outputPath` (or `outputDir`), and guards its write behind `const isMain = process.argv[1] === fileURLToPath(import.meta.url)` so the validator can import it without side effects. It must be deterministic — no network, no timestamps, nothing not already derivable from the sources — or the byte-compare flaps. The companion validator imports the assemble function, regenerates in memory, and compares against the CRLF-normalized disk read; for a multi-file surface it also checks the reverse direction, so an orphan on disk fails too. `validate-site-corpus.mjs` (single file, plus content screens) and `validate-component-md.mjs` (folder, both directions) are the two references.

8. **Wire it in.**
   - Add it to the `validate-registry` entry in the root `package.json` — generators run first, validators after, so keep a generator ahead of everything that imports it.
   - If it is website-relevant, add it to the website's own chains in `website/package.json` (that file is authoritative for the subset — a library-only check stays out), split by kind: a generator goes in both `predev` and `prebuild`, a validator in `prebuild` only. `predev` exists to start dev from fresh data, and a validator there would fail `next dev` on exactly the stale state the generators are about to fix.
   - A post-build check goes at the end of `verify` in the root `package.json` **and** into CI's website job in the same change — CLAUDE.md's CI & Local Verify section owns the keep-in-sync rule.

9. **Close the loop in the docs.** A script guarding a new countable collection gets a row in CLAUDE.md's Registries table (registry, count export, validator — follow the existing rows); a script extending an existing surface amends that surface's row; a standalone invariant gets a sentence in the CLAUDE.md section that owns its subject. `scripts/validate-doc-refs.mjs` will hold every path and npm script the new prose names to reality.

10. **Verify.** Run the new script directly first (`node scripts/<name>.mjs`), break the invariant on purpose to see it fail with a useful message, restore, then `npm run validate-registry` end to end. A post-build check needs `npm run verify` instead, since nothing shorter builds the HTML it reads.

## Guardrails

- Never hand-edit a generated file to make a validator pass — regenerate it, and commit the regenerated content with the change (CI's drift guard diffs after the generators run)
- No counts, no hand-copied script lists, no machine-local paths in the doc block or the docs — point at the authoritative home
- A check that reads build output never goes in the `validate-registry` chain; it runs before any HTML exists
- A validator with no failure mode is decoration — if you cannot make it fail by breaking the invariant, it is not guarding it
