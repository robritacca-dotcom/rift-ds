# World map

A flat world map from Natural Earth land shapes: token-coloured continents, framed bounds, and colour-carrying markers.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: maps
- Import: `import { WorldMap } from '@robr0/design-system';`
- Deep import: `import { WorldMap } from '@robr0/design-system/components/WorldMap/WorldMap';`
- Rendering: client component (declares 'use client')
- Live docs: https://robertritacca.com/components/world-map

## WorldMap props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| points | `WorldMapPoint[]` | no | `[]` | The places to mark. A point outside the framed view is simply not drawn. |
| bounds | `WorldMapBounds` | no | `[-180, -58, 180, 84]` | The window the map frames: `[west, south, east, north]` in degrees. It must not cross the antimeridian. Defaults to the whole world (Antarctica is not in the land data). Changing it resets any zoom. |
| fit | `"cover" \| "contain"` | no | `contain` | How the framed window meets the container: `contain` letterboxes so the whole window is visible, `cover` fills the container and crops the window's edges — the full-bleed stage look. |
| showZoomControls | `boolean` | no | `false` | Renders the zoom pill (zoom out, a percent readout that resets the view, zoom in). Zoom steps into `bounds` and out past them — down to the whole world with air around it, the graticule carrying on into the space. Ctrl or ⌘ with the scroll wheel (a trackpad pinch) zooms at the pointer; a plain scroll keeps scrolling the page. Dragging, or the arrow keys with the map focused, moves the view anywhere on the world at any zoom; a finger only drags while zoomed in, so the page keeps its touch scroll too. Needs `interactive`. |
| maxZoom | `number` | no | `8` | How far the zoom controls can step in, as a multiple of `bounds`. |
| graticuleStep | `number` | no | `15` | Degrees between graticule lines. `0` removes the graticule. |
| showLabels | `boolean` | no | `false` | Draw each point's `label` beside its marker. |
| activePointId | `string` | no |  | The point to single out: its marker enlarges and its callout renders. |
| interactive | `boolean` | no | `true` | Markers are real buttons: hoverable, focusable, clickable. Off, they become inert glyphs and the map is one image. |
| onPointHover | `((point: WorldMapPoint \| null) => void)` | no |  | Fires as the pointer enters a marker (or it takes focus), and with `null` as it leaves. |
| onPointClick | `((point: WorldMapPoint) => void)` | no |  | Fires when a marker is clicked. |
| renderCallout | `((point: WorldMapPoint) => ReactNode)` | no |  | Renders the annotation for the active (or hovered) point, placed beside its marker in an HTML overlay; MapCallout is the intended filling. The overlay carries `data-side="left"\|"right"` for which side of the marker it opens on — toward the map's centre, where the room is. |
| renderHoverCard | `((point: WorldMapPoint) => ReactNode)` | no |  | Wraps each marker in the library's HoverCard, with this as the card's content — the floating-panel alternative to `renderCallout`'s bare readout, opening on hover or focus with the system's delays and Escape dismissal. Content must be phrasing-level (spans), the panel's own rule. Opens upward, or downward for a marker near the frame's top. Needs `interactive`; when both renderers are given, this one wins. |
| label | `string` | no | `World map` | Accessible name for the map, e.g. "Offices across the network". The point count is appended for screen readers. |
| className | `string` | no | `` | Additional CSS classes |
