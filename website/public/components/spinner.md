# Spinner

Animated circular loading indicator in three sizes and primary, neutral, or inherit variants.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: feedback
- Import: `import { Spinner } from '@robr0/design-system';`
- Deep import: `import { Spinner } from '@robr0/design-system/components/Spinner/Spinner';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://robertritacca.com/components/spinner

## Spinner props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| size | `"sm" \| "md" \| "lg"` | no | `md` | Size of the spinner |
| variant | `"inherit" \| "neutral" \| "primary"` | no | `primary` | Visual variant — `inherit` draws the spinner in `currentColor`, for use inside coloured controls |
| label | `string` | no | `Loading` | Accessible label |
| className | `string` | no | `` | Additional CSS classes |
