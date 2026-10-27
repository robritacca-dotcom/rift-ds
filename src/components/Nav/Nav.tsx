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
 * Nav is the earlier plain top bar: a brand slot and a horizontal
 * ButtonGroup of page links, with no menus and no mobile behaviour of its
 * own. It keeps working for existing consumers, and new work uses
 * SiteHeader, which adds section mega menus, the sticky progressive blur and
 * the fold to a drawer.
 *
 * The landmark is labelled "Main" by default so assistive tech can tell it
 * apart from any other navigation on the page; pass `aria-label` to name it
 * differently. The forwarded ref and any unrecognised props target the `<nav>`.
 *
 * @deprecated Use `SiteHeader` instead.
 */
export const Nav = React.forwardRef<HTMLElement, NavProps>(
  ({ brandText, brandIcon, buttons, trailing, className = '', ...rest }, ref) => {
    const baseClass = 'ds-nav';

    return (
      <nav aria-label="Main" {...rest} ref={ref} className={`${baseClass} ${className}`}>
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
  },
);

Nav.displayName = 'Nav';
