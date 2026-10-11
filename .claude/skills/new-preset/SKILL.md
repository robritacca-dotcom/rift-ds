---
name: new-preset
description: Add a complete theme preset to the system — every lever declared, the generated stylesheet shipped, the AA gate passed. Use when asked to add a theme, a preset, or a new site look.
icon: palette
displayDescription: "Walks a new theme preset from a brand colour to a complete shipped look: every lever declared in the preset registry, the accent sextet curated, the stylesheet generated into the package, and the completeness gate passed, including the contrast check on every action fill and what sits on it, resting, hover and pressed, in both themes. Ends with the theme live behind one data-brand attribute, in the home page's selector and the playground's picker with no extra wiring."
invoke: ["add a theme preset","add a new theme","new preset","add a site look"]
---

# new-preset

Add a theme preset so one `data-brand` attribute delivers the complete look — site-wide and in the shipped package.

## When invoked

Use this skill when asked to add a theme, a preset, or a new look — phrases like "add a forest theme", "new preset", "give the site a corporate look".

## The governing idea

A preset is a **complete theme, not a tint**: every lever holds a saved position, and `scripts/validate-theme-presets.mjs` is the completeness gate that makes "one attribute, full theme" a guarantee rather than a hope. `THEME_PRESETS` in `website/src/lib/theme/presets.ts` is the single source; the generated stylesheets in `src/tokens/presets/` compile from `presetOverrides` in that file, and the playground's live preview composes the same lever functions (`website/src/lib/theme/theme-overrides.ts`) in a memo of its own that mirrors it. Nothing holds the two compositions to each other, so a change to how the levers combine has to be made in both. The playground's theme export is a third consumer of the composer, and `scripts/validate-theme-export.mjs` holds it to `presetOverrides` for every preset in both themes, so a new preset is checked there too.

## Instructions

### 1. Declare the preset

Add an entry to `THEME_PRESETS` in `website/src/lib/theme/presets.ts`. The `ThemePreset` type is the checklist — every field it requires is a decision, not a default to skip:

