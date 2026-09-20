# Segmented control

Pill-style toggle between related views with keyboard navigation and icon support.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: actions
- Import: `import { SegmentedControl } from '@robr0/design-system';`
- Deep import: `import { SegmentedControl } from '@robr0/design-system/components/SegmentedControl/SegmentedControl';`
- Rendering: client component (declares 'use client')
- Live docs: https://robertritacca.com/components/segmented-control

## SegmentedControl props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| segments | `Segment[]` | yes |  | Array of segments |
| activeSegment | `string` | yes |  | Currently active segment value |
| onSegmentChange | `((value: string) => void)` | no |  | Callback when segment changes |
| size | `"default" \| "compact"` | no | `default` | Component size |
| variant | `"neutral" \| "primary"` | no | `primary` | Visual treatment of the active segment — teal by default, `neutral` fills it grey |
| fullWidth | `boolean` | no | `false` | Full width — segments fill container |
| ariaLabel | `string` | no |  | Accessible label for the tablist |
| className | `string` | no | `` | Additional CSS classes |
