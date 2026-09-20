# Document chip

A compact file reference with a type icon, name, metadata, and optional remove.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: ai
- Import: `import { DocumentChip } from '@robr0/design-system';`
- Deep import: `import { DocumentChip } from '@robr0/design-system/components/DocumentChip/DocumentChip';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://robertritacca.com/components/document-chip

## DocumentChip props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| name | `string` | yes |  | File name, truncated with an ellipsis when it outgrows the tile. |
| fileType | `DocumentChipFileType` | no | `generic` | Document type — picks the leading Material Symbol. |
| icon | `ReactNode` | no |  | Override the type icon — a Material Symbol name, or any custom element. |
| meta | `string` | no |  | Free-text metadata line, e.g. "1.2 MB" or "12 pages" — callers keep their own formatting. |
| progress | `number` | no |  | Upload progress, 0–100. While set, replaces the metadata line with a progress bar. |
| error | `string` | no |  | Error message — replaces the metadata line and colours the tile with the error pair. |
| size | `"default" \| "compact"` | no | `default` | Tile size. Compact drops the metadata line — name only — for dense composer rows. |
| onClick | `(() => void)` | no |  | Click handler — presence makes the chip body (icon + text) an interactive button. |
| onRemove | `(() => void)` | no |  | Remove handler — renders a trailing close button. |
| removeLabel | `string` | no | `Remove file` | Accessible label for the remove button. |
| className | `string` | no | `` | Additional CSS classes |
