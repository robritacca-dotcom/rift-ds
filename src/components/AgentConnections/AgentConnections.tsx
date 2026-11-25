'use client';

import React, { useEffect, useRef } from 'react';
import { WidgetRow } from '../Widget/Widget';
import { Button } from '../Button/Button';
import { Badge } from '../Badge/Badge';
import { PixelAvatar } from '../PixelAvatar/PixelAvatar';
import '../../behaviors/visually-hidden.css';
import './AgentConnections.css';

/** One agent connected to an account. */
export interface AgentConnection {
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

/** Props owned by AgentConnections itself; everything else falls through to the root `<div>`. */
type AgentConnectionsOwnProps = {
  /** The connected agents, in the order they are listed. */
  agents: AgentConnection[];
  /** Called by an agent's Disconnect. The host cuts its access at once, then sets its `status` to `disconnected`. Unset, the rows offer no Disconnect. */
  onDisconnect?: (agent: AgentConnection) => void;
  /** The line under the agent's name naming its person, given their name: "For Sara Ito". */
  ownerLabel?: (owner: string) => string;
  /** The Disconnect button's words. Defaults to "Disconnect". */
  disconnectLabel?: string;
  /** The Disconnect button's accessible name, given the agent's name, so a list of them is told apart. Defaults to "Disconnect Ledger". */
  disconnectAccessibleLabel?: (name: string) => string;
  /** The mark a disconnected agent carries. Defaults to "Disconnected". */
  disconnectedLabel?: string;
  /** What is announced when an agent is disconnected, given its name. Defaults to "Ledger disconnected". */
  disconnectedAnnouncement?: (name: string) => string;
  /** Additional CSS classes */
  className?: string;
};

export interface AgentConnectionsProps
  extends AgentConnectionsOwnProps,
    Omit<React.ComponentPropsWithRef<'div'>, keyof AgentConnectionsOwnProps | 'children'> {}

const baseClass = 'ds-agent-connections';

/**
 * The agents connected to an account: each with the person it acts for,
 * what it may do and when it last acted, and a Disconnect that cuts it off
 * at once. Fully controlled by design: the host revokes the access, so it
 * owns whether an agent is connected. A disconnected agent stays as a
 * record, so the list never forgets who had access. Each agent is a
 * WidgetRow, so the list sits in a Widget beside plain rows.
 */
export function AgentConnections({
  ref,
  agents,
  onDisconnect,
  ownerLabel = (owner) => `For ${owner}`,
  disconnectLabel = 'Disconnect',
  disconnectAccessibleLabel = (name) => `Disconnect ${name}`,
  disconnectedLabel = 'Disconnected',
  disconnectedAnnouncement = (name) => `${name} disconnected`,
  className = '',
  ...rest
}: AgentConnectionsProps) {
  const rowRefs = useRef(new Map<string, HTMLLIElement>());
  /* The agent whose Disconnect the reader pressed: when it settles, its
     button has gone, so focus moves to its row rather than to nothing. */
  const pressed = useRef<string | null>(null);
  /* The live region is written straight to the DOM: the announcement is a
     side effect of the settle, not state the list renders from. */
  const liveRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!pressed.current) return;
    const agent = agents.find((entry) => entry.id === pressed.current);
    if (agent?.status !== 'disconnected') return;
    rowRefs.current.get(agent.id)?.focus();
    if (liveRef.current) liveRef.current.textContent = disconnectedAnnouncement(agent.name);
    pressed.current = null;
  }, [agents, disconnectedAnnouncement]);

  return (
    <div {...rest} ref={ref} className={[baseClass, className].filter(Boolean).join(' ')}>
      <ul className={`${baseClass}__list`}>
        {agents.map((agent) => {
          const disconnected = agent.status === 'disconnected';
          const description = [ownerLabel(agent.owner), agent.scope].filter(Boolean).join(' · ');
          return (
            <li
              key={agent.id}
              ref={(node) => {
                if (node) rowRefs.current.set(agent.id, node);
                else rowRefs.current.delete(agent.id);
              }}
              tabIndex={-1}
              className={[`${baseClass}__item`, disconnected && `${baseClass}__item--disconnected`].filter(Boolean).join(' ')}
            >
              <WidgetRow
                title={agent.name}
                description={description}
                leading={agent.mark ?? <PixelAvatar name={agent.name} size="lg" variant="tile" />}
                meta={disconnected ? undefined : agent.lastActive}
                actions={
                  disconnected ? (
                    <Badge variant="neutral" label={disconnectedLabel} />
                  ) : onDisconnect ? (
                    <Button
                      variant="secondary"
                      tone="destructive"
                      size="compact"
                      label={disconnectLabel}
                      aria-label={disconnectAccessibleLabel(agent.name)}
                      onClick={() => {
                        pressed.current = agent.id;
                        onDisconnect(agent);
                      }}
                    />
                  ) : undefined
                }
              />
            </li>
          );
        })}
      </ul>
      <span ref={liveRef} className="ds-visually-hidden" role="status" />
    </div>
  );
}
