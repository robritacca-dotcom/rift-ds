# Statement

A financial statement: titled sections of amounts with totals, and subtotals down to a bottom line, a column per period.

Generated from the rift-ds registry and prop JSDoc, version 1.29.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: data-display
- Import: `import { Statement } from 'rift-ds';`
- Deep import: `import { Statement } from 'rift-ds/components/Statement/Statement';`
- Rendering: server-renderable (no 'use client')
- Size: 2.7 kB gzipped with everything it imports, peer dependencies not counted
- Live docs: https://rift-ds.com/components/statement
- Schema: https://rift-ds.com/schema/components/statement.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## Alternatives

- Use [Table](https://rift-ds.com/components/table.md) instead when the rows are records to read rather than sections of amounts that add up.

## Statement props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| periods | `string[]` | yes |  | The periods the amounts are for, the column headers in order ("Q1", "Q2", "Year to date"). |
| items | `(StatementSection \| StatementSubtotal)[]` | yes |  | The sections and subtotals, top to bottom; the last subtotal is the bottom line. |
| currency | `string` | no | `'USD'` | The ISO 4217 code the amounts are in. Defaults to `USD`. |
| caption | `string` | yes |  | The statement's name, read as the table's caption ("Profit and loss, 2026"). |
| captionVisible | `boolean` | no | `false` | Shows the caption above the table; it is read either way. |
| labelHeader | `string` | no | `'Item'` | The header of the label column. Defaults to "Item". |
| locale | `string` | no | `'en-US'` | The BCP 47 locale the amounts are written in, such as `de-DE`. Defaults to `en-US`. This component can render from a Server Component, so it takes the prop alone and reads no LocaleProvider. |
| size | `"default" \| "compact"` | no | `'default'` | Row density: `compact` for a statement in a side panel. |
| className | `string` | no | `''` | Additional CSS classes |

## Keyboard

Nothing here takes focus, so there are no keys. A test holds that.

## Types

### DecimalString

A decimal amount written with an optional leading minus, digits and an optional `.` fraction: `"1234.50"`, `"-0.07"`.

```ts
type DecimalString = string;
```

### StatementLine

One line of a section: what it is, and its amount in each period.

```ts
interface StatementLine {
  /** A stable id for the line. */
  id: string;
  /** What the amount is ("Subscriptions", "Rent"). */
  label: string;
  /** The amount in each period, as a decimal string (`"1234.50"`), in the order of `periods`. */
  amounts: DecimalString[];
}
```

### StatementSection

A titled group of lines, with an optional total under them.

```ts
interface StatementSection {
  /** Marks the entry as a section. */
  kind: 'section';
  /** A stable id for the section. */
  id: string;
  /** The section's heading ("Revenue", "Operating expenses"). */
  title: string;
  /** The section's lines. */
  lines: StatementLine[];
  /** The label of the section's total row; leave it out to show no total. */
  totalLabel?: string;
  /** How the section counts toward the subtotals below it: `1` adds (revenue), `-1` subtracts (costs entered as positive amounts). Defaults to 1. */
  sign?: 1 | -1;
}
```

### StatementSubtotal

A running total of every section above it, each counted by its sign: a gross profit, a net profit.

```ts
interface StatementSubtotal {
  /** Marks the entry as a subtotal. */
  kind: 'subtotal';
  /** A stable id for the subtotal. */
  id: string;
  /** What the subtotal is ("Gross profit", "Net profit"). */
  label: string;
}
```
