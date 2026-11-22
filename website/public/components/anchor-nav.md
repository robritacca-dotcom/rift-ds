# Anchor nav

An on-page list of anchor links that tracks the reader's position, listed by hand or read from the page's headings.

Generated from the rift-ds registry and prop JSDoc, version 1.33.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: navigation
- Import: `import { AnchorNav } from 'rift-ds';`
- Deep import: `import { AnchorNav } from 'rift-ds/components/AnchorNav/AnchorNav';`
- Rendering: client component (declares 'use client')
- Size: 2.6 kB gzipped with everything it imports, peer dependencies not counted
- Live docs: https://rift-ds.com/components/anchor-nav
- Schema: https://rift-ds.com/schema/components/anchor-nav.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## AnchorNav props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| items | `AnchorNavItem[]` | no |  | The on-page sections to list, in document order. Leave it out and pass `fromHeadings` to read them from the page. |
| fromHeadings | `AnchorNavHeadingSource` | no |  | Read the sections from the page's headings instead of listing them: `{}` lists every `h2` in `main`, and `root`, `selector` and `minItems` narrow it. Ignored when `items` is passed. Renders nothing until enough sections are found. |
| variant | `"list" \| "floating"` | no | `'list'` | Visual form: `list` renders the inline "On this page" rail; `floating` collapses to a stack of short lines that expands into a panel on hover, keyboard focus, or tap, so it can ride a page edge without taking column width |
| title | `string` | no | `'On this page'` | Header text above the list; pass an empty string to render no header. Note: this shadows the native `title` tooltip attribute, which AnchorNav does not expose. |
| icon | `string \| ReactNode` | no | `'toc'` | Icon beside the header — Material Symbol name (string) or custom element (ReactNode); pass an empty string for none |
| activeId | `string` | no |  | Controlled active item id — set it to drive the highlight yourself and skip scroll tracking |
| onActiveChange | `((id: string) => void)` | no |  | Fires when the tracked (or clicked) active item changes |
| offset | `number` | no | `96` | Distance in px from the viewport top at which a section counts as current, e.g. a sticky header's height. A heading with a larger `scroll-margin-top` counts from there, so a jump to it always marks it. |

## Keyboard

Every row is pressed by an automated test, in a left-to-right and a right-to-left layout.

Follows the WAI-ARIA link pattern (https://www.w3.org/WAI/ARIA/apg/patterns/link/).

| Key | What it does |
| --- | --- |
| Enter | Follows the link. |

## Types

### AnchorNavHeadingSource

Where `fromHeadings` (and `useHeadingItems`) look for the page's sections.

```ts
interface AnchorNavHeadingSource {
  /** A selector for the element whose headings are listed. Defaults to `main`. */
  root?: string;
  /** Which headings count as sections. Defaults to `h2`. */
  selector?: string;
  /** List nothing until at least this many sections are found, since a rail of one link is no help. Defaults to 2. */
  minItems?: number;
}
```

### AnchorNavItem

```ts
interface AnchorNavItem {
  /** The id of the element the item jumps to (rendered as `href="#id"`) */
  id: string;
  /** Link text */
  label: string;
}
```

Types from other packages: `ReactNode` (react).
