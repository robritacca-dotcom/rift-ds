import React from 'react';
import './ChatMarker.css';
import '../../fonts/material-symbols.css';

/** Props owned by ChatMarker itself — everything else falls through to the root element. */
type ChatMarkerOwnProps = {
  /** Leading icon — a Material Symbol name, or any custom element. */
  icon?: string | React.ReactNode;
  /** Draw the flanking divider lines. Turn off for a bare centred note. */
  line?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** The marker text, e.g. "Today" or "Chat renamed". */
  children?: React.ReactNode;
};

export interface ChatMarkerProps
  extends ChatMarkerOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof ChatMarkerOwnProps> {}

/**
 * ChatMarker is the inline separator a conversation uses for anything that
 * is not a turn: date breaks, joins, mode changes, system notes. It reads
 * as furniture rather than as a message — quiet tertiary text between two
 * divider lines, so the eye skips it while scanning turns.
 */
export const ChatMarker = React.forwardRef<HTMLDivElement, ChatMarkerProps>(
  ({ icon, line = true, className = '', children, ...rest }, ref) => {
    const baseClass = 'ds-chat-marker';

    const classes = [baseClass, line ? '' : `${baseClass}--bare`, className]
      .filter(Boolean)
      .join(' ');

    return (
      <div {...rest} ref={ref} className={classes} role="separator">
        <span className={`${baseClass}__label`}>
          {icon && (
            <span className={`${baseClass}__icon`} aria-hidden="true">
              {typeof icon === 'string' ? (
                <span className="material-symbols-rounded">{icon}</span>
              ) : (
                icon
              )}
            </span>
          )}
          {children}
        </span>
      </div>
    );
  },
);

ChatMarker.displayName = 'ChatMarker';
