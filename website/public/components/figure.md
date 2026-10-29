# Figure

Images with captions, in the case-study frame.

Generated from the rift-ds registry and prop JSDoc, version 1.17.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: data-display
- Import: `import { Figure } from 'rift-ds';`
- Deep import: `import { Figure } from 'rift-ds/components/Figure/Figure';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://rift-ds.com/components/figure

## Figure props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| children | `ReactNode` | yes |  | The image element — a plain <img> or a framework image component |
| caption | `ReactNode` | no |  | Caption rendered below the image |
| onClick | `MouseEventHandler<HTMLButtonElement>` | no |  | Click handler (e.g. open a lightbox) — adds zoom affordance + keyboard support. It is attached to the zoom button wrapping the image, not to the `<figure>`, so it replaces the native `onClick` on the root. |
| className | `string` | no | `` | Additional CSS classes |
