---
name: rename-component
description: Rename a published component behind a deprecated alias, or remove a deprecated one at the owner's call, with every surface that names it moved in the same change. Use when asked to rename a component, retire or delete a component, or give a component a clearer name.
icon: drive_file_rename_outline
displayDescription: "Renames a component the package already publishes without breaking anyone who imports it: the new name takes the folder, the page and every reference, the old name stays importable as a deprecated alias that keeps its base class, and the old page, markdown, schema and registry URLs redirect. Also covers the rarer removal of a deprecated component nothing imports, which the owner must approve. Walks every surface the rename has to reach, including the two the build does not catch on its own."
invoke: ["rename [Name] to [NewName]","give [Name] a clearer name","remove the deprecated [Name] component"]
category: build
metadata:
  internal: true
---

# rename-component

Rename a component, or remove a deprecated one, so that every surface which names it moves together and nothing a consumer wrote stops building. CLAUDE.md's Component Anatomy section owns the rule ("Deprecate, never remove", and its one exception); this skill is the procedure.

## When invoked

Use when asked to rename a component, give one a clearer name, or delete a deprecated one. The examples below rename a fictional `Ribbon` to `Banner`.

**First, decide which of three cases this is**, because each ships differently:

- **Never published.** The old name is not in the last release (check with `git show <latest v* tag>:src/components/registry.json`). Rename it outright: no alias, no sanctioned rows. Its docs page may still have been live on the site, so it still gets redirects.
- **Published, renamed.** The normal case. The old name stays as a deprecated alias, and the change rides in a minor.
- **Published, removed.** Only for a component already deprecated with no importer in the repo or the known consumer apps, and only when the owner says so in this session. Ask first, with the evidence: `git grep` for its imports across this repo and every consumer app the memory names.

## Instructions

### 1. Map every reference

`git grep -l` every spelling (the name, its types, `ds-ribbon`, the `ribbon` slug, the label "Ribbon", any `--ds-ribbon-*` custom property), leaving out the generated files under `website/src/data/` and `website/public/`, which regenerate, and `website/src/data/release-log.json`, which is history.

### 2. Move and rename

- `git mv` the component folder and its files, and the docs page folder under `website/src/app/components/`.
- Replace every spelling across the files the map found, the longest first, so a shorter spelling never rewrites part of a longer one.
- Read what the replacement could not: comment headers in capitals, prose that said "the ribbon" about the component, and internal config values that spell the old name another way (a `"ribbon"` lever value in a lab). The 2026-11-25 renames missed one of these.

### 3. Keep the old name working (published, renamed)

- Write the alias module in the old folder, following `src/components/CircularButton/CircularButton.tsx` or `src/components/NavList/NavList.tsx`: re-export the component and every exported type under the old names, mark each `@deprecated` with a sentence first, and add the old base class beside the new one. Its doc comment says the old modifier and element classes are gone.
- Add a row to `deprecatedAliases` in `src/components/registry.json`, and keep `components` sorted by `name` in plain code-unit order (`scripts/validate-component-registry.mjs` sorts with a bare `.sort()`).
- A documented custom-property hook keeps its old name as a fallback: `var(--ds-banner-width, var(--ds-ribbon-width, <default>))`.

### 4. Redirect the old URLs

Four redirects per old slug in `website/next.config.ts`, with a comment saying why, beside the existing ones: the page, its `.md`, its schema under `/schema/components/` and its registry item under `/r/`.

### 5. Sanction the API gate's view

`node scripts/validate-api-compat.mjs` reads components by name, so a rename shows as a removed component and a removed schema file. Add `SANCTIONED_BREAKS` rows for exactly what it reports, with the version that ships it. `.claude/skills/release/SKILL.md` owns how each kind of row is worded and which release each may ride in.

### 6. The surfaces the build does not catch

- **The docs page's `storybookPath`.** `scripts/validate-storybook-paths.mjs` fails on a stale one, so the chain names it.
- **`website/src/data/figma-nodes.json`**: rename the key and keep the map in order. The Figma frame still carries the old name, so offer the `figma-parity` skill after; Figma work never holds back a ship.
- **design.md**: the renamed spec records the old name, as IconButton's records CircularButton.
- **The release notes**: the release skill's entry names the rename, the alias, and the old modifier and element classes a consumer's CSS loses.

### 7. Regenerate and prove it

The gitignored local labs break the chain in the main checkout, so run it in a clean worktree with the change staged there (a page lister reads `git ls-files`, so unstaged deletions still show). Then `npm run build:lib`, `node scripts/validate-size-budget.mjs` (drop a removed component's row from `website/src/data/component-sizes.json` by hand rather than rewriting every size), `node scripts/validate-api-compat.mjs`, and the stories of the renamed component and everything that composes it. Copy the regenerated files back and commit the rename as one change.

## Guardrails

- Never remove a published component without the owner's explicit yes in this session.
- Never edit a generated file to finish a rename; regenerate it.
- Never rewrite every published size to clear one stale row.
- A rename is one commit: the alias, the redirects, the sanctions and the regenerated surfaces move together, or a deploy in between serves broken links.
