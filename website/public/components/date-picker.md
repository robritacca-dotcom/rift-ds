# Date picker

Inline calendar with month navigation, day selection, and today indicator.

Generated from the rift-ds registry and prop JSDoc, version 1.3.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: forms
- Import: `import { DatePicker } from 'rift-ds';`
- Deep import: `import { DatePicker } from 'rift-ds/components/DatePicker/DatePicker';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/date-picker

## DatePicker props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| value | `string` | no |  | Currently selected date (YYYY-MM-DD) |
| size | `"default" \| "compact"` | no | `default` | Component size |
| disabled | `boolean` | no | `false` | Whether the picker is disabled |
| min | `string` | no |  | Minimum selectable date (YYYY-MM-DD) |
| max | `string` | no |  | Maximum selectable date (YYYY-MM-DD) |
| onDateSelect | `((date: string) => void)` | no |  | Callback when a date is selected |
| className | `string` | no | `` | Additional CSS classes |
