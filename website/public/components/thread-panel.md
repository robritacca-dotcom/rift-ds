# Thread panel

The session-history rail for chat products: brand header, new-thread action, standing controls, projects, grouped detail-rich threads, and a profile footer.

Generated from the rift-ds registry and prop JSDoc, version 1.27.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: ai
- Import: `import { ThreadPanel } from 'rift-ds';`
- Deep import: `import { ThreadPanel } from 'rift-ds/components/ThreadPanel/ThreadPanel';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://rift-ds.com/components/thread-panel
- Schema: https://rift-ds.com/schema/components/thread-panel.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## ThreadPanel props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| groups | `ThreadPanelGroup[]` | yes |  | The history, in display order. A flat list is one group with no label. |
| activeThreadId | `string` | no |  | Id of the thread on stage. Its row renders filled and carries `aria-current`. |
| onThreadSelect | `((id: string) => void)` | no |  | Fires with the clicked thread's id. Rows with an `href` navigate as well. |
| threadActions | `ThreadPanelThreadAction[]` | no |  | Shared menu actions for every thread row, behind a hover-revealed trailing trigger; a thread's own `actions` overrides the set. The menu renders only when `onThreadAction` is also given, and never on a `pending` row. |
| onThreadAction | `((threadId: string, actionId: string) => void)` | no |  | Fires with the thread's id and the chosen action's id. |
| statusLabels | `Partial<Record<ThreadPanelThreadStatus, string>>` | no |  | Spoken text for each thread status, read after the row's title; the dot itself is decorative. Merged over the English defaults (Working, Unread, Needs input, Failed). `idle` is silent unless given a label here. |
| pinnedLabel | `string` | no | `'Pinned'` | Spoken text for a `pinned` thread, read after the title and any status; the pin glyph itself is decorative. Not read on a `pending` row, whose name is its tooltip alone. |
| threadMenuLabel | `string \| ((title: string) => string)` | no | `'Thread options'` | Accessible name for a row's menu trigger. A string is followed by a colon and the thread's title ("Thread options: Q3 plan"); a function is given the title and returns the whole name, so a translation can put the title where its grammar needs it. |
| renamingThreadId | `string` | no |  | Id of the thread being renamed: its row swaps to an inline text field, prefilled with the title and selected. The host owns the state, like everything else. |
| onThreadRename | `((threadId: string, title: string) => void)` | no |  | Fires with the thread's id and the trimmed new title when a rename commits (Enter, or focus leaving the field). An empty or unchanged value fires `onRenameCancel` instead. |
| onRenameCancel | `(() => void)` | no |  | Fires when a rename ends without a change: Escape, an empty value, or an unchanged title. |
| renameLabel | `string` | no | `'Rename thread'` | Accessible name for the inline rename field. |
| logo | `ReactNode` | no |  | Brand mark slot at the top, e.g. a logo `<img>`. While collapsed it doubles as the expand button, AppSidebar's contract. |
| logoText | `string` | no |  | Brand name beside the logo. The header row renders only when `logo`, `logoText`, or `onExpandedChange` is given. |
| newThreadLabel | `string` | no |  | Text for the new-thread row. Defaults to "New thread". The row renders when this, `onNewThread`, or `newThreadHref` is given. |
| newThreadIcon | `string \| ReactNode` | no | `'edit_square'` | Icon for the new-thread row — Material Symbol name (string) or custom element (ReactNode). Defaults to the pen-in-a-box `edit_square`, the same glyph chat headers use for New chat. |
| newThreadShortcut | `string[]` | no |  | Keyboard hint rendered as compact Kbds at the row's trailing edge, as literal keycaps, e.g. `["Ctrl", "N"]`. Decorative — the host owns the actual binding. |
| newThreadKeys | `string` | no |  | Keyboard hint at the row's trailing edge in the shortcut grammar (`mod+shift+o`), drawn in the reader's platform legends. Decorative — bind the action with `useShortcut`. Wins over `newThreadShortcut`. |
| keyLabels | `Partial<Record<string, string>>` | no |  | Replaces any legend `newThreadKeys` is drawn with, such as `{ ctrl: 'Strg' }` for a German keyboard. |
| onNewThread | `(() => void)` | no |  | Fires when the new-thread row is clicked. |
| newThreadHref | `string` | no |  | Optional href — the new-thread row renders as an `<a>`. |
| controls | `ThreadPanelControl[]` | no |  | Standing rows between the new-thread action and the history, e.g. Automations or Settings. |
| onControlSelect | `((id: string) => void)` | no |  | Fires with the clicked control's id. Rows with an `href` navigate as well. |
| projects | `ThreadPanelProject[]` | no |  | Project rows between the standing controls and the history, under their own group heading. The section renders only when non-empty; collapsed, the rows fold to icon circles like the controls. |
| projectsLabel | `string` | no | `'Projects'` | The projects section's group heading text. |
| activeProjectId | `string` | no |  | Id of the open project. Its row renders filled and carries `aria-current`. |
| onProjectSelect | `((id: string) => void)` | no |  | Fires with the clicked project's id. Rows with an `href` navigate as well. |
| onProjectCreate | `(() => void)` | no |  | Fires when the header's trailing new-project button is pressed. The button renders only when this is given. |
| newProjectLabel | `string` | no | `'New project'` | Accessible name for the new-project button. |
| moreLabel | `string` | no |  | Text for the quiet trailing row that reveals older threads, e.g. "Show 20 more". Renders only when given. |
| onShowMore | `(() => void)` | no |  | Fires when the more row is clicked. |
| historyLabel | `string` | no | `'Thread history'` | Accessible name for the scrollable history region. |
| expanded | `boolean` | no | `true` | Whether the panel is expanded (280px, labels and history showing). Collapsed it is AppSidebar's 64px icon rail: circular icon rows, the history faded out, the avatar alone in the footer. |
| onExpandedChange | `((expanded: boolean) => void)` | no |  | Fires with the next state when the toggle (or, collapsed, the logo) is pressed. The toggle renders only when this is given; the panel is controlled, so the host owns the state. |
| collapseLabel | `string` | no | `'Collapse the panel'` | Accessible name for the header toggle while expanded. |
| expandLabel | `string` | no | `'Expand the panel'` | Accessible name for the expand affordance while collapsed. |
| profile | `ThreadPanelProfile` | no |  | The signed-in person, rendered as the footer's Avatar row. |
| footerSlot | `ReactNode` | no |  | Rendered in the footer above the profile row — a theme toggle, a storage meter. Fades out while collapsed, AppSidebar's contract. |
| collapsedFooterSlot | `ReactNode` | no |  | Rendered above the profile row while the panel is collapsed, in `footerSlot`'s place: the same controls at their smallest, such as a SegmentedControl's or ThemeToggle's `cycle` circle, stacked and centred on the rail's axis. AppSidebar's contract: the two forms share one cell and crossfade with the panel, and whichever is hidden is inert. |
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

### Shortcut

A shortcut in the grammar above, such as `mod+k`, `shift+?` or `g i`.

```ts
type Shortcut = string;
```

### ShortcutKeyLabels

The legends a shortcut is drawn with, by modifier or key name. Merged over the platform's defaults.

```ts
type ShortcutKeyLabels = Partial<Record<string, string>>;
```

### ThreadPanelControl

```ts
interface ThreadPanelControl {
  /** Stable identifier reported through `onControlSelect`. */
  id: string;
  /** Leading icon on the row — Material Symbol name (string) or custom element (ReactNode). */
  icon: string | React.ReactNode;
  /** Row text. */
  label: string;
  /** Optional href — the row renders as an `<a>` instead of a `<button>`. */
  href?: string;
}
```

### ThreadPanelGroup

```ts
interface ThreadPanelGroup {
  /** Group heading in the rails' shared mixed-case style, e.g. a project or repo name. Omit for an unlabelled run of threads. */
  label?: string;
  /** The group's threads, in display order. */
  threads: ThreadPanelThread[];
}
```

### ThreadPanelProfile

```ts
interface ThreadPanelProfile {
  /** The signed-in person's display name; also seeds the Avatar's initials. */
  name: string;
  /** The quiet second line under the name, e.g. the person's email, plan or workspace (AppSidebar's profile block carries the email there). */
  meta?: string;
  /** Replace the initials Avatar with a custom element, e.g. an `<Avatar src>`; the row seats a 40px mark (Avatar at `md`). */
  avatar?: React.ReactNode;
}
```

### ThreadPanelProject

```ts
interface ThreadPanelProject {
  /** Stable identifier: `activeProjectId` matches against it and `onProjectSelect` reports it. */
  id: string;
  /** The project's name. */
  label: string;
  /** Leading icon on the row — Material Symbol name (string) or custom element (ReactNode). Omit it and the row draws the project's generated PixelAvatar, which is the default mark. */
  icon?: string | React.ReactNode;
  /** Seed for the generated PixelAvatar a project wears when it has no `icon`. Defaults to `label`; pass a stable id so a renamed project keeps its character. The panel spreads the inks across its projects, so neighbours differ in colour as well as shape. */
  pixelAvatar?: string;
  /** Small trailing annotation in the caption face, e.g. how recently the project was touched. */
  meta?: string;
  /** Optional href — the row renders as an `<a>` instead of a `<button>`. */
  href?: string;
}
```

### ThreadPanelThread

```ts
interface ThreadPanelThread {
  /** Stable identifier: `activeThreadId` matches against it and `onThreadSelect` reports it. */
  id: string;
  /** The thread's one-line title. Overflow fades out under a trailing mask rather than clipping; the full text stays readable in the row's native tooltip. */
  title: string;
  /** Optional href — the row renders as an `<a>` for real navigation instead of a `<button>`. */
  href?: string;
  /** Small trailing annotation in the caption face, e.g. a relative timestamp. */
  meta?: string;
  /** The title is still being generated: the row shows a shimmer bar in the title's place and hides its menu, keeping `title` (e.g. "New chat") as the accessible name. */
  pending?: boolean;
  /** This thread's own menu actions, overriding the panel-wide `threadActions`. */
  actions?: ThreadPanelThreadAction[];
  /** Quiet second line under the title in the caption face — a repo, an environment, a one-line summary. Overflows under the same trailing mask as the title. */
  description?: string;
  /** The thread's state, drawn as the dot leading the row: `idle` (nothing new, nothing running), `working` (an agent is running now), `unread` (finished, not yet seen), `waiting` (blocked on the reader) or `error` (stopped on a failure). Once any thread in the panel carries a status every row draws a dot, the rest reading `idle`, so the titles share one left edge. The dot is decorative; every state but `idle` is also read aloud through `statusLabels`. */
  status?: ThreadPanelThreadStatus;
  /** Legacy boolean for `status: 'unread'`, ignored when `status` is set. @deprecated Use `status: 'unread'` instead. */
  unread?: boolean;
  /** Trailing icon before the meta — Material Symbol name (string) or custom element (ReactNode), e.g. `cloud` for a session that lives remotely. */
  icon?: string | React.ReactNode;
  /** Marks the thread pinned with a trailing pin glyph, read aloud through the panel's `pinnedLabel`. A marker only: the host groups pinned threads (typically a leading group) and offers pin/unpin through the row menu. */
  pinned?: boolean;
}
```

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
