'use client';

import React, { useState, useRef, useEffect, useMemo, useCallback, useId } from 'react';
import { CircularButton } from '../CircularButton/CircularButton';
import ReactDOM from 'react-dom';
import { Kbd } from '../Kbd/Kbd';
import './CommandPalette.css';
import '../../fonts/material-symbols.css';
import { useMounted } from '../../behaviors/useMounted';
import { useLayer } from '../../behaviors/useLayer';
import { useFocusScope } from '../../behaviors/useFocusScope';
import { useScrollLock } from '../../behaviors/useScrollLock';
import { useShortcut, type Shortcut, type ShortcutKeyLabels } from '../../behaviors/shortcuts';
import { mirrorClass } from '../../behaviors/direction';

export interface CommandPaletteCommand {
  /** Stable identifier */
  id: string;
  /** Display label — the primary text matched when filtering */
  label: string;
  /** Optional secondary line under the label */
  description?: string;
  /** Optional icon — Material Symbol name (string) or custom element (ReactNode) */
  icon?: string | React.ReactNode;
  /** Keyboard shortcut shown on the right as literal keycaps, e.g. ['⌘', 'P']. `keys` draws it for the visitor's platform instead. */
  shortcut?: string[];
  /** Keyboard shortcut shown on the right in the shortcut grammar (`mod+p`), drawn in the platform's legends: ⌘ P on a Mac, Ctrl P elsewhere. Display only: bind the action itself with `useShortcut`. Wins over `shortcut`. */
  keys?: Shortcut;
  /** Custom node at the row's right edge, after any `shortcut` — a badge or affordance the keycap slot can't express. It renders inside the option row, so keep it non-interactive: a focusable element here would nest controls. */
  trailing?: React.ReactNode;
  /** Extra terms that should match this command when filtering */
  keywords?: string[];
  /** Whether the command is disabled */
  disabled?: boolean;
  /** Marks a dangerous or irreversible command (delete, remove…): the row takes the danger colour, the same as a destructive DropdownMenu item */
  destructive?: boolean;
  /** Called when this command is chosen */
  onSelect?: () => void;
}

export interface CommandPaletteGroup {
  /** Group heading */
  label: string;
  /** Commands within the group */
  commands: CommandPaletteCommand[];
}

type CommandPaletteOwnProps = {
  /** Whether the palette is open */
  open: boolean;
  /** Callback when the palette requests to open or close */
  onOpenChange: (open: boolean) => void;
  /** Commands, grouped under headings */
  groups: CommandPaletteGroup[];
  /** Placeholder for the search field */
  placeholder?: string;
  /** Message shown when the query matches nothing */
  emptyMessage?: string;
  /** Show a loading affordance in place of results */
  loading?: boolean;
  /** Status text shown in place of results while `loading` is set. Defaults to "Loading…". */
  loadingMessage?: string;
  /**
   * Bind Cmd+K / Ctrl+K globally to toggle the palette. Set to false when the
   * host app owns the shortcut.
   */
  hotkey?: boolean;
  /**
   * The shortcuts that toggle the palette when `hotkey` is on, in the
   * shortcut grammar. Defaults to `['meta+k', 'ctrl+k']`, so both answer on
   * every platform. They go through the shared shortcut listener, so they
   * fire from a text field and over an open dialog.
   */
  hotkeyKeys?: Shortcut | Shortcut[];
  /** Replaces any legend a command's `keys` is drawn with, such as `{ ctrl: 'Strg' }` for a German keyboard. */
  keyLabels?: ShortcutKeyLabels;
  /**
   * Called with the chosen command, after its own `onSelect`. Replaces the
   * native `onSelect` (text-selection) handler on the panel.
   */
  onSelect?: (command: CommandPaletteCommand) => void;
  /** Called as the user types, for async/server-side search */
  onSearchChange?: (query: string) => void;
  /** Skip built-in filtering — use when commands are filtered upstream */
  manualFiltering?: boolean;
  /** Hide the hint row at the bottom of the panel */
  hideFooter?: boolean;
  /**
   * The words in the hint row, merged over the English defaults: the text
   * beside each key ("to navigate", "to select", "to close") and `escapeKey`,
   * the visible name on the Escape key cap ("esc").
   */
  hintLabels?: { navigate?: string; select?: string; close?: string; escapeKey?: string };
  /** Accessible name of the close button */
  closeLabel?: string;
  /** Additional CSS classes on the overlay container (the ref and native attributes go on the panel) */
  className?: string;
};

export interface CommandPaletteProps
  extends CommandPaletteOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof CommandPaletteOwnProps | 'children' | 'role'> {}

/** The palette's default toggle: ⌘K and Ctrl+K both, on every platform. */
const DEFAULT_HOTKEY_KEYS: Shortcut[] = ['meta+k', 'ctrl+k'];

/**
 * CommandPalette component — a modal Cmd+K launcher that searches a grouped
 * command list. Filtering matches labels, descriptions, and keywords; the
 * arrow keys move a highlight that stays in view, and Enter runs the command.
 */
