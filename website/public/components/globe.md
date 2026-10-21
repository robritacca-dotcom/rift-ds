# Globe

An orthographic globe with markers and great-circle arcs, rotated by drag, keys, or a slow spin.

Generated from the rift-ds registry and prop JSDoc, version 1.12.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: maps
- Import: `import { Globe } from 'rift-ds';`
- Deep import: `import { Globe } from 'rift-ds/components/Globe/Globe';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/globe

## Globe props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| points | `GlobePoint[]` | no | `[]` | The places to mark. |
| arcs | `GlobeArc[]` | no | `[]` | The arcs to draw between them. An arc whose endpoint is not in `points` is skipped. |
| rotation | `GlobeRotation` | no |  | Controlled view: `[longitude, latitude]` of the centre, in degrees. Pair with `onRotationChange`. Omit to let the globe own its rotation. |
| defaultRotation | `GlobeRotation` | no | `[-20, 20]` | Initial view when uncontrolled. |
| onRotationChange | `((rotation: GlobeRotation) => void)` | no |  | Fires whenever the view changes — drag, keys, or the auto-rotation. |
| autoRotate | `number` | no | `3` | Spin slowly on its own, in degrees per second at the shipped motion tempo. The speed follows `--motion-duration-orbit`, so a theme that stretches or shortens its durations slows or quickens the spin with them. Pauses while the pointer is over the globe or it has focus, and never runs under `prefers-reduced-motion`. `0` switches it off. |
| interactive | `boolean` | no | `true` | Drag to rotate, and rotate with the arrow keys (or W, A, S, D) when focused. |
| graticuleStep | `number` | no | `30` | Degrees between graticule lines. `0` removes the graticule. |
| showLabels | `boolean` | no | `true` | Draw each point's `label` beside its marker. |
| activePointId | `string` | no |  | The point to single out: its marker enlarges and its callout renders. |
| onPointHover | `((point: GlobePoint \| null) => void)` | no |  | Fires as the pointer enters a marker (or it takes focus), and with `null` as it leaves. |
| onPointClick | `((point: GlobePoint) => void)` | no |  | Fires when a marker is clicked, or activated with Enter or Space while focused. Setting it makes the markers real buttons on a non-interactive globe too. |
| renderCallout | `((point: GlobePoint) => ReactNode)` | no |  | Renders the annotation for the active (or hovered) point. It is placed beside the marker in an HTML overlay, so any markup works; MapCallout is the intended filling. The overlay carries `data-side="left"\|"right"` for which side of the marker it sits on. |
| label | `string` | no | `Globe` | Accessible name for the globe, e.g. "Listening points across the network". The point and arc counts are appended for screen readers. |
| pointsLabel | `((count: number) => string)` | no | `(count: number) => `${count} ${count === 1 ? 'point' : 'points'}`` | The point count appended to the globe's accessible name, given the count. Defaults to "<count> point" or "<count> points". |
| arcsLabel | `((count: number) => string)` | no | `(count: number) => `${count} ${count === 1 ? 'arc' : 'arcs'}`` | The arc count appended to the globe's accessible name, given the count. Defaults to "<count> arc" or "<count> arcs". |
| rotateHintLabel | `string` | no | `Drag to rotate, or use the arrow keys when focused.` | The pointer and keyboard instructions appended to the accessible name while `interactive`. |
| roleDescription | `string` | no | `globe` | What assistive technology calls the globe in place of its role, applied whichever role it takes: `application` while `interactive`, `group` when only `onPointClick` makes the markers buttons, and `img` otherwise. Defaults to "globe". |
| className | `string` | no | `` | Additional CSS classes |
