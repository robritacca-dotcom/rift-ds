import React from 'react';
import { AiButton } from '../AiButton/AiButton';
import type { AgentStatusState } from '../AgentStatus/AgentStatusPatterns';
import { Button } from '../Button/Button';
import { CommandPaletteTrigger } from '../CommandPaletteTrigger/CommandPaletteTrigger';
import { DropdownMenu, type DropdownMenuEntry } from '../DropdownMenu/DropdownMenu';
import { IconButton } from '../IconButton/IconButton';
import { Popover } from '../Popover/Popover';
import type { Shortcut } from '../../behaviors/shortcut-keys';
import type { LinkComponent } from '../../behaviors/LinkProvider';
import './AppToolbar.css';

/** One of the bar's icon controls, drawn as a borderless IconButton. */
export interface AppToolbarAction {
  /** Stable id for the action. */
  id: string;
  /** Material Symbol name (string) or custom element. */
  icon: string | React.ReactNode;
  /** What the action does: the button's accessible name, its tooltip, and its row in the More menu. */
  label: string;
  /** Runs the action. */
  onSelect?: () => void;
  /**
   * Makes the control a link to this address instead, such as the settings
   * page. A link never folds into the More menu, since a menu row is not a
   * link.
   */
  href?: string;
  /**
   * A panel the button opens below it, such as a NotificationCenter. The
   * panel draws its own surface; the bar gives it the floating edge. An
   * action with a panel never folds into the More menu, since a menu row
   * cannot open one.
   */
  panel?: React.ReactNode;
  /** A count or dot on the button, such as unread notifications. */
  badge?: number | string | true;
}

/** The bar's one primary action: a primary Button with a leading icon, last in the row. */
export interface AppToolbarPrimaryAction {
  /** What the action does: the button's label, and its name when the bar folds it to its icon. */
  label: string;
  /** Material Symbol name (string) or custom element, leading the label. */
  icon: string | React.ReactNode;
  /** Runs the action. */
  onSelect?: () => void;
}

/** Props owned by AppToolbar itself — everything else falls through to the bar. */
type AppToolbarOwnProps = {
  /**
   * Opens the app's search, usually a CommandPalette. When given, the bar
   * starts with a search field, never narrower than a usable field, folded
   * to its icon when the bar is narrow.
   */
  onSearch?: React.MouseEventHandler<HTMLButtonElement>;
  /** The search field's prompt and accessible name. Default "Search or ask anything". */
  searchLabel?: string;
  /**
   * The shortcut the search field shows, in the shortcut grammar. The
   * palette owns the key itself; this only draws it.
   * @default 'mod+k'
   */
  searchKeys?: Shortcut;
  /**
   * The icon controls at the end, borderless: notifications, a calendar,
   * help, settings. On a narrow bar every one after the first moves into a
   * More menu, except those that open a panel or are links.
   */
  actions?: AppToolbarAction[];
  /**
   * Opens the app's AI chat. When given, an AiButton follows the icon
   * controls, folded to its icon when the bar is narrow.
   */
  onChat?: React.MouseEventHandler<HTMLButtonElement>;
  /** The AI chat button's label. Default "Ask AI". */
  chatLabel?: string;
  /**
   * What the agent behind the AI button is doing, in AgentStatus's
   * vocabulary, so the button can show it working.
   * @default 'idle'
   */
  chatState?: AgentStatusState;
  /** Whether the chat the AI button opens is open now, announced as the button's expanded state. */
  chatExpanded?: boolean;
  /**
   * The page's primary action, last in the row: a primary Button with a
   * leading icon, the AI button's size, folded to its icon when the bar is
   * narrow.
   */
  primaryAction?: AppToolbarPrimaryAction;
  /**
   * The size of every control in the bar, on the row-control scale:
   * `default` is 40px, `compact` 32px. The search, the icon controls, the
   * AI button and the primary action always share one height.
   * @default 'default'
   */
  size?: 'default' | 'compact';
  /**
   * The component the actions' links render with, such as Next.js's `Link`,
   * so they navigate through the app's router. Wins over a LinkProvider's;
   * a plain `<a>` when neither is set.
   */
  linkComponent?: LinkComponent;
  /** The bar's accessible name. Default "App toolbar". */
  toolbarLabel?: string;
  /** The More menu button's name, shown when the bar is narrow. Default "More". */
  moreLabel?: string;
  /** Additional CSS classes on the bar */
  className?: string;
};

export interface AppToolbarProps
  extends AppToolbarOwnProps,
    Omit<React.ComponentPropsWithRef<'div'>, keyof AppToolbarOwnProps> {}

