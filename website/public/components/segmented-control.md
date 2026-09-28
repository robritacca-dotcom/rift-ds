# Segmented control

Pill-style toggle between related views with keyboard navigation and icon support.

Generated from the rift-ds registry and prop JSDoc, version 1.1.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: actions
- Import: `import { SegmentedControl } from 'rift-ds';`
- Deep import: `import { SegmentedControl } from 'rift-ds/components/SegmentedControl/SegmentedControl';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/segmented-control

## SegmentedControl props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| segments | `Segment[]` | yes |  | Array of segments |
| activeSegment | `string` | yes |  | Currently active segment value |
| onSegmentChange | `((value: string) => void)` | no |  | Callback when segment changes |
| size | `"default" \| "compact"` | no | `default` | Component size |
| variant | `"neutral" \| "primary"` | no | `primary` | Visual treatment of the active segment — teal by default, `neutral` fills it grey |
| fullWidth | `boolean` | no | `false` | Full width — segments fill container |
| collapse | `boolean` | no | `false` | Shed parts rather than overflow when the container is too narrow for the strip. The control measures its own natural widths and drops to labels alone, then to icons alone, in that order — the label carries the meaning, so the icon goes first. It only falls to icons when every segment has one, and hidden labels stay in the accessibility tree, so nothing loses its name. Off by default; the control overflows as before. |
| ariaLabel | `string` | no |  | Accessible label for the tablist |
| className | `string` | no | `` | Additional CSS classes |
