# Inspector dropdown

One-row select for inspector panels, with the name inside the bar and the library Dropdown's menu and font previews.

Generated from the rift-ds registry and prop JSDoc, version 1.27.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: inspector
- Import: `import { InspectorDropdown } from 'rift-ds';`
- Deep import: `import { InspectorDropdown } from 'rift-ds/components/Inspector/InspectorDropdown';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/inspector-dropdown
- Schema: https://rift-ds.com/schema/components/inspector-dropdown.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## InspectorDropdown props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| label | `string` | yes |  | The setting's name, drawn inside the bar on the left. Also the dropdown's accessible name. |
| value | `string` | no |  | Currently selected value, controlled. Leave undefined to let the dropdown keep its own selection, seeded from `defaultValue`. |
| defaultValue | `string` | no |  | Selected value on first render when uncontrolled (`value` undefined). |
| options | `DropdownOption[]` | yes |  | Available options (flat list). Each option's `font` previews the face, as in Dropdown. |
| groups | `DropdownOptionGroup[]` | no |  | Optional grouped options. When provided, renders groups with labels and separators. |
| placeholder | `string` | no |  | Shown on the right when nothing is selected. |
| disabled | `boolean` | no | `false` | Whether the dropdown is disabled. |
| size | `"default" \| "compact"` | no | `'default'` | Component size, matching Button: `default` is 40px tall, `compact` 32px. |
| onValueChange | `((value: string) => void)` | no |  | Called with the newly selected value. |
| className | `string` | no | `''` | Additional CSS classes, applied to the wrapper. |

## Types

### DropdownOption

```ts
interface DropdownOption {
  /** Display label */
  label: string;
  /** Option value */
  value: string;
  /**
   * CSS font-family stack to render this option's label in, so a typeface
   * can preview itself in a font picker. Applies to the option row and to
   * the closed trigger while the option is selected; omitted, the label
   * keeps the theme's own face.
   */
  font?: string;
  /**
   * Icon drawn before the label, in the option row and on the closed
   * trigger while the option is selected — Material Symbol name (string)
   * or custom element (ReactNode).
   */
  icon?: string | React.ReactNode;
  /** Whether this option is disabled */
  disabled?: boolean;
}
```

### DropdownOptionGroup

```ts
interface DropdownOptionGroup {
  /** Group heading */
  label: string;
  /** Options within the group */
  options: DropdownOption[];
}
```

Types from other packages: `ReactNode` (react).
