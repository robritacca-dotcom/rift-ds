# Agent connections

The agents connected to an account, each with its person, what it may do and when it last acted, and a Disconnect that cuts it off.

Generated from the rift-ds registry and prop JSDoc, version 1.37.1. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: ai
- Import: `import { AgentConnections } from 'rift-ds';`
- Deep import: `import { AgentConnections } from 'rift-ds/components/AgentConnections/AgentConnections';`
- Rendering: client component (declares 'use client')
- Size: 4.3 kB gzipped with everything it imports, peer dependencies not counted
- Live docs: https://rift-ds.com/components/agent-connections
- Schema: https://rift-ds.com/schema/components/agent-connections.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## AgentConnections props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| agents | `AgentConnection[]` | yes |  | The connected agents, in the order they are listed. |
| onDisconnect | `((agent: AgentConnection) => void)` | no |  | Called by an agent's Disconnect. The host cuts its access at once, then sets its `status` to `disconnected`. Unset, the rows offer no Disconnect. |
| ownerLabel | `((owner: string) => string)` | no | `` (owner) => `For ${owner}` `` | The line under the agent's name naming its person, given their name: "For Sara Ito". |
| disconnectLabel | `string` | no | `'Disconnect'` | The Disconnect button's words. Defaults to "Disconnect". |
| disconnectAccessibleLabel | `((name: string) => string)` | no | `` (name) => `Disconnect ${name}` `` | The Disconnect button's accessible name, given the agent's name, so a list of them is told apart. Defaults to "Disconnect Ledger". |
| disconnectedLabel | `string` | no | `'Disconnected'` | The mark a disconnected agent carries. Defaults to "Disconnected". |
| disconnectedAnnouncement | `((name: string) => string)` | no | `` (name) => `${name} disconnected` `` | What is announced when an agent is disconnected, given its name. Defaults to "Ledger disconnected". |
| className | `string` | no | `''` | Additional CSS classes |

## Keyboard

Every row is pressed by an automated test, in a left-to-right and a right-to-left layout.

The buttons follows the WAI-ARIA button pattern (https://www.w3.org/WAI/ARIA/apg/patterns/button/).

| Key | What it does |
| --- | --- |
| Enter | Activates the button. |
| Space | Activates the button. |

## Types

### AgentConnection

One agent connected to an account.

```ts
interface AgentConnection {
  /** A stable key. */
  id: string;
  /** The agent's name: "Ledger". */
  name: string;
  /** The person the agent acts for. Every agent has one: it holds no more than they do, and leaves when they do. */
  owner: string;
  /** What the agent may do, in a few words: "Views balances, prepares payments". */
  scope?: string;
  /** When it last acted, already written: "Active 2h ago". */
  lastActive?: React.ReactNode;
  /** A leading mark. Defaults to a PixelAvatar drawn from the name. */
  mark?: React.ReactNode;
  /** Whether it can still act. A disconnected agent stays listed as a record, with no control. Defaults to `connected`. */
  status?: 'connected' | 'disconnected';
}
```

Types from other packages: `ReactNode` (react).
