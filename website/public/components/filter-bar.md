# Filter bar

A row of filter chips for narrowing a collection, each opening a popover of options, with per-filter and clear-all resets.

Generated from the rift-ds registry and prop JSDoc, version 1.27.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: forms
- Import: `import { FilterBar } from 'rift-ds';`
- Deep import: `import { FilterBar } from 'rift-ds/components/FilterBar/FilterBar';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/filter-bar
- Schema: https://rift-ds.com/schema/components/filter-bar.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## FilterBar props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| filters | `FilterBarFilter[]` | yes |  | The filters on the bar, in display order. |
| values | `Record<string, string[]>` | no |  | Active options per filter id (controlled). Pair with `onValuesChange`. |
| defaultValues | `Record<string, string[]>` | no |  | Active options per filter id (uncontrolled initial state). |
| onValuesChange | `((values: Record<string, string[]>) => void)` | no |  | Fires with the full active-filter map on every change. Filters with nothing active are absent from the map, so an empty object means unfiltered. |
| clearLabel | `string` | no | `'Clear all'` | Label for the button that clears every filter at once. |
| clearFilterLabel | `((filterLabel: string) => string)` | no | `` (filterLabel: string) => `Clear ${filterLabel}` `` | Accessible name of an active filter's own clear button, given the filter's label. Defaults to "Clear" followed by the label. |
| size | `"default" \| "compact"` | no | `'default'` | Component size |
| className | `string` | no | `''` | Additional CSS classes |

## Types

### FilterBarFilter

One filter: a chip on the bar with a popover of options behind it.

```ts
interface FilterBarFilter {
  /** Stable key for this filter — the key under which its values are reported. */
  id: string;
  /** Chip label, e.g. "Status". */
  label: string;
  /** Icon shown before the label — Material Symbol name (string) or custom element (ReactNode). */
  icon?: string | React.ReactNode;
  /** The choices this filter offers. */
  options: FilterBarOption[];
  /**
   * Whether several options can be active at once. Defaults to true; set it
   * to false for a single-select filter, which closes on choice.
   */
  multiple?: boolean;
}
```

### FilterBarOption

One choice inside a filter's popover.

```ts
interface FilterBarOption {
  /** Stored value, reported through `onValuesChange`. */
  value: string;
  /** Display label. */
  label: string;
}
```

Types from other packages: `ReactNode` (react), `Record` (typescript).
