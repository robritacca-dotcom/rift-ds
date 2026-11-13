# Sidebar panel

Secondary navigation column listing one section's pages, with group headings and one level of accordion nesting.

Generated from the rift-ds registry and prop JSDoc, version 1.27.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: layout
- Import: `import { SidebarPanel } from 'rift-ds';`
- Deep import: `import { SidebarPanel } from 'rift-ds/components/SidebarPanel/SidebarPanel';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/sidebar-panel
- Schema: https://rift-ds.com/schema/components/sidebar-panel.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## SidebarPanel props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| items | `SidebarPanelItem[]` | yes |  | Items to list, optionally grouped with `group` and nested one level with `children` |
| title | `string` | no |  | Heading at the top of the panel, usually the label of the item that opened it. Also the panel's accessible name, after a native `aria-label`; with neither, the panel is named "Section navigation". Note: this shadows the native `title` tooltip attribute, which SidebarPanel does not expose. |
| activeKey | `string` | no |  | Key of the item for the current page. Its accordion parent starts open |
| defaultOpenKeys | `string[]` | no |  | Keys of the accordion rows open on first render, in addition to the active item's parent |
| onCollapse | `(() => void)` | no |  | Renders a collapse button beside the heading and calls this when it is pressed |
| collapseLabel | `string` | no |  | Accessible name of the collapse button. Defaults to "Collapse <title>", or "Collapse panel" when there is no title |
| onBack | `(() => void)` | no |  | Renders a back row above the heading and calls this when it is pressed; the drill-in navigation on small screens |
| backLabel | `string` | no | `'Back'` | Label of the back row |
| className | `string` | no | `''` | Additional CSS classes |
| linkComponent | `LinkComponent` | no |  | The component its links render with, such as Next.js's `Link`, so they navigate through the app's router. Wins over a LinkProvider's; a plain `<a>` when neither is set. |

## Types

### LinkComponent

A component that renders a link in place of a plain `<a>`, such as a router's.

```ts
type LinkComponent = React.ElementType<LinkComponentProps>;
```

### LinkComponentProps

The props a link component receives: every anchor attribute, the ref, and
an `href` that is always a string. Next.js's `Link` takes these as they
are; a router whose link takes `to` instead needs a one-line adapter:
`({ href, ...props }) => <RouterLink to={href} {...props} />`.

```ts
type LinkComponentProps = React.ComponentPropsWithRef<'a'> & { href: string };
```

### SidebarPanelItem

```ts
interface SidebarPanelItem {
  /** Unique key for this item */
  key: string;
  /** Display label */
  label: string;
  /** Renders the item as a real link to this URL instead of a button. Ignored when the item has children, whose row is the accordion toggle */
  href?: string;
  /** Click handler — also fires on a link item, so a consumer can route client-side */
  onClick?: () => void;
  /** Trailing pill, e.g. unread items. A count takes the count badge colours; a word stays a quiet pill */
  badge?: string | number;
  /** Group heading this item sits under; consecutive items sharing a group render beneath one heading */
  group?: string;
  /** Nested items — turns this row into an accordion. One level deep: grandchildren are not rendered */
  children?: SidebarPanelItem[];
}
```

Types from other packages: `ComponentPropsWithRef` (react), `ElementType` (react).
