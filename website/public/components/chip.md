# Chip

Compact pills for attributes, filters, and inline metadata.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: data-display
- Import: `import { Chip } from '@robr0/design-system';`
- Deep import: `import { Chip } from '@robr0/design-system/components/Chip/Chip';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://robertritacca.com/components/chip

## Chip props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| label | `ReactNode` | yes |  | Chip label — string for plain text, ReactNode for richer content (e.g. a numbered prefix) |
| icon | `ReactNode` | no |  | Leading icon — Material Symbol name (string) or custom element (ReactNode) |
| selected | `boolean` | no |  | Selected state (filter-style chips) — renders the teal active fill |
| disabled | `boolean` | no | `false` | Disabled state |
| size | `"default" \| "compact" \| "large"` | no | `default` | Chip size — `large` matches the default Button and paragraph body scale, for pills that are a primary tap target rather than metadata |
| onClick | `(() => void)` | no |  | Click handler — presence makes the chip an interactive <button> |
| onRemove | `(() => void)` | no |  | Remove handler — renders a trailing close button (input-style chips) |
| removeLabel | `string` | no | `Remove` | Accessible label for the remove button |
| className | `string` | no | `` | Additional CSS classes |