/**
 * AppToolbar — the bar along the top of an app's page, always in one order:
 * the search at the start, then space, then the borderless icon controls,
 * the AI button and the primary action at the end. The account lives in the
 * app's rail, so the bar does not repeat it. It measures its own width and
 * folds in steps: the AI button and the primary action to their icons, then
 * the search, then the icon controls after the first into a More menu. Seat
 * it in AppLayout's `toolbar` slot to pin it over the page; it draws no
 * surface of its own.
 *
 * The ref and any unrecognised props reach the bar, a named group.
 */
export function AppToolbar({
  onSearch,
  searchLabel = 'Search or ask anything',
  searchKeys = 'mod+k',
  actions = [],
  onChat,
  chatLabel = 'Ask AI',
  chatState = 'idle',
  chatExpanded,
  primaryAction,
  size = 'default',
  linkComponent,
  toolbarLabel = 'App toolbar',
  moreLabel = 'More',
  className = '',
  ref,
  ...rest
}: AppToolbarProps) {
  const baseClass = 'ds-app-toolbar';

  // The ones that move into the More menu on a narrow bar: every one after
  // the first, except one that opens a panel or is a link, which a menu row
  // can be neither.
  const folds = (action: AppToolbarAction, index: number) => index > 0 && !action.panel && !action.href;
  const foldable = actions.filter(folds);
  const moreItems: DropdownMenuEntry[] = foldable.map((action) => ({
    id: action.id,
    label: action.label,
    icon: action.icon,
    onClick: action.onSelect,
  }));

  return (
    <div role="group" aria-label={toolbarLabel} {...rest} ref={ref} className={[baseClass, size !== 'default' ? `${baseClass}--${size}` : '', className].filter(Boolean).join(' ')}>
      <div className={`${baseClass}__start`}>
        {onSearch ? (
          <>
            {/* Each folding control comes in two forms, one shown at a time
                by the bar's own width; the hidden one is display: none, so
                it leaves the tab order and the accessibility tree. */}
            <span className={`${baseClass}__search`}>
              <CommandPaletteTrigger label={searchLabel} keys={searchKeys} size={size} onClick={onSearch} />
            </span>
            <span className={`${baseClass}__search-icon`}>
              <CommandPaletteTrigger label={searchLabel} keys={searchKeys} size={size} iconOnly onClick={onSearch} />
            </span>
          </>
        ) : null}
      </div>
      <div className={`${baseClass}__end`}>
        {actions.length > 0 ? (
          <div className={`${baseClass}__controls`}>
            {actions.map((action, index) => {
              const button = (
                <IconButton
                  icon={action.icon}
                  label={action.label}
                  variant="tertiary"
                  size={size}
                  badge={action.badge}
                  href={action.href}
                  linkComponent={linkComponent}
                  onClick={action.onSelect}
                />
              );
              return (
                <span
                  key={action.id}
                  className={folds(action, index) ? `${baseClass}__control ${baseClass}__control--foldable` : `${baseClass}__control`}
                >
                  {action.panel ? (
                    <Popover
                      className={`${baseClass}__panel-host`}
                      content={action.panel}
                      position="bottom"
                      align="end"
                      aria-label={action.label}
                    >
                      {button}
                    </Popover>
                  ) : (
                    button
                  )}
                </span>
              );
            })}
            {foldable.length > 0 ? (
              <span className={`${baseClass}__more`}>
                <DropdownMenu
                  align="end"
                  size={size}
                  items={moreItems}
                  trigger={<IconButton icon="more_horiz" label={moreLabel} variant="tertiary" size={size} />}
                />
              </span>
            ) : null}
          </div>
        ) : null}
        {onChat ? (
          <>
            <span className={`${baseClass}__wide`}>
              <AiButton label={chatLabel} size={size} state={chatState} aria-expanded={chatExpanded} onClick={onChat} />
            </span>
            <span className={`${baseClass}__narrow`}>
              <AiButton label={chatLabel} size={size} iconOnly state={chatState} aria-expanded={chatExpanded} onClick={onChat} />
            </span>
          </>
        ) : null}
        {primaryAction ? (
          <>
            <span className={`${baseClass}__wide`}>
              <Button
                variant="primary"
                size={size}
                label={primaryAction.label}
                iconLeft={primaryAction.icon}
                onClick={primaryAction.onSelect}
              />
            </span>
            <span className={`${baseClass}__narrow`}>
              {/* IconButton, not Button's iconOnly: the square box the icon
                  controls beside it are drawn in. */}
              <IconButton
                variant="primary"
                size={size}
                icon={primaryAction.icon}
                label={primaryAction.label}
                onClick={primaryAction.onSelect}
              />
            </span>
          </>
        ) : null}
      </div>
    </div>
  );
}
