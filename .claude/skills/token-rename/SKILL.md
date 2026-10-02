---
name: token-rename
description: Rename or renumber a token family across every consumer, mirror, and doc in one gated pass. Use when asked to rename tokens, renumber a scale, or change a token naming convention.
icon: sync_alt
displayDescription: "Carries a token rename through the whole system in one pass: a codemod over every stylesheet and component, the guarded hand mirrors, the validator regexes that parse the old shape, the foundations pages, the Storybook token docs, and design.md. The mirror guards turn the sweep into a build-error checklist, so a consumer the codemod missed fails the build instead of shipping half-renamed."
invoke: ["rename a token family","renumber the [category] scale","token rename","change token naming"]
---

# token-rename

Rename a token family so every consumer, mirror, and doc moves in the same commit — the build, not memory, finds the stragglers.

## When invoked

Use this skill when a token family changes its names rather than its values — a renumbered scale, a renamed suffix grammar, a prefix change. For adding a token, use `new-token`; for changing what a token resolves to, no rename machinery is needed.

## The governing idea

A rename touches thousands of `var()` sites, but almost none of them need judgment — the work is one codemod plus a build-error-driven checklist. `scripts/validate-theme-mirrors.mjs` and `scripts/validate-token-references.mjs` hold every hand mirror of token data to the CSS, and `scripts/validate-token-usage.mjs` fails on any reference nothing defines, so after the mechanical sweep the chain enumerates exactly what remains. **Timing matters more than mechanics**: renames on the published token surface are breaking changes for consumers, so batch them and land them before a release, never dribbled across versions.

## Instructions

### 1. Write the mapping first

Old name to new name, one line per token, primitives and semantics both. The mapping is the review artifact — get it agreed before touching a file. If the rename introduces a new **prefix**, add it to `CATEGORY_PREFIXES` in `scripts/generate-token-registry.mjs` first (generation fails until the category has a home) and give the category its place wherever counts display.

### 2. Codemod the mechanical layer

A scripted replace over the token files and every consumer: `src/**` and `website/src/**` CSS and TSX. Order the replacements longest-name-first so a shorter name never clobbers a longer one's substring, and match whole custom-property names (the name followed by a non-name character), never bare substrings. Run it, then `git diff --stat` — the shape of the diff should match the mapping's reach, and a file count far off the expectation means the pattern over- or under-matched.

### 3. Let the chain enumerate the rest

```bash
npm run validate-registry
```

Expect failures — they are the checklist, not a problem. The usual remainder, each named by its validator:

- **Hand mirrors** — the playground's ramp/step tables, `presets.ts` overrides, InspectMode's prefix strings (`validate-theme-mirrors.mjs` names each), and the action-family token names in `scripts/validate-theme-presets.mjs` (`ACTION_PAIRINGS`, the required action roles, any `SANCTIONED_AA_GAPS` keys), which that script fails on by name.
- **Validator parsers** — a renumbering can break the regexes that parse the old shape (step patterns, label parsers). Fixing a parser to accept the new grammar is expected; weakening what it asserts is not.
- **design.md** — every token name it mentions is held to the registry, so stale prose fails by name.
- **Docs and doc pages** — the foundations pages' swatch rows and `src/stories/Tokens.stories.tsx` carry names in data arrays the mirrors guard; page prose that *describes* the old grammar (a "sizes run xs to xl" sentence) is yours to catch by reading, since no validator parses prose meaning.

Repeat codemod-then-chain until green, then `npm run verify` — the story tests and built-HTML checks catch a renamed token that a runtime path assembles dynamically.

### 4. Land it whole

One category per commit, verify green between categories, and note the rename in the entry the release skill writes when the version ships — a renamed published token is exactly what a consumer's changelog exists for.

## Guardrails

- Never weaken a validator to get past a rename failure — fix the data or the parser's grammar, keeping what it asserts
- Never leave a category half-renamed across commits; a commit is a complete category or it is not pushed
- Old names never linger as aliases — the token files carry one name per token, and consumers get the rename through a release note, not a shim
