# Section title

Heading with a divider line and optional trailing content for organising page sections.

Generated from the rift-ds registry and prop JSDoc, version 1.5.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: layout
- Import: `import { SectionTitle } from 'rift-ds';`
- Deep import: `import { SectionTitle } from 'rift-ds/components/SectionTitle/SectionTitle';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://rift-ds.com/components/section-title

## SectionTitle props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| title | `string` | yes |  | Section heading text |
| trailing | `ReactNode` | no |  | Optional trailing content (count, badge, metadata) |
| divider | `boolean` | no | `true` | Whether to draw the bottom divider line. Set false above content that draws its own lines (bordered tables, calendars), so the section separates by whitespace alone. |
| className | `string` | no |  | Additional CSS classes |
