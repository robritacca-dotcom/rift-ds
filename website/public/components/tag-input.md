# Tag input

Multi-value text input with entries held as removable tags.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: forms
- Import: `import { TagInput } from '@robr0/design-system';`
- Deep import: `import { TagInput } from '@robr0/design-system/components/TagInput/TagInput';`
- Rendering: client component (declares 'use client')
- Live docs: https://robertritacca.com/components/tag-input

## TagInput props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| label | `string` | no |  | Field label text |
| values | `string[]` | no |  | Committed tags (controlled) — pair with `onValuesChange` |
| defaultValues | `string[]` | no |  | Initial tags when uncontrolled |
| onValuesChange | `((values: string[]) => void)` | no |  | Convenience callback receiving the full tag array whenever a tag is added or removed. The native `onChange` still fires for draft-text edits, which keeps the standard React event signature for form libraries. |
| maxTags | `number` | no |  | Maximum number of tags — at the limit the input stops accepting new ones |
| size | `"default" \| "compact"` | no | `default` | Component size (not the native character-width `size` attribute) |
| error | `boolean` | no | `false` | Error state — shows error styling and message |
| helperText | `string` | no |  | Helper or error message displayed below the control |
| className | `string` | no | `` | Additional CSS classes — applied to the wrapper, not the <input> |
