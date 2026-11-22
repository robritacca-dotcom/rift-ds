# Artifact card

The tile a chat leaves in the thread for something it made, a toggle that opens the artifact in its panel.

Generated from the rift-ds registry and prop JSDoc, version 1.34.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: ai
- Import: `import { ArtifactCard } from 'rift-ds';`
- Deep import: `import { ArtifactCard } from 'rift-ds/components/ArtifactCard/ArtifactCard';`
- Rendering: server-renderable (no 'use client')
- Size: 0.6 kB gzipped with everything it imports, peer dependencies not counted
- Live docs: https://rift-ds.com/components/artifact-card
- Schema: https://rift-ds.com/schema/components/artifact-card.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## ArtifactCard props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| title | `ReactNode` | yes |  | The artifact's name. Collides with the native `title` tooltip attribute on purpose: the card shows its name, it does not hide it in a tooltip. |
| meta | `ReactNode` | no |  | A quiet line under the name: what kind of thing this is, or which version. |
| icon | `string \| ReactNode` | no | `'draft'` | The leading mark — Material Symbol name (string) or custom element (ReactNode). |
| open | `boolean` | no | `false` | Whether this card's artifact is on stage in its panel. The card holds the on-stage fill, announces itself pressed, and its trailing cue turns from open to close. |
| className | `string` | no | `''` | Additional CSS classes |

## Keyboard

Every row is pressed by an automated test, in a left-to-right and a right-to-left layout.

Follows the WAI-ARIA toggle button pattern (https://www.w3.org/WAI/ARIA/apg/patterns/button/).

| Key | What it does |
| --- | --- |
| Enter | Changes whether the button is pressed. |
| Space | Does the same as Enter. |

Types from other packages: `ReactNode` (react).
