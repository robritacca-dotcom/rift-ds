# Figure

Images with captions, in the case-study frame.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: data-display
- Import: `import { Figure } from '@robr0/design-system';`
- Deep import: `import { Figure } from '@robr0/design-system/components/Figure/Figure';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://robertritacca.com/components/figure

## Figure props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| children | `ReactNode` | yes |  | The image element — a plain <img> or a framework image component |
| caption | `ReactNode` | no |  | Caption rendered below the image |
| onClick | `(() => void)` | no |  | Click handler (e.g. open a lightbox) — adds zoom affordance + keyboard support |
| className | `string` | no | `` | Additional CSS classes |
