# Mention

An inline reference to an entity or a skill, with the menu that @ or / opens while typing and the tag it leaves in the message.

Generated from the rift-ds registry and prop JSDoc, version 1.7.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: ai
- Import: `import { Mention } from 'rift-ds';`
- Deep import: `import { Mention } from 'rift-ds/components/Mention/Mention';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/mention

## Mention props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| trigger | `string` | no | `@` | The character that opened the mention, drawn a step quieter than the name. |
| className | `string` | no | `` | Additional CSS classes |
| children | `ReactNode` | no |  | The name: a person, a file, a skill. |

## MentionMenu props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| items | `MentionItem[]` | yes |  | The items to list, already filtered and ordered. |
| activeId | `string` | no |  | The `id` of the highlighted item: the one Enter would choose. |
| onActiveChange | `((id: string) => void)` | no |  | Fires with an item's `id` when the pointer moves onto it. |
| onSelect | `((item: MentionItem) => void)` | no |  | Fires with the item a person chose. |
| query | `string` | no | `` | The text typed so far. The part of each label that matches it is drawn stronger. |
| label | `string` | no | `Suggestions` | Accessible name for the list. |
| emptyText | `ReactNode` | no |  | Shown in place of the list when `items` is empty. Without it an empty menu renders nothing. |
| className | `string` | no | `` | Additional CSS classes |

## MentionText props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| text | `string` | yes |  | The plain text, exactly as it was typed or sent. |
| sources | `MentionSource[]` | yes |  | The sources whose items count as mentions in this text. |
| className | `string` | no | `` | Additional CSS classes |
