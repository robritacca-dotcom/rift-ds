import React from 'react';
import { Button } from '../Button/Button';
import './ActionCard.css';
import '../../behaviors/chat-card.css';
import '../../fonts/material-symbols.css';
import { mirrorClass } from '../../behaviors/direction';
import type { ActionReadoutFact } from '../ActionReadout/ActionReadout';

/** Where a proposed change stands. */
export type ActionCardStatus = 'proposed' | 'confirmed' | 'dismissed' | 'undone';

/** Props owned by ActionCard itself — everything else falls through to the root `<div>`. */
type ActionCardOwnProps = {
  /** What the change is, with how much it touches: "Cancel orders: 69 orders". Collides with the native `title` tooltip attribute on purpose: the card shows it. */
  title: React.ReactNode;
  /** A quiet line under the title: what the change leaves alone, and why ("Left as they are: 2 already shipped"). */
  detail?: React.ReactNode;
  /** What the change will do, a line each, as ActionReadout lists what one did: shown over Confirm, then kept, under the receipt, by the confirmed record. A dismissed or undone card is one row and shows none. Write them for the state the card is in. */
  facts?: ActionReadoutFact[];
  /** The leading mark: a Material Symbol name, or your own element. */
  icon?: string | React.ReactNode;
  /** Where the change stands. Fully controlled by design: the host makes the change, so it owns whether it was made. `proposed` offers Confirm and Dismiss; the others are the card's record. Defaults to `proposed`. */
  status?: ActionCardStatus;
  /** What the confirmed card says was done: "69 orders cancelled". Defaults to the title. */
  receipt?: React.ReactNode;
  /** The colour of Confirm: `destructive` for a change that takes something away (a cancellation, a refund). Defaults to `default`. */
  tone?: 'default' | 'destructive';
  /** Called by Confirm. The host makes the change, then sets `status` to `confirmed`. */
  onConfirm?: () => void;
  /** Called by Dismiss. The host sets `status` to `dismissed`; nothing changed. */
  onDismiss?: () => void;
  /** Called by Undo on a confirmed card, shown only when this is set. The host reverses the change and sets `status` to `undone`. */
  onUndo?: () => void;
  /** The Confirm button's words. Defaults to "Confirm". */
  confirmLabel?: string;
  /** The Dismiss button's words. Not "Cancel", which beside a cancellation reads as the action itself. Defaults to "Dismiss". */
  dismissLabel?: string;
  /** The Undo button's words. Defaults to "Undo". */
  undoLabel?: string;
  /** The read-out where Confirm stood, on a confirmed card that keeps its `facts`. Defaults to "Confirmed". */
  confirmedLabel?: string;
  /** What a dismissed card says after its title. Defaults to "Not changed". */
  dismissedLabel?: string;
  /** What an undone card says after its title. Defaults to "Undone". */
  undoneLabel?: string;
  /** Additional CSS classes */
  className?: string;
};

export interface ActionCardProps
  extends ActionCardOwnProps,
    Omit<React.ComponentPropsWithRef<'div'>, keyof ActionCardOwnProps> {}

const baseClass = 'ds-action-card';

/**
 * A change an assistant proposes and the reader confirms: what it does and what
 * it leaves alone, with Confirm and Dismiss, then the record of what happened,
 * with Undo while it can be reversed. The card never makes the change itself:
 * the host does, from `onConfirm`, through the same action its own buttons use.
 * The record is announced as a status, so a confirmation is heard as well as seen.
 * Hook-free, so its records render from a Server Component; its buttons are
 * Button's own client islands.
 */
export function ActionCard({
  ref,
  title,
  detail,
  facts,
  icon,
  status = 'proposed',
  receipt,
  tone = 'default',
  onConfirm,
  onDismiss,
  onUndo,
  confirmLabel = 'Confirm',
  dismissLabel = 'Dismiss',
  undoLabel = 'Undo',
  confirmedLabel = 'Confirmed',
  dismissedLabel = 'Not changed',
  undoneLabel = 'Undone',
  className = '',
  ...rest
}: ActionCardProps) {
  const mark = icon ? (
    <span className={`${baseClass}__icon`} aria-hidden="true">
      {typeof icon === 'string' ? <span className={`material-symbols-rounded ${mirrorClass(icon)}`}>{icon}</span> : icon}
    </span>
  ) : null;

  const factList = facts?.length ? (
    <dl className={`ds-chat-card-facts ${baseClass}__facts`}>
      {facts.map((fact, index) => (
        <React.Fragment key={`${index}-${fact.label}`}>
          <dt>{fact.label}</dt>
          <dd>{fact.value}</dd>
        </React.Fragment>
      ))}
    </dl>
  ) : null;

  /* A confirmed record with facts keeps the proposal's shape: the receipt and Undo in one row, the
     facts under it, and where Confirm stood, a read-out of the decision in the positive status.
     No icon: the row's end is Undo's, which a host may hold back for a while, and an icon there would be swapped out under it. */
  if (status === 'confirmed' && factList) {
    return (
      <div {...rest} ref={ref} className={[baseClass, `${baseClass}--confirmed`, `${baseClass}--detailed`, className].filter(Boolean).join(' ')}>
        <span className={`${baseClass}__head`}>
          <span className={`${baseClass}__title`} role="status">
            {receipt ?? title}
          </span>
          {onUndo && <Button variant="tertiary" size="compact" iconLeft="undo" label={undoLabel} onClick={onUndo} />}
        </span>
        {factList}
        <span className={`${baseClass}__actions`}>
          {/* The recipe's read-out, in the positive status: where Confirm stood, the decision as a record. */}
          <span className={`ds-chat-card-readout ds-chat-card-readout--positive ${baseClass}__readout`}>
            <span className={`ds-chat-card-readout__icon ${baseClass}__readout-icon material-symbols-rounded`} aria-hidden="true">
              check
            </span>
            {confirmedLabel}
          </span>
        </span>
      </div>
    );
  }

  if (status !== 'proposed') {
    return (
      <div {...rest} ref={ref} className={[baseClass, `${baseClass}--${status}`, className].filter(Boolean).join(' ')}>
        <span className={`${baseClass}__record`} role="status">
          {/* Undo takes the trailing slot, so the icon steps aside for it. */}
          {!(status === 'confirmed' && onUndo) && mark}
          <span className={`${baseClass}__record-text`}>
            {status === 'confirmed' ? (receipt ?? title) : title}
            {status !== 'confirmed' && (
              <span className={`${baseClass}__record-note`}>{status === 'dismissed' ? dismissedLabel : undoneLabel}</span>
            )}
          </span>
        </span>
        {status === 'confirmed' && onUndo && (
          <Button variant="tertiary" size="compact" iconLeft="undo" label={undoLabel} onClick={onUndo} />
        )}
      </div>
    );
  }

  return (
    <div {...rest} ref={ref} className={[baseClass, `${baseClass}--proposed`, className].filter(Boolean).join(' ')}>
      <span className={`${baseClass}__title`}>
        {mark}
        {title}
      </span>
      {detail && <span className={`${baseClass}__detail`}>{detail}</span>}
      {factList}
      <span className={`${baseClass}__actions`}>
        <Button variant="primary" tone={tone} size="compact" label={confirmLabel} onClick={onConfirm} />
        <Button variant="secondary" tone="neutral" size="compact" label={dismissLabel} onClick={onDismiss} />
      </span>
    </div>
  );
}
