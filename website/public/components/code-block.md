# Code block

Monospace code with a header and one-click copy.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: data-display
- Import: `import { CodeBlock } from '@robr0/design-system';`
- Deep import: `import { CodeBlock } from '@robr0/design-system/components/CodeBlock/CodeBlock';`
- Rendering: client component (declares 'use client')
- Live docs: https://robertritacca.com/components/code-block

## CodeBlock props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| code | `string` | yes |  | The code to display, as a plain string |
| language | `string` | no |  | Language tag shown in the header, e.g. "tsx", "css" |
| filename | `string` | no |  | Filename shown in the header, e.g. "tokens-light.css" |
| showCopy | `boolean` | no | `true` | Show the copy-to-clipboard button |
| maxHeight | `string \| number` | no |  | Max height of the block; code scrolls vertically inside while the header stays pinned. Numbers are px. |
| collapsible | `boolean` | no | `false` | Show a chevron beside the filename that collapses/expands the code area |
| defaultCollapsed | `boolean` | no | `false` | Start collapsed (only applies when collapsible) |
| className | `string` | no | `` | Additional CSS classes |
