# Toggle group

A set of two-state buttons that can be toggled on or off, supporting text and icon items.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: actions
- Import: `import { ToggleGroup } from '@robr0/design-system';`
- Deep import: `import { ToggleGroup } from '@robr0/design-system/components/ToggleGroup/ToggleGroup';`
- Rendering: client component (declares 'use client')
- Live docs: https://robertritacca.com/components/toggle-group

## ToggleGroup props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| items | `ToggleGroupItem[]` | yes |  | Available items |
| value | `string \| string[]` | no | `[]` | Currently active value(s) |
| multiple | `boolean` | no | `false` | Allow multiple selection |
| size | `"default" \| "compact"` | no | `default` | Component size |
| variant | `"neutral" \| "primary"` | no | `primary` | Visual treatment of active items — teal by default, `neutral` fills them grey |
| disabled | `boolean` | no | `false` | Whether the whole group is disabled |
| onValueChange | `((value: string \| string[]) => void)` | no |  | Called with the next selection — a string when single, an array when `multiple` |
| className | `string` | no | `` | Additional CSS classes |
| onChange | `((value: string \| string[]) => void)` | no |  | Legacy change handler, kept for backwards compatibility. Deprecated: Use `onValueChange` instead. |
| ariaLabel | `string` | no |  | Legacy accessible-name prop. Deprecated: Pass the native `aria-label` attribute instead. |
