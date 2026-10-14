import React from 'react';
import './ArtifactCard.css';
import '../../fonts/material-symbols.css';

/** Props owned by ArtifactCard itself — everything else falls through to the root `<button>`. */
type ArtifactCardOwnProps = {
  /** The artifact's name. Collides with the native `title` tooltip attribute on purpose: the card shows its name, it does not hide it in a tooltip. */
  title: React.ReactNode;
  /** A quiet line under the name: what kind of thing this is, or which version. */
  meta?: React.ReactNode;
  /** The leading mark — Material Symbol name (string) or custom element (ReactNode). */
  icon?: string | React.ReactNode;
  /** Whether this card's artifact is on stage in its panel. The card holds the on-stage fill, announces itself pressed, and its trailing cue turns from open to close. */
  open?: boolean;
  /** Additional CSS classes */
  className?: string;
};

export interface ArtifactCardProps
  extends ArtifactCardOwnProps,
    Omit<React.ComponentPropsWithoutRef<'button'>, keyof ArtifactCardOwnProps | 'type'> {}

const baseClass = 'ds-artifact-card';

/**
 * ArtifactCard is an artifact's place in a conversation: one row naming
 * something the chat made, which opens it in an ArtifactPanel. It is a
 * toggle button, so `open` is the whole state and `onClick` the whole
 * behaviour; the host decides what opening means.
 *
 * Hook-free and stateless, so it renders from a Server Component until it
 * is given a handler.
 */
export const ArtifactCard = React.forwardRef<HTMLButtonElement, ArtifactCardProps>(
  ({ title, meta, icon = 'draft', open = false, className = '', ...rest }, ref) => (
    <button
      ref={ref}
      {...rest}
      type="button"
      className={[baseClass, open && `${baseClass}--open`, className].filter(Boolean).join(' ')}
      aria-pressed={open}
    >
      {typeof icon === 'string' ? (
        <span className={`${baseClass}__mark material-symbols-rounded`} aria-hidden="true">
          {icon}
        </span>
      ) : (
        <span className={`${baseClass}__mark`}>{icon}</span>
      )}
      <span className={`${baseClass}__text`}>
        <span className={`${baseClass}__title`}>{title}</span>
        {meta && <span className={`${baseClass}__meta`}>{meta}</span>}
      </span>
      <span className={`${baseClass}__cue material-symbols-rounded`} aria-hidden="true">
        {open ? 'close' : 'open_in_new_down'}
      </span>
    </button>
  )
);

ArtifactCard.displayName = 'ArtifactCard';
