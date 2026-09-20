---
name: new-token
description: Add a new design token (or token family) to the system, with every home it needs to reach. Use when asked to add a token, a new colour or motion token, or a token category.
icon: palette
displayDescription: "Walks a new design token through every surface it must reach: the token file its category lives in (both theme files for colour), the generated registry, the foundations pages, the Storybook token docs, and design.md. Covers the extra packaging steps a TypeScript-side token needs, and the validators that hold each home in sync."
invoke: ["add a token","add a [name] token","new token family","add a colour token"]
---

# new-token

Add a design token so it exists in every home the system requires — a token that exists only in CSS is incomplete.

## When invoked

Use this skill when asked to add or change a design token or token family — phrases like "add a token", "add a `--color-…` token", "new motion duration", "extend the chart ramp".

## Instructions

CLAUDE.md's **How to Add a New Token** section is the authoritative checklist — read it first and follow its numbered steps. This skill adds the operational detail the checklist compresses.

1. **Decide the tier.** A primitive (`--primitive-*` in `tokens-primitives.css`) is a raw value; a semantic token is a role. New roles reference existing primitives via `var()` — add a primitive first only when no suitable one exists. Semantic colour tokens must chain to a primitive or another `--color-*` token; `scripts/validate-token-references.mjs` fails the build on a literal.

2. **Put it in the file its category lives in** — `SEMANTIC_FILES` in `scripts/generate-token-registry.mjs` is the authoritative list of what the registry reads. Colour: both `src/tokens/tokens-light.css` and `src/tokens/tokens-dark.css`, always; the registry validator enforces light/dark parity for colour, so identical values in both is fine and a missing side is not. Shadow: both files too — the elevation tokens carry different values per theme — but parity is build-enforced for **colour only**, so a shadow token added to the light file alone ships silently unchanged in dark mode; check `tokens-dark.css` yourself. Spacing, radius, border, icon size: `tokens-light.css` alone. Typography: `tokens-typography.css`. Motion: `tokens-motion.css`. Nothing but colour and shadow is theme-split; a typography or spacing token copied into `tokens-dark.css` registers from the light file anyway and leaves a dead duplicate no validator reports.

3. **Check the prefix.** If the token starts a *new* prefix, generation fails until the prefix is added to `CATEGORY_PREFIXES` in `scripts/generate-token-registry.mjs` — deliberately, so a new category gets a display home at the same time. An existing prefix (`--color-`, `--motion-`, `--radius-`, …) needs nothing here; the registry regenerates on every build.

4. **Give it its documentation homes** (the build enforces the first, a drift audit catches the rest):
   - Colour tokens need a swatch on `/foundations/colour-mode` — build-enforced in both directions by `scripts/validate-website-surfaces.mjs`. Other categories go on their matching foundations page (CLAUDE.md's checklist maps category → page).
   - The matching Storybook doc: `src/stories/Tokens.stories.tsx` for colour, status, chart, elevation, spacing and motion; `src/stories/Typography.stories.tsx` for a type style (its Body and All Styles stories list every tier).
   - A sentence in `design.md` recording the role and per-theme values, in the section that owns the token's subject.

5. **A TypeScript-side token** (a shared constant, like the JS timing constants in `src/tokens/motion.ts`) has packaging steps CSS tokens do not:
   - A subpath entry in `SUBPATHS` in `scripts/package-manifest.mjs`, mirrored by hand into the root `package.json` `exports` (`scripts/validate-package-exports.mjs` fails the build if they drift), plus a matching entry in `vite.lib.config.ts`.
   - Or, if it is internal-only, an entry in `INTERNAL_MODULES` in `scripts/validate-package-exports.mjs` with the reason.
   - If component code mirrors the token's value outside CSS (a `var()` fallback, a serialized config), route the mirror through a validator so it cannot drift — the chart palette guard in `scripts/validate-token-references.mjs` is the pattern to copy.

6. **Verify**: `npm run validate-registry` must pass end to end (it regenerates `src/tokens/registry.json` and re-checks every home), then `npm run build` for the type-check. Displayed counts update themselves — never hardcode one.

## Guardrails

- Never hand-edit `src/tokens/registry.json` — it regenerates from the CSS
- Never skip a tier: components reference semantic tokens, semantic tokens reference primitives
- A token with no consumer is not a token — if nothing will reference it, don't add it
