import React from 'react';
import { WidgetRow } from '../Widget/Widget';
import { Badge } from '../Badge/Badge';
import { PixelAvatar } from '../PixelAvatar/PixelAvatar';
import './AgentActivity.css';

/** How an agent's action ended: done, waiting on a person's approval, turned down by one, or stopped because the person it acts for does not hold that access. */
export type AgentActivityOutcome = 'done' | 'awaiting' | 'declined' | 'blocked';

/** One thing an agent did, or tried to. */
export interface AgentActivityEntry {
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

/** The words for each outcome's mark. `done` carries none unless given. */
export type AgentActivityOutcomeLabels = Record<AgentActivityOutcome, string>;

const DEFAULT_OUTCOME_LABELS: AgentActivityOutcomeLabels = {
  done: '',
  awaiting: 'Awaiting approval',
  declined: 'Declined',
  blocked: 'Blocked',
};

const OUTCOME_VARIANT: Record<AgentActivityOutcome, 'positive' | 'warning' | 'neutral' | 'error'> = {
  done: 'positive',
  awaiting: 'warning',
  declined: 'neutral',
  blocked: 'error',
};

/** Props owned by AgentActivity itself; everything else falls through to the root `<ol>`. */
type AgentActivityOwnProps = {
  /** The entries, newest first. */
  entries: AgentActivityEntry[];
  /** The line naming who acted, given the agent's and the person's names: "Ledger for Sara Ito". */
  attributionLabel?: (agent: string, owner: string) => string;
  /** The words for each outcome's mark. Defaults: none for `done`, then "Awaiting approval", "Declined" and "Blocked". */
  outcomeLabels?: Partial<AgentActivityOutcomeLabels>;
  /** Additional CSS classes */
  className?: string;
};

export interface AgentActivityProps
  extends AgentActivityOwnProps,
    Omit<React.ComponentPropsWithRef<'ol'>, keyof AgentActivityOwnProps | 'children'> {}

const baseClass = 'ds-agent-activity';

/**
 * What agents did on an account, newest first: each entry names the agent
 * and the person it acted for, what it did and when, and marks an action
 * that is waiting on a person's approval, was declined, or was blocked
 * because the person does not hold that access. Every agent action is on
 * the record, so nothing an agent does happens out of sight. Each entry is
 * a WidgetRow, so the log sits in a Widget, and WidgetGroups can split it
 * by day. Hook-free, so it renders from a Server Component.
 */
export function AgentActivity({
  ref,
  entries,
  attributionLabel = (agent, owner) => `${agent} for ${owner}`,
  outcomeLabels,
  className = '',
  ...rest
}: AgentActivityProps) {
  const labels = { ...DEFAULT_OUTCOME_LABELS, ...outcomeLabels };

  return (
    <ol {...rest} ref={ref} className={[baseClass, className].filter(Boolean).join(' ')}>
      {entries.map((entry) => {
        const outcome = entry.outcome ?? 'done';
        const label = labels[outcome];
        const description = [attributionLabel(entry.agent, entry.owner), entry.reason].filter(Boolean).join(' · ');
        return (
          <li key={entry.id} className={`${baseClass}__item`}>
            <WidgetRow
              title={entry.action}
              description={description}
              leading={entry.mark ?? <PixelAvatar name={entry.agent} size="lg" variant="tile" />}
              meta={entry.time}
              actions={label ? <Badge variant={OUTCOME_VARIANT[outcome]} label={label} /> : undefined}
            />
          </li>
        );
      })}
    </ol>
  );
}
