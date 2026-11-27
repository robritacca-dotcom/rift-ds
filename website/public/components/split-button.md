# Split button

Primary action with an attached menu of alternatives, composing Button and DropdownMenu in one pill, in primary or secondary emphasis and any tone.

Generated from the rift-ds registry and prop JSDoc, version 1.40.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: actions
- Import: `import { SplitButton } from 'rift-ds';`
- Deep import: `import { SplitButton } from 'rift-ds/components/SplitButton/SplitButton';`
- Rendering: server-renderable (no 'use client')
- Size: 12.0 kB gzipped with everything it imports, peer dependencies not counted
- Live docs: https://rift-ds.com/components/split-button
- Schema: https://rift-ds.com/schema/components/split-button.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## SplitButton props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| label | `string` | yes |  | Label of the primary action |
| onClick | `MouseEventHandler<HTMLButtonElement>` | no |  | Click handler for the primary action |
| type | `"button" \| "submit" \| "reset"` | no | `'button'` | The primary segment's native type. Defaults to `button`; set `submit` to make the primary action its form's submit button. The menu trigger is always `button`, so opening the menu never submits. |
| items | `DropdownMenuEntry[]` | yes |  | Menu entries for the alternative actions |
| variant | `"neutral" \| "primary" \| "secondary"` | no | `'primary'` | Emphasis, shared by both segments: `primary` (filled) or `secondary` (outlined). The colour is `tone`'s job. `neutral` is the legacy value from before the split and renders as `variant="primary" tone="neutral"`. |
| tone | `"default" \| "destructive" \| "neutral"` | no |  | Colour, shared by both segments: `default` carries the action colour, `neutral` the greys, `destructive` the danger colour. |
| size | `"default" \| "compact"` | no | `'default'` | Component size |
| disabled | `boolean` | no | `false` | Disables both segments |
| loading | `boolean` | no | `false` | Shows a spinner on the primary segment and blocks interaction while an async action runs |
| iconLeft | `string \| ReactNode` | no |  | Icon for the primary segment — Material Symbol name or custom element |
| align | `"start" \| "end"` | no | `'end'` | Horizontal alignment of the menu panel relative to the control |
| menuLabel | `string` | no | `'More actions'` | Accessible name of the menu trigger segment |
| className | `string` | no | `''` | Additional CSS classes, applied to the wrapper around both segments, not the primary button |

## Keyboard

Every row is pressed by an automated test, in a left-to-right and a right-to-left layout.

The main button follows the WAI-ARIA button pattern (https://www.w3.org/WAI/ARIA/apg/patterns/button/).

| Key | What it does |
| --- | --- |
| Enter | Activates the button. |
| Space | Activates the button. |

The menu of other actions follows the WAI-ARIA menu pattern (https://www.w3.org/WAI/ARIA/apg/patterns/menubar/).

| Key | What it does |
| --- | --- |
| On open | Opening the menu moves focus into it. |
| Arrow Down | Moves to the next item. |
| Arrow Up | Moves to the previous item. |
| End | Moves to the last item. |
| Home | Moves to the first item. |
| A letter | Moves to the next item whose name starts with it. |
| Escape | Closes the menu and returns focus to what opened it. |

## Types

### DropdownMenuEntry

```ts
type DropdownMenuEntry =
  | DropdownMenuItem
  | DropdownMenuSeparator
  | DropdownMenuGroup;
```

### DropdownMenuGroup

The props of DropdownMenu: `get_component("DropdownMenu")`.

### DropdownMenuItem

The props of DropdownMenu: `get_component("DropdownMenu")`.

### DropdownMenuSeparator

The props of DropdownMenu: `get_component("DropdownMenu")`.

Types from other packages: `HTMLButtonElement` (typescript), `MouseEventHandler` (react), `ReactNode` (react).
