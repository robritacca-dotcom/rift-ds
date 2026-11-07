# Error summary

Every error on a form at the top of it, each a link that moves focus to its field.

Generated from the rift-ds registry and prop JSDoc, version 1.25.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: feedback
- Import: `import { ErrorSummary } from 'rift-ds';`
- Deep import: `import { ErrorSummary } from 'rift-ds/components/ErrorSummary/ErrorSummary';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/error-summary
- Schema: https://rift-ds.com/schema/components/error-summary.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## ErrorSummary props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| errors | `ErrorSummaryError<ReactNode>[]` | yes |  | The errors, in the form's order: each the id of the control it belongs to and what is wrong. The summary renders nothing while the list is empty. |
| title | `ReactNode` | no |  | The heading, in place of the one `titleLabel` writes. Note: this replaces the native `title` attribute, which ErrorSummary does not expose. |
| titleLabel | `((count: number, formatted: string) => string)` | no | `(count: number, formatted: string) =>   count === 1 ? 'There is a problem' : `There are ${formatted} problems`` | The heading for a given number of errors: the count as a number (for a plural rule) and as written in the locale (for display). Defaults to "There is a problem" for one and "There are <count> problems" for more. |
| description | `ReactNode` | no |  | A line under the heading, before the list. |
| focusOnMount | `boolean` | no | `true` | Move focus to the summary when the list goes from empty to holding errors (on a submit), so a screen reader reads it and a keyboard user starts from it. Defaults to true. |
| headingLevel | `2 \| 4 \| 3` | no | `2` | The heading's level, so the summary takes its place in the page's outline. Defaults to 2. |
| onErrorClick | `((id: string) => void)` | no |  | Called with a control's id after its link moves focus to it. |
| locale | `string` | no |  | The BCP 47 locale the count is written in. Defaults to the nearest LocaleProvider's, else `en-US`. |
| className | `string` | no | `` | Additional CSS classes. |
