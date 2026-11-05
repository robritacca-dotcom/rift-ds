# Entity switcher

Switcher for the company, team, or account a screen is scoped to, with a logo, icon, or initials mark and levels that drill in.

Generated from the rift-ds registry and prop JSDoc, version 1.22.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: navigation
- Import: `import { EntitySwitcher } from 'rift-ds';`
- Deep import: `import { EntitySwitcher } from 'rift-ds/components/EntitySwitcher/EntitySwitcher';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/entity-switcher
- Schema: https://rift-ds.com/schema/components/entity-switcher.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## EntitySwitcher props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| items | `EntitySwitcherItem[]` | yes |  | The top level of the tree. Its shape decides the list: all leaves is one flat list, any children make it drill in. |
| value | `string` | no |  | The selected entity's id (controlled). |
| defaultValue | `string` | no |  | The entity selected at first (uncontrolled). The first entity when omitted. |
| onValueChange | `((id: string, item: EntitySwitcherItem) => void)` | no |  | Called with the id and the entity when one is picked. |
| open | `boolean` | no |  | Whether the panel is open (controlled). |
| defaultOpen | `boolean` | no | `false` | Whether the panel starts open (uncontrolled). |
| onOpenChange | `((open: boolean) => void)` | no |  | Called when the panel opens or closes. |
| collapsed | `boolean` | no |  | The mark alone, the rest of the trigger faded out, and the panel opening beside it rather than below: the form for a collapsed rail. The mark never moves between the two forms. Left unset, it follows a host rail that marks itself `data-expanded="false"` (AppSidebar's `persistentTopSlot`). |
| searchThreshold | `number` | no | `8` | How many entities, across every level, before the search field appears. |
| switcherLabel | `string` | no | `Switch entity` | Accessible name of the trigger and the panel; the selected entity's name follows it on the trigger. |
| searchLabel | `string` | no | `Search` | Placeholder and accessible name of the search field. |
| backLabel | `string` | no | `Back to {name}` | The row that climbs out of a level. `{name}` is the level above. |
| topLevelLabel | `string` | no | `all` | Stands in for `{name}` in `backLabel` when the level above is the top. |
| wholeBranchLabel | `string` | no | `All of {name}` | The description of the row that picks a whole branch, leading its level. `{name}` is the branch. |
| emptyLabel | `string` | no | `Nothing matches` | Shown when a search finds nothing. |
| className | `string` | no | `` | Additional CSS classes on the root. |
