# Chip

Compact pills for attributes, filters, and inline metadata.

Generated from the rift-ds registry and prop JSDoc, version 1.15.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: data-display
- Import: `import { Chip } from 'rift-ds';`
- Deep import: `import { Chip } from 'rift-ds/components/Chip/Chip';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://rift-ds.com/components/chip

## Chip props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| label | `ReactNode` | yes |  | Chip label — string for plain text, ReactNode for richer content (e.g. a numbered prefix) |
| icon | `ReactNode` | no |  | Leading icon — Material Symbol name (string) or custom element (ReactNode) |
| selected | `boolean` | no |  | Selected state (filter-style chips): renders the active fill, coloured by `tone` |
| tone | `"default" \| "neutral"` | no | `default` | Colour of the selected fill: `default` takes the action colour, `neutral` fills it grey, for filter rows whose selection should read quietly. |
| disabled | `boolean` | no | `false` | Disabled state |
| size | `"default" \| "compact" \| "large"` | no | `default` | Chip size — `large` matches the default Button and paragraph body scale, for pills that are a primary tap target rather than metadata |
| onClick | `MouseEventHandler<HTMLButtonElement>` | no |  | Click handler — presence makes the chip an interactive <button>. On a removable chip it is attached to the main region's button rather than the root span. |
| onRemove | `(() => void)` | no |  | Remove handler — renders a trailing close button (input-style chips) |
| removeLabel | `string \| ((label: string) => string)` | no | `Remove` | Accessible label for the remove button. Defaults to "Remove". Pass a function to name each chip's button after its own label, so a row of chips does not announce one name for every button: it is given the label's text (a rich label's text content), e.g. `(label) => \`Remove ${label}\``. A plain string is used as given. |
| className | `string` | no | `` | Additional CSS classes |
