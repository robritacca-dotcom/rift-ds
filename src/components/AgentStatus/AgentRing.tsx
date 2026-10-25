/**
 * The agent ring: the AI gradient drawn around whatever an agent is working
 * on, from a whole section or table down to one row, card or field. It is a
 * class and an attribute rather than a component, because a wrapper cannot
 * go around a table row and a class works on any element.
 *
 * Kept out of AgentStatus.tsx so that module exports only components
 * (react-refresh). `.tsx` despite holding no JSX: the barrel generator and
 * the `./components/*` export subpath both address `.tsx`, so that
 * extension is what makes this reachable as
 * `rift-ds/components/AgentStatus/AgentRing`. Importing it carries the
 * stylesheet the class needs.
 */
import type { AgentStatusState } from './AgentStatusPatterns';
import './AgentStatus.css';

/** The ring's class. The `data-agent-state` attribute beside it picks the state. */
export const AGENT_RING_CLASS = 'ds-agent-ring';

/** The props that put the ring on an element. */
export interface AgentRingProps {
  /** Always `ds-agent-ring`; join it with the element's own classes. */
  className: string;
  /** The ring's state. Absent or `idle` draws no ring; `thinking` turns it like `working`. */
  'data-agent-state'?: AgentStatusState;
}

/**
 * The class and attribute that put the agent ring on any element, in
 * AgentStatus's vocabulary: `thinking` and `working` turn the ring, `waiting` breathes
 * in the warning colour, and `done` and `error` show the status colour for
 * a beat, then fade. Spread it onto the target, joining `className` with the element's
 * own:
 *
 * ```tsx
 * const ring = agentRingProps(rowState);
 * <tr {...ring} className={`${ring.className} my-row`}>
 * ```
 *
 * The ring draws with the element's `::after`, so an element that already
 * uses `::after`, and a replaced element (`input`, `textarea`, `select`,
 * `img`), takes it on a wrapper instead.
 */
export function agentRingProps(state?: AgentStatusState | null): AgentRingProps {
  return state ? { className: AGENT_RING_CLASS, 'data-agent-state': state } : { className: AGENT_RING_CLASS };
}
