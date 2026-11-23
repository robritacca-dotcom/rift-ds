# Progress bar

Horizontal bar indicating completion progress, with an optional percentage label.

Generated from the rift-ds registry and prop JSDoc, version 1.35.1. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: feedback
- Import: `import { ProgressBar } from 'rift-ds';`
- Deep import: `import { ProgressBar } from 'rift-ds/components/ProgressBar/ProgressBar';`
- Rendering: server-renderable (no 'use client')
- Size: 0.7 kB gzipped with everything it imports, peer dependencies not counted
- Live docs: https://rift-ds.com/components/progress-bar
- Schema: https://rift-ds.com/schema/components/progress-bar.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## Alternatives

- Use [Spinner](https://rift-ds.com/components/spinner.md) instead when the wait is indeterminate.

## ProgressBar props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| value | `number` | no | `0` | Current progress value (0–100) |
| size | `"default" \| "compact"` | no | `'default'` | Size of the bar |
| showLabel | `boolean` | no | `false` | Show percentage label |
| ariaLabel | `string` | no |  | Legacy accessible-name prop for the bar, saying what is loading. A native `aria-label` wins when both are passed; with neither, the bar is named "Progress". Deprecated: Pass the native `aria-label` attribute instead. |
| locale | `string` | no | `'en-US'` | The BCP 47 locale the percentage label is written in, such as `ar-EG`. Defaults to `en-US`. This component can render from a Server Component, so it takes the prop alone and reads no LocaleProvider. |
| className | `string` | no | `''` | Additional CSS classes |

## Keyboard

Nothing here takes focus, so there are no keys. A test holds that.
