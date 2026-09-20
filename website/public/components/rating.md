# Rating

Star-scale rating control with keyboard selection, a read-only mode, and a configurable icon.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: forms
- Import: `import { Rating } from '@robr0/design-system';`
- Deep import: `import { Rating } from '@robr0/design-system/components/Rating/Rating';`
- Rendering: client component (declares 'use client')
- Live docs: https://robertritacca.com/components/rating

## Rating props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| value | `number` | no |  | Current rating (controlled). 0 means no rating. |
| defaultValue | `number` | no | `0` | Initial rating for uncontrolled use. 0 means no rating. |
| max | `number` | no | `5` | Number of steps on the scale |
| onValueChange | `((value: number) => void)` | no |  | Convenience callback receiving the new rating directly. Fires on every selection, including a clear back to 0 via `allowClear`. |
| readOnly | `boolean` | no | `false` | Display-only mode — renders the current rating with no interaction |
| disabled | `boolean` | no | `false` | Whether the control is disabled |
| allowClear | `boolean` | no | `false` | Selecting the already-selected step clears the rating back to 0 |
| icon | `string` | no | `star` | Material Symbol drawn for each step |
| size | `"default" \| "compact"` | no | `default` | Component size |
| label | `string` | no | `Rating` | Accessible name for the group, and the base of each step's label |
| className | `string` | no | `` | Additional CSS classes |
