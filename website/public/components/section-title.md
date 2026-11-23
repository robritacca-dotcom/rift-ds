# Section title

Heading with a divider line and optional trailing content for organising page sections.

Generated from the rift-ds registry and prop JSDoc, version 1.35.1. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: layout
- Import: `import { SectionTitle } from 'rift-ds';`
- Deep import: `import { SectionTitle } from 'rift-ds/components/SectionTitle/SectionTitle';`
- Rendering: server-renderable (no 'use client')
- Size: 0.5 kB gzipped with everything it imports, peer dependencies not counted
- Live docs: https://rift-ds.com/components/section-title
- Schema: https://rift-ds.com/schema/components/section-title.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## Alternatives

- Use [Page header](https://rift-ds.com/components/page-header.md) instead when the heading is the page’s own title, with its breadcrumb and actions.
- Use [Heading](https://rift-ds.com/components/heading.md) instead when the heading needs a level or type tier of its own rather than a section’s divided title.

## SectionTitle props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| title | `string` | yes |  | Section heading text. Note: this shadows the native `title` tooltip attribute, which SectionTitle does not expose. |
| trailing | `ReactNode` | no |  | Optional trailing content (count, badge, metadata) |
| divider | `boolean` | no | `true` | Whether to draw the bottom divider line. Set false above content that draws its own lines (bordered tables, calendars), so the section separates by whitespace alone. |
| anchor | `string \| boolean` | no |  | Give the heading an id and a "#" link to itself, shown on hover and focus, as Heading's `anchor` does. `true` makes the id from the title; a string sets it. The id lands on the heading, not the root, so an `id` passed through goes to the root and the link targets the anchor. |
| anchorLabel | `((title: string) => string)` | no | `` (text) => `Link to ${text}` `` | Accessible name of the anchor link, given the title. Defaults to "Link to <title>". |
| className | `string` | no |  | Additional CSS classes |

## Keyboard

Nothing here takes focus, so there are no keys. A test holds that.

Types from other packages: `ReactNode` (react).
