import React from 'react';
import './ChatHeader.css';

/** Props owned by ChatHeader itself — everything else falls through to the root element. */
type ChatHeaderOwnProps = {
  /**
   * The chat or assistant name. Deliberately shadows the native `title`
   * tooltip attribute — a header's title is content, not a tooltip. Pass a
   * string for the default treatment, or your own heading element.
   */
  title?: React.ReactNode;
  /**
   * Trailing controls: a new-chat CircularButton, a view switcher, a close
   * button. The slot only lays them out — each control owns its behaviour.
   */
  actions?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
};

export interface ChatHeaderProps
  extends ChatHeaderOwnProps,
    Omit<React.ComponentPropsWithoutRef<'header'>, keyof ChatHeaderOwnProps> {}

/**
 * ChatHeader is the top row of a chat surface: the conversation's name on the
 * left, its controls on the right. It draws no bottom border — like the
 * composer below, it floats free of the transcript, and the thread's own
 * padding provides the separation.
 *
 * Purely presentational, so it renders from a Server Component; the controls
 * passed into `actions` bring their own interactivity.
 */
export const ChatHeader = React.forwardRef<HTMLElement, ChatHeaderProps>(
  ({ title, actions, className = '', ...rest }, ref) => {
    const baseClass = 'ds-chat-header';

    const classes = [baseClass, className].filter(Boolean).join(' ');

    return (
      <header {...rest} ref={ref} className={classes}>
        {typeof title === 'string' ? (
          <span className={`${baseClass}__title`}>{title}</span>
        ) : (
          title
        )}
        {actions && <div className={`${baseClass}__actions`}>{actions}</div>}
      </header>
    );
  },
);

ChatHeader.displayName = 'ChatHeader';
