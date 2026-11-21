'use client';

import React from 'react';
import { Button } from '../Button/Button';
import { IconButton } from '../IconButton/IconButton';
import { useCopied } from '../../behaviors/clipboard';

/** Props owned by CopyButton itself. */
type CopyButtonOwnProps = {
  /** The text put on the clipboard, or a function that returns it at the moment of the press (for a value that changes, such as the current URL). */
  value: string | (() => string);
  /** Called with the copied text after it is put on the clipboard, so a host can count copies or announce them. */
  onCopied?: (value: string) => void;
  /** Visible text before a copy. When `iconOnly`, it is the accessible name and the tooltip instead, unless `copyLabel` is set. */
  copyText?: string;
  /** Accessible name before a copy. Defaults to `copyText`. */
  copyLabel?: string;
  /** Visible text and accessible name for a moment after a copy. */
  copiedLabel?: string;
  /** Show only the glyph, with the label in a tooltip, as an IconButton. */
  iconOnly?: boolean;
  /**
   * Where the icon-only form's tooltip sits, as on IconButton.
   * @default 'top'
   */
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right' | 'start' | 'end';
  /** Visual emphasis, as on Button. */
  variant?: 'secondary' | 'tertiary';
  /** Colour, as on Button: `neutral` draws the secondary outline in the neutral greys rather than the action colour, for a utility control such as a page's "Copy link". */
  tone?: 'default' | 'neutral';
  /** Control size, as on Button. */
  size?: 'default' | 'compact';
  /** Disable the button. */
  disabled?: boolean;
  /** Additional CSS classes. */
  className?: string;
};

export interface CopyButtonProps
  extends CopyButtonOwnProps,
    Omit<React.ComponentPropsWithRef<'button'>, keyof CopyButtonOwnProps | 'children' | 'type' | 'value' | 'aria-label'> {}

/**
 * CopyButton: puts a value on the clipboard and says so. A Button (or an
 * IconButton when `iconOnly`) whose glyph turns from a copy mark to a check,
 * and whose label turns to `copiedLabel`, for a moment after the press. The
 * write goes through the library's one clipboard behaviour, so it falls back
 * to a hidden textarea where the async API is missing.
 */
export function CopyButton({
  value,
  onCopied,
  copyText = 'Copy',
  copyLabel,
  copiedLabel = 'Copied',
  iconOnly = false,
  tooltipPosition = 'top',
  variant = 'tertiary',
  tone = 'default',
  size = 'compact',
  disabled = false,
  className = '',
  onClick,
  ref,
  ...rest
}: CopyButtonProps) {
  const { copied, copy } = useCopied();
  const classes = ['ds-copy-button', className].filter(Boolean).join(' ');
  const icon = copied ? 'check' : 'content_copy';
  const name = copied ? copiedLabel : (copyLabel ?? copyText);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    const text = typeof value === 'function' ? value() : value;
    copy(text);
    onCopied?.(text);
  };

  if (iconOnly) {
    return (
      <IconButton
        {...rest}
        ref={ref}
        className={classes}
        icon={icon}
        label={name}
        tooltipPosition={tooltipPosition}
        variant={variant}
        tone={tone}
        size={size}
        disabled={disabled}
        onClick={handleClick}
      />
    );
  }
  return (
    <Button
      {...rest}
      ref={ref as React.Ref<HTMLButtonElement>}
      className={classes}
      iconLeft={icon}
      variant={variant}
      tone={tone}
      size={size}
      disabled={disabled}
      aria-label={copyLabel && !copied ? copyLabel : undefined}
      onClick={handleClick}
    >
      {copied ? copiedLabel : copyText}
    </Button>
  );
}
