# Tabs

Tab navigation with underline indicator, icon support, compact size, and full-width mode.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: navigation
- Import: `import { Tabs } from '@robr0/design-system';`
- Deep import: `import { Tabs } from '@robr0/design-system/components/Tabs/Tabs';`
- Rendering: client component (declares 'use client')
- Live docs: https://robertritacca.com/components/tabs

## Tabs props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| tabs | `Tab[]` | yes |  | Array of tab definitions |
| activeTab | `string` | yes |  | Currently active tab value |
| onTabChange | `((value: string) => void)` | no |  | Callback when tab is selected |
| size | `"default" \| "compact"` | no | `default` | Visual size |
| fullWidth | `boolean` | no | `false` | Whether tabs fill the available width |
| className | `string` | no | `` | Additional CSS classes |
| ariaLabel | `string` | no | `Tabs` | Accessible label for the tab list |
