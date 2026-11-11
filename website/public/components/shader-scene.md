# Shader scene

A WebGL2 scene, from a night horizon and a glowing rift to a meteor shower and an aurora, in the theme's field colours, with fades, a vignette and grain.

Generated from the rift-ds registry and prop JSDoc, version 1.25.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: effects
- Import: `import { ShaderScene } from 'rift-ds';`
- Deep import: `import { ShaderScene } from 'rift-ds/components/ShaderScene/ShaderScene';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/shader-scene
- Schema: https://rift-ds.com/schema/components/shader-scene.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## ShaderScene props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| scene | `ShaderSceneId` | no | `horizon` | The scene to paint: `horizon`, a planet's limb at night, `rift`, a glowing tear, `glyphs`, soft light printed in type, `prism`, shafts of light split into a spectrum, `meteors`, a shower over a planet's edge, `waves`, a rolling sea of points, or `aurora`, ribbons of colour round a void. |
| params | `Partial<Record<string, number>>` | no |  | The scene's settings, merged over its defaults (`SHADER_SCENES` lists each scene's keys and ranges), so passing one changes one thing. Changing them never rebuilds the GL state. |
| passes | `Partial<Record<string, ShaderScenePassSetting>>` | no |  | The finishing passes (`scrim`, `vignette`, `fadeTop`, `fadeBottom`, `grain`), each merged over its defaults. |
| speed | `number` | no | `1.6` | Scene seconds per second: how fast it moves. 0 holds it still. |
| liveRef | `RefObject<Values \| null>` | no |  | A ref the scene reads every frame in place of `params`, `passes` and `speed`, for a host that tunes it by drag: writing the ref moves the scene and renders nothing. Empty falls back to the props. |
| enabled | `boolean` | no | `true` | False never starts WebGL and reports `unavailable`, leaving the page ground: the kill switch, as on ShaderField. |
| onStatusChange | `((status: ShaderSceneStatus) => void)` | no |  | Called whenever the status changes. Drive a fallback from this: the scene paints only the page ground when it cannot run, and what to show instead is the caller's design decision. |
| className | `string` | no | `` | Additional CSS classes |