export const CommandPalette = React.forwardRef<HTMLDivElement, CommandPaletteProps>(({
  open,
  onOpenChange,
  groups,
  placeholder = 'Type a command or search…',
  emptyMessage = 'No matching commands',
  loading = false,
  loadingMessage = 'Loading…',
  hotkey = true,
  hotkeyKeys = DEFAULT_HOTKEY_KEYS,
  keyLabels,
  onSelect,
  onSearchChange,
  manualFiltering = false,
  hideFooter = false,
  hintLabels,
  closeLabel = 'Close command palette',
  className = '',
  ...rest
}, ref) => {
  const hints = {
    navigate: hintLabels?.navigate ?? 'to navigate',
    select: hintLabels?.select ?? 'to select',
    close: hintLabels?.close ?? 'to close',
    escapeKey: hintLabels?.escapeKey ?? 'esc',
  };
  const [query, setQuery] = useState('');
  const [rawActiveIndex, setActiveIndex] = useState(0);
  const [prevOpen, setPrevOpen] = useState(open);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  // The focus scope needs the panel, and so does the consumer's ref.
  const setPanelRef = useCallback(
    (node: HTMLDivElement | null) => {
      panelRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    },
    [ref]
  );
  const listRef = useRef<HTMLDivElement>(null);
  const generatedId = useId();
  const baseClass = 'ds-command-palette';

  // SSR guard — only render the portal on the client
  const mounted = useMounted();

  const matches = useCallback(
    (command: CommandPaletteCommand) => {
      const q = query.trim().toLowerCase();
      if (manualFiltering || q === '') return true;
      const haystack = [command.label, command.description ?? '', ...(command.keywords ?? [])]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    },
    [manualFiltering, query]
  );

  const filteredGroups = useMemo(
    () =>
      groups
        .map((group) => ({ ...group, commands: group.commands.filter(matches) }))
        .filter((group) => group.commands.length > 0),
    [groups, matches]
  );

  // Flat, in-render-order list of the selectable (non-disabled) commands
  const flatCommands = useMemo(
    () => filteredGroups.flatMap((g) => g.commands).filter((c) => !c.disabled),
    [filteredGroups]
  );

  // Clear the query once the palette closes. Adjusting state during render is
  // React's supported pattern for reacting to a prop change — doing it in an
  // effect would queue an extra render pass.
  if (prevOpen !== open) {
    setPrevOpen(open);
    if (!open) {
      setQuery('');
      setActiveIndex(0);
    }
  }

  // Clamp rather than reset, so a shrinking result set (async results landing,
  // a group filtered out) can never leave the highlight past the end.
  const activeIndex = Math.min(rawActiveIndex, Math.max(0, flatCommands.length - 1));

  // Global Cmd+K / Ctrl+K toggle, through the shared shortcut listener.
  useShortcut(hotkeyKeys, () => onOpenChange(!open), {
    enabled: hotkey,
    global: true,
    allowInInput: true,
  });

  // Shared overlay behaviors (src/behaviors/) — see Dialog for the contract.
  // Initial focus goes straight to the search field. The scroll lock uses the
  // cancel-events strategy: hiding body overflow removes the document
  // scrollbar, and the rail blinking out reads as a jump on classic-scrollbar
  // platforms — so the page keeps its scrollbar and scroll *input* is
  // cancelled outside the command list instead. Dragging the scrollbar thumb
  // itself remains possible; the scrim makes that a deliberate act.
  const layer = useLayer({ open, onDismiss: () => onOpenChange(false) });
  useFocusScope(panelRef, { active: open, initialFocus: () => inputRef.current });
  useScrollLock(open, { strategy: 'cancel-events', allowWithin: listRef });

  const runCommand = (command: CommandPaletteCommand) => {
    if (command.disabled) return;
    command.onSelect?.();
    onSelect?.(command);
    onOpenChange(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((prev) =>
          flatCommands.length === 0 ? 0 : (prev + 1) % flatCommands.length
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((prev) =>
          flatCommands.length === 0 ? 0 : (prev - 1 + flatCommands.length) % flatCommands.length
        );
        break;
      case 'Home':
        e.preventDefault();
        setActiveIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setActiveIndex(Math.max(0, flatCommands.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (flatCommands[activeIndex]) runCommand(flatCommands[activeIndex]);
        break;
    }
  };

  // Keep the highlighted row in view
  useEffect(() => {
    if (!open || !listRef.current) return;
    const active = listRef.current.querySelector<HTMLElement>(
      `[data-command-index="${activeIndex}"]`
    );
    active?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, open]);

  const handleQueryChange = (next: string) => {
    setQuery(next);
    // A new query re-ranks the list, so highlight the top result again
    setActiveIndex(0);
    onSearchChange?.(next);
  };

  const listboxId = `${generatedId}-listbox`;
  const activeCommand = flatCommands[activeIndex];
  // While loading no command is rendered, so the input must not point at one.
  const activeDescendantId = activeCommand && !loading
    ? `${generatedId}-command-${activeCommand.id}`
    : undefined;

  const classes = [baseClass, open ? `${baseClass}--open` : '', className]
    .filter(Boolean)
    .join(' ');

  // Running index across groups so keyboard order matches visual order
  let commandIndex = 0;

  const palette = (
    <div className={classes}>
      {/* A press that began while another layer was on top was that layer's. */}
      <div
        className={`${baseClass}__backdrop`}
        onClick={() => {
          if (layer.ownsPress()) onOpenChange(false);
        }}
      />

      <div
        aria-label="Command palette"
        {...rest}
        className={`${baseClass}__panel`}
        ref={setPanelRef}
        role="dialog"
        aria-modal="true"
      >
        <div className={`${baseClass}__search`}>
          <span className={`${baseClass}__search-icon material-symbols-rounded`} aria-hidden="true">
            search
          </span>
          <input
            ref={inputRef}
            type="text"
            className={`${baseClass}__input`}
            role="combobox"
            autoComplete="off"
            aria-expanded
            aria-controls={listboxId}
            aria-autocomplete="list"
            aria-activedescendant={activeDescendantId}
            aria-label={placeholder}
            placeholder={placeholder}
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <CircularButton
            className={`${baseClass}__close`}
            icon="close"
            variant="tertiary"
            size="compact"
            tooltip={false}
            ariaLabel={closeLabel}
            onClick={() => onOpenChange(false)}
          />
        </div>

        {/* A listbox may hold only options and groups, so the container takes the
            role only while it shows commands; the loading and empty messages are
            status regions in the same box (axe: aria-required-children). */}
        <div
          className={`${baseClass}__list`}
          role={!loading && filteredGroups.length > 0 ? 'listbox' : undefined}
          id={listboxId}
          ref={listRef}
        >
          {loading && (
            <p className={`${baseClass}__status`} role="status">
              {loadingMessage}
            </p>
          )}

          {!loading && filteredGroups.length === 0 && (
            <p className={`${baseClass}__status`} role="status">
              {emptyMessage}
            </p>
          )}

          {!loading &&
            filteredGroups.map((group) => (
              <div
                key={group.label}
                className={`${baseClass}__group`}
                role="group"
                aria-label={group.label}
              >
                <p className={`${baseClass}__group-label`}>{group.label}</p>

                {group.commands.map((command) => {
                  // Disabled commands stay visible but are skipped by the highlight
                  const index = command.disabled ? -1 : commandIndex++;
                  const isActive = index === activeIndex;

                  return (
                    <div
                      key={command.id}
                      id={`${generatedId}-command-${command.id}`}
                      data-command-index={index}
                      className={[
                        `${baseClass}__command`,
                        isActive ? `${baseClass}__command--active` : '',
                        command.disabled ? `${baseClass}__command--disabled` : '',
                        command.destructive ? `${baseClass}__command--destructive` : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      role="option"
                      aria-selected={isActive}
                      aria-disabled={command.disabled}
                      onMouseEnter={() => index >= 0 && setActiveIndex(index)}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => runCommand(command)}
                    >
                      {command.icon && (
                        <span
                          className={`${baseClass}__command-icon${typeof command.icon === 'string' ? ` material-symbols-rounded ${mirrorClass(command.icon)}` : ''}`}
                          aria-hidden="true"
                        >
                          {command.icon}
                        </span>
                      )}

                      <span className={`${baseClass}__command-text`}>
                        <span className={`${baseClass}__command-label`}>{command.label}</span>
                        {command.description && (
                          <span className={`${baseClass}__command-description`}>
                            {command.description}
                          </span>
                        )}
                      </span>

                      {command.keys ? (
                        <span className={`${baseClass}__shortcut`}>
                          <Kbd keys={command.keys} keyLabels={keyLabels} size="compact" />
                        </span>
                      ) : command.shortcut && command.shortcut.length > 0 && (
                        <span className={`${baseClass}__shortcut`}>
                          {command.shortcut.map((key, i) => (
                            <Kbd key={i} size="compact">
                              {key}
                            </Kbd>
                          ))}
                        </span>
                      )}

                      {command.trailing && (
                        <span className={`${baseClass}__trailing`}>{command.trailing}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
        </div>

        {!hideFooter && (
          <div className={`${baseClass}__footer`}>
            <span className={`${baseClass}__hint`}>
              <Kbd size="compact">↑</Kbd>
              <Kbd size="compact">↓</Kbd>
              {hints.navigate}
            </span>
            <span className={`${baseClass}__hint`}>
              <Kbd size="compact">↵</Kbd>
              {hints.select}
            </span>
            <span className={`${baseClass}__hint`}>
              <Kbd size="compact">{hints.escapeKey}</Kbd>
              {hints.close}
            </span>
          </div>
        )}
      </div>
    </div>
  );

  if (!mounted) return null;
  return ReactDOM.createPortal(palette, document.body);
});

CommandPalette.displayName = 'CommandPalette';
