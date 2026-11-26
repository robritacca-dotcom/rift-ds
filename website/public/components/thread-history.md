# Thread history

A chat’s grouped thread rows with status dots, row menus and inline rename, for a history rail or an app sidebar section.

Generated from the rift-ds registry and prop JSDoc, version 1.39.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: ai
- Import: `import { ThreadHistory } from 'rift-ds';`
- Deep import: `import { ThreadHistory } from 'rift-ds/components/ThreadHistory/ThreadHistory';`
- Rendering: server-renderable (no 'use client')
- Size: 10.7 kB gzipped with everything it imports, peer dependencies not counted
- Live docs: https://rift-ds.com/components/thread-history
- Schema: https://rift-ds.com/schema/components/thread-history.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## Alternatives

- Use [Thread panel](https://rift-ds.com/components/thread-panel.md) instead when the history is the whole rail, with its brand, new-thread row, projects and profile footer.

## ThreadHistory props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| groups | `ThreadPanelGroup[]` | yes |  | The history, in display order. A flat list is one group with no label. Each thread takes ThreadPanel's thread shape. |
| activeThreadId | `string` | no |  | Id of the thread on stage. Its row renders filled and carries `aria-current`. |
| onThreadSelect | `((id: string) => void)` | no |  | Fires with the clicked thread's id. Rows with an `href` navigate as well. |
| threadActions | `ThreadPanelThreadAction[]` | no |  | Shared menu actions for every thread row, behind a hover-revealed trailing trigger (always shown on a touch screen); a thread's own `actions` overrides the set. The menu renders only when `onThreadAction` is also given, and never on a `pending` row. |
| onThreadAction | `((threadId: string, actionId: string) => void)` | no |  | Fires with the thread's id and the chosen action's id. |
| statusLabels | `Partial<Record<ThreadPanelThreadStatus, string>>` | no |  | Spoken text for each thread status, read after the row's title; the dot itself is decorative. Merged over the English defaults (Working, Unread, Needs input, Failed). `idle` is silent unless given a label here. |
| pinnedLabel | `string` | no | `'Pinned'` | Spoken text for a `pinned` thread, read after the title and any status; the pin glyph itself is decorative. |
| threadMenuLabel | `string \| ((title: string) => string)` | no | `'Thread options'` | Accessible name for a row's menu trigger. A string is followed by a colon and the thread's title ("Thread options: Q3 plan"); a function is given the title and returns the whole name, so a translation can put the title where its grammar needs it. |
| renamingThreadId | `string` | no |  | Id of the thread being renamed: its row swaps to an inline text field, prefilled with the title and selected. The host owns the state. |
| onThreadRename | `((threadId: string, title: string) => void)` | no |  | Fires with the thread's id and the trimmed new title when a rename commits (Enter, or focus leaving the field). An empty or unchanged value fires `onRenameCancel` instead. |
| onRenameCancel | `(() => void)` | no |  | Fires when a rename ends without a change: Escape, an empty value, or an unchanged title. |
| renameLabel | `string` | no | `'Rename thread'` | Accessible name for the inline rename field. |
| moreLabel | `string` | no |  | Text for the quiet trailing row that reveals older threads, e.g. "Show 20 more". Renders only when given. |
| onShowMore | `(() => void)` | no |  | Fires when the more row is clicked. |
| collapsibleSections | `boolean` | no | `false` | Let the reader fold each labelled group under its heading: the heading becomes a toggle with a chevron, and the rows glide shut beneath it. |
| collapsedSections | `string[]` | no | `[]` | The folded groups, by each group's `id` (its `label` when it has none). Controlled: pair it with `onCollapsedSectionsChange`. Needs `collapsibleSections`. |
| onCollapsedSectionsChange | `((collapsedSections: string[]) => void)` | no |  | Fires with the full new list of folded groups when a heading is pressed. |
| className | `string` | no | `''` | Additional CSS classes |
| linkComponent | `LinkComponent` | no |  | The component its links render with, such as Next.js's `Link`, so they navigate through the app's router; a plain `<a>` when unset. This component can render on the server, so it never reads a LinkProvider: pass the prop even under one. |

## Keyboard

Its threads are a list of buttons; the rename field commits on Enter and cancels on Escape. The component's own stories test these keys.

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

### ThreadPanelGroup

```ts
interface ThreadPanelGroup {
  /** Group heading in the rails' shared mixed-case style, e.g. a project or repo name. Omit for an unlabelled run of threads. */
  label?: string;
  /** Stable identity for the group's fold state, the key `collapsedSections` lists. Defaults to `label`; set it when the label is translated or may change. */
  id?: string;
  /** The group's threads, in display order. */
  threads: ThreadPanelThread[];
}
```

### ThreadPanelThread

The props of ThreadPanel: `get_component("ThreadPanel")`.

### ThreadPanelThreadAction

```ts
interface ThreadPanelThreadAction {
  /** Stable identifier reported through `onThreadAction`. */
  id: string;
  /** Menu row text. */
  label: string;
  /** Leading icon on the menu row — Material Symbol name (string) or custom element (ReactNode). */
  icon?: string | React.ReactNode;
  /** Destructive styling (the error text colour) for delete-like actions. */
  destructive?: boolean;
}
```

### ThreadPanelThreadStatus

What a thread's leading dot reports. Fill says whether the thread wants
the reader, colour says what it wants, motion says it is live right now:
`idle` is a hollow neutral ring, `working` a pulsing neutral dot, and
`unread`, `waiting` and `error` solid dots in the info, warning and error
roles.

```ts
type ThreadPanelThreadStatus =
  | 'idle'
  | 'working'
  | 'unread'
  | 'waiting'
  | 'error';
```

Types from other packages: `ComponentPropsWithRef` (react), `ElementType` (react), `Partial` (typescript), `ReactNode` (react), `Record` (typescript).
