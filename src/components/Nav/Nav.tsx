import React from 'react';
import { ButtonGroup, type ButtonGroupProps } from '../ButtonGroup/ButtonGroup';
import './Nav.css';

/** Props owned by Nav itself — everything else falls through to the `<nav>`. */
type NavOwnProps = {
  /** Brand/logo text */
  brandText?: string;
  /** Brand icon element (img, svg, etc.) */
  brandIcon?: React.ReactNode;
  /** Navigation buttons config — passed directly to ButtonGroup */
  buttons: ButtonGroupProps['buttons'];
  /** Additional elements rendered after the button group (e.g. ToggleSwitch) */
  trailing?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
};

export interface NavProps
  extends NavOwnProps,
    Omit<React.ComponentPropsWithoutRef<'nav'>, keyof NavOwnProps> {}

/**
 * Nav component from Figma design system
 * Renders a horizontal navigation bar using ButtonGroup.
 *
 * The landmark is labelled "Main" by default so assistive tech can tell it
 * apart from any other navigation on the page; pass `aria-label` to name it
 * differently. Unrecognised props are spread onto the `<nav>`.
 */
export const Nav = ({
  brandText,
  brandIcon,
  buttons,
  trailing,
  className = '',
  ...rest
}: NavProps) => {
  const baseClass = 'ds-nav';

  return (
    <nav aria-label="Main" {...rest} className={`${baseClass} ${className}`}>
      {(brandText || brandIcon) && (
        <div className={`${baseClass}__brand`}>
          {brandIcon && (
            <span className={`${baseClass}__brand-icon`}>{brandIcon}</span>
          )}
          {brandText && (
            <span className={`${baseClass}__brand-text`}>{brandText}</span>
          )}
        </div>
      )}
      <div className={`${baseClass}__right`}>
        <ButtonGroup orientation="horizontal" buttons={buttons} />
        {trailing}
      </div>
    </nav>
  );
};
