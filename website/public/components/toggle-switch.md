# Toggle switch

Binary on/off toggle control with sliding thumb and check indicator, used for settings like theme switching.

Generated from the rift-ds registry and prop JSDoc, version 1.0.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: forms
- Import: `import { ToggleSwitch } from 'rift-ds';`
- Deep import: `import { ToggleSwitch } from 'rift-ds/components/ToggleSwitch/ToggleSwitch';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/toggle-switch

## ToggleSwitch props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| checked | `boolean` | no | `true` | Whether the toggle is on (checked) |
| label | `string` | no | `Toggle` | Label text displayed next to the toggle |
| showLabel | `boolean` | no | `true` | Whether to show the label |
| helperText | `string` | no |  | Helper or error message rendered under the label text |
| error | `boolean` | no | `false` | Error state — recolours the helper text and marks the switch invalid |
| size | `"default" \| "compact"` | no | `default` | Component size |
| onCheckedChange | `((checked: boolean) => void)` | no |  | Called with the next checked state when toggled |
| className | `string` | no | `` | Additional CSS classes |
| onChange | `((checked: boolean) => void)` | no |  | Legacy change handler, kept for backwards compatibility. Deprecated: Use `onCheckedChange` instead. |
| ariaLabel | `string` | no |  | Legacy accessible-name prop. Deprecated: Pass the native `aria-label` attribute instead. |
