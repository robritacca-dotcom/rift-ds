# Progress bar

Horizontal bar indicating completion progress, with an optional percentage label.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: feedback
- Import: `import { ProgressBar } from '@robr0/design-system';`
- Deep import: `import { ProgressBar } from '@robr0/design-system/components/ProgressBar/ProgressBar';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://robertritacca.com/components/progress-bar

## ProgressBar props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| value | `number` | no | `0` | Current progress value (0–100) |
| size | `"default" \| "compact"` | no | `default` | Size of the bar |
| showLabel | `boolean` | no | `false` | Show percentage label |
| ariaLabel | `string` | no |  | Accessible label describing what is loading |
| className | `string` | no | `` | Additional CSS classes |
