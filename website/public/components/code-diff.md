# Code diff

Unified diff view for code changes, with added, removed, and context lines.

Generated from the rift-ds registry and prop JSDoc, version 1.14.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: ai
- Import: `import { CodeDiff } from 'rift-ds';`
- Deep import: `import { CodeDiff } from 'rift-ds/components/CodeDiff/CodeDiff';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://rift-ds.com/components/code-diff

## CodeDiff props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| diff | `string` | yes |  | A unified-format diff body. Lines starting with `+` render as additions, `-` as removals, `@@ … |
| filename | `string` | no |  | Filename shown in a header bar above the diff, with an additions/deletions summary |
| showLineNumbers | `boolean` | no | `true` | Show the old and new line number gutters |
| diffLabel | `((filename?: string) => string)` | no | `(filename: string \| undefined) =>   filename ? `Code diff: ${filename}` : 'Code diff'` | Accessible name for the scrolling diff region, given the `filename` when there is one. Defaults to "Code diff: <filename>", or "Code diff" without one. |
| changeLabels | `Partial<CodeDiffChangeLabels>` | no |  | Visually hidden text announced before each changed line, so the change type is not carried by colour and the marker alone. Merged over the English defaults: `added` "Added line:", `removed` "Removed line:". |
| statsLabel | `((additions: number, deletions: number) => string)` | no | `(additions: number, deletions: number) =>   `${additions} added, ${deletions} removed`` | The header's additions and deletions summary as a screen reader hears it, given both counts; the visible `+3 -1` is hidden from assistive technology. Defaults to "3 added, 1 removed". |
| className | `string` | no | `` | Additional CSS classes |
