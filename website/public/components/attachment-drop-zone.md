# Attachment drop zone

A wrapper that makes a whole surface a file drop target, with an outlined overlay while files hover over it.

Generated from the rift-ds registry and prop JSDoc, version 1.3.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: ai
- Import: `import { AttachmentDropZone } from 'rift-ds';`
- Deep import: `import { AttachmentDropZone } from 'rift-ds/components/Attachment/AttachmentDropZone';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/attachment-drop-zone

## AttachmentDropZone props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| onFilesSelected | `((files: File[]) => void)` | no |  | Fires with the files dropped anywhere on the zone. |
| disabled | `boolean` | no | `false` | Stops the zone reacting to drags; its children behave as if it were not there. |
| icon | `ReactNode` | no | `upload_file` | Icon above the overlay's headline: a Material Symbol name, or any custom element. Pass `null` for none. |
| label | `string` | no | `Drop files to attach` | Headline of the overlay shown while files are dragged over the zone. |
| hint | `string` | no |  | Second line of the overlay: what may be dropped, e.g. accepted types and limits. |
| className | `string` | no | `` | Additional CSS classes |
| children | `ReactNode` | no |  | The surface that accepts drops: a chat panel, a thread and its composer. |
