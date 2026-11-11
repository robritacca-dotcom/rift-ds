---
name: figma-tokens
description: Carry a token or theme change into the Rift DS Figma kit's variables. Diffs the resolved token values against the kit's Primitives, Theme and Mode collections, then adds, updates or renames variables in every mode, adds a theme as a Theme mode, rebinds the kit's layers where a component now reads a new token, and refreshes the Colour, Typography and Themes pages. Use after adding, changing, renaming or removing a token, after adding or retuning a theme preset, or when asked to update the Figma tokens or sync the variables.
icon: palette
displayDescription: "Carries a token or theme change into the Figma kit. It compares every token's resolved value, in every theme and in light and dark, with the kit's variables, then adds, updates or renames them in each mode, adds a new theme as a mode, rebinds the components that now read a new token, and refreshes the Colour, Typography and Themes pages. A rename keeps every binding, and nothing is removed without a yes."
invoke: ["update the Figma tokens","sync the variables to Figma","add the [X] theme to Figma"]
---

# figma-tokens

Bring the Figma kit's variables in step with the tokens after a change. The token CSS is the source of truth: this skill changes Figma only, and never a token to match Figma.

## When invoked

Use after a change that the `new-token`, `token-rename` or `new-preset` skill made (or any edit to the token CSS or a preset), or when asked to update the Figma tokens, sync the variables, or add a theme to Figma. It is the variables half of the `figma-parity` skill, run on its own: parity sends its variable findings here.

Before the first Figma call, do what the `new-figma-component` skill's "Before the first Figma call" section says. Its "The kit's conventions" section owns how the kit's variables are organised and bound.

## Sources

Read, never hand-copy. Run `npm run validate-registry` first if the token CSS changed since the last build, so the generated files are current.

- **Resolved values**: `src/tokens/values.json`, every token for every theme in light and dark.
- **The token list and categories**: `src/tokens/registry.json`.
- **Themes**: `THEME_PRESETS` in `website/src/lib/theme/presets.ts`. A theme's Figma mode is named after its `label`.
- **The tiers**: `src/tokens/tokens-primitives.css`, `src/tokens/tokens-light.css` and `src/tokens/tokens-dark.css`, for which primitive a semantic token points at, so a Figma variable aliases the right primitive rather than holding a copied value.

## Instructions

### 1. Work out what changed

If the owner named the change, start from it. Otherwise diff the token CSS and `presets.ts` against the last commit that synced Figma (ask if unknown) or against the kit itself in step 2. Sort the changes:

- **Added**: a token, a primitive, or a theme.
- **Changed**: a value, in some theme or mode.
- **Renamed**: a token or family (`token-rename`'s mapping is the list).
- **Removed**: a token or a theme.

### 2. Read the kit's variables

A read-only `use_figma` script returning JSON: every collection, its modes, and every variable with its type, scopes, code syntax and value or alias per mode. Read how an existing variable of the same category is built (its group path, its scopes, its code syntax, whether it aliases a Primitives or Theme variable) and copy that shape exactly for anything new.

Diff it against the sources for every theme the kit carries and both modes. This catches drift the change did not cause, too; fold it in.

### 3. Plan, and ask where it matters

Write the plan as a table: collection, variable, action, value per mode. Two cases wait for the owner's yes:

- **Removing a variable.** Count the layers bound to it first. A removed token usually means its consumers moved to another, so rebind them (step 5) before removing it.
- **A theme past the mode cap.** The kit's plan caps a collection's modes. A new theme takes a Theme mode only while there is room. At the cap, ask which theme to leave out of Figma, or whether the new one stays code-only. Whenever a theme joins or leaves the Theme collection, update `KIT_THEMES` in `website/src/app/docs/figma/page.tsx` in the same change, so the site's Figma kit page names the modes the kit really has.

Everything else proceeds.

### 4. Apply

In batches of one category at a time, in this order so aliases always have a target:

1. **Primitives**: added and changed raw values, per preset.
2. **Theme**: a new theme is a new mode with every variable set (copy the nearest theme's mode, then set each value from the sources so nothing is left inherited); added and changed variables get every mode set.
3. **Mode**: the semantic colours in Light and Dark, aliased to the Theme layer as the existing ones are.

A **rename** changes the variable's name and code syntax in place, which keeps every binding: never delete and recreate. Set the scopes and code syntax (`var(--token-name)`) on every new variable to match its neighbours.

### 5. Follow the change through the kit

- **Components**: when a component's CSS now reads a new or different token, find its layers in the kit and rebind them. Search the component CSS under `src/components/` for the token to know which components to check.
- **Colour page**: a swatch for every semantic colour token, as the foundations page does. Add, rename or remove swatches to match.
- **Typography page**: a new type style or a changed ladder step.
- **Themes page**: a new theme gets its card and its theme-page frame, built like the existing ones and pinned to its own Theme mode (the one sanctioned pin), with its links to the theme's foundations page, its DESIGN.md and the playground under `SITE_URL`. The theme's id is its key in `THEME_PRESETS`.

### 6. Verify

Run the step 2 read again and diff it against the sources: it must come back empty for every theme the kit carries and both modes. Then screenshot the Colour page and two component pages from different families, switched to the changed theme in Light and Dark, and check they read right. Set every page back to its usual Theme and Mode.

### 7. Report

What was added, changed, renamed and removed per collection, the components rebound, the pages refreshed, anything left for the owner (a removal awaiting a yes, a theme past the cap), and the screenshots. No repo file changes, unless a rebuilt frame moved a node in `website/src/data/figma-nodes.json`, which then gets updated and checked with `node scripts/validate-figma-nodes.mjs`. Nothing is committed.
