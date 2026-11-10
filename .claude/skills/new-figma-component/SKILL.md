---
name: new-figma-component
description: Build a library component into the Rift DS Figma kit (a component set bound to the kit's variables, one sticker sheet and a page in the kit's recipe) and map its frame in website/src/data/figma-nodes.json. Runs apart from new-component, so the code and the Figma work can be split. Use when asked to add a component to Figma, build the Figma side of a component, or draw [Name] in the kit.
icon: draw
displayDescription: "Builds a component that already exists in code into the Figma kit: a component set whose variants follow the props, bound to the kit's Theme and Mode variables, one sticker sheet in the default theme, and a page in the kit's recipe with links to the docs and Storybook. Then maps the frame so the docs page links straight to it. Runs apart from new-component, so the code and the design work can be split."
invoke: ["add [Name] to Figma","build the Figma side of [Name]","draw [Name] in the kit"]
---

# new-figma-component

Build one library component into the Rift DS Figma kit and wire its frame back to the site. The code already exists: this skill draws it, it never changes it.

## When invoked

Use when asked to add a component to the Figma kit, build the Figma side of a component, or draw a component in the kit. It is the design half of adding a component, kept separate from the `new-component` skill so the two can run in different sessions. A component in code with no frame fails `scripts/validate-figma-nodes.mjs`, which runs before every root build, Storybook and `verify`, so until this skill runs for it nothing ships.

If the component does not exist in `src/components/registry.json` (or `src/chat/registry.json` for a chat widget) yet, stop: the code comes first, through `new-component`. Figma never leads the code.

## Before the first Figma call

- **Load the Figma connector's `figma-use` skill** (the `get_figma_skill` tool serves it when no Figma plugin is installed) before any `use_figma` call. It owns the plugin API and its traps.
- **Open a session on the kit**: the file key is the path segment of `FIGMA_FILE_URL` in `scripts/brand.mjs`. Call `create_session` with it and a one-line task, and reuse the session id on every later call.
- **Never write a file key, node id or URL from memory.** Find nodes by name with a read-only `use_figma` script, and derive every URL from `SITE_URL`, `STORYBOOK_URL`, `REPOSITORY_URL` and `AUTHOR_URL` in `scripts/brand.mjs`.

## The kit's conventions

This section is the one home of how the kit is built. The `figma-parity` and `new-figma-template` skills point here rather than restating it.

**Variables.** Three collections. Primitives holds each preset's raw values and is hidden. Theme has one mode per preset the file carries (the default theme first) and holds the light and dark colour layers, the dimensions and the fonts. Mode (Light, Dark) holds the semantic colours, and it is the only collection components bind colour to. Every fill, stroke, radius, gap and padding binds to a variable named after its token, so a theme or mode switch at the page changes everything. A value with no token is a sign the code has one you missed: look it up in `src/tokens/values.json` before reaching for a raw number.

- **Never pin a Theme or Mode on a frame.** Frames stay on Auto, so the page's setting drives the whole page. The Themes page's theme cards and the Cover's marketing frames are the only sanctioned pins.
- **Never bake a fade as a colour gradient**: it ignores Light and Dark. Fade with an alpha-only gradient mask over bound-colour layers.
- **A concentric radius** (a shell around a control, such as the composer around its send button) is the one place a hand-set number beats a token, because Figma cannot add the inset and border to the inner radius. Pick the number that fits the page's theme.

**Component sets.** Variant properties follow the props in `website/public/schema/components/<slug>.json`: one property per enum prop (`variant`, `tone`, `size` and the rest, named and valued as in code), and a boolean property per boolean state prop such as `disabled`. Hover, pressed and focus are CSS states, not props, so they are a `State` property at most, never a prop the code lacks. Text and instance-swap properties carry the label and the icons. The set's description holds the registry description, the import line and the prop mapping (Code Connect is unavailable on the kit's plan, so the description is where a designer finds the code).

