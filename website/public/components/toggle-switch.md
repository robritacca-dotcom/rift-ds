# Toggle switch

Binary on/off toggle control with sliding thumb and check indicator, used for settings like theme switching.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: forms
- Import: `import { ToggleSwitch } from '@robr0/design-system';`
- Deep import: `import { ToggleSwitch } from '@robr0/design-system/components/ToggleSwitch/ToggleSwitch';`
- Rendering: client component (declares 'use client')
- Live docs: https://robertritacca.com/components/toggle-switch

## ToggleSwitch props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| checked | `boolean` | no | `true` | Whether the toggle is on (checked) |
| label | `string` | no | `Toggle` | Label text displayed next to the toggle |
| showLabel | `boolean` | no | `true` | Whether to show the label |
| size | `"default" \| "compact"` | no | `default` | Component size |
| onCheckedChange | `((checked: boolean) => void)` | no |  | Called with the next checked state when toggled |
| className | `string` | no | `` | Additional CSS classes |
| onChange | `((checked: boolean) => void)` | no |  | Legacy change handler, kept for backwards compatibility. Deprecated: Use `onCheckedChange` instead. |
| ariaLabel | `string` | no |  | Legacy accessible-name prop. Deprecated: Pass the native `aria-label` attribute instead. |
