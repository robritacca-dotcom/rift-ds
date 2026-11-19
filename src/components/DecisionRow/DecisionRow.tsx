'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Badge } from '../Badge/Badge';
import { Button } from '../Button/Button';
import { WidgetRow } from '../Widget/Widget';
import '../../behaviors/visually-hidden.css';
import './DecisionRow.css';

/** Where a decision stands: waiting on the reader, or settled one way or the other. */
export type DecisionRowStatus = 'pending' | 'accepted' | 'declined';

/** Props owned by DecisionRow itself; everything else falls through to the row's root `<div>`. */
type DecisionRowOwnProps = {
  /** What is waiting on a decision: who asked and for what. Collides with the native `title` tooltip attribute on purpose: the row shows it. */
  title: string;
  /** A quiet second line: the dates, the amount, the reason given. */
  description?: string;
  /** A leading mark: an Avatar, a StatusDot, an icon. Decorative unless the element names itself. */
  leading?: React.ReactNode;
  /** A trailing fact before the decision: when it was asked, how long it has waited. */
  meta?: React.ReactNode;
  /**
   * Where the decision stands, for controlled use. Pair with `onStatusChange`. Unset, the row keeps its own, starting at `defaultStatus`.
   * @default "pending"
   */
  status?: DecisionRowStatus;
  /** Where it stands to begin with, for uncontrolled use. */
  defaultStatus?: DecisionRowStatus;
  /** Fires with the new status when the reader accepts, declines or undoes. */
  onStatusChange?: (status: DecisionRowStatus) => void;
  /** Fires when the reader accepts. */
  onAccept?: () => void;
  /** Fires when the reader declines. */
  onDecline?: () => void;
  /** Offers Undo on a settled row, which returns it to pending and fires this. Leave it unset where a decision cannot be reversed. */
  onUndo?: () => void;
  /** Draws the accept button as destructive, for a decision whose yes takes something away (remove a member, delete a draft). */
  destructive?: boolean;
  /** The accept button's words. */
  acceptLabel?: string;
  /** The decline button's words. */
  declineLabel?: string;
  /** The settled mark's words once accepted. */
  acceptedLabel?: string;
  /** The settled mark's words once declined. */
  declinedLabel?: string;
  /** The undo button's words. */
  undoLabel?: string;
  /** What is announced when the row settles, given its title and the settled mark's words: "Accepted: Room booking". */
  settledAnnouncement?: (title: string, outcome: string) => string;
  /** Additional CSS classes */
  className?: string;
  /** A ref onto the row's root `<div>`. */
  ref?: React.Ref<HTMLDivElement>;
};

export interface DecisionRowProps
  extends DecisionRowOwnProps,
    Omit<React.HTMLAttributes<HTMLDivElement>, keyof DecisionRowOwnProps> {}

/**
 * DecisionRow: one item waiting on a yes or a no, as a row in a list. While
 * it is pending it offers two buttons in the host's words (Approve and Deny,
 * Accept and Decline, Keep and Discard); once decided it settles to a mark
 * saying which, with Undo while the host can reverse it. It is WidgetRow with
 * that lifecycle, so it sits in a Widget beside plain rows.
 *
 * The buttons leave the row when it settles, so focus moves with them, to
 * Undo when there is one and to the row otherwise, and the outcome is
 * announced, so a keyboard or screen-reader user is never left on nothing.
 */
export function DecisionRow({
  title,
  description,
  leading,
  meta,
  status: statusProp,
  defaultStatus = 'pending',
  onStatusChange,
  onAccept,
  onDecline,
  onUndo,
  destructive = false,
  acceptLabel = 'Accept',
  declineLabel = 'Decline',
  acceptedLabel = 'Accepted',
  declinedLabel = 'Declined',
  undoLabel = 'Undo',
  settledAnnouncement = (rowTitle, outcome) => `${outcome}: ${rowTitle}`,
  className = '',
  ref,
  ...rest
}: DecisionRowProps) {
  const baseClass = 'ds-decision-row';
  const [ownStatus, setOwnStatus] = useState<DecisionRowStatus>(defaultStatus);
  const status = statusProp ?? ownStatus;
  const rootRef = useRef<HTMLDivElement | null>(null);
  /* Set by the reader's own press, so focus moves only after a decision they
     made here, never when a host settles the row from elsewhere. */
  const movedByPress = useRef(false);

  const setRef = (node: HTMLDivElement | null) => {
    rootRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) (ref as React.RefObject<HTMLDivElement | null>).current = node;
  };

  const decide = (next: DecisionRowStatus) => {
    movedByPress.current = true;
    if (statusProp === undefined) setOwnStatus(next);
    onStatusChange?.(next);
    if (next === 'accepted') onAccept?.();
    else if (next === 'declined') onDecline?.();
    else onUndo?.();
  };

  useEffect(() => {
    if (!movedByPress.current) return;
    movedByPress.current = false;
    const root = rootRef.current;
    if (!root) return;
    const target =
      status === 'pending'
        ? root.querySelector<HTMLElement>(`.${baseClass}__accept`)
        : (root.querySelector<HTMLElement>(`.${baseClass}__undo`) ?? root);
    target?.focus();
  }, [status]);

  const settled = status !== 'pending';
  const outcome = status === 'accepted' ? acceptedLabel : declinedLabel;

  const actions = settled ? (
    <>
      {/* The mark is the eye's; the status line below says the same with the row's title, so it is heard once. */}
      <span className={`${baseClass}__outcome`} aria-hidden="true">
        <Badge variant={status === 'accepted' ? 'positive' : 'neutral'} label={outcome} />
      </span>
      {onUndo && (
        <Button className={`${baseClass}__undo`} variant="tertiary" size="compact" iconLeft="undo" label={undoLabel} onClick={() => decide('pending')} />
      )}
    </>
  ) : (
    <>
      <Button
        className={`${baseClass}__accept`}
        variant="secondary"
        tone={destructive ? 'destructive' : 'default'}
        size="compact"
        label={acceptLabel}
        onClick={() => decide('accepted')}
      />
      <Button variant="tertiary" tone="neutral" size="compact" label={declineLabel} onClick={() => decide('declined')} />
    </>
  );

  return (
    <div
      {...rest}
      ref={setRef}
      tabIndex={settled && !onUndo ? -1 : rest.tabIndex}
      className={[baseClass, settled ? `${baseClass}--settled` : '', className].filter(Boolean).join(' ')}
      data-status={status}
    >
      <WidgetRow title={title} description={description} leading={leading} meta={meta} actions={actions} />
      <span className="ds-visually-hidden" role="status">
        {settled ? settledAnnouncement(title, outcome) : ''}
      </span>
    </div>
  );
}
