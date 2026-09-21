---
name: new-preset
description: Add a complete theme preset to the system — every lever declared, the generated stylesheet shipped, the AA gate passed. Use when asked to add a theme, a preset, or a new site look.
icon: palette
displayDescription: "Walks a new theme preset from a brand colour to a complete shipped look: every lever declared in the preset registry, the accent sextet curated, the stylesheet generated into the package, and the completeness gate passed, including the WCAG AA check on the action pairing in both themes. Ends with the theme live behind one data-brand attribute, in the home page's selector and the playground's picker with no extra wiring."
invoke: ["add a theme preset","add a new theme","new preset","add a site look"]
---

# new-preset

Add a theme preset so one `data-brand` attribute delivers the complete look — site-wide and in the shipped package.

## When invoked

Use this skill when asked to add a theme, a preset, or a new look — phrases like "add a forest theme", "new preset", "give the site a corporate look".

## The governing idea

A preset is a **complete theme, not a tint**: every lever holds a saved position, and `scripts/validate-theme-presets.mjs` is the completeness gate that makes "one attribute, full theme" a guarantee rather than a hope. `THEME_PRESETS` in `website/src/lib/theme/presets.ts` is the single source; the generated stylesheets in `src/tokens/presets/` and the playground's live preview both compile from the same `presetOverrides` composer, so the preview and the shipped CSS cannot disagree.

## Instructions

### 1. Declare the preset

Add an entry to `THEME_PRESETS` in `website/src/lib/theme/presets.ts`. The `ThemePreset` type is the checklist — every field it requires is a decision, not a default to skip:

- **`brand`** (and `brandDark` when one key cannot serve both themes): the action colour. The lever derives the full action family from it, so pick the key with the AA gate in mind (step 3).
- **Neutral tint** (`tintOn`/`tintSeed`/`tintStrength`): whether the greys lean toward the brand.
- **Shape** (`radiusScale`, `pill`): the corner language.
- **The four feel levers** (`density`, `typeScale`, `motionScale`, `elevation`): 100/100/100/default is a legitimate position, but state it deliberately.
- **Faces** (`fontLabel`, optionally `headingFontLabel`): the type pairing; the picker previews these, so labels must match `FONT_OPTIONS`/`HEADING_FONT_OPTIONS` entries in the same file.
- **`accents`**: the ambient sextet. These drive the background blobs and chart series 2–7 together, so curate them as one palette around the key. `SHIPPED_ACCENTS` in `website/src/lib/theme/theme-overrides.ts` shows the default set's shape.
- **`advanced`** ramp rebases and `extraOverrides` where the derived look needs correcting — the existing presets are the worked examples of when each is warranted (a lifted label for contrast, a re-keyed ramp for harmony).

Existing entries in the file are the reference implementations; read two before writing one.

### 2. Decide where it appears

Add the id to `THEME_SELECTOR_ORDER` (same file) in its curated position. The home page's dot row and the playground's preset picker both walk this list, so one edit places it everywhere — there is nothing to wire.

### 3. Generate, gate, verify

```bash
node scripts/generate-preset-stylesheets.mjs
node scripts/validate-preset-stylesheets.mjs
node scripts/validate-theme-presets.mjs
```

The generator writes the preset's `html[data-brand]` stylesheet and refreshes the `presets.css` aggregate — commit both; they ship in the npm package. The completeness gate then holds every override to a real token, requires the action family and all six accents, and checks the resolved action bg/text pairing at **WCAG AA 4.5:1 in both themes**. A failing pairing means the key needs to move (deepen or lighten it, or lift the label through `extraOverrides`) — pinning a gap in `SANCTIONED_AA_GAPS` is deliberate acceptance with a written reason, never a shortcut, and needs the owner's sign-off.

Then `npm run verify` — the mirror guards and the site build exercise everything the three scripts do not.

### 4. Prove it live

Pick the new theme from the home page's selector and walk a component page, a chart, and the chat surfaces in both light and dark. The completeness gate proves resolution; only eyes prove the look holds together.

## Guardrails

- Never hand-edit `src/tokens/presets/*.css` — they are generated; the byte-compare validator rejects a hand edit anyway
- Never pin `SANCTIONED_AA_GAPS` to pass the gate without the owner's explicit decision
- A preset's portrait (swatch shape, faces) derives from its declaration — never restyle a picker row by hand
