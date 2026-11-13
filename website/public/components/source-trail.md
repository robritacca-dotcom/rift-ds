# Source trail

The sources an agent opened while answering, as a collapsible list with per-item status.

Generated from the rift-ds registry and prop JSDoc, version 1.27.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: ai
- Import: `import { SourceTrail } from 'rift-ds';`
- Deep import: `import { SourceTrail } from 'rift-ds/components/SourceTrail/SourceTrail';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/source-trail
- Schema: https://rift-ds.com/schema/components/source-trail.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## SourceTrail props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| items | `SourceTrailItem[]` | yes |  | The sources, in the order the agent opened them. |
| title | `string` | no |  | Header text. Left unset, it is computed from the items — "Reading 3 sources" while any is still pending or active, "Read 3 sources" once every visit has settled. Note: this shadows the native `title` tooltip attribute, which SourceTrail does not expose. |
| readingLabel | `((count: number) => string)` | no | `` (count: number) => `Reading ${count} source${count === 1 ? '' : 's'}` `` | The computed header while any visit is pending or active, or while `streaming`, given the number of sources. Defaults to "Reading 1 source" or "Reading N sources". Ignored when `title` is set. |
| readLabel | `((count: number) => string)` | no | `` (count: number) => `Read ${count} source${count === 1 ? '' : 's'}` `` | The computed header once every visit has settled, given the number of sources. Defaults to "Read 1 source" or "Read N sources". Ignored when `title` is set. |
| statusLabels | `Partial<Record<SourceTrailStatus, string>>` | no |  | Visually hidden text announcing each row's status after its source. Merged over the English defaults (Not opened yet, Reading now, Read). |
| streaming | `boolean` | no | `false` | Still researching: newly appended rows animate in. |
| open | `boolean` | no |  | Open state for controlled use. Pair with `onOpenChange`. |
| defaultOpen | `boolean` | no | `true` | Open state for uncontrolled use. |
| onOpenChange | `((open: boolean) => void)` | no |  | Fires whenever the panel opens or closes. |
| linkComponent | `LinkComponent` | no |  | The component its links render with, such as Next.js's `Link`, so they navigate through the app's router; passed on to each source's SourceChip. Wins over a LinkProvider's; a plain `<a>` when neither is set. |
| className | `string` | no | `''` | Additional CSS classes |

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

### SourceTrailItem

One source the agent opened while answering.

```ts
interface SourceTrailItem {
  /** The source name, passed through to the row's SourceChip. */
  title: string;
  /** Optional link to the source — the chip renders as an anchor. */
  href?: string;
  /** Leading icon for the chip — a Material Symbol name (string) or custom element (ReactNode). */
  icon?: string | React.ReactNode;
  /** Where the visit has got to. Drives the row's indicator; defaults to done. */
  status?: SourceTrailStatus;
  /** Supporting line, e.g. what the source contributed to the answer. */
  detail?: string;
}
```

### SourceTrailStatus

```ts
type SourceTrailStatus = 'pending' | 'active' | 'done';
```

Types from other packages: `ComponentPropsWithRef` (react), `ElementType` (react), `Partial` (typescript), `ReactNode` (react), `Record` (typescript).
