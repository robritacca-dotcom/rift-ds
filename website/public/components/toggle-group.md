# Toggle group

A set of two-state buttons that can be toggled on or off, supporting text and icon items.

Generated from the rift-ds registry and prop JSDoc, version 1.36.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: actions
- Import: `import { ToggleGroup } from 'rift-ds';`
- Deep import: `import { ToggleGroup } from 'rift-ds/components/ToggleGroup/ToggleGroup';`
- Rendering: client component (declares 'use client')
- Size: 0.6 kB gzipped with everything it imports, peer dependencies not counted
- Live docs: https://rift-ds.com/components/toggle-group
- Schema: https://rift-ds.com/schema/components/toggle-group.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## ToggleGroup props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| items | `ToggleGroupItem[]` | yes |  | Available items |
| value | `string \| string[]` | no |  | Currently active value(s), controlled. Leave undefined to let the group keep its own selection, seeded from `defaultValue`. |
| defaultValue | `string \| string[]` | no | `[]` | Active value(s) on first render when uncontrolled (`value` undefined). |
| multiple | `boolean` | no | `false` | Allow multiple selection, where each item toggles on or off. Without it exactly one item is active once chosen, and pressing it again keeps it. |
| size | `"default" \| "compact"` | no | `'default'` | Component size |
| tone | `"default" \| "neutral"` | no |  | Colour of active items: `default` takes the action colour, `neutral` fills them grey, for a set whose selection should not carry the action colour's weight. |
| variant | `"neutral" \| "primary"` | no |  | Legacy name for `tone`, from before colour moved onto its own prop: `primary` is `tone="default"`. Deprecated: Use `tone` instead. |
| disabled | `boolean` | no | `false` | Whether the whole group is disabled |
| onValueChange | `((value: string \| string[]) => void)` | no |  | Called with the next selection — a string when single, an array when `multiple` |
| className | `string` | no | `''` | Additional CSS classes |
| onChange | `((value: string \| string[]) => void)` | no |  | Legacy change handler, kept for backwards compatibility. Deprecated: Use `onValueChange` instead. |
| ariaLabel | `string` | no |  | Legacy accessible-name prop. Deprecated: Pass the native `aria-label` attribute instead. |

## Keyboard

Every row is pressed by an automated test, in a left-to-right and a right-to-left layout.

Follows the WAI-ARIA toggle button pattern (https://www.w3.org/WAI/ARIA/apg/patterns/button/).

| Key | What it does |
| --- | --- |
| Enter | Changes whether the button is pressed. |
| Space | Does the same as Enter. |

## Types

### ToggleGroupItem

```ts
interface ToggleGroupItem {
  /** Unique value */
  value: string;
  /** Display label or icon name (Material Symbols) */
  label: string;
  /**
   * Draw `label` as a Material Symbol icon instead of text. An item is an
   * icon or a label, never both: for icon-plus-label options, use
   * SegmentedControl, whose segments take an `icon` beside their `label`.
   */
  icon?: boolean;
}
```
