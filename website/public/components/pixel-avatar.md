# Pixel avatar

A generated character mark drawn from a name: the same name is always the same pixel creature in the same ink.

Generated from the rift-ds registry and prop JSDoc, version 1.6.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: data-display
- Import: `import { PixelAvatar } from 'rift-ds';`
- Deep import: `import { PixelAvatar } from 'rift-ds/components/PixelAvatar/PixelAvatar';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://rift-ds.com/components/pixel-avatar

## PixelAvatar props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| name | `string` | yes |  | The seed. The same name always draws the same character in the same ink, so a project, workspace or thread has its mark the moment it has a name, with nothing designed or stored for it. |
| size | `"sm" \| "md" \| "lg" \| "xl"` | no | `md` | Rendered size, on the icon scale (`--icon-size-500/600/800/1200` — 20, 24, 32 and 48px), so the character seats wherever an icon does. |
| ink | `PixelInk` | no |  | Overrides the ink the name picks (1 to 6, the `--color-pixel-ink-*` tokens). A name's own ink is one of six, so two neighbours can land on the same one; a host drawing a list passes each row's entry from `distinctPixelInks` here to keep them apart. The character's shape still comes from the name. |
| variant | `"plain" \| "tile"` | no | `plain` | `plain` draws the character alone; `tile` seats it on a rounded wash of its own ink, for a larger standalone mark. |
| label | `string` | no |  | Accessible name. Omit it when the mark sits beside the name it was drawn from, which is the usual case: the character is then decorative and hidden from assistive technology. Given, the root becomes an image with this label. |
| className | `string` | no | `` | Additional CSS classes |

## distinctPixelInks props

No own props; native attributes pass through.

## pixelAvatarInk props

No own props; native attributes pass through.

## PixelInk props

No own props; native attributes pass through.
