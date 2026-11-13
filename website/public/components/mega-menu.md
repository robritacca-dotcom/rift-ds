# Mega menu

A wide navigation panel of icon rows with descriptions, beside an optional featured card.

Generated from the rift-ds registry and prop JSDoc, version 1.27.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: navigation
- Import: `import { MegaMenu } from 'rift-ds';`
- Deep import: `import { MegaMenu } from 'rift-ds/components/MegaMenu/MegaMenu';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://rift-ds.com/components/mega-menu
- Schema: https://rift-ds.com/schema/components/mega-menu.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## MegaMenu props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| open | `boolean` | yes |  | Whether the panel shows. Controlled by design: the host owns the triggers that open it, so it owns this state too. A closed panel fades out and is `inert`, so its links leave the tab order. |
| items | `MegaMenuItem[]` | yes |  | The link rows, in columns of at least four. A column grows taller before the grid adds one, up to three columns beside a showcase and four without. |
| showcase | `MegaMenuShowcase` | no |  | A featured card in its own column beside the link grid. |
| currentHref | `string` | no |  | The path of the page being viewed. A row whose `href` is this path, or a parent of it, is marked as the current page. |
| onNavigate | `(() => void)` | no |  | Called when any link in the panel is followed, so a host can close it. |
| linkComponent | `LinkComponent` | no |  | The component every link renders through, so a router's link (Next.js `Link`) navigates without a reload. The panel is server-renderable, so it cannot read a `LinkProvider`; a client host resolves one and passes it here. Defaults to `<a>`. |
| className | `string` | no | `''` | Additional CSS classes on the panel. |

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

### MegaMenuItem

One link row in a mega menu: a page and the line that says what is on it.

```ts
interface MegaMenuItem {
  /** Where the row links. */
  href: string;
  /** The page's name. */
  label: string;
  /** One line on what the page holds, clamped to two lines in the panel. */
  description?: string;
  /** A Material Symbols name drawn in the row's icon tile. */
  icon?: string;
  /** An image path drawn in the icon tile instead of `icon`, for a brand or product mark. */
  logo?: string;
}
```

### MegaMenuShowcase

The featured card beside a mega menu's link grid: one link that is the whole card.

```ts
interface MegaMenuShowcase {
  /** Where the card links. */
  href: string;
  /** A short kicker above the title, set in the overline face. */
  overline?: string;
  /** The card's title, followed by a forward arrow. */
  label: string;
  /** One or two lines under the title. */
  description?: string;
  /**
   * A drawing that fills the card behind the copy. Decorative: the title and
   * description carry the meaning, so mark it `aria-hidden`.
   */
  cover?: React.ReactNode;
}
```

Types from other packages: `ComponentPropsWithRef` (react), `ElementType` (react), `ReactNode` (react).
