# Time picker

Time-of-day field with a dropdown list of selectable times.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: forms
- Import: `import { TimePicker } from '@robr0/design-system';`
- Deep import: `import { TimePicker } from '@robr0/design-system/components/TimePicker/TimePicker';`
- Rendering: client component (declares 'use client')
- Live docs: https://robertritacca.com/components/time-picker

## TimePicker props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| label | `string` | no |  | Label text rendered above the trigger |
| placeholder | `string` | no | `Select time` | Placeholder shown when no time is selected |
| value | `string` | no |  | Currently selected time as a 24-hour "HH:MM" string (controlled) |
| defaultValue | `string` | no |  | Initially selected time as a 24-hour "HH:MM" string (uncontrolled) |
| minTime | `string` | no | `00:00` | Earliest generated option, as a 24-hour "HH:MM" string |
| maxTime | `string` | no | `23:30` | Latest generated option, as a 24-hour "HH:MM" string |
| stepMinutes | `number` | no | `30` | Minutes between generated options |
| hourFormat | `"12" \| "24"` | no | `12` | Display format for the trigger and options — the value stays a 24-hour "HH:MM" string either way |
| size | `"default" \| "compact"` | no | `default` | Component size |
| disabled | `boolean` | no | `false` | Whether the picker is disabled |
| required | `boolean` | no | `false` | Whether the field is required |
| error | `boolean` | no | `false` | Error state |
| helperText | `string` | no |  | Helper or error message |
| onValueChange | `((value: string) => void)` | no |  | Called with the newly selected 24-hour "HH:MM" value |
| className | `string` | no | `` | Additional CSS classes |
