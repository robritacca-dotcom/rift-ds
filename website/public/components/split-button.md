# Split button

Primary action with an attached menu of alternatives, composing Button and DropdownMenu in one pill, in primary or secondary emphasis and any tone.

Generated from the rift-ds registry and prop JSDoc, version 1.17.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: actions
- Import: `import { SplitButton } from 'rift-ds';`
- Deep import: `import { SplitButton } from 'rift-ds/components/SplitButton/SplitButton';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://rift-ds.com/components/split-button

## SplitButton props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| label | `string` | yes |  | Label of the primary action |
| onClick | `MouseEventHandler<HTMLButtonElement>` | no |  | Click handler for the primary action |
| items | `DropdownMenuEntry[]` | yes |  | Menu entries for the alternative actions |
| variant | `"neutral" \| "primary" \| "secondary"` | no | `primary` | Emphasis, shared by both segments: `primary` (filled) or `secondary` (outlined). The colour is `tone`'s job. `neutral` is the legacy value from before the split and renders as `variant="primary" tone="neutral"`. |
| tone | `"default" \| "neutral" \| "destructive"` | no |  | Colour, shared by both segments: `default` carries the action colour, `neutral` the greys, `destructive` the danger colour. |
| size | `"default" \| "compact"` | no | `default` | Component size |
| disabled | `boolean` | no | `false` | Disables both segments |
| loading | `boolean` | no | `false` | Shows a spinner on the primary segment and blocks interaction while an async action runs |
| iconLeft | `ReactNode` | no |  | Icon for the primary segment — Material Symbol name or custom element |
| align | `"start" \| "end"` | no | `end` | Horizontal alignment of the menu panel relative to the control |
| menuLabel | `string` | no | `More actions` | Accessible name of the menu trigger segment |
| className | `string` | no | `` | Additional CSS classes, applied to the wrapper around both segments, not the primary button |
