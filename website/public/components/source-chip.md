# Source chip

A numbered citation pill linking a claim to its source.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: ai
- Import: `import { SourceChip } from '@robr0/design-system';`
- Deep import: `import { SourceChip } from '@robr0/design-system/components/SourceChip/SourceChip';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://robertritacca.com/components/source-chip

## SourceChip props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| title | `string` | yes |  | The source name, e.g. "Design tokens quarterly". Truncates with an ellipsis when long. |
| index | `number` | no |  | Citation number, rendered as a leading numeral in its own small badge circle. |
| icon | `ReactNode` | no |  | Leading icon — a Material Symbol name (string) or custom element (ReactNode). The icon and the index share the leading slot: when both are passed, `index` wins and the icon is not rendered. |
| href | `string` | no |  | Optional href — renders as an `<a>` instead of a `<span>`. |
| className | `string` | no | `` | Additional CSS classes |
