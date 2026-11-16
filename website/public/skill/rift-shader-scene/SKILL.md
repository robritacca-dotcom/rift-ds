---
name: rift-shader-scene
description: Write a WebGL shader scene of your own for the rift-ds ShaderScene component, in GLSL, reading the theme's colour roles. Use when asked to make a shader, a shader background, an animated or generative background, a custom scene, or to change one the project already has.
---

# Writing a shader scene for rift-ds

Generated from the library's registries at version 1.29.0. `ShaderScene` paints a WebGL2 scene behind a page. Its `scene` prop takes the id of one the library ships or a scene of the project's own, a `ShaderSceneSource`. You write that source. The guide for people is https://rift-ds.com/docs/shaders, and the component's contract is https://rift-ds.com/components/shader-scene.md.

## Before you write one

1. Check whether a shipped scene already fits. `SHADER_SCENES`, exported beside the component, lists every one with its settings, and https://rift-ds.com/components/shader-scene shows them. Picking one is `<ShaderScene scene="horizon" />`.
2. In a Next.js app router project with no scene yet, start from the block: `npx rift-ds init block shader-scene` writes a scene file and a page that stages it with a slider for each setting. It never overwrites a file. Then edit the scene it wrote.
3. Otherwise write the scene in a file of its own, as below.

## A scene

A scene is three things: the colours it reads, its settings, and the GLSL that paints it. This is the one the block writes.

```ts
import type { ShaderSceneSource } from 'rift-ds/components/ShaderScene/ShaderScene';

export const emberScene: ShaderSceneSource = {
  mode: 'dark',
  colours: ['--color-ambient-4', '--color-ambient-5'],
  params: [
    { key: 'glow', label: 'Glow', min: 0, max: 2, step: 0.01, default: 1 },
    { key: 'height', label: 'Height', min: 0.1, max: 1.5, step: 0.01, default: 0.8 },
    { key: 'scale', label: 'Scale', min: 0.5, max: 6, step: 0.05, default: 2.4 },
  ],
  glsl: /* glsl */ `
vec3 scene(vec2 uv, float t) {
  // Square the space up, so the noise is not stretched on a wide stage.
  float aspect = u_size.x / u_size.y;
  vec2 p = vec2((uv.x - 0.5) * aspect, uv.y);

  // How high the light reaches in this column: slow noise, drifting.
  float reach = u_height * (0.35 + 1.1 * fbm(vec2(p.x * u_scale + t * 0.05, t * 0.08)));

  // Brightest at the floor and gone at its reach, with a soft top edge.
  float body = smoothstep(reach, 0.0, uv.y);
  body *= body;

  // Finer noise rising through it lifts the second colour out as embers.
  float fine = fbm(vec2(p.x, uv.y) * u_scale * 5.0 - vec2(0.0, t * 0.35));
  float embers = smoothstep(0.5, 0.85, fine) * body;

  // Add the light to the ground: the fades and light mode depend on it.
  vec3 light = (u_col[0] * body * 1.2 + u_col[1] * embers * 0.5) * u_glow;
  return u_ground + light;
}
`,
};
```

Use it by passing the object:

```tsx
import { ShaderScene } from 'rift-ds/components/ShaderScene/ShaderScene';

<div style={{ position: 'relative', overflow: 'hidden', height: 360 }}>
  <ShaderScene scene={emberScene} params={{ glow: 1.4 }} onError={console.error} />
</div>
```

The scene fills its positioned ancestor, so the ancestor places and clips it. It takes no pointer events and is hidden from assistive tech: it is scenery, and content goes over it. The source is compared by what it says, so an object written inline compiles once.

## What the GLSL gets

Write one function, `vec3 scene(vec2 uv, float t)`, in GLSL ES 3.00 (WebGL2). Returns the pixel's colour in linear RGB over the ground. uv runs 0 to 1 on both axes from the bottom left, with no aspect correction; t is the scene's clock in seconds. Everything below is declared before your code, so call it by name. Never declare a uniform yourself and never write `main`, `#version` or a `precision` line.

| Uniform | Type | What it holds |
|---|---|---|
| `u_size` | `vec2` | The drawing buffer's size in pixels. Divide its x by its y for the aspect ratio. |
| `u_time` | `float` | The scene's clock in seconds, the same value as t. It advances with speed and holds still under reduced motion. |
| `u_ground` | `vec3` | The ground the scene paints over, in linear RGB: the page ground, or a near-black of its own for a dark scene on a light page. Add light to it and return the sum. |
| `u_page` | `vec3` | The page ground itself, which the fades melt into. |
| `u_lightMode` | `float` | 1 when a dark scene is being laid onto a light page as a pale tint, otherwise 0. |
| `u_ratio` | `float` | Drawing-buffer pixels per CSS pixel. Multiply a size meant in CSS pixels by it. |
| `u_col` | `vec3[]` | The scene's colours in linear RGB, in the order its colours list names them. Unused slots are black. |
| `u_glyphs` | `sampler2D` | The scene's character ramp as one strip, a cell per character, white on black. Read its red channel. Only for a scene that sets `glyphs`. |
| `u_glyphCount` | `float` | How many characters the ramp holds. Only for a scene that sets `glyphs`. |

