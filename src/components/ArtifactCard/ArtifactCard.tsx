import React from 'react';
import './ArtifactCard.css';
import '../../behaviors/chat-card.css';
import '../../fonts/material-symbols.css';
import { mirrorClass } from '../../behaviors/direction';

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

/** The trailing cue: the panel's open or close mark. */
const cueIcon = (open: boolean) => (open ? 'right_panel_close' : 'right_panel_open');

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
        <span className={`${baseClass}__mark material-symbols-rounded ${mirrorClass(icon)}`} aria-hidden="true">
          {icon}
        </span>
      ) : (
        <span className={`${baseClass}__mark`}>{icon}</span>
      )}
      <span className={`${baseClass}__text`}>
        <span className={`${baseClass}__title`}>{title}</span>
        {meta && <span className={`${baseClass}__meta`}>{meta}</span>}
      </span>
      {/* The chat widget's artifact toggle's glyphs, so the card and the
          header control that open the same panel draw the same mark. */}
      <span className={`${baseClass}__cue material-symbols-rounded ${mirrorClass(cueIcon(open))}`} aria-hidden="true">
        {cueIcon(open)}
      </span>
    </button>
  )
);

ArtifactCard.displayName = 'ArtifactCard';
