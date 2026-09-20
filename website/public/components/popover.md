# Popover

Contextual overlay panel with click and hover triggers, positioned relative to its anchor.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: overlays
- Import: `import { Popover } from '@robr0/design-system';`
- Deep import: `import { Popover } from '@robr0/design-system/components/Popover/Popover';`
- Rendering: client component (declares 'use client')
- Live docs: https://robertritacca.com/components/popover

## Popover props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| children | `ReactNode` | yes |  | Trigger element |
| content | `ReactNode` | yes |  | Popover content |
| size | `"default" \| "compact"` | no | `default` | Component size |
| position | `"top" \| "bottom" \| "left" \| "right"` | no | `bottom` | Preferred position |
| trigger | `"hover" \| "click"` | no | `click` | Trigger mode |
| open | `boolean` | no |  | Whether the popover is open (controlled mode) |
| onOpenChange | `((open: boolean) => void)` | no |  | Callback when open state changes |
| ariaLabel | `string` | no |  | Accessible label for the trigger |
| className | `string` | no | `` | Additional CSS classes for the popover panel |
