# Nav list

Vertical list of navigation links for drawers and menus, with three indent levels and per-row expand toggles.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: navigation
- Import: `import { NavList } from '@robr0/design-system';`
- Deep import: `import { NavList } from '@robr0/design-system/components/NavList/NavList';`
- Rendering: client component (declares 'use client')
- Live docs: https://robertritacca.com/components/nav-list

## NavList props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| items | `NavListItem[]` | yes |  | Navigation tree to render. |
| currentHref | `string` | no |  | href of the current page — the exactly matching row gets `aria-current="page"` and the active treatment. |
| expandedIds | `string[]` | no |  | Controlled list of expanded item ids. |
| defaultExpandedIds | `string[]` | no |  | Initially expanded item ids (uncontrolled). |
| onExpandedChange | `((expandedIds: string[]) => void)` | no |  | Fires with the full new list of expanded ids whenever a toggle is pressed, in both controlled and uncontrolled modes. |
| multiple | `boolean` | no | `false` | Allow several sections expanded at once. Default false — expanding one collapses the rest. |
| onNavigate | `((item: NavListItem, event: MouseEvent<HTMLElement, MouseEvent>) => void)` | no |  | Fires when any link is clicked, alongside native navigation — e.g. to close the drawer that contains the list. |
| className | `string` | no | `` | Additional CSS classes |
