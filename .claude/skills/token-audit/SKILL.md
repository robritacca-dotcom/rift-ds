---
name: token-audit
description: Scan CSS files (and component TS/TSX colour literals) for hardcoded values that should use design tokens, and report violations — including near-twins of existing tokens. Use when asked to check for hardcoded values, raw colours or pixel values, or audit token usage and design system compliance.
icon: manage_search
displayDescription: "Scans CSS files for hardcoded hex colours, raw rgb() values, pixel values, and transition timings that should reference design tokens, plus component TS/TSX files for colour-shaped literals. Flags near-twins of existing tokens as their own finding class. Reports file, line number, offending value, and recommended token replacement. Accepts a single component, all-components, or website as scope."
invoke: ["check for hardcoded values","token audit","audit [component] CSS","are there raw colours"]
---

# token-audit

Scan CSS files for hardcoded values that should use design tokens, and report violations.

## When invoked

Use this skill when asked to check for hardcoded values, audit token usage, find raw colours or pixel values, or check design system compliance — phrases like "check for hardcoded values", "token audit", "are there any raw colours", "audit [component] CSS".

## What is already automated

`scripts/validate-token-usage.mjs` already fails the build on any `var(--…)` reference to a custom property nothing defines, so unresolvable-token references need no hand-check; this skill hunts for raw values that never reference a token at all.

## Instructions

1. **Determine scope.** Accept one of:
   - A specific component name (e.g. `Avatar`) → scans `src/components/Avatar/Avatar.css`
   - `all-components` → scans all `src/components/**/*.css`
   - `website` → scans all `website/src/**/*.css` (which includes the `.module.css` files)
   - A specific file path

   **The site background is outside every CSS scope, and deliberately so.** Its blob colours are token *names* in `website/src/data/shader-background.json`, resolved at runtime and handed to the GPU — no CSS file names them, so a `website` scan will pass without ever looking at what actually picks the site-wide background palette. Do not hand-audit it: `scripts/validate-shader-background.mjs` already fails the build if any blob references a token that is not in the registry, which is a stronger guarantee than this skill can offer. Say so in the report rather than leaving a reader to assume the surface went unexamined.

   **The chart series palette is the second out-of-CSS surface.** `src/components/Chart/palette.ts` emits `var(--color-chart-series-N, <light-theme hex>)` references that SVG paint resolves live — so charts follow a theme switch — and the literal hexes are cascade fallbacks, deliberate and not violations. Do not hand-audit those either: `scripts/validate-token-references.mjs` fails the build if a fallback stops matching what its token resolves to. Nor is the chart palette the only mirror that script guards — its mirror checks are the authoritative list of out-of-CSS token surfaces (the playground's neutral table and the share card's blob hexes ride there too), and a new mirror lands there, not here. Mention the shader background and that script's mirrors in the report the same way, so no reader assumes those surfaces went unexamined.

2. **Read the token files in `src/tokens/` first** to know what tokens are available and what raw values they map to — primitives (raw hex/px), the light *and* dark semantic files, typography (font size, weight, line-height), and motion (`tokens-motion.css` — durations and easings; its JS-side counterpart, the shared constants in `src/tokens/motion.ts`, is outside this skill's CSS scope). The fastest authoritative index is the **generated** `src/tokens/registry.json` — every semantic token with its category and per-theme values, machine-readable; read it instead of parsing the CSS by hand (never edit it — it regenerates from the CSS).

3. **Scan each CSS file** in scope for violations:

   **Flag as violations:**
   - Hardcoded hex colours: `#rrggbb`, `#rgb`, `#rrggbbaa`
   - Raw `rgb()` or `rgba()` calls that could map to a semantic colour token
   - Pixel values for `padding`, `margin`, `gap`, `border-radius`, `font-size`, `line-height` that correspond to a known token (cross-reference the primitives file)
   - Hardcoded font weights (e.g. `font-weight: 600`) where a typography token exists
   - Icon sizing done wrong: `font-size` set directly on a Material Symbols icon, or raw pixel icon dimensions matching an `--icon-size-*` step — the fix is `--icon-size: var(--icon-size-sm|md|lg|xl)` (the icon font reads that one property for size, width, and height; the scale's values live in the token files)
   - Hardcoded `transition`/`animation` durations and easings (`0.2s`, `ease`, literal cubic-beziers) where a `--motion-duration-*`/`--motion-ease-*` token matches — component and website CSS is fully migrated, so any literal timing is a violation unless a directive sanctions it

   **Do NOT flag:**
   - Files within `src/tokens/` themselves (these define the tokens)
   - `0px`, `0`, `100%`, `50%` — these are structural, not token-replaceable
   - **Any value sanctioned by a `ds-allow` directive** — the one and only signal that an off-token value is deliberate. `/* ds-allow(<category>): <reason> */` inside a comment covers the declaration/rule/section it sits at; `/* ds-allow-file(<category>): <reason> */` in a file header covers the whole file for that category. Enumerate the current sanctions with `grep -rn "ds-allow" src website/src --include='*.css'` (the same scope `validate-css-directives.mjs` scans); the category set and grammar are build-enforced by `scripts/validate-css-directives.mjs`. This skill deliberately names no components: an off-token value with **no** directive is a violation, and the fix is either a token or a new directive at the site (plus a design.md note) — never an exception added to this skill
   - `1px` border widths — acceptable
   - Values inside `calc()` that are genuine arithmetic, not replaceable with a single token
   - CSS variable declarations themselves (lines starting with `--`)

   **Hunt near-twins, not just strays.** A raw value that is *almost* an existing token is a typo recorded as a decision, and the legality check alone never sees it — it can even sit under a `ds-allow`. Compare every collected raw value against the token registry's resolved values **and against the other raw values in scope**: a colour within a few points per channel of a token (including cross-notation twins — a hex, an `hsl()`, and an `rgb()` of the same colour are one value written three ways), or a spacing value one pixel off a neighbouring scale step. Report a near-twin as its own finding class, distinct from a plain stray, naming what it is a twin of — `path/to/GadgetTile.css:17 — #0E6D8E → near-twin of var(--color-action-primary-bg), probably a mistyped copy` (a fictional example by design — `GadgetTile` is not a real component). A twin of a token is repaired by pointing at the token; a twin pair of raw values collapses into whichever one is sanctioned.

   **Component TS/TSX files are in scope for colour-shaped literals.** The CSS glob is not the whole surface: hex, `rgb()`/`rgba()`, and `hsl()` literals also live in component `.ts`/`.tsx` files, where no `ds-allow` mechanism exists. Scan them too, and judge each hit against the mirror checks in `scripts/validate-token-references.mjs` (the authoritative list of sanctioned out-of-CSS token surfaces — it holds the chart palette and every `getCSSVar` fallback to the tokens). A literal outside those mirrors is a finding to judge, not skip — deliberately theme-frozen fixture data can be legitimate, but a near-twin of a token in it is still a typo.

4. **For each violation**, output:
   - File path (relative to repo root)
   - Line number
   - The offending value
   - Recommended token replacement (if a clear match exists in the token files)

   Format: `path/to/file.css:42 — #0E6E8F → var(--color-action-primary-bg)`

5. **Summarise** at the end:
   - `X violation(s) found`
   - `Y acceptable raw value(s) noted (documented exceptions)`
   - If zero violations: "No token violations found. CSS is token-compliant."
