# App toolbar

The bar along the top of an app’s page: the search, borderless icon controls, the AI button and a primary action, folding in steps as it narrows.

Generated from the rift-ds registry and prop JSDoc, version 1.39.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: layout
- Import: `import { AppToolbar } from 'rift-ds';`
- Deep import: `import { AppToolbar } from 'rift-ds/components/AppToolbar/AppToolbar';`
- Rendering: server-renderable (no 'use client')
- Size: 18.7 kB gzipped with everything it imports, peer dependencies not counted
- Live docs: https://rift-ds.com/components/app-toolbar
- Schema: https://rift-ds.com/schema/components/app-toolbar.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## Alternatives

- Use [Table toolbar](https://rift-ds.com/components/table-toolbar.md) instead when the bar sits over a table and holds its search, filters and view settings.
- Use [Toolbar](https://rift-ds.com/components/toolbar.md) instead when the controls act on a canvas or a view and sit together in one pill.

## AppToolbar props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| onSearch | `MouseEventHandler<HTMLButtonElement>` | no |  | Opens the app's search, usually a CommandPalette. When given, the bar starts with a search field, never narrower than a usable field, folded to its icon when the bar is narrow. |
| searchLabel | `string` | no | `'Search or ask anything'` | The search field's prompt and accessible name. Default "Search or ask anything". |
| searchKeys | `string` | no | `'mod+k'` | The shortcut the search field shows, in the shortcut grammar. The palette owns the key itself; this only draws it. |
| actions | `AppToolbarAction[]` | no | `[]` | The icon controls at the end, borderless: notifications, a calendar, help, settings. On a narrow bar every one after the first moves into a More menu, except those that open a panel or are links. |
| onChat | `MouseEventHandler<HTMLButtonElement>` | no |  | Opens the app's AI chat. When given, an AiButton follows the icon controls, folded to its icon when the bar is narrow. |
| chatLabel | `string` | no | `'Ask AI'` | The AI chat button's label. Default "Ask AI". |
| chatState | `AgentStatusState` | no | `'idle'` | What the agent behind the AI button is doing, in AgentStatus's vocabulary, so the button can show it working. |
| chatExpanded | `boolean` | no |  | Whether the chat the AI button opens is open now, announced as the button's expanded state. |
| primaryAction | `AppToolbarPrimaryAction` | no |  | The page's primary action, last in the row: a primary Button with a leading icon, the AI button's size, folded to its icon when the bar is narrow. |
| size | `"default" \| "compact"` | no | `'default'` | The size of every control in the bar, on the row-control scale: `default` is 40px, `compact` 32px. The search, the icon controls, the AI button and the primary action always share one height. |
| linkComponent | `LinkComponent` | no |  | The component the actions' links render with, such as Next.js's `Link`, so they navigate through the app's router. Wins over a LinkProvider's; a plain `<a>` when neither is set. |
| toolbarLabel | `string` | no | `'App toolbar'` | The bar's accessible name. Default "App toolbar". |
| moreLabel | `string` | no | `'More'` | The More menu button's name, shown when the bar is narrow. Default "More". |
| className | `string` | no | `''` | Additional CSS classes on the bar |

## Keyboard

Tab moves through its controls in order; each control, the More menu among them, keeps its own keys. Those keys belong to the platform, so no test of this library presses them.

## Types

### AgentStatusState

```ts
type AgentStatusState =
  | 'idle'
  | 'thinking'
  | 'working'
  | 'waiting'
  | 'done'
  | 'error';
```

### AppToolbarAction

One of the bar's icon controls, drawn as a borderless IconButton.

```ts
interface AppToolbarAction {
  /** Stable id for the action. */
  id: string;
  /** Material Symbol name (string) or custom element. */
  icon: string | React.ReactNode;
  /** What the action does: the button's accessible name, its tooltip, and its row in the More menu. */
  label: string;
  /** Runs the action. */
  onSelect?: () => void;
  /**
   * Makes the control a link to this address instead, such as the settings
   * page. A link never folds into the More menu, since a menu row is not a
   * link.
   */
  href?: string;
  /**
   * A panel the button opens below it, such as a NotificationCenter. The
   * panel draws its own surface; the bar gives it the floating edge. An
   * action with a panel never folds into the More menu, since a menu row
   * cannot open one.
   */
  panel?: React.ReactNode;
  /** A count or dot on the button, such as unread notifications. */
  badge?: number | string | true;
}
```

### AppToolbarPrimaryAction

The bar's one primary action: a primary Button with a leading icon, last in the row.

```ts
interface AppToolbarPrimaryAction {
  /** What the action does: the button's label, and its name when the bar folds it to its icon. */
  label: string;
  /** Material Symbol name (string) or custom element, leading the label. */
  icon: string | React.ReactNode;
  /** Runs the action. */
  onSelect?: () => void;
}
```

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

Types from other packages: `ComponentPropsWithRef` (react), `ElementType` (react), `HTMLButtonElement` (typescript), `MouseEventHandler` (react), `ReactNode` (react).
