import React from 'react';
import './ChatMessage.css';

/** Props owned by ChatMessage itself — everything else falls through to the root element. */
type ChatMessageOwnProps = {
  /**
   * Which side of the conversation this turn belongs to. Drives alignment
   * and the default surface: user turns are right-aligned bubbles,
   * assistant turns are surface-less full-width text. Shadows the ARIA
   * role attribute; the root renders no ARIA role.
   */
  role?: 'user' | 'assistant';
  /** Avatar slot, e.g. an `<Avatar>`. Omit for no gutter at all. */
  avatar?: React.ReactNode;
  /**
   * Show the passed avatar. When false the avatar is hidden but its gutter
   * space is kept, so consecutive rows in a run stay aligned.
   */
  showAvatar?: boolean;
  /** Display name shown above the content. */
  author?: string;
  /** Time shown beside the author, e.g. "2:41 PM". Free text, so callers keep their own formatting. */
  timestamp?: string;
  /**
   * Consecutive-message mode: hides the avatar (keeping its gutter), drops
   * the author and timestamp, and tightens the spacing to the row above.
   */
  grouped?: boolean;
  /**
   * Override the role's default surface. Explicit true on an assistant turn
   * renders a received bubble; explicit false on a user turn renders plain text.
   */
  bubble?: boolean;
  /**
   * Square the speaker-side bottom corner of the bubble — bottom-right on a
   * sent bubble, bottom-left on a received one. Only meaningful when a
   * bubble renders.
   */
  tail?: boolean;
  /** Compact drops the type one size step and tightens the bubble padding. */
  size?: 'default' | 'compact';
  /** Waiting for the first content: renders a three-dot pulse in place of children. */
  pending?: boolean;
  /** Accessible text announced for the pending state. */
  pendingLabel?: string;
  /** Action row under the content, revealed on hover and keyboard focus (always visible on touch) — `showActions` pins it on. */
  actions?: React.ReactNode;
  /**
   * Always show the action row instead of revealing it on hover and focus.
   * For surfaces where the actions are part of the response — a copy or
   * feedback row — rather than a secondary affordance.
   */
  showActions?: boolean;
  /** Footer slot under the content — a sources row, an edited note. */
  footer?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /**
   * The message content. The package ships no markdown renderer; render
   * markdown yourself, ideally wrapped in Prose, and pass the result.
   */
  children?: React.ReactNode;
};

export interface ChatMessageProps
  extends ChatMessageOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof ChatMessageOwnProps> {}

/**
 * ChatMessage is a single chat turn: avatar, author, timestamp, and the
 * content itself, aligned by role. User turns read as right-aligned bubbles;
 * assistant turns read as plain full-width text, so a transcript keeps the
 * question-and-answer rhythm without every row wearing a surface.
 *
 * The bubble colours come exclusively from the four `--color-chat-bubble-*`
 * tokens, so re-theming a chat means repointing those and nothing else.
 */
export const ChatMessage = React.forwardRef<HTMLDivElement, ChatMessageProps>(
  (
    {
      role = 'assistant',
      avatar,
      showAvatar = true,
      author,
      timestamp,
      grouped = false,
      bubble,
      tail = false,
      size = 'default',
      pending = false,
      pendingLabel = 'Waiting for a reply',
      actions,
      showActions = false,
      footer,
      className = '',
      children,
      ...rest
    },
    ref,
  ) => {
    const baseClass = 'ds-chat-message';
    const hasBubble = bubble ?? role === 'user';
    const hideAvatar = grouped || !showAvatar;

    const classes = [
      baseClass,
      `${baseClass}--${role}`,
      hasBubble ? `${baseClass}--bubble` : `${baseClass}--plain`,
      tail ? `${baseClass}--tail` : '',
      grouped ? `${baseClass}--grouped` : '',
      size === 'compact' ? `${baseClass}--compact` : '',
      pending ? `${baseClass}--pending` : '',
      showActions ? `${baseClass}--show-actions` : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div {...rest} ref={ref} className={classes}>
        {avatar !== undefined && (
          <span
            className={[
              `${baseClass}__gutter`,
              hideAvatar ? `${baseClass}__gutter--hidden` : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {avatar}
          </span>
        )}

        <div className={`${baseClass}__body`}>
          {!grouped && (author || timestamp) && (
            <div className={`${baseClass}__meta`}>
              {author && <span className={`${baseClass}__author`}>{author}</span>}
              {timestamp && (
                <span className={`${baseClass}__timestamp`}>{timestamp}</span>
              )}
            </div>
          )}

          <div className={`${baseClass}__content`}>
            {pending ? (
              <span className={`${baseClass}__pending`} role="status">
                <span className={`${baseClass}__sr-only`}>{pendingLabel}</span>
                <span className={`${baseClass}__dots`} aria-hidden="true">
                  <span className={`${baseClass}__dot`} />
                  <span className={`${baseClass}__dot`} />
                  <span className={`${baseClass}__dot`} />
                </span>
              </span>
            ) : (
              children
            )}
          </div>

          {actions && <div className={`${baseClass}__actions`}>{actions}</div>}
          {footer && <div className={`${baseClass}__footer`}>{footer}</div>}
        </div>
      </div>
    );
  },
);

ChatMessage.displayName = 'ChatMessage';
