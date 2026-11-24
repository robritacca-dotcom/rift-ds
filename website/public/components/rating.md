# Rating

Star-scale rating or a thumbs up and down verdict, with keyboard selection and a read-only mode.

Generated from the rift-ds registry and prop JSDoc, version 1.36.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: forms
- Import: `import { Rating } from 'rift-ds';`
- Deep import: `import { Rating } from 'rift-ds/components/Rating/Rating';`
- Rendering: client component (declares 'use client')
- Size: 1.4 kB gzipped with everything it imports, peer dependencies not counted
- Live docs: https://rift-ds.com/components/rating
- Schema: https://rift-ds.com/schema/components/rating.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## Rating props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| value | `number` | no |  | Current rating (controlled). 0 means no rating. |
| defaultValue | `number` | no | `0` | Initial rating for uncontrolled use. 0 means no rating. |
| max | `number` | no | `5` | Number of steps on the scale |
| onValueChange | `((value: number) => void)` | no |  | Convenience callback receiving the new rating directly. Fires on every selection, including a clear back to 0 via `allowClear`. |
| readOnly | `boolean` | no | `false` | Display-only mode — renders the current rating with no interaction |
| disabled | `boolean` | no | `false` | Whether the control is disabled |
| allowClear | `boolean` | no | `false` | Selecting the already-selected step clears the rating back to 0 |
| icon | `string \| ReactNode` | no | `'star'` | Glyph drawn for each step — Material Symbol name (string) or custom element (ReactNode). A string glyph solidifies on filled steps via the font's fill axis; a custom element should draw with `currentColor` so the filled colour still reads. |
| size | `"default" \| "compact"` | no | `'default'` | Component size |
| label | `string` | no | `'Rating'` | Accessible name for the group, and the base of each step's label (in the `thumbs` form the group's name only; each thumb is named by `upLabel` or `downLabel`) |
| valueLabel | `((value: number, max: number) => string)` | no | `` (value: number, max: number) => `${value} out of ${max}` `` | The spoken value, given a step (or, in `readOnly` mode, the current rating) and `max`. Defaults to "3 out of 5". It follows `label` and a colon, as in "Rating: 3 out of 5". |
| className | `string` | no | `''` | Additional CSS classes |
| variant | `"stars" \| "thumbs"` | no | `'stars'` | The scale's form. `stars` (the default) is a row of `max` steps that fill up to the value. `thumbs` is a two-way verdict, a thumb up and a thumb down, for a quick "Was this helpful?": value 1 is up, 2 is down, 0 is no answer yet, and `max`, `icon` and `valueLabel` are ignored. |
| upLabel | `string` | no | `'Yes'` | Accessible name of the thumb up in the `thumbs` form. |
| downLabel | `string` | no | `'No'` | Accessible name of the thumb down in the `thumbs` form. |

## Keyboard

Every row is pressed by an automated test, in a left-to-right and a right-to-left layout.

Follows the WAI-ARIA radio group pattern (https://www.w3.org/WAI/ARIA/apg/patterns/radio/).

| Key | What it does |
| --- | --- |
| Tab | Moves focus into the group at one option, and out of the group on the next press. |
| Arrow Right | Moves to the next option and chooses it. The opposite arrow in a right-to-left layout. |
| Arrow Left | Moves to the previous option and chooses it. The opposite arrow in a right-to-left layout. |
| End | Moves to the last option and chooses it. |
| Home | Moves to the first option and chooses it. |

Types from other packages: `ReactNode` (react).
