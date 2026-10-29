# Avatar

User profile image with initials and icon fallback, status indicator, and multiple sizes.

Generated from the rift-ds registry and prop JSDoc, version 1.17.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: data-display
- Import: `import { Avatar } from 'rift-ds';`
- Deep import: `import { Avatar } from 'rift-ds/components/Avatar/Avatar';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/avatar

## Avatar props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| src | `string` | no |  | Image source URL |
| alt | `string` | no |  | Alt text for the image, also the avatar's accessible name. A passed `aria-label` takes precedence. |
| name | `string` | no |  | User's name — used for initials fallback |
| size | `"sm" \| "md" \| "lg"` | no | `md` | Avatar size |
| fill | `"neutral" \| AvatarFill` | no |  | Which of the six fills the initials sit on. Picked from the name when unset, so a person keeps one colour everywhere; `neutral` keeps the plain grey. An AvatarGroup sets it on its avatars so neighbours in the stack differ. |
| status | `"online" \| "away" \| "offline" \| "busy"` | no |  | Online status indicator |
| statusLabel | `string` | no |  | Accessible name for the status dot. Defaults to the `status` value itself (e.g. "online"). |
| className | `string` | no | `` | Additional CSS classes |
