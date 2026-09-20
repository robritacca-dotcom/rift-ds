import React from 'react';
import { Button } from '../Button/Button';
import { CircularButton } from '../CircularButton/CircularButton';
import { DropdownMenu, type DropdownMenuEntry } from '../DropdownMenu/DropdownMenu';
import './SplitButton.css';

export type { DropdownMenuEntry as SplitButtonMenuEntry } from '../DropdownMenu/DropdownMenu';

/** Props owned by SplitButton itself — everything else falls through to the primary button. */
type SplitButtonOwnProps = {
  /** Label of the primary action */
  label: string;
  /** Click handler for the primary action */
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  /** Menu entries for the alternative actions */
  items: DropdownMenuEntry[];
  /** Visual treatment, shared by both segments */
  variant?: 'primary' | 'secondary' | 'neutral';
  /** Component size */
  size?: 'default' | 'compact';
  /** Disables both segments */
  disabled?: boolean;
  /** Shows a spinner on the primary segment and blocks interaction while an async action runs */
  loading?: boolean;
  /** Icon for the primary segment — Material Symbol name or custom element */
  iconLeft?: string | React.ReactNode;
  /** Horizontal alignment of the menu panel relative to the control */
  align?: 'start' | 'end';
  /** Accessible name of the menu trigger segment */
  menuLabel?: string;
  /** Additional CSS classes, applied to the wrapper around both segments, not the primary button */
  className?: string;
};

export interface SplitButtonProps
  extends SplitButtonOwnProps,
    Omit<React.ComponentPropsWithoutRef<'button'>, keyof SplitButtonOwnProps | 'type'> {}

/**
 * A primary action with an attached menu of alternatives — "Save" beside
 * "Save as draft" and "Save as template". One pill silhouette, two segments:
 * the label fires `onClick` directly, the chevron opens a DropdownMenu, so
 * the default stays one click away while the variants stay discoverable.
 *
 * Forwards a ref to the primary segment's button and spreads unrecognised
 * props onto that segment — while `className` composes onto the wrapper
 * around both segments. Menu behaviour (keyboard, outside click, sub-menus)
 * is DropdownMenu's, unchanged. Purely compositional (no 'use client'), like
 * ButtonGroup: the interactivity lives in the pieces it assembles.
 */
export const SplitButton = React.forwardRef<HTMLButtonElement, SplitButtonProps>(
  (
    {
      label,
      onClick,
      items,
      variant = 'primary',
      size = 'default',
      disabled = false,
      loading = false,
      iconLeft,
      align = 'end',
      menuLabel = 'More actions',
      className = '',
      ...rest
    },
    ref,
  ) => {
    const baseClass = 'ds-split-button';

    const classes = [baseClass, `${baseClass}--${variant}`, className].filter(Boolean).join(' ');

    return (
      <span className={classes}>
        <Button
          {...rest}
          ref={ref}
          className={`${baseClass}__main`}
          label={label}
          iconLeft={iconLeft}
          variant={variant}
          size={size}
          disabled={disabled}
          loading={loading}
          onClick={onClick}
        />
        <DropdownMenu
          className={`${baseClass}__menu`}
          align={align}
          size={size}
          items={items}
          trigger={
            <CircularButton
              className={`${baseClass}__trigger`}
              icon="keyboard_arrow_down"
              /* No self-labelling tooltip: the trigger must stay a direct flex
                 child of the split so align-self: stretch can size it to the
                 main segment — the tooltip wrapper would sit between them. */
              tooltip={false}
              ariaLabel={menuLabel}
              variant={variant}
              size={size}
              disabled={disabled || loading}
            />
          }
        />
      </span>
    );
  },
);

SplitButton.displayName = 'SplitButton';
