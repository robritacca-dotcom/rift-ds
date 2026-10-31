# Tabs

Tab navigation with underline indicator, icon support, compact size, and full-width mode.

Generated from the rift-ds registry and prop JSDoc, version 1.19.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: navigation
- Import: `import { Tabs } from 'rift-ds';`
- Deep import: `import { Tabs } from 'rift-ds/components/Tabs/Tabs';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/tabs

## Tabs props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| tabs | `Tab[]` | yes |  | Array of tab definitions |
| value | `string` | no |  | Value of the selected tab, for a controlled set. Leave it undefined to let the component keep its own selection, seeded from `defaultValue`. |
| defaultValue | `string` | no |  | Value of the tab selected on first render when the set is uncontrolled. Falls back to the first enabled tab. |
| onValueChange | `((value: string) => void)` | no |  | Called with the value of the tab the user selects |
| activeTab | `string` | no |  | Legacy name for `value`. Deprecated: Use `value` instead. |
| onTabChange | `((value: string) => void)` | no |  | Legacy change callback; fires alongside `onValueChange`. Deprecated: Use `onValueChange` instead. |
| size | `"default" \| "compact"` | no | `default` | Visual size |
| fullWidth | `boolean` | no | `false` | Whether tabs fill the available width |
| className | `string` | no | `` | Additional CSS classes |
| ariaLabel | `string` | no |  | Legacy accessible-name prop for the tab list. Deprecated: Pass the native `aria-label` attribute instead. |
