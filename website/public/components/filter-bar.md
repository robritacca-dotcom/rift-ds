# Filter bar

A row of filter chips for narrowing a collection, each opening a popover of options, with per-filter and clear-all resets.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: forms
- Import: `import { FilterBar } from '@robr0/design-system';`
- Deep import: `import { FilterBar } from '@robr0/design-system/components/FilterBar/FilterBar';`
- Rendering: client component (declares 'use client')
- Live docs: https://robertritacca.com/components/filter-bar

## FilterBar props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| filters | `FilterBarFilter[]` | yes |  | The filters on the bar, in display order. |
| values | `Record<string, string[]>` | no |  | Active options per filter id (controlled). Pair with `onValuesChange`. |
| defaultValues | `Record<string, string[]>` | no |  | Active options per filter id (uncontrolled initial state). |
| onValuesChange | `((values: Record<string, string[]>) => void)` | no |  | Fires with the full active-filter map on every change. Filters with nothing active are absent from the map, so an empty object means unfiltered. |
| clearLabel | `string` | no | `Clear all` | Label for the button that clears every filter at once. |
| size | `"default" \| "compact"` | no | `default` | Component size |
| className | `string` | no | `` | Additional CSS classes |
