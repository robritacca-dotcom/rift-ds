# Description list

Terms and their values for review screens, receipts, and account details, stacked, in two columns, or in a grid.

Generated from the rift-ds registry and prop JSDoc, version 1.26.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: data-display
- Import: `import { DescriptionList } from 'rift-ds';`
- Deep import: `import { DescriptionList } from 'rift-ds/components/DescriptionList/DescriptionList';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://rift-ds.com/components/description-list
- Schema: https://rift-ds.com/schema/components/description-list.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## DescriptionList props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| items | `DescriptionListEntry[]` | no |  | The entries, in order. Or compose `DescriptionListItem` children instead. |
| children | `ReactNode` | no |  | `DescriptionListItem` children, for a list written out by hand. |
| layout | `"grid" \| "inline" \| "stacked"` | no | `stacked` | `stacked` puts each term above its value; `inline` sets term and value in two columns and stacks them when the list is narrow; `grid` lays stacked entries out in `columns`. |
| columns | `1 \| 2 \| 4 \| 3` | no | `2` | How many columns the `grid` layout uses at full width, 1 to 4. Fewer show as the list narrows. |
| dividers | `boolean` | no | `false` | Draw a divider between entries. |
| size | `"default" \| "compact"` | no | `default` | The type size: `default` the paragraph face, `compact` the small paragraph face for dense panels. |
| termWidth | `"default" \| "narrow" \| "wide"` | no | `default` | How much of the row the term column takes in the `inline` layout: a quarter, a third or a half. |
| align | `"start" \| "end"` | no | `start` | Where values sit: `end` lines amounts up against the far edge. |
| emptyValue | `ReactNode` | no | `Not set` | What an empty value shows. Defaults to "Not set". |
| copyLabel | `((term: string) => string)` | no | `(term: string) => (term ? `Copy ${term}` : 'Copy')` | The copy button's accessible name, given the entry's term when it is text and an empty string when it is not. Defaults to "Copy <term>", or "Copy". |
| copiedLabel | `string` | no | `Copied` | The copy button's accessible name for a moment after a copy. Defaults to "Copied". |
| onValueCopy | `((value: string) => void)` | no |  | Called after a value is put on the clipboard, so a host can confirm it or count it. Only reaches a list rendered from a client component. |
| className | `string` | no | `` | Additional CSS classes. |

## DescriptionListItem props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| details | `ReactNode` | no |  | The value. Empty (null, undefined or an empty string) shows the list's `emptyValue`. |
| term | `ReactNode` | yes |  | The term: what the value is ("Account number", "Due date"). |
| action | `ReactNode` | no |  | A trailing control for this value: an Edit button, a link. |
| copyable | `string \| boolean` | no |  | Offer a copy button: `true` copies the value when it is text, a string copies that string (the unformatted account number behind a formatted one). |
| children | `ReactNode` | no |  | The value, as children. `details` wins when both are set. |
| className | `string` | no | `` | Additional CSS classes. |
