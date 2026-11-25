# Figure

Images with captions, in the case-study frame, with a Do or Don't verdict for guidelines.

Generated from the rift-ds registry and prop JSDoc, version 1.37.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: data-display
- Import: `import { Figure } from 'rift-ds';`
- Deep import: `import { Figure } from 'rift-ds/components/Figure/Figure';`
- Rendering: server-renderable (no 'use client')
- Size: 0.5 kB gzipped with everything it imports, peer dependencies not counted
- Live docs: https://rift-ds.com/components/figure
- Schema: https://rift-ds.com/schema/components/figure.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## Figure props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| children | `ReactNode` | yes |  | The image element — a plain <img> or a framework image component |
| caption | `ReactNode` | no |  | Caption rendered below the image |
| onClick | `MouseEventHandler<HTMLButtonElement>` | no |  | Click handler (e.g. open a lightbox) — adds zoom affordance + keyboard support. It is attached to the zoom button wrapping the image, not to the `<figure>`, so it replaces the native `onClick` on the root. |
| variant | `"default" \| "error" \| "positive"` | no | `'default'` | A verdict on what the figure shows, for a guideline's Do and Don't pair: `positive` leads the caption with a positive "Do" badge, `error` with an error "Don't" badge, on the crisp container fill. `default` is a plain figure. Set two side by side in a Grid. |
| verdictLabel | `string` | no |  | The verdict mark's text. Defaults to "Do" for `positive` and "Don't" for `error`. |
| className | `string` | no | `''` | Additional CSS classes |

## Keyboard

Nothing here takes focus, so there are no keys. A test holds that.

Types from other packages: `HTMLButtonElement` (typescript), `MouseEventHandler` (react), `ReactNode` (react).
