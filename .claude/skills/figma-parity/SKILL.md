---
name: figma-parity
description: Compare the Rift DS Figma kit with the library and bring the kit back in step. Inventories both sides (components, variant properties, descriptions, variables and their values, page links, the node map), reports what is missing, out of date or only in Figma, then fixes the Figma side, since the code is the source of truth. Use when asked to check Figma parity, sync the Figma kit, or find what Figma is missing.
icon: compare
displayDescription: "Compares the Figma kit with the library on both sides: every component, its variant properties and description, every variable and its value in each theme and mode, every page link and the node map the docs pages link through. Then it fills the gaps and fixes what drifted on the Figma side, because the code is the source of truth. Anything that only exists in Figma is reported, never deleted unasked."
invoke: ["check Figma parity","sync the Figma kit","what is Figma missing?"]
---

# figma-parity

Hold the Figma kit to the library. The code is the source of truth: this skill changes Figma and the node map, and never changes a component or a token to match Figma.

## When invoked

Use when asked to check Figma parity, sync the kit, find what Figma is missing, or after a release that changed components or tokens. A clean pass is a valid outcome.

Before the first Figma call, do what the `new-figma-component` skill's "Before the first Figma call" section says (load `figma-use`, open a session on the kit, never write ids or URLs from memory). Its "The kit's conventions" section is the standard every fix here meets.

## Instructions

### 1. Inventory the code

Read, never hand-copy:

- **Components**: `src/components/registry.json` and the widgets in `src/chat/registry.json` (name, label, slug, description).
- **Props**: each `website/public/schema/components/<slug>.json`, reduced to what a Figma set expresses: the enum props and their values, the boolean state props, the text props a set carries as text properties.
- **Tokens**: `src/tokens/values.json`, every semantic token's value per theme and mode, limited to the themes the kit carries as Theme modes and to the categories it binds (colour, radius, spacing, border, type, shadow).
- **Links**: `SITE_URL` and `STORYBOOK_URL` in `scripts/brand.mjs`, and the Storybook ids in the deployed Storybook's `index.json`.
- **The node map**: `website/src/data/figma-nodes.json`.

Write it to a JSON file in the scratchpad, so the Figma side can be diffed against it.

### 2. Inventory the kit

One or more read-only `use_figma` scripts that return JSON, never a mutation: the page list and order; every component set with its page, name, description and variant property definitions; every variable in Theme and Mode with its value per mode; each component page's link-button targets (reaction and label hyperlink); and whether each node id in the map still exists and is the page's wrapper frame. Page through large results rather than one call that times out.

### 3. Diff and sort

Every finding goes in one of four buckets:

- **Missing**: a component, prop value, variable or page the code has and the kit lacks.
- **Drifted**: present in both but different. A variant property's options, a description that no longer matches the registry, a variable whose value differs from `values.json` in some theme and mode, a link to the wrong URL, a node map entry pointing at a deleted or moved node, a page out of order.
- **Convention breaks**: anything that fails the kit's conventions (a pinned Theme or Mode, a raw colour where a variable belongs, artboards repeated per theme, a text link where the recipe has buttons).
- **Figma only**: a component, variant or variable the code does not have. Never fix these by deleting: report them for the owner, since they may be work in progress.

Present the counts per bucket and the list before fixing. A fix that rebuilds or deletes anything the owner drew by hand waits for their yes; everything else proceeds.

### 4. Fix the Figma side

Work bucket by bucket, in small `use_figma` steps checked with `get_screenshot`:

- **Missing components**: build each through the `new-figma-component` skill's instructions, one at a time.
- **Missing or drifted props**: add or rename the variant property's options to match the schema, and update the sticker sheet so it still shows every meaningful combination.
- **Missing or drifted variables**: hand them to the `figma-tokens` skill, which owns how a variable is added, updated, renamed or removed in every mode.
- **Drifted descriptions and links**: rewrite from the registry and the brand constants.
- **Node map**: update `website/src/data/figma-nodes.json` for any frame that moved or was rebuilt, then run `node scripts/validate-figma-nodes.mjs`.
- **Convention breaks**: fix in place.

If fixing Figma would mean changing the code (a prop the code should have, a token that looks wrong), do not touch the code. Add it to the report as a question for the owner.

### 5. Re-check and report

Run the step 2 inventory again and diff it once more: the Missing, Drifted and Convention buckets should be empty. Report what was fixed per bucket, what is left in Figma only, any questions about the code, and the map changes. Nothing is committed.
