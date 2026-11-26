# Tabs

Tabs with an underline indicator, icons and counts, compact and full-width modes, and panels it can render itself.

Generated from the rift-ds registry and prop JSDoc, version 1.38.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: navigation
- Import: `import { Tabs } from 'rift-ds';`
- Deep import: `import { Tabs } from 'rift-ds/components/Tabs/Tabs';`
- Rendering: client component (declares 'use client')
- Size: 1.8 kB gzipped with everything it imports, peer dependencies not counted
- Live docs: https://rift-ds.com/components/tabs
- Schema: https://rift-ds.com/schema/components/tabs.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## Alternatives

- Use [Segmented control](https://rift-ds.com/components/segmented-control.md) instead when the options switch a view mode or a filter.

## Tabs props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| tabs | `Tab[]` | yes |  | Array of tab definitions |
| value | `string` | no |  | Value of the selected tab, for a controlled set. Leave it undefined to let the component keep its own selection, seeded from `defaultValue`. |
| defaultValue | `string` | no |  | Value of the tab selected on first render when the set is uncontrolled. Falls back to the first enabled tab. |
| onValueChange | `((value: string) => void)` | no |  | Called with the value of the tab the user selects |
| activeTab | `string` | no |  | Legacy name for `value`. Deprecated: Use `value` instead. |
| onTabChange | `((value: string) => void)` | no |  | Legacy change callback; fires alongside `onValueChange`. Deprecated: Use `onValueChange` instead. |
| size | `"default" \| "compact"` | no | `'default'` | Visual size |
| fullWidth | `boolean` | no | `false` | Whether tabs fill the available width |
| countLabel | `((count: string) => string)` | no | `` (count: string) => `, ${count}` `` | What a screen reader hears after a tab's label for its count, given the count already written in the resolved locale. Defaults to ", 3"; say what it counts (", 3 unread") when the label does not. |
| locale | `string` | no |  | The BCP 47 locale the tab counts are written in, such as `ar-EG`. Defaults to the nearest LocaleProvider's, else `en-US`. |
| className | `string` | no | `''` | Additional CSS classes |
| ariaLabel | `string` | no |  | Legacy accessible-name prop for the tab list. Deprecated: Pass the native `aria-label` attribute instead. |

## Keyboard

Every row is pressed by an automated test, in a left-to-right and a right-to-left layout.

Follows the WAI-ARIA tabs pattern (https://www.w3.org/WAI/ARIA/apg/patterns/tabs/).

| Key | What it does |
| --- | --- |
| Tab | Moves focus into the list at the selected tab, and out of the list on the next press. |
| Arrow Right | Moves to the next tab and selects it. The opposite arrow in a right-to-left layout. |
| Arrow Left | Moves to the previous tab and selects it. The opposite arrow in a right-to-left layout. |
| End | Moves to the last tab and selects it. |
| Home | Moves to the first tab and selects it. |

## Types

### Tab

```ts
interface Tab {
  /** Unique tab identifier */
  value: string;
  /** Display label */
  label: string;
  /** Optional icon — Material Symbol name (string) or custom element (ReactNode) */
  icon?: string | React.ReactNode;
  /** A count after the label (unread items, results), written in the resolved locale; the tab's name carries it through `countLabel`. */
  count?: number;
  /** Whether this tab is disabled */
  disabled?: boolean;
  /** The id of the `role="tabpanel"` element this tab shows, written as the tab's `aria-controls`. Set it when you render the panels yourself; with `content`, Tabs names its own panel and this id is used for it. */
  panelId?: string;
  /** What the tab shows. When any tab has content, Tabs renders a `role="tabpanel"` for each after the tab list, the selected one shown, each named by its tab. The panels are the tab list's siblings, with no wrapper, and the ref and `className` stay on the tab list. Leave it out to render the panels yourself. */
  content?: React.ReactNode;
}
```

Types from other packages: `ReactNode` (react).
