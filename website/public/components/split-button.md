# Split button

Primary action with an attached menu of alternatives, composing Button and DropdownMenu in one pill.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: actions
- Import: `import { SplitButton } from '@robr0/design-system';`
- Deep import: `import { SplitButton } from '@robr0/design-system/components/SplitButton/SplitButton';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://robertritacca.com/components/split-button

## SplitButton props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| label | `string` | yes |  | Label of the primary action |
| onClick | `MouseEventHandler<HTMLButtonElement>` | no |  | Click handler for the primary action |
| items | `DropdownMenuEntry[]` | yes |  | Menu entries for the alternative actions |
| variant | `"neutral" \| "primary" \| "secondary"` | no | `primary` | Visual treatment, shared by both segments |
| size | `"default" \| "compact"` | no | `default` | Component size |
| disabled | `boolean` | no | `false` | Disables both segments |
| loading | `boolean` | no | `false` | Shows a spinner on the primary segment and blocks interaction while an async action runs |
| iconLeft | `ReactNode` | no |  | Icon for the primary segment — Material Symbol name or custom element |
| align | `"start" \| "end"` | no | `end` | Horizontal alignment of the menu panel relative to the control |
| menuLabel | `string` | no | `More actions` | Accessible name of the menu trigger segment |
| className | `string` | no | `` | Additional CSS classes, applied to the wrapper around both segments, not the primary button |
