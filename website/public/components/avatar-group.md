# Avatar group

Overlapping avatar stack with a +N counter for the overflow.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: data-display
- Import: `import { AvatarGroup } from '@robr0/design-system';`
- Deep import: `import { AvatarGroup } from '@robr0/design-system/components/AvatarGroup/AvatarGroup';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://robertritacca.com/components/avatar-group

## AvatarGroup props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| children | `ReactNode` | yes |  | The avatars to stack, in display order — normally `Avatar` elements. |
| max | `number` | no | `5` | Avatars shown before the rest collapse into a "+N" counter. |
| size | `"sm" \| "md" \| "lg"` | no | `md` | Size applied to every avatar in the stack and to the overflow counter. Cloned onto the children so the group cannot render mixed sizes. |
| overflowLabel | `string` | no |  | Accessible label for the overflow counter. Defaults to "N more" — override it to localise or add context, e.g. "4 more reviewers". |
| className | `string` | no | `` | Additional CSS classes |
