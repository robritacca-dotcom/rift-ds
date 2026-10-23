# Popover

Contextual overlay panel with click and hover triggers, positioned relative to its anchor.

Generated from the rift-ds registry and prop JSDoc, version 1.13.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: overlays
- Import: `import { Popover } from 'rift-ds';`
- Deep import: `import { Popover } from 'rift-ds/components/Popover/Popover';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/popover

## Popover props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| children | `ReactNode` | yes |  | Trigger element |
| content | `ReactNode` | yes |  | Popover content. Replaces the native `content` attribute, which only means something on a `<meta>` element. |
| size | `"default" \| "compact"` | no | `default` | Component size |
| position | `"top" \| "bottom" \| "left" \| "right"` | no | `bottom` | Preferred position |
| trigger | `"hover" \| "click"` | no | `click` | Trigger mode |
| open | `boolean` | no |  | Whether the popover is open (controlled mode) |
| defaultOpen | `boolean` | no | `false` | Whether the popover starts open when uncontrolled |
| onOpenChange | `((open: boolean) => void)` | no |  | Callback when open state changes |
| ariaLabel | `string` | no |  | Accessible label for the trigger and the panel; the panel is named "Popover" when it is omitted |
| className | `string` | no | `` | Additional CSS classes for the popover's root wrapper, which holds the trigger and the panel |
