import React from 'react';
import { ButtonGroup, type ButtonGroupProps } from '../ButtonGroup/ButtonGroup';
import './Nav.css';

export interface NavProps {
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
}

/**
 * Nav component from Figma design system
 * Renders a horizontal navigation bar using ButtonGroup
 */
export const Nav = ({
  brandText,
  brandIcon,
  buttons,
  trailing,
  className = '',
}: NavProps) => {
  const baseClass = 'ds-nav';

  return (
    <nav className={`${baseClass} ${className}`}>
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
