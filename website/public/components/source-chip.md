# Source chip

A numbered citation pill linking a claim to its source.

Generated from the rift-ds registry and prop JSDoc, version 1.7.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: ai
- Import: `import { SourceChip } from 'rift-ds';`
- Deep import: `import { SourceChip } from 'rift-ds/components/SourceChip/SourceChip';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/source-chip

## SourceChip props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| title | `string` | yes |  | The source name, e.g. "Design tokens quarterly". Truncates with an ellipsis when long. |
| index | `number` | no |  | Citation number, rendered as a leading numeral in its own small badge circle. Wins the leading slot over `logo` and `icon`. |
| icon | `ReactNode` | no | `language` | The glyph for a source with neither a number nor a logo — a Material Symbol name (string) or custom element (ReactNode). Defaults to a globe, so the leading slot is never empty. |
| href | `string` | no |  | Optional href — renders as an `<a>` instead of a `<span>`. |
| excerpt | `string` | no |  | The passage the answer drew on. Setting it gives the chip a preview panel that opens on hover, focus or press: the full title over this excerpt. Without an `href` the chip then renders as a `<button>`, so the preview is reachable from the keyboard. |
| source | `string` | no |  | Where the source lives, shown as the preview's top line, e.g. "docs.acme.com". Only rendered with `excerpt`. |
| logo | `ReactNode` | no |  | The source's logo or favicon — an image URL (string) or a custom element (ReactNode), cropped to a circle. It fills the chip's leading slot when there is no `index`, and always leads the preview's top line. Decorative: the title and `source` text carry the name. |
| meta | `string` | no |  | A short trailing fact for the preview's top line, e.g. "Updated 3 days ago". Only rendered with `excerpt`. |
| className | `string` | no | `` | Additional CSS classes |
