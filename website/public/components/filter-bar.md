# Filter bar

A row of filter chips for narrowing a collection, each opening a popover of options, with per-filter and clear-all resets.

Generated from the rift-ds registry and prop JSDoc, version 1.5.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: forms
- Import: `import { FilterBar } from 'rift-ds';`
- Deep import: `import { FilterBar } from 'rift-ds/components/FilterBar/FilterBar';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/filter-bar

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
