# Drawer

An edge-anchored panel that slides in from any side, modal by default or resting beside a live page, for filter panels, detail views, and mobile navigation.

Generated from the rift-ds registry and prop JSDoc, version 1.37.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: overlays
- Import: `import { Drawer } from 'rift-ds';`
- Deep import: `import { Drawer } from 'rift-ds/components/Drawer/Drawer';`
- Rendering: client component (declares 'use client')
- Size: 6.0 kB gzipped with everything it imports, peer dependencies not counted
- Live docs: https://rift-ds.com/components/drawer
- Schema: https://rift-ds.com/schema/components/drawer.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## Drawer props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| open | `boolean` | yes |  | Whether the drawer is open |
| onOpenChange | `(open: boolean) => void` | yes |  | Callback when the drawer requests to close |
| title | `string` | yes |  | Drawer title. Note: this shadows the native `title` tooltip attribute, which Drawer does not expose. |
| description | `string` | no |  | Optional subtitle under the title |
| heading | `ReactNode` | no |  | Content shown in place of the title text, such as a site's logo. The `title` still names the dialog, read by assistive tech from a visually hidden heading. |
| children | `ReactNode` | no |  | Drawer body content |
| footer | `ReactNode` | no |  | Optional footer slot — typically a row of Buttons |
| side | `"top" \| "bottom" \| "left" \| "right" \| "start" \| "end"` | no | `'right'` | Edge the panel slides in from. `left` and `right` are the screen's edges in any reading direction; `start` and `end` follow it, so a `start` drawer opens on the left in English and on the right in Arabic. |
| size | `"sm" \| "md" \| "lg"` | no | `'md'` | Panel size along the axis it slides on |
| dismissible | `boolean` | no | `true` | Whether ESC, scrim click, and the close button can dismiss |
| modal | `boolean` | no | `true` | Whether the drawer takes over the page. `true` (the default) draws the scrim, traps focus, locks scroll and makes the page behind inert. `false` leaves the page live beside the panel, for a detail view that follows a list: no scrim, no trap, and a press outside never closes it. Focus still moves into the panel on open; on close it returns to the opener only if it is still inside the panel. |
| layout | `"floating" \| "flush"` | no | `'flush'` | How the panel meets the edge. `flush` (the default) runs to the edge with a hairline on the side facing the page; `floating` holds the panel off every edge as a raised, rounded card. |
| closeLabel | `string` | no | `'Close drawer'` | Accessible name of the close button. |
| className | `string` | no | `''` | Additional CSS classes — applied to the portal container, not the panel |

## Keyboard

Every row is pressed by an automated test, in a left-to-right and a right-to-left layout.

The modal drawer, the default follows the WAI-ARIA dialog pattern (https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/).

| Key | What it does |
| --- | --- |
| On open | Opening moves focus inside. |
| Tab | Moves to the next control inside, and from the last back to the first. Focus never reaches the page behind. |
| Shift + Tab | Moves to the previous control inside, and from the first to the last. |
| Escape | Closes it and returns focus to what opened it. |

Types from other packages: `ReactNode` (react).
