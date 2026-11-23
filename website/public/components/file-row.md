# File row

One file in a list: its type mark, its name as a link or a button, a line of detail and controls at the end.

Generated from the rift-ds registry and prop JSDoc, version 1.36.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: data-display
- Import: `import { FileRow } from 'rift-ds';`
- Deep import: `import { FileRow } from 'rift-ds/components/Attachment/FileRow';`
- Rendering: server-renderable (no 'use client')
- Size: 1.8 kB gzipped with everything it imports, peer dependencies not counted
- Live docs: https://rift-ds.com/components/file-row
- Schema: https://rift-ds.com/schema/components/file-row.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## Alternatives

- Use [Attachment tile](https://rift-ds.com/components/attachment-tile.md) instead when the file sits on a chat message or in a composer, shown as a square.

## FileRow props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| name | `string` | yes |  | The file's name with its extension (`Q3 report.pdf`), which also picks its type mark. |
| mimeType | `string` | no |  | The file's MIME type, when its name has no telling extension. |
| kind | `FileKind` | no | `picked from the name and the MIME type` | The file's kind, when neither its name nor its MIME type says it. |
| typeLabel | `string` | no |  | The type mark's lettering, in place of the one derived from the name. |
| meta | `ReactNode` | no |  | A quiet second line: the size, who added it, when. |
| href | `string` | no |  | Makes the name a link to the file or its preview page. |
| onOpen | `(() => void)` | no |  | Makes the name a button that opens the file in place, such as in a DocumentViewer dialog. `href` wins when both are set. |
| actions | `ReactNode` | no |  | Controls at the row's end: a download, a share, a menu. |
| size | `"default" \| "compact"` | no | `'default'` | Row density: `compact` for a list in a side panel. |
| linkComponent | `LinkComponent` | no |  | The component the name's link renders with, such as Next.js's `Link`, so it navigates through the app's router; a plain `<a>` when unset. This component can render on the server, so it never reads a LinkProvider: pass the prop even under one. |
| className | `string` | no | `''` | Additional CSS classes |

## Keyboard

The name is a native link or button and the actions passed in are native controls, reached with Tab. Those keys belong to the platform, so no test of this library presses them.

## Types

### FileKind

```ts
type FileKind =
  | 'pdf'
  | 'document'
  | 'spreadsheet'
  | 'presentation'
  | 'image'
  | 'audio'
  | 'video'
  | 'archive'
  | 'code'
  | 'text'
  | 'pasted'
  | 'generic';
```

### LinkComponent

A component that renders a link in place of a plain `<a>`, such as a router's.

```ts
type LinkComponent = React.ElementType<LinkComponentProps>;
```

### LinkComponentProps

The props a link component receives: every anchor attribute, the ref, and
an `href` that is always a string. Next.js's `Link` takes these as they
are; a router whose link takes `to` instead needs a one-line adapter:
`({ href, ...props }) => <RouterLink to={href} {...props} />`.

```ts
type LinkComponentProps = React.ComponentPropsWithRef<'a'> & { href: string };
```

Types from other packages: `ComponentPropsWithRef` (react), `ElementType` (react), `ReactNode` (react).
