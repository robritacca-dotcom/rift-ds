# Bento tile art

The texture half of a bento tile's shader pair: six fine patterns in one vocabulary, fading in from a corner.

Generated from the rift-ds registry and prop JSDoc, version 1.14.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: effects
- Import: `import { BentoTileArt } from 'rift-ds';`
- Deep import: `import { BentoTileArt } from 'rift-ds/components/BentoTile/BentoTileArt';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://rift-ds.com/components/bento-tile-art

## BentoTileArt props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| pattern | `BentoTileArtPattern` | no |  | Which pattern to draw. Unset, it follows its tile's shader pair (pinned by `highlight`, or by position); outside a tile it draws `dots`. |
| className | `string` | no | `` | Additional CSS classes on the layer. |
