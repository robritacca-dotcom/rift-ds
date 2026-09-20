# Entity card

Compact display-only card with a centred icon or image and a label, used in the Icons and Logos galleries.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: data-display
- Import: `import { EntityCard } from '@robr0/design-system';`
- Deep import: `import { EntityCard } from '@robr0/design-system/components/EntityCard/EntityCard';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://robertritacca.com/components/entity-card

## EntityCard props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| label | `string` | yes |  | Display label beneath the icon / image |
| icon | `string` | no |  | Material Symbol icon name rendered via the rounded font (e.g. "home") |
| imageSrc | `string` | no |  | Path to an image asset — used instead of icon when provided |
| imageAlt | `string` | no |  | Alt text for the image |
| className | `string` | no | `` | Additional CSS classes |
