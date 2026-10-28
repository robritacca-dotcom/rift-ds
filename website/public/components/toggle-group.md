# Toggle group

A set of two-state buttons that can be toggled on or off, supporting text and icon items.

Generated from the rift-ds registry and prop JSDoc, version 1.16.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: actions
- Import: `import { ToggleGroup } from 'rift-ds';`
- Deep import: `import { ToggleGroup } from 'rift-ds/components/ToggleGroup/ToggleGroup';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/toggle-group

## ToggleGroup props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| items | `ToggleGroupItem[]` | yes |  | Available items |
| value | `string \| string[]` | no |  | Currently active value(s), controlled. Leave undefined to let the group keep its own selection, seeded from `defaultValue`. |
| defaultValue | `string \| string[]` | no | `[]` | Active value(s) on first render when uncontrolled (`value` undefined). |
| multiple | `boolean` | no | `false` | Allow multiple selection, where each item toggles on or off. Without it exactly one item is active once chosen, and pressing it again keeps it. |
| size | `"default" \| "compact"` | no | `default` | Component size |
| tone | `"default" \| "neutral"` | no |  | Colour of active items: `default` takes the action colour, `neutral` fills them grey, for a set whose selection should not carry the action colour's weight. |
| variant | `"neutral" \| "primary"` | no |  | Legacy name for `tone`, from before colour moved onto its own prop: `primary` is `tone="default"`. Deprecated: Use `tone` instead. |
| disabled | `boolean` | no | `false` | Whether the whole group is disabled |
| onValueChange | `((value: string \| string[]) => void)` | no |  | Called with the next selection — a string when single, an array when `multiple` |
| className | `string` | no | `` | Additional CSS classes |
| onChange | `((value: string \| string[]) => void)` | no |  | Legacy change handler, kept for backwards compatibility. Deprecated: Use `onValueChange` instead. |
| ariaLabel | `string` | no |  | Legacy accessible-name prop. Deprecated: Pass the native `aria-label` attribute instead. |
