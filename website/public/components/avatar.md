# Avatar

A person's or an organisation's image, with initials and icon fallback, a status indicator, and multiple sizes.

Generated from the rift-ds registry and prop JSDoc, version 1.38.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: data-display
- Import: `import { Avatar } from 'rift-ds';`
- Deep import: `import { Avatar } from 'rift-ds/components/Avatar/Avatar';`
- Rendering: client component (declares 'use client')
- Size: 0.8 kB gzipped with everything it imports, peer dependencies not counted
- Live docs: https://rift-ds.com/components/avatar
- Schema: https://rift-ds.com/schema/components/avatar.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## Avatar props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| src | `string` | no |  | Image source URL |
| alt | `string` | no |  | Alt text for the image, also the avatar's accessible name. A passed `aria-label` takes precedence. An organisation's avatar (`shape="square"`) should pass it, or it is announced as a user's. |
| name | `string` | no |  | User's name — used for initials fallback |
| size | `"sm" \| "md" \| "lg"` | no | `'md'` | Avatar size |
| shape | `"circle" \| "square"` | no | `'circle'` | `circle` for a person; `square` for an organisation (a company, a bank, a vendor, an integration): rounded corners on the radius scale, a logo fitted whole rather than cropped, and a building glyph when there is no image or name. |
| fill | `"neutral" \| AvatarFill` | no |  | Which of the six fills the initials sit on. Picked from the name when unset, so a person keeps one colour everywhere; `neutral` keeps the plain grey. An AvatarGroup sets it on its avatars so neighbours in the stack differ. |
| status | `"online" \| "away" \| "offline" \| "busy"` | no |  | Online status indicator |
| statusLabel | `string` | no |  | Accessible name for the status dot. Defaults to the `status` value itself (e.g. "online"). |
| className | `string` | no | `''` | Additional CSS classes |

## Keyboard

Nothing here takes focus, so there are no keys. A test holds that.

## Types

### AvatarFill

One of the six avatar fills, by token number (`--color-avatar-bg-*`).

```ts
type AvatarFill = 1 | 2 | 3 | 4 | 5 | 6;
```
