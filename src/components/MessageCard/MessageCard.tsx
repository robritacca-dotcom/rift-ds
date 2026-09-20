import React from 'react';
import './MessageCard.css';
import '../../fonts/material-symbols.css';

/** Props owned by MessageCard itself — everything else falls through to the root element. */
type MessageCardOwnProps = {
  /** Card heading. */
  title?: string;
  /** One or two lines under the title. */
  description?: string;
  /** Top media slot — an image or chart, inset from the card edges with its own rounded corners. */
  media?: React.ReactNode;
  /** Small leading icon beside the title — a Material Symbol name, or any custom element. */
  icon?: string | React.ReactNode;
  /** Free-text metadata line, e.g. a domain or date, so callers keep their own formatting. */
  meta?: string;
  /**
   * Action row rendered in a footer outside the body — small secondary or
   * tertiary Buttons, mirroring ToolCall's actions footer.
   */
  actions?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Body content between the description and the footer — rich content, a Prose block, a DocumentChip row. */
  children?: React.ReactNode;
};

export interface MessageCardProps
  extends MessageCardOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof MessageCardOwnProps> {}

/**
 * MessageCard is a structured rich-content card embedded in a chat message:
 * media, title, body, and an actions row, for link previews, search results,
 * and booking-style rich responses inside an assistant turn or bubble.
 *
 * It is not the navigation Card — this is content furniture inside a
 * conversation, sized by the bubble or turn that holds it.
 */
export const MessageCard = React.forwardRef<HTMLDivElement, MessageCardProps>(
  ({ title, description, media, icon, meta, actions, className = '', children, ...rest }, ref) => {
    const baseClass = 'ds-message-card';

    const classes = [baseClass, className].filter(Boolean).join(' ');
    const hasBody = Boolean(title || icon || meta || description || children);

    return (
      <div {...rest} ref={ref} className={classes}>
        {media && <div className={`${baseClass}__media`}>{media}</div>}

        {hasBody && (
          <div className={`${baseClass}__body`}>
            {(title || icon || meta) && (
              <div className={`${baseClass}__header`}>
                {(title || icon) && (
                  <div className={`${baseClass}__title-row`}>
                    {icon && (
                      <span className={`${baseClass}__icon`} aria-hidden="true">
                        {typeof icon === 'string' ? (
                          <span className="material-symbols-rounded">{icon}</span>
                        ) : (
                          icon
                        )}
                      </span>
                    )}
                    {title && <span className={`${baseClass}__title`}>{title}</span>}
                  </div>
                )}
                {meta && <span className={`${baseClass}__meta`}>{meta}</span>}
              </div>
            )}
            {description && <p className={`${baseClass}__description`}>{description}</p>}
            {children}
          </div>
        )}

        {actions && <div className={`${baseClass}__actions`}>{actions}</div>}
      </div>
    );
  },
);

MessageCard.displayName = 'MessageCard';
