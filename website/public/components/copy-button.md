# Copy button

A button that puts a value on the clipboard and confirms it, with text or as an icon alone.

Generated from the rift-ds registry and prop JSDoc, version 1.36.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: actions
- Import: `import { CopyButton } from 'rift-ds';`
- Deep import: `import { CopyButton } from 'rift-ds/components/CopyButton/CopyButton';`
- Rendering: client component (declares 'use client')
- Size: 5.7 kB gzipped with everything it imports, peer dependencies not counted
- Live docs: https://rift-ds.com/components/copy-button
- Schema: https://rift-ds.com/schema/components/copy-button.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## Alternatives

- Use [Icon button](https://rift-ds.com/components/icon-button.md) instead when the button runs an action other than copying a value.

## CopyButton props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| value | `string \| (() => string)` | yes |  | The text put on the clipboard, or a function that returns it at the moment of the press (for a value that changes, such as the current URL). |
| onCopied | `((value: string) => void)` | no |  | Called with the copied text as it is sent to the clipboard (the write is not awaited), so a host can count copies or announce them. |
| copyText | `string` | no | `'Copy'` | Visible text before a copy. When `iconOnly`, it is the accessible name and the tooltip instead, unless `copyLabel` is set. |
| copyLabel | `string` | no |  | Accessible name before a copy. Defaults to `copyText`. |
| copiedLabel | `string` | no | `'Copied'` | Visible text and accessible name for a moment after a copy. |
| iconOnly | `boolean` | no | `false` | Show only the glyph, with the label in a tooltip, as an IconButton. |
| tooltipPosition | `"top" \| "bottom" \| "left" \| "right" \| "start" \| "end"` | no | `'top'` | Where the icon-only form's tooltip sits, as on IconButton. |
| variant | `"secondary" \| "tertiary"` | no | `'tertiary'` | Visual emphasis, as on Button. |
| tone | `"default" \| "neutral"` | no | `'default'` | Colour, as on Button: `neutral` draws the secondary outline in the neutral greys rather than the action colour, for a utility control such as a page's "Copy link". |
| size | `"default" \| "compact"` | no | `'compact'` | Control size, as on Button. |
| disabled | `boolean` | no | `false` | Disable the button. |
| className | `string` | no | `''` | Additional CSS classes. |

## Keyboard

Every row is pressed by an automated test, in a left-to-right and a right-to-left layout.

Follows the WAI-ARIA button pattern (https://www.w3.org/WAI/ARIA/apg/patterns/button/).

| Key | What it does |
| --- | --- |
| Enter | Activates the button. |
| Space | Activates the button. |
