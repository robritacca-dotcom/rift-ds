# Tree view

Collapsible hierarchy for files, folders, and nested structures.

Generated from the rift-ds registry and prop JSDoc, version 1.33.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: data-display
- Import: `import { TreeView } from 'rift-ds';`
- Deep import: `import { TreeView } from 'rift-ds/components/TreeView/TreeView';`
- Rendering: client component (declares 'use client')
- Size: 2.0 kB gzipped with everything it imports, peer dependencies not counted
- Live docs: https://rift-ds.com/components/tree-view
- Schema: https://rift-ds.com/schema/components/tree-view.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## Alternatives

- Use [Org chart](https://rift-ds.com/components/org-chart.md) instead when the hierarchy is people, drawn as a chart of who reports to whom.

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
| className | `string` | no | `''` | Additional CSS classes |

## Keyboard

Every row is pressed by an automated test, in a left-to-right and a right-to-left layout.

Follows the WAI-ARIA tree view pattern (https://www.w3.org/WAI/ARIA/apg/patterns/treeview/).

| Key | What it does |
| --- | --- |
| Arrow Down | Moves to the next visible row. |
| Arrow Up | Moves to the previous visible row. |
| End | Moves to the last visible row. |
| Home | Moves to the first row. |
| Arrow Right | Opens a closed branch. The opposite arrow in a right-to-left layout. |
| Arrow Left | Closes an open branch. The opposite arrow in a right-to-left layout. |
| A letter | Moves to the next visible row whose name starts with it. |

## Types

### TreeViewNode

```ts
interface TreeViewNode {
  /** Unique identifier for the node */
  id: string;
  /** Text shown on the row */
  label: string;
  /** Icon on the row — Material Symbol name (string) or custom element (ReactNode); defaults to `folder` for branches and `draft` for leaves */
  icon?: string | React.ReactNode;
  /** Child nodes; a non-empty list makes the node an expandable branch */
  children?: TreeViewNode[];
}
```

Types from other packages: `ReactNode` (react).
