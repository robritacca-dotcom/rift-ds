import React from 'react';
import './Figure.css';

/** Props owned by Figure itself — everything else falls through to the root figure. */
type FigureOwnProps = {
  /** The image element — a plain <img> or a framework image component */
  children: React.ReactNode;
  /** Caption rendered below the image */
  caption?: React.ReactNode;
  /**
   * Click handler (e.g. open a lightbox) — adds zoom affordance + keyboard support.
   * It is attached to the zoom button wrapping the image, not to the
   * `<figure>`, so it replaces the native `onClick` on the root.
   */
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  /** Additional CSS classes */
  className?: string;
};

export interface FigureProps
  extends FigureOwnProps,
    Omit<React.ComponentPropsWithoutRef<'figure'>, keyof FigureOwnProps> {}

/**
 * Figure component — an image with an optional caption in a bordered,
 * rounded container. Pass onClick to make it zoomable (adds the
 * zoom cursor, hover dim, and keyboard activation). Forwards a ref to the
 * root `<figure>` and spreads native attributes onto it.
 */
export const Figure = React.forwardRef<HTMLElement, FigureProps>(
  ({ children, caption, onClick, className = '', ...rest }, ref) => {
    const baseClass = 'ds-figure';

    const classes = [baseClass, onClick && `${baseClass}--zoomable`, className]
      .filter(Boolean)
      .join(' ');

    const media = <div className={`${baseClass}__media`}>{children}</div>;

    return (
      <figure {...rest} ref={ref} className={classes}>
        {onClick ? (
          // A real button rather than role="button" on the figure: ARIA
          // forbids the button role on <figure>, and the element brings
          // Enter/Space activation itself. Its accessible name is the
          // child image's alt text.
          <button type="button" className={`${baseClass}__zoom`} onClick={onClick}>
            {media}
          </button>
        ) : (
          media
        )}
        {caption && (
          <figcaption className={`${baseClass}__caption`}>{caption}</figcaption>
        )}
      </figure>
    );
  },
);

Figure.displayName = 'Figure';
