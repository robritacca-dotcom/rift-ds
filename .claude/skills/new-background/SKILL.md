---
name: new-background
description: Add a shader scene to the library, or a site background the header menu offers, with every surface that tracks them moved in the same change. Use when asked to add a scene, add a background, add a shader preset, or retune a background's look.
icon: landscape
displayDescription: "Walks a new shader scene or site background through every home it has: the scene in the library with its params, passes and colour roles, the playground's Shaders view template, the site's background registry row with its per-band tuning, the shaded chats that stand on it, the gesture list, and the visual pass that proves it on every page and in every theme."
invoke: ["add a shader scene","add a background","new background","add a shader preset","retune the horizon"]
---

# new-background

Add a scene the library paints, or a background the site offers, so one row reaches every surface that shows it.

## When invoked

Use this skill when asked to add a shader scene, add a site background, add a shader preset to the playground, or retune one that exists. Three sizes of change share the ritual: a new library scene (the largest), a new site background on an existing scene, and a retune of a background's look.

## Where everything lives

Read the owners before changing anything; this skill holds no copy of their facts.

- **The scenes** are `src/components/ShaderScene/scenes.ts`: each declares its id, the colour roles it reads (the `--color-ambient-*` set, so a theme recolours it), its params with ranges, and its GLSL. The finishing passes are `src/components/ShaderScene/passes.ts`. design.md's ShaderScene spec owns the component's contract.
- **The playground's Shaders view** stages a scene from a template in `website/src/lib/shaders/templates.ts` (one entry per scene, only what differs from the defaults); the rail's card still is baked from the scene itself. The theme export and the DESIGN.md importer read the same templates.
- **The site's backgrounds** are `website/src/data/site-backgrounds.json` (CLAUDE.md's Registries table): one row per pick the header menu offers, with the scene and its tuning for each band BlurBackground paints. `website/src/lib/shaders/background-storage.ts` is the accessor and owns the tuning rationale; `scripts/validate-site-backgrounds.mjs` holds every row to the scenes, their params and passes, and the token registry. The header menu, the pre-paint script in the root layout and BlurBackground all read the list, so a row is the whole of adding a background.
- **The shaded chats** stand on a scene through one recipe, `website/src/components/StagedShader/ShadedChat.module.css`: the playground's chat card, the chat home template and the home reel's recording mode. A background change reaches them through the recipe, never through a copy.
- **Grips**: a slider or drag the change adds to the site needs a row in `scripts/gestures.json`; no validator notices a missing one.

## Instructions

1. **Decide the size.** A retune changes a row's `home` or `page` tuning in the registry, nothing else. A new background on an existing scene is one registry row plus step 4. A new scene starts at step 2.

2. **Add the scene** (new scene only). Declare it in `scenes.ts` beside the others with its colour roles, its params and their ranges, and its GLSL; the component picks it up from `SCENES`. Add its template to `templates.ts` so the Shaders view can stage it and the theme export can name it. Give it a story in `src/components/ShaderScene/ShaderScene.stories.tsx` and a stage on the ShaderScene page under `website/src/app/components/shader-scene/`, and add a line to the ShaderScene spec in design.md. The story tests and `validate-site-backgrounds.mjs` then hold its colour roles to the token registry.

3. **Add the background row** (new background). One row in `website/src/data/site-backgrounds.json`: id, a one-word label, a short description with no full stop, a Material Symbol icon, the scene, and a `home` and `page` tuning. Tune the two bands apart: the tall bands sit under a hero and the standard band under a page title, and a setting that reads well in one rarely reads well in the other. Write the reasons for the tuning in the accessor's doc block, since JSON carries no comments. Run `node scripts/validate-site-backgrounds.mjs`.

4. **Prove it live.** With the dev server up, pick the background from the header menu and walk the home page, a component page, a foundations page and `/templates/chat-home`, in light and dark, and in a theme with a real floating shadow and one without (the presets differ). Scroll an inner page: the band sinks with the scroll. Send a message on the chat home and in the playground's Chat view with the scene picked: the frost closes over it and the board still scrolls in the inset shell. Reload: the pick comes back before first paint. Then the `visual-review` skill for the full pass.

5. **Re-shoot what shows it.** The playground's template stills (`scripts/capture-template-thumbnails.mjs`) if a template's ground changed, and the README banner (`scripts/capture-readme-banner.mjs`) if the home page's first screen did. Both are by-hand refreshes with no generator, by design; CLAUDE.md's Screenshot surfaces entry owns that rule.

6. **Finish.** `npm run validate-registry`, then the `ship` skill, which also offers the visual review for a background change.

## Guardrails

- Never hand-edit a generated file: the shadcn registry entry for the chat, the schemas, the blueprints and the dependency graph regenerate from the sources you changed.
- Never put a colour value in a scene or a row: a scene reads token roles, and a row carries only params, so every theme recolours both.
- A new param or pass goes through the component, with a range, never through a site-only override; the validator rejects a key the scene does not declare.
- Examples in this skill are fictional; the registry and the scenes are the facts.
