# Entity card

Compact display-only card with a centred icon or image and a label, used in the Icons and Logos galleries.

Generated from the rift-ds registry and prop JSDoc, version 1.40.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: data-display
- Import: `import { EntityCard } from 'rift-ds';`
- Deep import: `import { EntityCard } from 'rift-ds/components/EntityCard/EntityCard';`
- Rendering: server-renderable (no 'use client')
- Size: 0.6 kB gzipped with everything it imports, peer dependencies not counted
- Live docs: https://rift-ds.com/components/entity-card
- Schema: https://rift-ds.com/schema/components/entity-card.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## EntityCard props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| label | `string` | yes |  | Display label beneath the icon / image |
| icon | `string \| ReactNode` | no |  | Icon — Material Symbol name (string, e.g. "home") rendered via the rounded font, or custom element (ReactNode) |
| imageSrc | `string` | no |  | Path to an image asset — used instead of icon when provided |
| imageAlt | `string` | no |  | Alt text for the image |
| className | `string` | no | `''` | Additional CSS classes |

## Keyboard

Nothing here takes focus, so there are no keys. A test holds that.

Types from other packages: `ReactNode` (react).
