# Avatar

User profile image with initials and icon fallback, status indicator, and multiple sizes.

Generated from the rift-ds registry and prop JSDoc, version 1.5.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: data-display
- Import: `import { Avatar } from 'rift-ds';`
- Deep import: `import { Avatar } from 'rift-ds/components/Avatar/Avatar';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/avatar

## Avatar props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| src | `string` | no |  | Image source URL |
| alt | `string` | no |  | Alt text for the image |
| name | `string` | no |  | User's name — used for initials fallback |
| size | `"sm" \| "md" \| "lg"` | no | `md` | Avatar size |
| status | `"online" \| "away" \| "offline" \| "busy"` | no |  | Online status indicator |
| className | `string` | no | `` | Additional CSS classes |
