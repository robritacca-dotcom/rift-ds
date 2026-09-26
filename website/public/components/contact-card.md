# Contact card

Linked contact method with icon, label, and value.

Generated from the rift-ds registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

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
| copyable | `boolean` | no | `false` | Renders a copy-to-clipboard button; fires onCopy(value) when clicked |
| onCopy | `((value: string) => void)` | no |  | Called with the card's value when the copy button is clicked |
| copyOnClick | `boolean` | no | `false` | Renders the whole card as a button that copies `value` on click — no navigation |
| className | `string` | no | `` | Additional CSS classes |
