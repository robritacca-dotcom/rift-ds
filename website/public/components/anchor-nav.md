# Anchor nav

An on-page list of anchor links that tracks the reader's position and jumps between sections.

Generated from the rift-ds registry and prop JSDoc, version 1.3.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: navigation
- Import: `import { AnchorNav } from 'rift-ds';`
- Deep import: `import { AnchorNav } from 'rift-ds/components/AnchorNav/AnchorNav';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/anchor-nav

## AnchorNav props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| items | `AnchorNavItem[]` | yes |  | The on-page sections to list, in document order |
| variant | `"list" \| "floating"` | no | `list` | Visual form: `list` renders the inline "On this page" rail; `floating` collapses to a stack of short lines that expands into a panel on hover, keyboard focus, or tap, so it can ride a page edge without taking column width |
| title | `string` | no | `On this page` | Header text above the list; pass an empty string to render no header |
| icon | `ReactNode` | no | `toc` | Icon beside the header — Material Symbol name (string) or custom element (ReactNode); pass an empty string for none |
| activeId | `string` | no |  | Controlled active item id — set it to drive the highlight yourself and skip scroll tracking |
| onActiveChange | `((id: string) => void)` | no |  | Fires when the tracked (or clicked) active item changes |
| offset | `number` | no | `96` | Distance in px from the viewport top at which a section counts as current, e.g. a sticky header's height |
