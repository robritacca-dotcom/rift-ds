import './EntityCard.css';

export interface EntityCardProps {
  /** Display label beneath the icon / image */
  label: string;
  /** Material Symbol icon name rendered via the rounded font (e.g. "home") */
  icon?: string;
  /** Path to an image asset — used instead of icon when provided */
  imageSrc?: string;
  /** Alt text for the image */
  imageAlt?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * EntityCard
 * A compact card with a centred icon (Material Symbols Rounded)
 * or image and a label underneath. Used on Icons and Logos pages.
 */
export const EntityCard = ({
  label,
  icon,
  imageSrc,
  imageAlt,
  className = '',
}: EntityCardProps) => {
  const baseClass = 'ds-entity-card';
  const classes = [baseClass, className].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      <div className={`${baseClass}__preview`}>
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={imageAlt || label}
            className={`${baseClass}__image`}
          />
        ) : icon ? (
          <span className={`${baseClass}__icon material-symbols-rounded`} aria-hidden="true">
            {icon}
          </span>
        ) : null}
      </div>
      <span className={`${baseClass}__label`}>{label}</span>
    </div>
  );
};
