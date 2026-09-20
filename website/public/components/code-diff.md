# Code diff

Unified diff view for code changes, with added, removed, and context lines.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: ai
- Import: `import { CodeDiff } from '@robr0/design-system';`
- Deep import: `import { CodeDiff } from '@robr0/design-system/components/CodeDiff/CodeDiff';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://robertritacca.com/components/code-diff

## CodeDiff props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| diff | `string` | yes |  | A unified-format diff body. Lines starting with `+` render as additions, `-` as removals, `@@ … |
| filename | `string` | no |  | Filename shown in a header bar above the diff, with an additions/deletions summary |
| showLineNumbers | `boolean` | no | `true` | Show the old and new line number gutters |
| className | `string` | no | `` | Additional CSS classes |

## parseUnifiedDiff props

No own props; native attributes pass through.
