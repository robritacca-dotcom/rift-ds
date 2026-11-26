# Popover

Contextual overlay panel with click and hover triggers, positioned relative to its anchor.

Generated from the rift-ds registry and prop JSDoc, version 1.39.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: overlays
- Import: `import { Popover } from 'rift-ds';`
- Deep import: `import { Popover } from 'rift-ds/components/Popover/Popover';`
- Rendering: client component (declares 'use client')
- Size: 2.8 kB gzipped with everything it imports, peer dependencies not counted
- Live docs: https://rift-ds.com/components/popover
- Schema: https://rift-ds.com/schema/components/popover.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## Popover props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| children | `ReactNode` | yes |  | Trigger element |
| content | `ReactNode` | yes |  | Popover content. Replaces the native `content` attribute, which only means something on a `<meta>` element. |
| size | `"default" \| "compact"` | no | `'default'` | Component size |
| surface | `"menu" \| "panel"` | no | `'panel'` | The panel's surface. `panel` (the default) is the content panel: a 16px inset and the container border. `menu` is DropdownMenu's own surface (its 4px inset, input border and corner), for a popover that sits among menus and should read as one of them, such as a table toolbar's sort or column panel. |
| position | `"top" \| "bottom" \| "left" \| "right" \| "start" \| "end"` | no | `'bottom'` | Preferred position. `left` and `right` are screen sides; `start` and `end` follow the reading direction, so `end` opens to the right in English and to the left in Arabic. |
| align | `"start" \| "end"` | no | `'start'` | Which edge of the trigger the panel lines up with, on the top and bottom sides. `start` and `end` follow the reading direction. Defaults to `start`. |
| trigger | `"hover" \| "click"` | no | `'click'` | Trigger mode |
| open | `boolean` | no |  | Whether the popover is open (controlled mode) |
| defaultOpen | `boolean` | no | `false` | Whether the popover starts open when uncontrolled |
| onOpenChange | `((open: boolean) => void)` | no |  | Callback when open state changes |
| ariaLabel | `string` | no |  | Legacy accessible-name prop for the trigger and the panel. A native `aria-label` wins when both are passed, and names those two rather than the wrapper; with neither, the panel is named "Popover". Deprecated: Pass the native `aria-label` attribute instead. |
| className | `string` | no | `''` | Additional CSS classes for the popover's root wrapper, which holds the trigger and the panel |

## Keyboard

Every row is pressed by an automated test, in a left-to-right and a right-to-left layout.

The trigger of a click popover follows the WAI-ARIA disclosure pattern (https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/).

| Key | What it does |
| --- | --- |
| Enter | Opens what it controls, and closes it when it is open. |
| Space | Does the same as Enter. |

Types from other packages: `ReactNode` (react).
