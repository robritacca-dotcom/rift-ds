# Tree view

Collapsible hierarchy for files, folders, and nested structures.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: data-display
- Import: `import { TreeView } from '@robr0/design-system';`
- Deep import: `import { TreeView } from '@robr0/design-system/components/TreeView/TreeView';`
- Rendering: client component (declares 'use client')
- Live docs: https://robertritacca.com/components/tree-view

## TreeView props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| nodes | `TreeViewNode[]` | yes |  | Tree data to render |
| defaultExpandedIds | `string[]` | no | `[]` | IDs of initially expanded branches (uncontrolled) |
| expandedIds | `string[]` | no |  | Expanded branch IDs (controlled) — pair with `onExpandedChange` |
| onExpandedChange | `((ids: string[]) => void)` | no |  | Called with the full list of expanded branch IDs whenever a branch toggles |
| selectedId | `string` | no |  | Selected node ID (controlled) — pair with `onSelect` |
| defaultSelectedId | `string` | no |  | ID of the initially selected node (uncontrolled) |
| onSelect | `((id: string) => void)` | no |  | Called with the node's ID when a row is selected via click, Enter, or Space. Intentionally shadows the native `select` event handler, which has no meaning on a tree widget. |
| className | `string` | no | `` | Additional CSS classes |
