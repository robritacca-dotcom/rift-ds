---
name: rift-style-audit
description: Scan a project's styles for hardcoded values that should use the rift-ds design tokens, and report them, including near-twins of existing tokens. Use when asked to check for hardcoded values, raw colours or pixel values, or to audit token usage and design system compliance.
---

# Auditing styles against rift-ds tokens

Generated from the library's registries at version 1.7.0. You scan the project's own styles for hardcoded values that should reference a design token, and you report them. You do not fix anything unless the user asks. Token names and values are in the `rift-design-system` skill's `references/tokens.md`. That file installs beside this skill with `npx rift-ds init`. If it is missing, run that command, or read it at https://rift-ds.com/skill/rift-design-system/references/tokens.md.

## Instructions

1. **Determine the scope.** Accept one of:
   - A single file or component
   - A folder
   - The whole project

   Skip `node_modules`, build output, generated files and the package's own files. Scan every place the project writes a style:
   - Stylesheets: CSS, CSS modules, Sass and Less
   - CSS-in-JS: styled-components and Emotion templates, style objects, theme objects
   - Tailwind: arbitrary values in class names (`bg-[#1a1a1a]`, `p-[13px]`) and raw values in the Tailwind theme config
   - Inline styles: `style` props and attributes

2. **Read the tokens first.** Read the `rift-design-system` skill's `references/tokens.md` to know which tokens exist and what each resolves to in light and dark. Then read the project's own theme file if it has one (a `theme.css`, or wherever it overrides `--primitive-*` or semantic tokens). Where the project overrides a token, the project's value is the one that counts, and the reference's value is only the default.

3. **Scan each file** in scope for violations.

   **Flag as violations:**
   - Hardcoded hex colours: `#rrggbb`, `#rgb`, `#rrggbbaa`
   - Raw `rgb()`, `rgba()` or `hsl()` calls that could map to a semantic colour token
   - Pixel values for `padding`, `margin`, `gap`, `border-radius`, `font-size` and `line-height` that correspond to a token (`--gap-*`, `--padding-*`, `--radius-*`, `--font-*`)
   - Hardcoded font weights (`font-weight: 600`) where a typography token exists
   - Icon sizing done wrong: `font-size` set directly on an icon, or raw pixel icon dimensions that match a step. The fix is setting `--icon-size` to a step from `--icon-size-*`
   - Hardcoded `transition` and `animation` durations and easings (`0.2s`, `ease`, a literal cubic-bezier) where a `--motion-*` token matches
   - Shadows written by hand. The system has two, `--shadow-floating` and `--shadow-modal`

   **Do not flag:**
   - The project's theme file, where it overrides tokens or primitives. That file defines the theme
   - `0px`, `0`, `100%`, `50%`. These are structural, not replaceable by a token
   - `1px` border widths
   - Values inside `calc()` that are real arithmetic, not replaceable by a single token
   - Custom property declarations themselves (lines starting with `--`)
   - A value the project marks as deliberate in a comment beside it. Count it as an acceptable raw value and quote the reason

   **Hunt near-twins, not only strays.** A raw value that is almost a token is a typo recorded as a decision, and a check that only asks "is this a token" never sees it. Compare every raw value you collect against the resolved token values and against the other raw values in scope. A colour within a few points per channel of a token is a near-twin, and so is the same colour written another way: a hex, an `hsl()` and an `rgb()` of one colour are one value written three times. A spacing value one pixel off a scale step is a near-twin too. Report a near-twin as its own class of finding, separate from a plain stray, and name what it is a twin of. A twin of a token is repaired by pointing at the token. Two raw values that are twins of each other collapse into one.

   **Colour literals in components count.** Hex, `rgb()` and `hsl()` literals also live in `.ts`, `.tsx`, `.js` and `.jsx` files: chart colours, canvas drawing, theme objects. Scan them too and judge each hit. Fixed data that is meant to stay the same in every theme can be legitimate, but a near-twin of a token in it is still a typo.

4. **For each violation**, give:
   - The file path, relative to the project root
   - The line number
   - The offending value
   - The recommended token, when the reference has a clear match

   Format, with an invented file:

   ```
   src/components/GadgetTile.css:42 - #050505 → var(--color-text-primary)
   src/components/GadgetTile.css:17 - #0E6E90 → near-twin of var(--color-action-primary-bg), probably a mistyped copy
   ```

   Recommend by role, not by value alone. When two tokens share a value, name the one whose role matches how the value is used, and say when you cannot tell.

5. **Summarise** at the end:
   - `X violation(s) found`
   - `Y near-twin(s) found`
   - `Z acceptable raw value(s) noted`
   - With zero violations: "No token violations found. The styles are token-compliant."

If the user wants the findings fixed, the `rift-apply-theme` skill has the rules for choosing a token by role.
