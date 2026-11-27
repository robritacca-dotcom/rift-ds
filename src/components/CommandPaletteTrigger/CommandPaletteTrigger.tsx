// No 'use client' directive: the trigger defines no hooks or handlers of its
// own (the host passes onClick), so it renders from a Server Component too.
// The icon-only form's Tooltip wrapper is the client island, as IconButton's is.
import React from 'react';
import { Kbd } from '../Kbd/Kbd';
import { Tooltip } from '../Tooltip/Tooltip';
import { shortcutAriaAnyPlatform, type Shortcut, type ShortcutKeyLabels } from '../../behaviors/shortcut-keys';
import './CommandPaletteTrigger.css';
import '../../fonts/material-symbols.css';
import { mirrorClass } from '../../behaviors/direction';

/** Props owned by CommandPaletteTrigger itself — everything else falls through to the <button>. */
type CommandPaletteTriggerOwnProps = {
  /** The prompt the field shows, which is also the button's accessible name. */
  label?: string;
  /** The keyboard shortcut drawn as literal keycaps at the end, one key per entry, in place of `keys`. Pass an empty array for none. */
  shortcut?: string[];
  /**
   * The keyboard shortcut drawn at the end, in the shortcut grammar, in the
   * reader's platform legends. Defaults to `mod+k`: ⌘ K on a Mac and Ctrl K
   * elsewhere, announced as both, since CommandPalette answers to either.
   * `shortcut` wins when it is given.
   */
  keys?: Shortcut;
  /** Replaces any legend `keys` is drawn with, such as `{ ctrl: 'Strg' }` for a German keyboard. */
  keyLabels?: ShortcutKeyLabels;
  /** Leading icon — Material Symbol name (string) or custom element (ReactNode). */
  icon?: string | React.ReactNode;
  /** Control size, on the row-control scale: `default` is 40px, `compact` 32px. */
  size?: 'default' | 'compact';
  /** Fold to the icon alone, an even box the row height across, for a row with no room for the field. The label stays the accessible name. */
  iconOnly?: boolean;
  /**
   * The hover and focus tooltip of the icon-only form, which names itself as
   * IconButton does: by default it carries `label`. Pass a string to show
   * different wording, or `false` to opt out.
   */
  tooltip?: string | false;
  /** Which side the tooltip opens on; below by default, since the trigger usually sits in a top bar. `start` and `end` follow the reading direction. */
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right' | 'start' | 'end';
  /**
   * Frosts the field for a busy ground (a map, a shader, a photo): the page
   * behind it is blurred and the field takes the glass fill at rest, as
   * Button's `glass` does, so its prompt reads over whatever is behind it.
   * Hover is the field's own.
   */
  glass?: boolean;
  /** Additional CSS classes */
  className?: string;
};

export interface CommandPaletteTriggerProps
  extends CommandPaletteTriggerOwnProps,
    Omit<React.ComponentPropsWithoutRef<'button'>, keyof CommandPaletteTriggerOwnProps | 'children' | 'type'> {}

/**
 * The entry point to a command palette: a button dressed as a search field
 * (icon, prompt and the shortcut's keycaps), because typing happens in the
 * palette itself. It sits on the row-control height, so it lines up with
 * the buttons and pickers beside it, and folds to its icon alone with
 * `iconOnly`. Pair it with CommandPalette: the trigger's `onClick` opens
 * the palette, and the palette owns the shortcut. `aria-keyshortcuts`
 * defaults to the shortcut it draws.
 *
 * Forwards a ref to the button and spreads unrecognised props onto it.
 */
export const CommandPaletteTrigger = React.forwardRef<HTMLButtonElement, CommandPaletteTriggerProps>(
  (
    {
      label = 'Search or ask anything',
      shortcut,
      keys = 'mod+k',
      keyLabels,
      icon = 'search',
      size = 'default',
      iconOnly = false,
      tooltip,
      tooltipPosition = 'bottom',
      glass = false,
      className = '',
      ...rest
    },
    ref,
  ) => {
    const baseClass = 'ds-command-palette-trigger';
    const classes = [
      baseClass,
      `${baseClass}--${size}`,
      iconOnly ? `${baseClass}--icon-only` : '',
      glass ? `${baseClass}--glass` : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');
    let announced: string;
    if (shortcut) {
      const keyNames = shortcut.map((key) => (key === '⌘' ? 'Meta' : key === 'Ctrl' ? 'Control' : key)).join('+');
      /* The palette answers to ⌘ K and Ctrl+K both, so a ⌘ shortcut announces its Ctrl twin too. */
      announced = keyNames.startsWith('Meta+') ? `${keyNames} ${keyNames.replace('Meta+', 'Control+')}` : keyNames;
    } else {
      /* Rendered on the server too, so it announces the shortcut on both
         platforms rather than guessing which one the reader is on. */
      announced = shortcutAriaAnyPlatform(keys) ?? '';
    }
    const control = (
      <button
        aria-label={label}
        aria-keyshortcuts={announced || undefined}
        {...rest}
        ref={ref}
        type="button"
        className={classes}
      >
        {typeof icon === 'string' ? (
          <span className={`${baseClass}__icon material-symbols-rounded ${mirrorClass(icon)}`} aria-hidden="true">
            {icon}
          </span>
        ) : (
          <span className={`${baseClass}__icon`} aria-hidden="true">
            {icon}
          </span>
        )}
        {!iconOnly && (
          <>
            <span className={`${baseClass}__label`} aria-hidden="true">
              {label}
            </span>
            {shortcut ? (
              shortcut.length > 0 && (
                <span className={`${baseClass}__keys`} aria-hidden="true">
                  {shortcut.map((key) => (
                    <Kbd key={key} size="compact">
                      {key}
                    </Kbd>
                  ))}
                </span>
              )
            ) : (
              keys && (
                <span className={`${baseClass}__keys`} aria-hidden="true">
                  <Kbd keys={keys} keyLabels={keyLabels} size="compact" aria-keyshortcuts={undefined} />
                </span>
              )
            )}
          </>
        )}
      </button>
    );
    // Self-labelling, as IconButton is: the folded form has no visible prompt.
    const tooltipContent = !iconOnly || tooltip === false ? null : (tooltip ?? label);
    if (!tooltipContent) return control;
    return (
      <Tooltip content={tooltipContent} position={tooltipPosition}>
        {control}
      </Tooltip>
    );
  },
);

CommandPaletteTrigger.displayName = 'CommandPaletteTrigger';
