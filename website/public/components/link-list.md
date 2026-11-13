# Link list

Linked items with logo, label, and subtitle.

Generated from the rift-ds registry and prop JSDoc, version 1.27.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: data-display
- Import: `import { LinkList } from 'rift-ds';`
- Deep import: `import { LinkList } from 'rift-ds/components/LinkList/LinkList';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://rift-ds.com/components/link-list
- Schema: https://rift-ds.com/schema/components/link-list.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## LinkList props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| items | `LinkListItem[]` | yes |  | Links to render, in display order |
| className | `string` | no | `''` | Additional CSS classes |
| linkComponent | `LinkComponent` | no |  | The component its links render with, such as Next.js's `Link`, so they navigate through the app's router; a plain `<a>` when unset. This component can render on the server, so it never reads a LinkProvider: pass the prop even under one. |

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

### LinkListItem

```ts
interface LinkListItem {
  /** Link destination */
  href: string;
  /** Primary label — shown with the open_in_new icon */
  label: string;
  /** One or more subtitle lines shown below the label */
  sub?: string | string[];
  /** Path to a logo image (preferred over icon when both are set) */
  logo?: string;
  /** Alt text for the logo — defaults to empty string (decorative) */
  logoAlt?: string;
  /** Icon used when no logo is provided — Material Symbol name (string, e.g. "emoji_events") or custom element (ReactNode) */
  icon?: string | React.ReactNode;
  /** Open in a new tab. Defaults to true; set false for links inside the same site, which swaps the open_in_new indicator for arrow_forward. */
  newTab?: boolean;
}
```

Types from other packages: `ComponentPropsWithRef` (react), `ElementType` (react), `ReactNode` (react).
