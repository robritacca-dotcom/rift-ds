# Section title

Heading with a divider line and optional trailing content for organising page sections.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: layout
- Import: `import { SectionTitle } from '@robr0/design-system';`
- Deep import: `import { SectionTitle } from '@robr0/design-system/components/SectionTitle/SectionTitle';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://robertritacca.com/components/section-title

## SectionTitle props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| title | `string` | yes |  | Section heading text |
| trailing | `ReactNode` | no |  | Optional trailing content (count, badge, metadata) |
| divider | `boolean` | no | `true` | Whether to draw the bottom divider line. Set false above content that draws its own lines (bordered tables, calendars), so the section separates by whitespace alone. |
| className | `string` | no |  | Additional CSS classes |
