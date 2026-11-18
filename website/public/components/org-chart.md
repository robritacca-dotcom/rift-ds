# Org chart

Who reports to whom: each person a card with their avatar, name and role, their reports in a row beneath.

Generated from the rift-ds registry and prop JSDoc, version 1.29.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: data-display
- Import: `import { OrgChart } from 'rift-ds';`
- Deep import: `import { OrgChart } from 'rift-ds/components/OrgChart/OrgChart';`
- Rendering: server-renderable (no 'use client')
- Size: 1.4 kB gzipped with everything it imports, peer dependencies not counted
- Live docs: https://rift-ds.com/components/org-chart
- Schema: https://rift-ds.com/schema/components/org-chart.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## Alternatives

- Use [Tree view](https://rift-ds.com/components/tree-view.md) instead when the hierarchy is a list to navigate and fold rather than people drawn as a chart.

## OrgChart props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| root | `OrgChartNode` | yes |  | The person at the top, with everyone under them. |
| label | `string` | yes |  | The chart's name, read before the people in it ("Design team"). |
| linkComponent | `LinkComponent` | no |  | The component the people's links render with, such as Next.js's `Link`, so they navigate through the app's router; a plain `<a>` when unset. This component can render on the server, so it never reads a LinkProvider: pass the prop even under one. |
| className | `string` | no | `''` | Additional CSS classes |

## Keyboard

Each person whose name links to a profile is a native link, reached with Tab. Those keys belong to the platform, so no test of this library presses them.

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

### OrgChartNode

One person in the chart, and the people who report to them.

```ts
interface OrgChartNode {
  /** A stable id for the person. */
  id: string;
  /** Their name. */
  name: string;
  /** Their role ("Head of design"). */
  role?: string;
  /** An image for their avatar; their initials show without one. */
  avatarSrc?: string;
  /** Makes the person's name a link to their profile. */
  href?: string;
  /** The people who report to them, in order. */
  reports?: OrgChartNode[];
}
```

Types from other packages: `ComponentPropsWithRef` (react), `ElementType` (react).
