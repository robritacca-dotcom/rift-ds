import React from 'react';
import './EntityCard.css';
import { mirrorClass } from '../../behaviors/direction';

/** Props owned by EntityCard itself — everything else falls through to the root div. */
type EntityCardOwnProps = {
  /** Display label beneath the icon / image */
  label: string;
  /** Icon — Material Symbol name (string, e.g. "home") rendered via the rounded font, or custom element (ReactNode) */
  icon?: string | React.ReactNode;
  /** Path to an image asset — used instead of icon when provided */
  imageSrc?: string;
  /** Alt text for the image */
  imageAlt?: string;
  /** Additional CSS classes */
  className?: string;
};

export interface EntityCardProps
  extends EntityCardOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof EntityCardOwnProps | 'children'> {}

/**
 * EntityCard
 * A compact card with a centred icon (Material Symbols Rounded)
 * or image and a label underneath. Used on Icons and Logos pages.
 * Forwards a ref to the root div and spreads native attributes onto it.
 */
export const EntityCard = React.forwardRef<HTMLDivElement, EntityCardProps>(
  ({ label, icon, imageSrc, imageAlt, className = '', ...rest }, ref) => {
    const baseClass = 'ds-entity-card';
    const classes = [baseClass, className].filter(Boolean).join(' ');

    return (
      <div {...rest} ref={ref} className={classes}>
        <div className={`${baseClass}__preview`}>
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={imageAlt || label}
              className={`${baseClass}__image`}
            />
          ) : icon ? (
            typeof icon === 'string' ? (
              <span className={`${baseClass}__icon material-symbols-rounded ${mirrorClass(icon)}`} aria-hidden="true">
                {icon}
              </span>
            ) : (
              <span className={`${baseClass}__icon`} aria-hidden="true">
                {icon}
              </span>
            )
          ) : null}
        </div>
        <span className={`${baseClass}__label`}>{label}</span>
      </div>
    );
  },
);

EntityCard.displayName = 'EntityCard';
