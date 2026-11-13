# Shader field

An ambient WebGL2 field of soft light sources that sample colour tokens, with a reported fallback status.

Generated from the rift-ds registry and prop JSDoc, version 1.27.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: effects
- Import: `import { ShaderField } from 'rift-ds';`
- Deep import: `import { ShaderField } from 'rift-ds/components/ShaderField/ShaderField';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/shader-field
- Schema: https://rift-ds.com/schema/components/shader-field.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## ShaderField props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| params | `Partial<ShaderParams>` | no |  | Field parameters, merged over the shipped defaults, so passing one property changes one thing. Changing them never rebuilds the GL state. |
| blobs | `readonly ShaderBlob[]` | no | `[ { token: "--color-ambient-1", size: 0.45, cx: 0.175, cy: 0.125, period: 18, phase: 0, weight: 1 }, { token: "--color-ambient-2", size: 0.55, cx: 0.125, cy: 0.125, period: 16, phase: 1, weight: 1 }, { token: "--color-ambient-3", size: 0.9, cx: 0.35, cy: 0.25, period: 22, phase: 0.5, weight: 1 }, { token: "--color-bg-container-secondary", size: 0.55, cx: 0.025, cy: 0.075, period: 14, phase: 1.5, weight: 1 }, { token: "--color-ambient-4", size: 0.55, cx: -0.125, cy: 0.475, period: 17, phase: 0.8, weight: 1 }, { token: "--color-ambient-5", size: 0.48, cx: 0.39, cy: -0.26, period: 19, phase: 0.3, weight: 1 }, { token: "--color-ambient-6", size: 0.3, cx: 0.35, cy: 0.3, period: 15, phase: 1.2, weight: 1 }, { token: "--color-core-ui-secondary", size: 0.75, cx: -0.125, cy: -0.025, period: 20, phase: 0.7, weight: 1 }, ]` | The light sources. Defaults to an eight-source composition: six on the ambient tokens (`--color-ambient-*`, which follow the core accents unless a theme re-points them) and two on surface tokens. Fewer than `BLOB_COUNT` entries is fine — unused slots park off-field; more are ignored, because the shader's uniform arrays are fixed-size. |
| enabled | `boolean` | no | `true` | False keeps WebGL entirely unmounted and reports `unavailable`, so the caller's fallback is the whole background. This is the kill switch: a config lever, or an A/B against the fallback. |
| onStatusChange | `((status: ShaderFieldStatus) => void)` | no |  | Called whenever the renderer's status changes. Drive the fallback layer's visibility from this — the component deliberately does not own one, since what to paint instead is a design decision, not a rendering one. |
| className | `string` | no | `''` | Additional CSS classes |

## Types

### ShaderBlob

One light source in the field.

The coordinate space is the shader's (see field.glsl): origin at the
container centre, one unit = container width, y running downward. Centres
are constants — nothing here is recomputed on resize.

```ts
interface ShaderBlob {
  /**
   * Semantic colour token, read from the canvas's computed style at runtime,
   * so the field re-themes with `data-theme` and with any scoped custom-
   * property override. A token nothing defines resolves to no colour — an
   * invisible source, never an error.
   */
  token: string;
  /** Disc diameter in container-width units. */
  size: number;
  /** Centre offset from the container centre, width units. */
  cx: number;
  /** Centre offset from the container centre, width units. */
  cy: number;
  /** Drift cycle in seconds, before `speed` is applied. */
  period: number;
  /** Phase offset, so sources never move in lockstep. */
  phase: number;
  /**
   * Emission weight. Positive emits light; negative absorbs it, giving a
   * shadow that occludes whatever shines behind it.
   */
  weight: number;
}
```

### ShaderFieldStatus

How the renderer has resolved.

`pending` is the one that matters to a caller: the context is still coming
up, so neither the field nor a fallback should be painted yet — showing a
fallback here and swapping it a frame later reads as two backgrounds loading
in sequence.

```ts
type ShaderFieldStatus = 'pending' | 'active' | 'unavailable';
```

### ShaderParams

The eight tuneable properties of the field.

```ts
interface ShaderParams {
  /** Overall opacity of the field, 0.1–1. */
  intensity: number;
  /** Domain-warp strength: how much fbm noise bends the field, 0–0.5. */
  warp: number;
  /** Noise frequency. Higher values give finer, busier structure, 0.5–6. */
  scale: number;
  /** Drift-rate multiplier on every blob's period, 0–4. */
  speed: number;
  /** Dither/film-grain amplitude, 0–0.4. Also what kills 8-bit banding. */
  grain: number;
  /** Anisotropic stretch: 0 renders discs, 1 renders diagonal streams, 0–1. */
  streak: number;
  /**
   * Cursor-wake strength, 0–1. Defaults to 0 — the interaction is built and
   * dormant, not absent. Raising it turns on the swirl and glow trail, and
   * with them the loop's step up from 30fps to 60fps while a wake is alive.
   */
  react: number;
  /**
   * How much the composition resists shrinking with the container, 0–1.
   *
   * At 0 — the behaviour a CSS blob layer has — the whole
   * field is fitted to whatever width it is given, so a phone shows the
   * entire composition at phone scale: every source small, and more of them
   * crowded into view than the look was built for. At 1 the field holds the
   * scale it was composed at (`REFERENCE_WIDTH`) and a narrower container
   * crops into it instead. Values between blend the two geometrically,
   * keeping some of the shrink so colours still bleed together on a small
   * screen. Above the reference width it does nothing.
   *
   * The default sits between the two, which suits a full-viewport background,
   * read on a phone as a scene rather than a diagram; set it to 0 wherever
   * the point is to see the whole composition, such as a small demo tile.
   */
  crop: number;
}
```

Types from other packages: `Partial` (typescript).
