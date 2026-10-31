# Progress bar

Horizontal bar indicating completion progress, with an optional percentage label.

Generated from the rift-ds registry and prop JSDoc, version 1.19.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: feedback
- Import: `import { ProgressBar } from 'rift-ds';`
- Deep import: `import { ProgressBar } from 'rift-ds/components/ProgressBar/ProgressBar';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://rift-ds.com/components/progress-bar

## ProgressBar props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| value | `number` | no | `0` | Current progress value (0–100) |
| size | `"default" \| "compact"` | no | `default` | Size of the bar |
| showLabel | `boolean` | no | `false` | Show percentage label |
| ariaLabel | `string` | no |  | Accessible label describing what is loading. Defaults to "Progress"; a passed native `aria-label` works too. |
| locale | `string` | no | `en-US` | The BCP 47 locale the percentage label is written in, such as `ar-EG`. Defaults to `en-US`. This component can render from a Server Component, so it takes the prop alone and reads no LocaleProvider. |
| className | `string` | no | `` | Additional CSS classes |
