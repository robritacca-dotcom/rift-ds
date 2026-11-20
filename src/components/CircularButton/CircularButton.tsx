// The old name of IconButton, kept so code written against it still builds.
// No 'use client' directive, as IconButton has none.
import React from 'react';
import { IconButton, type IconButtonProps } from '../IconButton/IconButton';

/**
 * Props of the deprecated CircularButton: IconButton's, with the name under
 * its old spelling.
 *
 * @deprecated Use `IconButtonProps`, whose `label` replaces `ariaLabel`.
 */
export interface CircularButtonProps extends Omit<IconButtonProps, 'label'> {
  /** Accessible label, required because the button has no visible text. IconButton calls it `label`. */
  ariaLabel: string;
}

/**
 * IconButton under its old name. It renders the same button, passes
 * `ariaLabel` on as `label`, and adds the old `ds-circular-button` base
 * class beside the new ones, so a rule written against the base still
 * matches. The old modifier and element classes are gone: a rule written
 * against one moves to its `ds-icon-button` twin.
 *
 * @deprecated Use `IconButton` with `label`. The button was renamed because
 * its shape is the theme's: a square theme draws it square.
 */
export const CircularButton = React.forwardRef<HTMLButtonElement | HTMLAnchorElement, CircularButtonProps>(
  ({ ariaLabel, className, ...rest }, ref) => (
    <IconButton
      {...rest}
      ref={ref}
      label={ariaLabel}
      className={['ds-circular-button', className].filter(Boolean).join(' ')}
    />
  ),
);

CircularButton.displayName = 'CircularButton';
