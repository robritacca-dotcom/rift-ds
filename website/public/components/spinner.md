# Spinner

Animated circular loading indicator in three sizes and a default, neutral or inherit tone.

Generated from the rift-ds registry and prop JSDoc, version 1.19.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: feedback
- Import: `import { Spinner } from 'rift-ds';`
- Deep import: `import { Spinner } from 'rift-ds/components/Spinner/Spinner';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://rift-ds.com/components/spinner

## Spinner props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| size | `"sm" \| "md" \| "lg"` | no | `md` | Size of the spinner |
| tone | `"inherit" \| "default" \| "neutral"` | no |  | Colour of the arc: `default` in the primary text colour, `neutral` in the secondary one, `inherit` in `currentColor`, for use inside coloured controls. |
| variant | `"inherit" \| "neutral" \| "primary"` | no |  | Legacy name for `tone`, from before colour moved onto its own prop: `primary` is `tone="default"`. Deprecated: Use `tone` instead. |
| label | `string` | no | `Loading` | Accessible label, announced as the spinner's name. A passed `aria-label` takes precedence. |
| className | `string` | no | `` | Additional CSS classes |
