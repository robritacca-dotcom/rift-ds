# Agent activity

What agents did on an account, each entry naming the agent and the person it acted for, with what waits on approval or was blocked.

Generated from the rift-ds registry and prop JSDoc, version 1.37.1. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: ai
- Import: `import { AgentActivity } from 'rift-ds';`
- Deep import: `import { AgentActivity } from 'rift-ds/components/AgentActivity/AgentActivity';`
- Rendering: server-renderable (no 'use client')
- Size: 2.8 kB gzipped with everything it imports, peer dependencies not counted
- Live docs: https://rift-ds.com/components/agent-activity
- Schema: https://rift-ds.com/schema/components/agent-activity.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## Alternatives

- Use [Timeline](https://rift-ds.com/components/timeline.md) instead when the entries are steps or events with no agent behind them.

## AgentActivity props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| entries | `AgentActivityEntry[]` | yes |  | The entries, newest first. |
| attributionLabel | `((agent: string, owner: string) => string)` | no | `` (agent, owner) => `${agent} for ${owner}` `` | The line naming who acted, given the agent's and the person's names: "Ledger for Sara Ito". |
| outcomeLabels | `Partial<AgentActivityOutcomeLabels>` | no |  | The words for each outcome's mark. Defaults: none for `done`, then "Awaiting approval", "Declined" and "Blocked". |
| className | `string` | no | `''` | Additional CSS classes |

## Keyboard

Nothing here takes focus, so there are no keys. A test holds that.

## Types

### AgentActivityEntry

One thing an agent did, or tried to.

```ts
interface AgentActivityEntry {
  /** A stable key. */
  id: string;
  /** The agent that acted: "Ledger". */
  agent: string;
  /** The person it acted for. Every entry names both, so no action reads as the agent's alone. */
  owner: string;
  /** What it did, in the past tense, with the amounts and names: "Prepared a payment of $4,200.00 to Hollis Supply". */
  action: string;
  /** When, already written: "10:42", "Yesterday". */
  time?: React.ReactNode;
  /** How it ended. Defaults to `done`, which carries no mark. */
  outcome?: AgentActivityOutcome;
  /** Why it was declined or blocked, in a few words, added to the attribution line: "Payroll isn’t Sara’s to share". */
  reason?: string;
  /** A leading mark. Defaults to a PixelAvatar drawn from the agent's name, the same one the agent wears in AgentConnections. */
  mark?: React.ReactNode;
}
```

### AgentActivityOutcome

How an agent's action ended: done, waiting on a person's approval, turned down by one, or stopped because the person it acts for does not hold that access.

```ts
type AgentActivityOutcome = 'done' | 'awaiting' | 'declined' | 'blocked';
```

### AgentActivityOutcomeLabels

The words for each outcome's mark. `done` carries none unless given.

```ts
type AgentActivityOutcomeLabels = Record<AgentActivityOutcome, string>;
```

Types from other packages: `Partial` (typescript), `ReactNode` (react), `Record` (typescript).
