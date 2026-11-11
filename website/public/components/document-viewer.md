# Document viewer

A PDF, an image or a text file shown on the page, with download and a fallback where the browser will not embed it.

Generated from the rift-ds registry and prop JSDoc, version 1.26.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: data-display
- Import: `import { DocumentViewer } from 'rift-ds';`
- Deep import: `import { DocumentViewer } from 'rift-ds/components/DocumentViewer/DocumentViewer';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/document-viewer
- Schema: https://rift-ds.com/schema/components/document-viewer.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## DocumentViewer props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| src | `string` | yes |  | The file's address. |
| title | `string` | yes |  | The document's name, shown in the toolbar and naming the frame for a screen reader. Note: this replaces the native `title` tooltip attribute, which DocumentViewer does not expose. |
| kind | `"auto" \| DocumentViewerKind` | no | `auto` | How to show it, or `auto` to read it from `fileName`, `src` and `mimeType`. A kind the viewer cannot show renders the fallback. Defaults to `auto`. |
| fileName | `string` | no |  | The file's name, extension included, for `auto` and for the downloaded file. Defaults to the last part of `src`. |
| mimeType | `string` | no |  | The file's mime type, when `auto` cannot tell from the name. |
| height | `"fill" \| "default" \| "tall"` | no | `default` | The viewer's height: `default`, `tall`, or `fill` to take the height of its container. |
| bare | `boolean` | no | `false` | Drop the frame and the toolbar and fill the host, for a host that brings its own header with the name and the actions, such as AttachmentViewer. |
| download | `string \| boolean` | no | `true` | Show the download button. A string names the downloaded file. Defaults to true. |
| onDownload | `(() => void)` | no |  | Called when the download button is pressed, in place of the browser's own download: for a file the host must fetch with credentials. |
| openInNewTab | `boolean` | no | `true` | Show the button that opens the file in a new tab. Defaults to true. |
| toolbar | `ReactNode` | no |  | More controls for the toolbar, before the built-in ones: a share button, a page count. |
| fallback | `ReactNode` | no |  | What shows when the file cannot be shown here: an unknown kind, a text file that would not load, or a browser that will not embed a PDF. Defaults to a line saying so and a download button. |
| downloadLabel | `string` | no | `Download` | Accessible name and text of the download button. Defaults to "Download". |
| openLabel | `string` | no | `Open in new tab` | Accessible name of the open button. Defaults to "Open in new tab". |
| zoomInLabel | `string` | no | `Zoom in` | Accessible name of the zoom-in button. Defaults to "Zoom in". |
| zoomOutLabel | `string` | no | `Zoom out` | Accessible name of the zoom-out button. Defaults to "Zoom out". |
| resetZoomLabel | `((percent: string) => string)` | no |  | Accessible name of the button that fits an image to the width again, given the zoom in percent. Defaults to "Fit to width, now <zoom>%". |
| loadingLabel | `string` | no | `Loading document` | Announced while a text file loads. Defaults to "Loading document". |
| fallbackLabel | `string` | no | `This file can’t be shown here.` | The default fallback's line. Defaults to "This file can’t be shown here." |
| locale | `string` | no |  | The BCP 47 locale the zoom is written in. Defaults to the nearest LocaleProvider's, else `en-US`. |
| className | `string` | no | `` | Additional CSS classes |