- Bind component properties only to the component's own layers, never inside a nested instance (it throws).
- A text property shares one value across every variant, so text that differs by status stays unbound.
- After swapping an icon in an instance, re-apply the glyph's fill.
- Never edit text inside an icon instance by index: a TEXT search also finds the glyphs.
- A body the consumer fills (a popover's, a field's) is a slot made with `createSlot()`.
- Compose the kit's own components (a Button inside a Dialog is a Button instance), the same way the code composes them. A sub-component the set needs goes in the page's Building blocks panel.
- Icons are instances from the Icons page. A glyph the code uses that the page lacks is added there, never drawn locally.

**One sticker sheet.** Each component gets its set and one sticker sheet showing the meaningful combinations in the default theme, Light. Never repeat artboards per theme or mode: the variables already prove the switch.

**The page recipe.** Every component gets its own page, named after the component's `label`, set to the Theme and Mode every other component page uses (read them off a neighbour), with the same page background. On it, one auto-layout wrapper frame named after the component holds:

1. **A header card**: a top bar with the Rift DS mark on the left, linked to `SITE_URL`, and meta links on the right (Rift DS, GitHub and the author, as underlined secondary text linking to `SITE_URL`, `REPOSITORY_URL` and `AUTHOR_URL`); then the title in the Display/2 style, the registry description, and an "In Figma and code" status pill.
2. **A links row**: two Button instances cloned from the pair on an existing component page (Primary and Neutral, Compact, with the Rift DS and Storybook marks leading and an arrow trailing), never text links. Each gets an on-click URL reaction and the same URL on its label's text hyperlink, or a click in design mode follows the clone's old link: `SITE_URL/components/<slug>` and `STORYBOOK_URL` followed by the component's Storybook path. Take that path from the `storybookPath` its docs page passes to `PageLinks` (usually `/?path=/docs/components-<name lowercased>--docs`, but a chat widget's sits under `chat-`), and check it against the deployed Storybook's `index.json`.
3. **Columns**: the sticker sheet panel on the left; the main component panel on the right, with a Building blocks panel under it when the set has sub-components.

Colours: the wrapper takes the page background token; the header, the links row and every panel take the primary container fill with the container border as an outline. Sticker sheets and component sets have no fill, and the right column is unfilled. A standalone panel component keeps its own surface. Icon components never sit on a component page.

**Page order**: Cover, a divider, Colour, Icons, Typography, Themes, a second divider, then every component page in alphabetical order. Re-sort after adding a page.

**Demo content** follows the code's own defaults and the content guide: fictional names, avatars off unless the component exists to show one.

## Instructions

### 1. Read the component in code

- Its registry entry (label, slug, category, description) and its schema in `website/public/schema/components/<slug>.json` (every prop, its type, its default).
- Its CSS, for the tokens each part uses, and its stories, for the combinations worth showing.
- Its rendered page: open `SITE_URL/components/<slug>` (or the local dev server) in the built-in browser and screenshot the default theme. That picture is the target.

### 2. Read the kit

With a read-only `use_figma` script: the page list and order, the nearest sibling's page (same family) as the layout reference, the link-button pair to clone, and the variables the component's tokens map to. Note any token with no variable; step 3 adds it before drawing.

### 3. Build

In small `use_figma` steps, checking each with `get_screenshot` before the next:

1. Any missing variable, added to the right collection with a value for every mode, from `src/tokens/values.json`.
2. The component set, its properties and its description.
3. The sticker sheet.
4. The page in the recipe, placed in alphabetical order.

### 4. Check fidelity

Screenshot the main variant beside the site's render in the default theme. Measure what differs (padding, radius, type, icon size) and fix it in Figma. Then switch the page's Theme and Mode once to confirm everything follows, and set them back.

### 5. Map the frame

Add the component's slug to `components` in `website/src/data/figma-nodes.json`, in alphabetical order, with the wrapper frame's node id in URL form (`12-345`, the colon written as a hyphen). Run `node scripts/validate-figma-nodes.mjs`, then open the component's docs page and confirm its Figma link lands on the frame.

### 6. Report

The page, the set's variant properties and the sticker sheet, with a screenshot. Name any prop the kit could not express and any token you had to add. Nothing is committed: the map change waits for the owner, like any other.
