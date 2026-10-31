# Code block

Monospace code with a header and one-click copy.

Generated from the rift-ds registry and prop JSDoc, version 1.19.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: data-display
- Import: `import { CodeBlock } from 'rift-ds';`
- Deep import: `import { CodeBlock } from 'rift-ds/components/CodeBlock/CodeBlock';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/code-block

## CodeBlock props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| code | `string` | yes |  | The code to display, as a plain string |
| language | `string` | no |  | Language tag shown in the header, e.g. "tsx", "css" |
| filename | `string` | no |  | Filename shown in the header, e.g. "tokens-light.css" |
| showCopy | `boolean` | no | `true` | Show the copy-to-clipboard button |
| onCopied | `(() => void)` | no |  | Called after the code is put on the clipboard, through the async API or its textarea fallback, so a host can count copies. |
| maxHeight | `string \| number` | no |  | Max height of the block; code scrolls vertically inside while the header stays pinned. Numbers are px. |
| collapsible | `boolean` | no | `false` | Show a chevron beside the filename that collapses/expands the code area |
| defaultCollapsed | `boolean` | no | `false` | Start collapsed (only applies when collapsible) |
| copyLabel | `string` | no | `Copy code` | Accessible name for the copy button before it is pressed |
| copyText | `string` | no | `Copy` | Visible text on the copy button before it is pressed |
| copiedLabel | `string` | no | `Copied` | Text and accessible name the copy button shows once the code is copied |
| expandLabel | `string` | no | `Expand code` | Accessible name for the collapse toggle while the code is collapsed |
| collapseLabel | `string` | no | `Collapse code` | Accessible name for the collapse toggle while the code is showing |
| codeLabel | `string` | no |  | Accessible name for the scrollable code region. Defaults to "Code: <filename>", then "Code: <language>", then "Code". |
| className | `string` | no | `` | Additional CSS classes |