Each entry in `params` also arrives as `uniform float u_<key>`.

| Function | What it gives |
|---|---|
| `uint ihash(uvec2 p)` | An integer hash with no visible pattern, the base of the others. |
| `float rnd(ivec2 p)` | A random number from 0 to 1 for an integer cell. |
| `float vnoise(vec2 p)` | Smooth value noise from 0 to 1. |
| `float fbm(vec2 p)` | Four octaves of value noise, for cloud, smoke and water. |
| `float lobe(float d, float above, float below)` | A soft falloff around zero with one width above it and another below, for a glow with a hard side and a soft one. |

## Rules

- **Return the ground plus light.** End with `return u_ground + light;` in linear colour. The fades, the grain and light mode all work from that sum, and a scene that returns a colour of its own cuts a hard box into the page.
- **Name colour roles, never values.** No `vec3(1.0, 0.4, 0.1)` for a colour. List custom properties in `colours` and read them as `u_col[0]`, `u_col[1]` and so on, in that order, 8 at most. The ambient roles, `--color-ambient-1` onward, are made for this and follow the theme, the colour mode and any preset. A custom property of the project's own works too. Numbers that shape light (a falloff, a weight) are fine as literals.
- **Correct the aspect yourself.** `uv` is 0 to 1 on both axes, so a circle drawn in it is an ellipse on a wide stage. Start with `float aspect = u_size.x / u_size.y;` and scale x by it.
- **A param key is a GLSL identifier** and must not repeat a uniform in the table (so not `time`, `size`, `ground`, `page` or `ratio`) or start with a pass's name and an underscore.
- **Say `mode: 'dark'` for a scene that only adds light**, which is most of them. On a light page the component then lays that light on as a pale tint. A scene that paints both modes leaves it out and reads the ground: `float day = smoothstep(0.1, 0.45, dot(u_ground, vec3(0.2126, 0.7152, 0.0722)));` is 0 on a dark ground and 1 on a light one.
- **Keep a pixel cheap.** The component holds the frame rate and the resolution, so the cost left is yours. `fbm` is four noise lookups; a dozen calls a pixel is slow on a laptop across a full-width band. Loops need constant bounds.
- **Raise `pixelRatio` only for fine detail** (type, points), to 2, and multiply anything sized in CSS pixels by `u_ratio`. Soft light does not need it.
- **Move with `t`, slowly.** A background drifts on cycles of tens of seconds. Reduced motion holds `t` still for you, so never read a clock of your own.
- **Hold the scene at module scope** when it does not change, and set values through `params`, which compiles nothing. For sliders, write to a ref and pass it as `liveRef`, so a drag renders nothing.

## The finishing passes

These run over every scene, the project's included, each switched and tuned through the `passes` prop, as in `passes={{ fadeTop: { on: false }, grain: { params: { amount: 0.1 } } }}`. The fades melt the scene into the page at its top and bottom; turn them off for a scene in a framed stage. A project cannot add a pass of its own.

| Pass | What it does | By default | Settings |
|---|---|---|---|
| `scrim` | Scrim | Off | `amount` (0 to 0.9) |
| `vignette` | Vignette | Off | `amount` (0 to 1), `size` (0.2 to 1.2) |
| `fadeTop` | Fade the top | On | `start` (0.2 to 0.95), `softness` (0.3 to 2) |
| `fadeBottom` | Fade the bottom | On | `from` (0 to 0.4), `to` (0.05 to 0.7) |
| `grain` | Film grain | On | `amount` (0 to 0.4) |

## Check your work

1. Pass `onError` while you work. A scene that fails to compile paints nothing, reports `unavailable` through `onStatusChange` and `data-status`, and hands over the compiler's log. Its line numbers count from the first line of your `glsl`, written `1:<line>`.
2. Read the browser console in development: a key that is not an identifier, a uniform declared twice, too many colours and a colour with no value are each warned about by name.
3. Look at it in light and dark (`data-theme` on the root element), and in a preset if the project uses one. A scene that is right in one mode and a grey block in the other is missing `mode: 'dark'` or is not adding to `u_ground`.
4. Look at it on a wide stage and a narrow one. A shape that stretches needs the aspect correction.
5. Leave a fallback. Where WebGL2 cannot run the scene stays empty and whatever sits under it shows, so the ancestor needs a background of its own, from a token.

## Report

Say where the scene file is, which colour roles it reads, the settings it declares with their ranges, which passes you turned off and why, and what you checked in the browser and what you could not.
