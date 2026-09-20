import React from 'react';
import { Tooltip } from '../Tooltip/Tooltip';
import './MessageActions.css';
import '../../fonts/material-symbols.css';

/** One action in the row: a stable id, a glyph, and an accessible name. */
export interface MessageAction {
  /** Stable identifier passed to `onActionClick`. */
  id: string;
  /** Material Symbol name for the button glyph. */
  icon: string;
  /** Accessible name, also shown as the tooltip. */
  label: string;
  /** Marks the action as selected, e.g. the chosen feedback thumb. */
  active?: boolean;
  /** Disables just this action. */
  disabled?: boolean;
}

/** Props owned by MessageActions itself — everything else falls through to the root element. */
type MessageActionsOwnProps = {
  /** The actions, rendered left to right. */
  items: MessageAction[];
  /** Fires with the pressed action's id. */
  onActionClick?: (id: string) => void;
  /** Wrap each button in a Tooltip showing its label. The label stays as `aria-label` either way. */
  showTooltips?: boolean;
  /** Additional CSS classes */
  className?: string;
};

export interface MessageActionsProps
  extends MessageActionsOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof MessageActionsOwnProps> {}

/**
 * MessageActions is the icon-button row for message-level actions: copy,
 * retry, feedback. It slots into ChatMessage's `actions` prop, which reveals
 * it on hover and keyboard focus.
 *
 * The row is stateless beyond hover — copy feedback is the consumer swapping
 * an item's `icon` (content_copy → check) and flipping it back, so the row
 * never owns a timer or a clipboard call.
 */
export const MessageActions = React.forwardRef<HTMLDivElement, MessageActionsProps>(
  ({ items, onActionClick, showTooltips = true, className = '', ...rest }, ref) => {
    const baseClass = 'ds-message-actions';

    const classes = [baseClass, className].filter(Boolean).join(' ');

    return (
      <div {...rest} ref={ref} className={classes}>
        {items.map((item) => {
          const button = (
            <button
              type="button"
              className={[
                `${baseClass}__button`,
                item.active ? `${baseClass}__button--active` : '',
              ]
                .filter(Boolean)
                .join(' ')}
              aria-label={item.label}
              aria-pressed={item.active !== undefined ? item.active : undefined}
              disabled={item.disabled}
              onClick={() => onActionClick?.(item.id)}
            >
              <span className="material-symbols-rounded" aria-hidden="true">
                {item.icon}
              </span>
            </button>
          );

          return showTooltips ? (
            <Tooltip key={item.id} content={item.label}>
              {button}
            </Tooltip>
          ) : (
            <React.Fragment key={item.id}>{button}</React.Fragment>
          );
        })}
      </div>
    );
  },
);

MessageActions.displayName = 'MessageActions';
