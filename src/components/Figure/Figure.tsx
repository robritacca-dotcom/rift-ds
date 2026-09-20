import React from 'react';
import './Figure.css';

export interface FigureProps {
  /** The image element — a plain <img> or a framework image component */
  children: React.ReactNode;
  /** Caption rendered below the image */
  caption?: React.ReactNode;
  /** Click handler (e.g. open a lightbox) — adds zoom affordance + keyboard support */
  onClick?: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Figure component — an image with an optional caption in a bordered,
 * rounded container. Pass onClick to make it zoomable (adds the
 * zoom cursor, hover dim, and keyboard activation).
 */
export const Figure = ({
  children,
  caption,
  onClick,
  className = '',
}: FigureProps) => {
  const baseClass = 'ds-figure';

  const classes = [baseClass, onClick && `${baseClass}--zoomable`, className]
    .filter(Boolean)
    .join(' ');

  const media = <div className={`${baseClass}__media`}>{children}</div>;

  return (
    <figure className={classes}>
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
};
