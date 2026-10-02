# Inspector dropdown

One-row select for inspector panels, with the name inside the bar and the library Dropdown's menu and font previews.

Generated from the rift-ds registry and prop JSDoc, version 1.3.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: inspector
- Import: `import { InspectorDropdown } from 'rift-ds';`
- Deep import: `import { InspectorDropdown } from 'rift-ds/components/Inspector/InspectorDropdown';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/inspector-dropdown

## InspectorDropdown props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| label | `string` | yes |  | The setting's name, drawn inside the bar on the left. Also the dropdown's accessible name. |
| value | `string` | no |  | Currently selected value. |
| options | `DropdownOption[]` | yes |  | Available options (flat list). Each option's `font` previews the face, as in Dropdown. |
| groups | `DropdownOptionGroup[]` | no |  | Optional grouped options. When provided, renders groups with labels and separators. |
| placeholder | `string` | no |  | Shown on the right when nothing is selected. |
| disabled | `boolean` | no | `false` | Whether the dropdown is disabled. |
| size | `"default" \| "compact"` | no | `default` | Component size, matching Button: `default` is 40px tall, `compact` 32px. |
| onValueChange | `((value: string) => void)` | no |  | Called with the newly selected value. |
| className | `string` | no | `` | Additional CSS classes, applied to the wrapper. |