- **`brand`** (and `brandDark` when one key cannot serve both themes): the action colour. The lever derives the full action family from it, so pick the key with the AA gate in mind (step 3).
- **Neutral tint** (`tintOn`/`tintSeed`/`tintStrength`): whether the greys lean toward the brand. The strength is not applied evenly: light mode's surface steps take only a share of it (`LIGHT_SURFACE_TINT_RATIO` in `website/src/lib/theme/theme-overrides.ts` owns the rule and the reason), so judge the strength in both themes, never from light mode alone.
- **Shape** (`radiusScale`, `pill`): the corner language.
- **The feel levers** (`density`, `typeScale`, `motionScale`, `elevation`): 100/100/100/default is a legitimate position, but state it deliberately. `motionScale` is stored as a percentage of the shipped durations, so a lower number is a *faster* theme; the playground slider and /foundations/themes show it as speed through `motionSpeedPercent`, so a stored 80 reads 120% there.
- **Type weight and tracking** (`displayWeight`, `headingWeight`, `tracking`): one weight per tier and a letter-spacing offset added to every style's shipped tracking. The `SHIPPED_*` constants in `website/src/lib/theme/theme-overrides.ts` are the base look's positions. A single style that should differ from its tier goes in `extraOverrides`. Keep both weights inside `TYPE_WEIGHT_RANGE` (same file) and inside the axis range `FAMILIES` in `scripts/sync-preset-fonts.mjs` syncs for the face: the playground previews from a wider Google request than the package ships, so a weight past the synced range previews correctly and ships clamped. Widen the `FAMILIES` entry and rerun the sync first.
- **Icons** (`iconWeight`, `iconFill`): the icon font's stroke weight and fill, written to its axis hooks. A heavy text weight usually wants a heavier icon beside it.
- **Faces** (`fontLabel`, optionally `headingFontLabel`): the type pairing; the picker previews these, so labels must match `FONT_OPTIONS`/`HEADING_FONT_OPTIONS` entries in `website/src/lib/theme/theme-overrides.ts` byte-exactly (some labels carry a parenthetical that is part of the label, `(serif)` and `(rounded)` today; copy the label from the array).
- **`accents`**: the ambient sextet. These drive the background blobs and chart series 2–7 together, so curate them as one palette around the key. `SHIPPED_ACCENTS` in `website/src/lib/theme/theme-overrides.ts` shows the default set's shape.
- **`advanced`** ramp rebases and `extraOverrides` where the derived look needs correcting — the existing presets are the worked examples of when each is warranted (a lifted label for contrast, a re-keyed ramp for harmony, one style stepped off its tier's weight, such as a sub-display a step lighter than the display tier) — plus `extraOverridesDark` for the roles that cannot hold one value across both themes (the usual repair when the dark cell fails the AA gate in step 3).

**An override that moves a fill moves the whole state set.** Inverting a button (an ink fill under a coloured label, say) means overriding the resting, hover and pressed fills *and* the labels that sit on them, `--color-action-primary-text` and `--color-action-primary-text-active`. Active icons alias the active label, so they follow without a declaration of their own. Hover and pressed fills should step **away from their label**: brighter under a dark label, deeper under a light one. That is the rule the lever's derivation follows, and stepping toward the label is how a pressed state drops below AA.

Existing entries in the file are the reference implementations; read two before writing one.

### 2. Decide where it appears

Add the id to `HUE_ORDER` (same file) in its curated position — the array's own comment owns the ordering rule, so read it rather than guessing where the entry belongs. `THEME_SELECTOR_ORDER` is derived from it (the served theme first, then the rest in hue order), and every theme-picking surface walks that list — the home page's dot row, the playground's preset picker, the theme gallery, get-started's preset list, Storybook's Theme toolbar — so one edit places it everywhere; there is nothing to wire.

**Making it the served theme** (the look every visitor gets before choosing one) is a separate decision for the owner. Its one home is `SERVED_THEME_ID` in `website/src/lib/theme/brand.ts`: change it there and never restate the id elsewhere, since the root layout and Storybook's preview both read the constant. The selector order leads with the served theme by derivation, so there is no second edit; then run `npm run verify`.

### 3. Generate, gate, verify

```bash
node scripts/generate-preset-stylesheets.mjs
node scripts/validate-preset-stylesheets.mjs
node scripts/validate-theme-presets.mjs
node scripts/validate-theme-export.mjs
```

The generator writes the preset's `html[data-brand]` stylesheet and refreshes the `presets.css` aggregate; they ship in the npm package. Downstream generators re-embed the preset CSS too (the shadcn registry's base item among them — the `validate-registry` entry in the root `package.json` is the authoritative list), so commit every file the chain regenerates, not just the two named here. The completeness gate then holds every override to a real token, primitive or icon axis hook (the script's doc block owns the rule), requires the action family and all six accents, and checks **every action fill against what components draw on it, in every state and both themes**: labels at WCAG AA 4.5:1, icons and strokes at 3:1. `ACTION_PAIRINGS` in the script is the authoritative table, and each failure names the fill, the foreground, the ratio and the component that draws it. A failing pairing means the key or an override needs to move (deepen or lighten the key, step a hover or pressed fill away from its label, or lift the label through `extraOverrides`) — pinning a gap in `SANCTIONED_AA_GAPS` is deliberate acceptance with a written reason, never a shortcut, and needs the owner's sign-off.

A face the presets have never shipped needs `node scripts/sync-preset-fonts.mjs` first — a deliberate by-hand fetch, never part of the build; its `FAMILIES` table is the download spec, and CLAUDE.md's Fonts entry owns the contract. The stylesheet generator fails naming the script otherwise, and the downloaded woff2s commit with the preset.

Then `npm run verify` — the mirror guards and the site build exercise everything those scripts do not.

### 4. Prove it live

Pick the new theme from the home page's selector and walk a component page, a chart, and the chat surfaces in both light and dark, plus a doc page with an h2 over an h3 (or the playground's Type view) when the two tier weights are equal or close, since size is then carrying the hierarchy alone. The completeness gate proves resolution; only eyes prove the look holds together.

## Guardrails

- Never hand-edit `src/tokens/presets/*.css` — they are generated; the byte-compare validator rejects a hand edit anyway
- Never pin `SANCTIONED_AA_GAPS` to pass the gate without the owner's explicit decision
- A preset's portrait (swatch shape, faces) derives from its declaration — never restyle a picker row by hand
