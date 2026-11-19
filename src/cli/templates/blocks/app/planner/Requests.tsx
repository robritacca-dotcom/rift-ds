'use client';

/**
 * Requests waiting on a decision, each a DecisionRow that settles to the
 * answer and offers Undo. The statuses live here; send each decision to your
 * own store in onStatusChange.
 */

import { useState } from 'react';
import { Avatar } from 'rift-ds/components/Avatar/Avatar';
import { DecisionRow, type DecisionRowStatus } from 'rift-ds/components/DecisionRow/DecisionRow';
import { Widget } from 'rift-ds/components/Widget/Widget';

const REQUESTS = [
  { id: 'r1', name: 'Priya Natarajan', what: 'Two more days on search', when: '10m ago' },
  { id: 'r2', name: 'Tom Okafor', what: 'Move the launch a week', when: 'Yesterday' },
  { id: 'r3', name: 'Lena Fischer', what: 'A designer for help centre', when: 'Mon' },
];

export function Requests({ className }: { className?: string }) {
  const [statuses, setStatuses] = useState<Record<string, DecisionRowStatus>>({});
  return (
    <Widget className={className} title="Waiting on you" count={REQUESTS.filter((r) => (statuses[r.id] ?? 'pending') === 'pending').length}>
      {REQUESTS.map((request) => (
        <DecisionRow
          key={request.id}
          title={request.name}
          description={request.what}
          meta={request.when}
          leading={<Avatar name={request.name} size="sm" />}
          status={statuses[request.id] ?? 'pending'}
          onStatusChange={(status) => setStatuses((current) => ({ ...current, [request.id]: status }))}
          onUndo={() => {}}
          acceptLabel="Approve"
          declineLabel="Deny"
          acceptedLabel="Approved"
          declinedLabel="Denied"
        />
      ))}
    </Widget>
  );
}
