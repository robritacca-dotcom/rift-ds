# Action bar

A bar docked to the bottom of a long list or form, with a summary line and the primary actions over a progressive blur.

Generated from the rift-ds registry and prop JSDoc, version 1.34.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: actions
- Import: `import { ActionBar } from 'rift-ds';`
- Deep import: `import { ActionBar } from 'rift-ds/components/ActionBar/ActionBar';`
- Rendering: server-renderable (no 'use client')
- Size: 0.5 kB gzipped with everything it imports, peer dependencies not counted
- Live docs: https://rift-ds.com/components/action-bar
- Schema: https://rift-ds.com/schema/components/action-bar.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## Alternatives

- Use [Toolbar](https://rift-ds.com/components/toolbar.md) instead when the controls act on a canvas or a view and sit together in one pill, rather than closing out a list.
- Use [Table toolbar](https://rift-ds.com/components/table-toolbar.md) instead when the bar sits over a table and holds its search, filters and view settings.

## ActionBar props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| summary | `ReactNode` | no |  | The summary line at the bar's start, such as "23 students still to mark". It is a polite live region, so a count that changes while the reader works is announced once it settles. |
| actions | `ReactNode` | no |  | The actions at the bar's end, typically one or two Buttons with the primary action last. On a narrow bar they wrap below the summary and hold the end edge. |
| sticky | `boolean` | no | `true` | Whether the bar holds to the bottom of its scroll container while the content scrolls under it. Off, it sits in flow after the content. |
| blur | `boolean` | no | `true` | Whether the content fades under a progressive blur that reaches above the bar. Off, the bar is a solid surface with a hairline at its top edge. |
| className | `string` | no | `''` | Additional CSS classes on the root. |

## Keyboard

The bar adds no keys of its own: its actions are buttons, and the browser owns Tab, Enter and Space. Those keys belong to the platform, so no test of this library presses them.

Types from other packages: `ReactNode` (react).
