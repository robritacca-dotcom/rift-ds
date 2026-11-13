# Currency input

An amount of money as a decimal string, read in the locale's marks and grouped once the field is left.

Generated from the rift-ds registry and prop JSDoc, version 1.27.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: forms
- Import: `import { CurrencyInput } from 'rift-ds';`
- Deep import: `import { CurrencyInput } from 'rift-ds/components/CurrencyInput/CurrencyInput';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/currency-input
- Schema: https://rift-ds.com/schema/components/currency-input.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## CurrencyInput props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| label | `string` | no |  | Label text above the field. |
| value | `string \| null` | no |  | The amount as a decimal string (`"1234.50"`), or `null` for none (controlled). Pair with `onValueChange`. |
| defaultValue | `string \| null` | no | `null` | The amount the field starts with (uncontrolled). |
| onValueChange | `((value: string \| null) => void)` | no |  | Called with the amount as a normalised decimal string as the reader types, or `null` while the field holds no number. Fires alongside the native `onChange`. |
| currency | `string` | no | `'USD'` | The ISO 4217 code of the currency, such as `USD`, `EUR` or `JPY`. Defaults to `USD`. |
| currencyDisplay | `"symbol" \| "code" \| "none"` | no | `'symbol'` | How the currency shows inside the field: its symbol, its code, or nothing (when the label already says it). The side it sits on follows the locale. |
| fractionDigits | `number` | no |  | Digits after the point. Defaults to the currency's own: 0 for JPY, 2 for USD, 3 for KWD. |
| allowNegative | `boolean` | no | `false` | Accept a negative amount (a refund, an adjustment). Defaults to false. |
| min | `string` | no |  | The smallest amount, as a decimal string. A value below it is raised to it when the field loses focus. |
| max | `string` | no |  | The largest amount, as a decimal string. A value above it is lowered to it when the field loses focus. |
| step | `string` | no | `'1'` | How much the Up and Down arrow keys add or take away, as a decimal string. Defaults to `"1"`. |
| locale | `string` | no |  | The BCP 47 locale the amount is read and written in, such as `de-DE`. Defaults to the nearest LocaleProvider's, else `en-US`. |
| size | `"default" \| "compact"` | no | `'default'` | Component size (not the native character-width `size` attribute). |
| helperText | `string` | no |  | Helper text below the field. |
| errorText | `ReactNode` | no |  | The error message under the field; setting it marks the field invalid. |
| error | `boolean` | no |  | Error state without a message of its own. |
| name | `string` | no |  | The form field name. The form receives the normalised decimal string through a hidden input, never the formatted text. |
| className | `string` | no | `''` | Additional CSS classes, applied to the wrapper. |

## Types

### DecimalString

A decimal amount written with an optional leading minus, digits and an optional `.` fraction: `"1234.50"`, `"-0.07"`.

```ts
type DecimalString = string;
```

Types from other packages: `ReactNode` (react).
