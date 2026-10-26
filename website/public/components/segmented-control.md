# Segmented control

Pill-style toggle between related views with keyboard navigation and icon support.

Generated from the rift-ds registry and prop JSDoc, version 1.14.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: actions
- Import: `import { SegmentedControl } from 'rift-ds';`
- Deep import: `import { SegmentedControl } from 'rift-ds/components/SegmentedControl/SegmentedControl';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/segmented-control

## SegmentedControl props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| segments | `Segment[]` | yes |  | Array of segments |
| value | `string` | no |  | Value of the active segment, for a controlled control. Leave it undefined to let the component keep its own selection, seeded from `defaultValue`. |
| defaultValue | `string` | no |  | Value of the segment active on first render when the control is uncontrolled. Falls back to the first enabled segment. |
| onValueChange | `((value: string) => void)` | no |  | Called with the value of the segment the user selects |
| activeSegment | `string` | no |  | Legacy name for `value`. Deprecated: Use `value` instead. |
| onSegmentChange | `((value: string) => void)` | no |  | Legacy change callback; fires alongside `onValueChange`. Deprecated: Use `onValueChange` instead. |
| size | `"default" \| "compact"` | no | `default` | Component size |
| tone | `"default" \| "neutral"` | no |  | Colour of the active segment: `default` takes the action colour, `neutral` fills it grey, for a set whose selection should not carry the action colour's weight. |
| variant | `"neutral" \| "primary"` | no |  | Legacy name for `tone`, from before colour moved onto its own prop: `primary` is `tone="default"`. Deprecated: Use `tone` instead. |
| fullWidth | `boolean` | no | `false` | Full width — segments fill container |
| collapse | `boolean` | no | `false` | Shed parts rather than overflow when the container is too narrow for the strip. The control measures its own natural widths and drops to labels alone, then to icons alone, in that order — the label carries the meaning, so the icon goes first. It only falls to icons when every segment has one, and hidden labels stay in the accessibility tree, so nothing loses its name. Off by default; the control overflows as before. |
| showLabels | `boolean` | no | `true` | Show each segment's label beside its icon. Set it to `false` for an icon-only strip: the labels stay in the accessibility tree as the segments' names, and a segment without an icon keeps its label on screen. Defaults to `true`. |
| ariaLabel | `string` | no |  | Legacy accessible-name prop for the strip. Deprecated: Pass the native `aria-label` attribute instead. |
| className | `string` | no | `` | Additional CSS classes |
