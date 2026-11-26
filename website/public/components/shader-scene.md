# Shader scene

A WebGL2 scene, from a night horizon to a spiral galaxy or one of your own in GLSL, in the theme's field colours, with fades, vignette and grain.

Generated from the rift-ds registry and prop JSDoc, version 1.38.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: effects
- Import: `import { ShaderScene } from 'rift-ds';`
- Deep import: `import { ShaderScene } from 'rift-ds/components/ShaderScene/ShaderScene';`
- Rendering: client component (declares 'use client')
- Size: 32.6 kB gzipped with everything it imports, peer dependencies not counted
- Live docs: https://rift-ds.com/components/shader-scene
- Schema: https://rift-ds.com/schema/components/shader-scene.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## ShaderScene props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| scene | `ShaderSceneSource \| ShaderSceneId` | no | `'horizon'` | The scene to paint: one of the library's by id, or a scene of your own as a `ShaderSceneSource` (its colour roles, its settings and the GLSL that paints it). The library's are `horizon`, a planet's limb at night, `rift`, a glowing tear, `glyphs`, soft light printed in type, `prism`, beams of light split into a spectrum, `meteors`, a shower over a planet's edge, `waves`, a rolling sea of points, `highway`, a straight highway at night drawn in light trails, `aurora`, ribbons of colour round a void, `ocean`, open water from above with sea life drawn in type, turquoise on a light page and moonlit on a dark one, `sky`, cloud massed overhead and burning with a low sun, a golden hour on a light page and the last of a sunset under a night sky on a dark one, `galaxy`, a spiral galaxy seen at a slant, deep in a field of stars, and `tide`, dusk over still water smeared like a long exposure, a periwinkle evening on a light page and the last of the light on a dark one. A scene of your own is compared by content, so an object written inline rebuilds nothing until what it says changes. |
| params | `Partial<Record<string, number>>` | no |  | The scene's settings, merged over its defaults (`SHADER_SCENES` lists each library scene's keys and ranges; your own scene declares its own), so passing one changes one thing. Changing them never rebuilds the GL state. |
| passes | `Partial<Record<string, ShaderScenePassSetting>>` | no |  | The finishing passes (`scrim`, `vignette`, `fadeTop`, `fadeBottom`, `grain`), each merged over its defaults. |
| speed | `number` | no | `1.6` | Scene seconds per second: how fast it moves. 0 holds it still. |
| liveRef | `RefObject<Values \| null>` | no |  | A ref the scene reads every frame in place of `params`, `passes` and `speed`, for a host that tunes it by drag: writing the ref moves the scene and renders nothing. Empty falls back to the props. |
| enabled | `boolean` | no | `true` | False never starts WebGL and reports `unavailable`, painting nothing: the kill switch, as on ShaderField. |
| onStatusChange | `((status: ShaderSceneStatus) => void)` | no |  | Called whenever the status changes. Drive a fallback from this, or lay one under the scene: it paints nothing until it is `active`, so what shows while it is pending or cannot run is the caller's design decision. |
| onError | `((message: string) => void)` | no |  | Called with the compiler's log when the scene's GLSL fails to compile or link, for a scene of your own. Its line numbers count from the first line of the scene's `glsl`, written `1:<line>`. The status becomes `unavailable` as well, and the log still reaches the console. Replaces the native `onError` attribute, which a scene's root never fires. |
| className | `string` | no | `''` | Additional CSS classes |

## Keyboard

Nothing here takes focus, so there are no keys. A test holds that.

## Types

### ShaderSceneId

The scenes the library ships, picked by id.

```ts
type ShaderSceneId = 'horizon' | 'rift' | 'glyphs' | 'prism' | 'meteors' | 'waves' | 'aurora' | 'highway' | 'ocean' | 'sky' | 'galaxy' | 'tide';
```

### ShaderSceneParamSpec

One numeric setting of a scene, drawn as a slider by a host that offers controls.

```ts
type ShaderSceneParamSpec = {
  /** The setting's name: a GLSL identifier, which the scene reads as `uniform float u_<key>`. */
  key: string;
  /** The name a host prints beside the slider. */
  label: string;
  /** The lowest value the slider offers. */
  min: number;
  /** The highest value the slider offers. */
  max: number;
  /** The slider's step. */
  step: number;
  /** The value the scene takes when `params` does not set this key. */
  default: number;
};
```

### ShaderScenePassSetting

One finishing pass's setting: whether it runs, and its own settings.

```ts
type ShaderScenePassSetting = {
  /** Run the pass. Each pass has its own default. */
  on?: boolean;
  /** The pass's settings, merged over its defaults. */
  params?: Partial<Record<string, number>>;
};
```

### ShaderSceneSource

A scene of your own, as ShaderScene's `scene` prop takes it: the colour
roles it reads, its settings, and the GLSL that paints it. Hold it at
module scope or pass it inline; the program is rebuilt only when its
content changes.

```ts
type ShaderSceneSource = {
  /**
   * The colour custom properties the scene reads, resolved from the live
   * cascade at the scene into `u_col[0..]` in this order, eight at most.
   * Name the `--color-ambient-*` roles and the scene re-themes with the page.
   */
  colours: string[];
  /**
   * `dark` for a scene that only adds light and so only reads on a dark
   * ground. On a light page its light is computed against a near-black
   * ground of its own and laid onto the page as colour, its brightest
   * marks as a deepened ink of the scene's first colour. A scene
   * without it paints for both modes itself, from the page ground
   * (`u_ground`).
   */
  mode?: "dark";
  /**
   * A ramp of characters, thin to heavy, for a scene that prints type. It
   * is drawn once into a strip texture in the theme's code face
   * (`--font-family-code`) and reaches the GLSL as `u_glyphs`, with the
   * number of characters in `u_glyphCount`.
   */
  glyphs?: string;
  /**
   * The most drawing-buffer pixels per CSS pixel the scene may use, for a
   * scene with detail finer than soft light (type, points). Defaults to 1;
   * the ratio in use reaches the GLSL as `u_ratio`.
   */
  pixelRatio?: number;
  /** The scene's settings. Each arrives in the GLSL as `uniform float u_<key>`, declared for you. */
  params: ShaderSceneParamSpec[];
  /**
   * GLSL ES 3.00 defining `vec3 scene(vec2 uv, float t)`, which returns the
   * pixel's linear colour over the ground (`u_ground`). `uv` runs 0 to 1
   * from the bottom left and `t` is the scene's clock in seconds. The
   * uniforms and the noise helpers are declared before it.
   */
  glsl: string;
};
```

### ShaderSceneStatus

How the scene resolved, the same three states ShaderField reports.
`pending` while the GL context comes up (bounded by a watchdog), `active`
once a frame has painted, `unavailable` when it is disabled, WebGL2
cannot run it or its context is lost (it returns to `active` when the
context comes back, or after it rebuilds on a fresh canvas once it is
near the screen, passing through `pending`).

```ts
type ShaderSceneStatus = 'pending' | 'active' | 'unavailable';
```

### Values

What the canvas reads every frame. A ref holds it, so a drag never renders.

```ts
type Values = {
  speed: number;
  scene: Record<string, number>;
  passes: Record<string, { on: boolean; params: Record<string, number> }>;
};
```

Types from other packages: `Partial` (typescript), `Record` (typescript), `RefObject` (react).
