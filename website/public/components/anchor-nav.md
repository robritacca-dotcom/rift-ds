# Anchor nav

An on-page list of anchor links that tracks the reader's position and jumps between sections.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: navigation
- Import: `import { AnchorNav } from '@robr0/design-system';`
- Deep import: `import { AnchorNav } from '@robr0/design-system/components/AnchorNav/AnchorNav';`
- Rendering: client component (declares 'use client')
- Live docs: https://robertritacca.com/components/anchor-nav

## AnchorNav props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| items | `AnchorNavItem[]` | yes |  | The on-page sections to list, in document order |
| variant | `"list" \| "floating"` | no | `list` | Visual form: `list` renders the inline "On this page" rail; `floating` collapses to a stack of short lines that expands into a panel on hover, keyboard focus, or tap, so it can ride a page edge without taking column width |
| title | `string` | no | `On this page` | Header text above the list; pass an empty string to render no header |
| icon | `string` | no | `toc` | Material Symbols icon name beside the header; pass an empty string for none |
| activeId | `string` | no |  | Controlled active item id — set it to drive the highlight yourself and skip scroll tracking |
| onActiveChange | `((id: string) => void)` | no |  | Fires when the tracked (or clicked) active item changes |
| offset | `number` | no | `96` | Distance in px from the viewport top at which a section counts as current, e.g. a sticky header's height |
