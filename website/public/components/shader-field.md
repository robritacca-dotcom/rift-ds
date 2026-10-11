# Shader field

An ambient WebGL2 field of soft light sources that sample colour tokens, with a reported fallback status.

Generated from the rift-ds registry and prop JSDoc, version 1.7.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: effects
- Import: `import { ShaderField } from 'rift-ds';`
- Deep import: `import { ShaderField } from 'rift-ds/components/ShaderField/ShaderField';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/shader-field

## ShaderField props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| params | `Partial<ShaderParams>` | no |  | Field parameters, merged over the shipped defaults, so passing one property changes one thing. Changing them never rebuilds the GL state. |
| blobs | `readonly ShaderBlob[]` | no | `[   { token: "--color-core-accent-gold", size: 0.45, cx: 0.175, cy: 0.125, period: 18, phase: 0, weight: 1 },   { token: "--color-core-accent-mint", size: 0.55, cx: 0.125, cy: 0.125, period: 16, phase: 1, weight: 1 },   { token: "--color-core-accent-violet", size: 0.9, cx: 0.35, cy: 0.25, period: 22, phase: 0.5, weight: 1 },   { token: "--color-bg-container-secondary", size: 0.55, cx: 0.025, cy: 0.075, period: 14, phase: 1.5, weight: 1 },   { token: "--color-core-accent-cobalt", size: 0.55, cx: -0.125, cy: 0.475, period: 17, phase: 0.8, weight: 1 },   { token: "--color-core-accent-coral", size: 0.48, cx: 0.39, cy: -0.26, period: 19, phase: 0.3, weight: 1 },   { token: "--color-core-accent-amber", size: 0.3, cx: 0.35, cy: 0.3, period: 15, phase: 1.2, weight: 1 },   { token: "--color-core-ui-secondary", size: 0.75, cx: -0.125, cy: -0.025, period: 20, phase: 0.7, weight: 1 }, ]` | The light sources. Defaults to an eight-source composition on the core accent tokens. Fewer than `BLOB_COUNT` entries is fine — unused slots park off-field; more are ignored, because the shader's uniform arrays are fixed-size. |
| enabled | `boolean` | no | `true` | False keeps WebGL entirely unmounted and reports `unavailable`, so the caller's fallback is the whole background. This is the kill switch: a config lever, or an A/B against the fallback. |
| onStatusChange | `((status: ShaderFieldStatus) => void)` | no |  | Called whenever the renderer's status changes. Drive the fallback layer's visibility from this — the component deliberately does not own one, since what to paint instead is a design decision, not a rendering one. |
| className | `string` | no | `` | Additional CSS classes |
