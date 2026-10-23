# Contact card

Linked contact method with icon, label, and value.

Generated from the rift-ds registry and prop JSDoc, version 1.13.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: data-display
- Import: `import { ContactCard } from 'rift-ds';`
- Deep import: `import { ContactCard } from 'rift-ds/components/ContactCard/ContactCard';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/contact-card

## ContactCard props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| label | `string` | yes |  | Primary label — e.g. "Email" |
| value | `string` | yes |  | Visible value or description — e.g. "hello@example.com" |
| href | `string` | yes |  | Link destination |
| icon | `ReactNode` | no |  | Icon used when no logo is set — Material Symbol name (string) or custom element (ReactNode) |
| logo | `string` | no |  | Path to a logo image — preferred over icon when both are provided |
| external | `boolean` | no | `false` | Opens link in a new tab and shows open_in_new indicator |
| copyable | `boolean` | no | `false` | Renders a copy button beside the trailing icon. Pressing it calls `onCopy(value)`; ContactCard never writes to the clipboard itself. |
| onCopy | `((value: string) => void)` | no |  | Called with the card's value when the copy control is pressed: the copy button, or the whole card when `copyOnClick` is set. ContactCard does not touch the clipboard, so write the value there in this handler. Note: this replaces the native `onCopy` clipboard-event handler, which ContactCard does not expose. |
| copyOnClick | `boolean` | no | `false` | Renders the whole card as a button that calls `onCopy(value)` on click, with no navigation. The copying itself is the `onCopy` handler's job. |
| copyLabel | `string` | no |  | Accessible name for the copy control: the copy button, or the whole card when `copyOnClick` is set. Defaults to "Copy <value>", and to "Copy <value> to clipboard" on a `copyOnClick` card; both defaults assume your `onCopy` writes the value to the clipboard. |
| className | `string` | no | `` | Additional CSS classes |
| linkComponent | `LinkComponent` | no |  | The component its links render with, such as Next.js's `Link`, so they navigate through the app's router. Wins over a LinkProvider's; a plain `<a>` when neither is set. |
