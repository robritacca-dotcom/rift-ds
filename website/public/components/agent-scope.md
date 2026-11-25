# Agent scope

How far an agent may go in each area of an account, from off to act, never past the person who connected it.

Generated from the rift-ds registry and prop JSDoc, version 1.37.1. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: ai
- Import: `import { AgentScope } from 'rift-ds';`
- Deep import: `import { AgentScope } from 'rift-ds/components/AgentScope/AgentScope';`
- Rendering: client component (declares 'use client')
- Size: 8.4 kB gzipped with everything it imports, peer dependencies not counted
- Live docs: https://rift-ds.com/components/agent-scope
- Schema: https://rift-ds.com/schema/components/agent-scope.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## AgentScope props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| permissions | `AgentScopePermission[]` | yes |  | The areas an agent can be let into, in the order they are listed. |
| value | `Record<string, AgentScopeLevel>` | no |  | The level the agent holds in each area, keyed by permission id, for controlled use. An area missing from it is off. Pair with `onValueChange`. |
| defaultValue | `Record<string, AgentScopeLevel>` | no |  | The levels to begin with, for uncontrolled use. An agent starts with nothing: an area missing from it is off. |
| onValueChange | `((value: Record<string, AgentScopeLevel>) => void)` | no |  | Called with every area's level when the reader changes one. |
| levelLabels | `Partial<AgentScopeLevelLabels>` | no |  | The words for each level. Defaults to Off, View, Prepare and Act. |
| approvalLabel | `string` | no | `'A person approves'` | The note an area that moves money adds to its description, in place of `act`. Defaults to "A person approves". |
| hiddenLabel | `((count: string) => string)` | no | `` (count: string) => count === '1' ? '1 more area is left out: you don’t hold it yourself.' : `${count} more areas are left out: you don’t hold them yourself.` `` | The closing line counting the areas left out because the person does not hold them, given the count already written in the locale. Return an empty string to leave it out. |
| disabled | `boolean` | no | `false` | Hold every area at its current level. |
| locale | `string` | no |  | The BCP 47 locale the closing count is written in, such as `ar-EG`. Defaults to the nearest LocaleProvider's, then `en-US`. |
| className | `string` | no | `''` | Additional CSS classes |

## Keyboard

Every row is pressed by an automated test, in a left-to-right and a right-to-left layout.

The level pickers follows the WAI-ARIA tabs pattern (https://www.w3.org/WAI/ARIA/apg/patterns/tabs/).

| Key | What it does |
| --- | --- |
| Tab | Moves focus into the list at the selected tab, and out of the list on the next press. |
| Arrow Right | Moves to the next tab and selects it. The opposite arrow in a right-to-left layout. |
| Arrow Left | Moves to the previous tab and selects it. The opposite arrow in a right-to-left layout. |
| End | Moves to the last tab and selects it. |
| Home | Moves to the first tab and selects it. |

## Types

### AgentScopeLevel

How far an agent may go in one area, lowest first: nothing, look, draft for a person to approve, do it itself.

```ts
type AgentScopeLevel = 'none' | 'view' | 'prepare' | 'act';
```

### AgentScopeLevelLabels

The words for each level, as the segments show them.

```ts
type AgentScopeLevelLabels = Record<AgentScopeLevel, string>;
```

### AgentScopePermission

One area of the account an agent can be let into.

```ts
interface AgentScopePermission {
  /** A stable key: the permission's key in `value`. */
  id: string;
  /** The area, in the reader's words: "Payments", "Cards", "Statements". */
  label: string;
  /** A quiet line under the label saying what the area covers. */
  description?: string;
  /** A leading mark: a Material Symbol name, or your own element. */
  icon?: string | React.ReactNode;
  /** The levels this area has, lowest first. Defaults to all four; an area with nothing to draft leaves out `prepare`. */
  levels?: AgentScopeLevel[];
  /** The level the connecting person holds here themselves. The agent is never offered more: levels above it are left out, not shown disabled, and an area the person holds at `none` is left out altogether. */
  held: AgentScopeLevel;
  /** The area moves money. `act` is never offered, whatever the person holds: the agent drafts, and a person approves each one. */
  approval?: boolean;
  /** Hold the area at its current level. */
  disabled?: boolean;
}
```

Types from other packages: `Partial` (typescript), `ReactNode` (react), `Record` (typescript).
