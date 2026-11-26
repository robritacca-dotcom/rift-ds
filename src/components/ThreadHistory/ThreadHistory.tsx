import React from 'react';
import type { LinkComponent } from '../../behaviors/LinkProvider';
import { DropdownMenu } from '../DropdownMenu/DropdownMenu';
import { StatusDot } from '../StatusDot/StatusDot';
import type { StatusDotProps } from '../StatusDot/StatusDot';
import type {
  ThreadPanelGroup,
  ThreadPanelThreadAction,
  ThreadPanelThreadStatus,
} from '../ThreadPanel/ThreadPanel';
import './ThreadHistory.css';
import '../../behaviors/direction.css';
import '../../behaviors/visually-hidden.css';
import '../../fonts/material-symbols.css';
import { mirrorClass } from '../../behaviors/direction';

/** Props owned by ThreadHistory itself — everything else falls through to the root `<nav>`. */
type ThreadHistoryOwnProps = {
  /** The history, in display order. A flat list is one group with no label. Each thread takes ThreadPanel's thread shape. */
  groups: ThreadPanelGroup[];
  /** Id of the thread on stage. Its row renders filled and carries `aria-current`. */
  activeThreadId?: string;
  /** Fires with the clicked thread's id. Rows with an `href` navigate as well. */
  onThreadSelect?: (id: string) => void;
  /** Shared menu actions for every thread row, behind a hover-revealed trailing trigger (always shown on a touch screen); a thread's own `actions` overrides the set. The menu renders only when `onThreadAction` is also given, and never on a `pending` row. */
  threadActions?: ThreadPanelThreadAction[];
  /** Fires with the thread's id and the chosen action's id. */
  onThreadAction?: (threadId: string, actionId: string) => void;
  /** Spoken text for each thread status, read after the row's title; the dot itself is decorative. Merged over the English defaults (Working, Unread, Needs input, Failed). `idle` is silent unless given a label here. */
  statusLabels?: Partial<Record<ThreadPanelThreadStatus, string>>;
  /** Spoken text for a `pinned` thread, read after the title and any status; the pin glyph itself is decorative. */
  pinnedLabel?: string;
  /**
   * Accessible name for a row's menu trigger. A string is followed by a colon
   * and the thread's title ("Thread options: Q3 plan"); a function is given
   * the title and returns the whole name, so a translation can put the title
   * where its grammar needs it.
   */
  threadMenuLabel?: string | ((title: string) => string);
  /** Id of the thread being renamed: its row swaps to an inline text field, prefilled with the title and selected. The host owns the state. */
  renamingThreadId?: string;
  /** Fires with the thread's id and the trimmed new title when a rename commits (Enter, or focus leaving the field). An empty or unchanged value fires `onRenameCancel` instead. */
  onThreadRename?: (threadId: string, title: string) => void;
  /** Fires when a rename ends without a change: Escape, an empty value, or an unchanged title. */
  onRenameCancel?: () => void;
  /** Accessible name for the inline rename field. */
  renameLabel?: string;
  /** Text for the quiet trailing row that reveals older threads, e.g. "Show 20 more". Renders only when given. */
  moreLabel?: string;
  /** Fires when the more row is clicked. */
  onShowMore?: () => void;
  /**
   * Let the reader fold each labelled group under its heading: the heading
   * becomes a toggle with a chevron, and the rows glide shut beneath it.
   * @default false
   */
  collapsibleSections?: boolean;
  /** The folded groups, by label. Controlled: pair it with `onCollapsedSectionsChange`. Needs `collapsibleSections`. */
  collapsedSections?: string[];
  /** Fires with the full new list of folded groups when a heading is pressed. */
  onCollapsedSectionsChange?: (collapsedSections: string[]) => void;
  /** Additional CSS classes */
  className?: string;
  /**
   * The component its links render with, such as Next.js's `Link`, so they
   * navigate through the app's router; a plain `<a>` when unset. This
   * component can render on the server, so it never reads a LinkProvider:
   * pass the prop even under one.
   */
  linkComponent?: LinkComponent;
};

export interface ThreadHistoryProps
  extends ThreadHistoryOwnProps,
    Omit<React.ComponentPropsWithRef<'nav'>, keyof ThreadHistoryOwnProps> {}

const baseClass = 'ds-thread-history';

/** How each thread status draws its StatusDot: fill for "wants you",
    colour for what it wants, the pulse for live. */
const STATUS_DOTS: Record<
  ThreadPanelThreadStatus,
  Pick<StatusDotProps, 'variant' | 'outline' | 'pulse'>
> = {
  idle: { variant: 'neutral', outline: true },
  working: { variant: 'neutral', pulse: true },
  unread: { variant: 'info' },
  waiting: { variant: 'warning' },
  error: { variant: 'error' },
};

const DEFAULT_STATUS_LABELS: Partial<Record<ThreadPanelThreadStatus, string>> =
  {
    working: 'Working',
    unread: 'Unread',
    waiting: 'Needs input',
    error: 'Failed',
  };

/** A row that is a `<button>`, or an `<a>` when an href is supplied (Button's pattern). */
function ActionRow({
  className,
  href,
  onClick,
  ariaCurrent,
  title,
  children,
  link: Link,
}: {
  className: string;
  href?: string;
  onClick?: () => void;
  ariaCurrent?: 'page' | 'true';
  title?: string;
  children: React.ReactNode;
  link: LinkComponent;
}) {
  if (href) {
    return (
      <Link
        className={className}
        href={href}
        onClick={onClick}
        aria-current={ariaCurrent === 'true' ? 'page' : ariaCurrent}
        title={title}
      >
        {children}
      </Link>
    );
  }
  return (
    <button
      type="button"
      className={className}
      onClick={onClick}
      aria-current={ariaCurrent}
      title={title}
    >
      {children}
    </button>
  );
}

/** The inline rename field. Uncontrolled: Enter commits, Escape cancels,
    and focus leaving the field commits too — an empty or unchanged value
    cancels instead, since half a title is not a title. The keyboard paths
    hand focus back to the row once the host swaps it in; a blur commit
    leaves focus where the user sent it. Hook-free on purpose, so the
    module stays renderable from a Server Component (the field itself only
    renders when the host wires the rename callbacks, which already means
    a client host). */
function RenameField({
  baseClass,
  defaultValue,
  label,
  onSubmit,
  onCancel,
}: {
  baseClass: string;
  defaultValue: string;
  label: string;
  onSubmit: (value: string) => void;
  onCancel?: () => void;
}) {
  const commit = (el: HTMLInputElement) => {
    const value = el.value.trim();
    if (value && value !== defaultValue) onSubmit(value);
    else onCancel?.();
  };
  /* The row's button mounts only after the host clears the rename state,
     so the hand-back polls a few frames for the swap to land — one frame
     is a race against the host's re-render. */
  const refocusRow = (el: HTMLInputElement) => {
    const row = el.closest('li');
    const tryFocus = (attempt: number) => {
      const target = row?.querySelector<HTMLElement>('button, a');
      if (target) target.focus();
      else if (attempt < 3) requestAnimationFrame(() => tryFocus(attempt + 1));
    };
    requestAnimationFrame(() => tryFocus(0));
  };
  return (
    <input
      className={`${baseClass}__rename`}
      type="text"
      defaultValue={defaultValue}
      aria-label={label}
      ref={(el) => {
        /* Focus and select once on mount; the activeElement guard keeps a
           parent re-render from re-selecting mid-typing. */
        if (el && document.activeElement !== el) {
          el.focus();
          el.select();
        }
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          e.stopPropagation();
          refocusRow(e.currentTarget);
          commit(e.currentTarget);
        } else if (e.key === 'Escape') {
          /* Stop here so a host dialog (the chat sheet) doesn't close on
             the same keystroke. */
          e.stopPropagation();
          refocusRow(e.currentTarget);
          onCancel?.();
        }
      }}
      onBlur={(e) => commit(e.currentTarget)}
    />
  );
}

/**
 * ThreadHistory is a chat's thread history: labelled groups of thread rows
 * and an optional row that reveals more. ThreadPanel seats it in its rail,
 * and an AppSidebar section seats it through `content`, so a chat built on
 * the app rail draws the same rows. A row scales from a bare title to the
 * full anatomy: a leading status dot (all rows or none, so titles share an
 * edge), a quiet description line, a trailing glyph, a pin marker and the
 * meta caption, a hover-revealed overflow menu (always shown on a touch
 * screen), a shimmer while a `pending` thread is named, and an inline
 * rename field.
 *
 * Fully controlled and stateless: the host owns the active thread, the
 * rename state and the folded groups. Carries no `'use client'` directive,
 * so rendered with links alone it works from a React Server Component; the
 * menu and the rename take callbacks, so they belong to client hosts.
 *
 * The root is a `<nav>` named "Thread history" by default; pass
 * `aria-label` to name it differently. The ref and unrecognised props
 * reach it.
 */
export function ThreadHistory({
  groups,
  activeThreadId,
  onThreadSelect,
  threadActions,
  onThreadAction,
  statusLabels,
  pinnedLabel = 'Pinned',
  threadMenuLabel = 'Thread options',
  renamingThreadId,
  onThreadRename,
  onRenameCancel,
  renameLabel = 'Rename thread',
  moreLabel,
  onShowMore,
  collapsibleSections = false,
  collapsedSections = [],
  onCollapsedSectionsChange,
  className = '',
  linkComponent,
  ref,
  ...rest
}: ThreadHistoryProps) {
  /* The dot column is all or nothing: one thread with a status seats a
     dot on every row, so the titles keep a shared left edge. */
  const dotted = groups.some((group) =>
    group.threads.some((thread) => thread.status || thread.unread),
  );
  const labels = { ...DEFAULT_STATUS_LABELS, ...statusLabels };
  const Link = linkComponent ?? 'a';
  const iconClass = 'material-symbols-rounded';
    /* Groups fold only when asked, under their headings. */
    const folds = collapsibleSections;
    const isFolded = (heading: string) => folds && collapsedSections.includes(heading);
    const toggleSection = (heading: string) =>
      onCollapsedSectionsChange?.(
        collapsedSections.includes(heading)
          ? collapsedSections.filter((entry) => entry !== heading)
          : [...collapsedSections, heading],
      );
    /* A section's heading: the plain label, or with `collapsibleSections`
       the same label as a toggle with a chevron. */
    const heading = (text: string, className: string) => (
      <div className={`${baseClass}__section-head`}>
        <span className={className}>{text}</span>
        {/* The fold is the chevron alone, named by the heading's own text,
            so the heading keeps its seat on the icon line and only the
            chevron answers the pointer. */}
        {folds && (
          <button
            type="button"
            className={`${baseClass}__fold`}
            aria-label={text}
            aria-expanded={!isFolded(text)}
            onClick={() => toggleSection(text)}
          >
            <span className={`${iconClass} ${baseClass}__fold-chevron`} aria-hidden="true">
              expand_more
            </span>
          </button>
        )}
      </div>
    );
    /* The rows under a heading, in a panel that glides shut when it folds
       (SideNav's grid-rows fold); open, it adds nothing. */
    const panel = (text: string | undefined, list: React.ReactNode) => {
      const shut = Boolean(text && isFolded(text));
      return (
        <div
          className={`${baseClass}__section-panel${shut ? '' : ` ${baseClass}__section-panel--open`}`}
          inert={shut}
        >
          {list}
        </div>
      );
    };

  return (
    <nav
      aria-label="Thread history"
      {...rest}
      ref={ref}
      className={[baseClass, dotted && `${baseClass}--dotted`, collapsibleSections && `${baseClass}--collapsible-sections`, className]
        .filter(Boolean)
        .join(' ')}
    >
          {groups.map(
            (group, index) =>
              group.threads.length > 0 && (
                <div
                  key={group.label ?? index}
                  className={`${baseClass}__group`}
                >
                  {group.label && heading(group.label, `${baseClass}__group-label`)}
                  {panel(group.label, (
                  <ul
                    className={`${baseClass}__list`}
                    aria-label={group.label}
                  >
                    {group.threads.map((thread) => {
                      const active = thread.id === activeThreadId;
                      const actions = thread.actions ?? threadActions;
                      const showMenu = Boolean(
                        actions &&
                          actions.length > 0 &&
                          onThreadAction &&
                          !thread.pending,
                      );
                      /* A thread still being named is, by definition,
                         mid-run. */
                      const status: ThreadPanelThreadStatus | undefined =
                        dotted
                          ? thread.pending
                            ? 'working'
                            : (thread.status ??
                              (thread.unread ? 'unread' : 'idle'))
                          : undefined;
                      const statusLabel =
                        status && !thread.pending ? labels[status] : undefined;
                      const renaming = Boolean(
                        thread.id === renamingThreadId && onThreadRename,
                      );
                      return (
                        <li
                          key={thread.id}
                          className={[
                            `${baseClass}__row`,
                            showMenu && `${baseClass}__row--with-menu`,
                          ]
                            .filter(Boolean)
                            .join(' ')}
                        >
                          {renaming ? (
                            <RenameField
                              baseClass={baseClass}
                              defaultValue={thread.title}
                              label={renameLabel}
                              onSubmit={(value) =>
                                onThreadRename?.(thread.id, value)
                              }
                              onCancel={onRenameCancel}
                            />
                          ) : (
                            <>
                              <ActionRow
                                link={Link}
                                className={[
                                  `${baseClass}__thread`,
                                  active && `${baseClass}__thread--active`,
                                  thread.description &&
                                    !thread.pending &&
                                    `${baseClass}__thread--detailed`,
                                ]
                                  .filter(Boolean)
                                  .join(' ')}
                                href={thread.href}
                                onClick={
                                  onThreadSelect
                                    ? () => onThreadSelect(thread.id)
                                    : undefined
                                }
                                ariaCurrent={
                                  active
                                    ? thread.href
                                      ? 'page'
                                      : 'true'
                                    : undefined
                                }
                                title={thread.title}
                              >
                                {status && (
                                  <StatusDot
                                    className={`${baseClass}__status`}
                                    size="xs"
                                    decorative
                                    {...STATUS_DOTS[status]}
                                  />
                                )}
                                {thread.pending ? (
                                  /* The naming state: the shimmer holds the
                                     title's place; the row's accessible name
                                     comes from its tooltip. */
                                  <span
                                    className={`${baseClass}__title ${baseClass}__title--pending`}
                                  >
                                    <span
                                      className={`${baseClass}__title-shimmer`}
                                      aria-hidden="true"
                                    />
                                  </span>
                                ) : (
                                  <span className={`${baseClass}__title`}>
                                    {thread.title}
                                  </span>
                                )}
                                {statusLabel && (
                                  <span className="ds-visually-hidden">
                                    {statusLabel}
                                  </span>
                                )}
                                {/* The pin glyph below is decorative, so its
                                    meaning rides in the row's text, the
                                    status label's manner. */}
                                {thread.pinned && !thread.pending && (
                                  <span className="ds-visually-hidden">
                                    {pinnedLabel}
                                  </span>
                                )}
                                {!thread.pending &&
                                  (thread.icon ||
                                    thread.pinned ||
                                    thread.meta) && (
                                    <span className={`${baseClass}__trail`}>
                                      {thread.icon && (
                                        <span
                                          className={`${baseClass}__thread-icon${typeof thread.icon === 'string' ? ` ${iconClass} ${mirrorClass(thread.icon)}` : ''}`}
                                          aria-hidden="true"
                                        >
                                          {thread.icon}
                                        </span>
                                      )}
                                      {thread.pinned && (
                                        <span
                                          className={`${baseClass}__pin ${iconClass}`}
                                          aria-hidden="true"
                                        >
                                          keep
                                        </span>
                                      )}
                                      {thread.meta && (
                                        <span className={`${baseClass}__meta`}>
                                          {thread.meta}
                                        </span>
                                      )}
                                    </span>
                                  )}
                                {thread.description && !thread.pending && (
                                  <span
                                    className={`${baseClass}__description`}
                                  >
                                    {thread.description}
                                  </span>
                                )}
                              </ActionRow>
                              {showMenu && actions && (
                                <DropdownMenu
                                  className={`${baseClass}__menu`}
                                  align="end"
                                  size="compact"
                                  items={actions.map((action) => ({
                                    label: action.label,
                                    icon: action.icon,
                                    destructive: action.destructive,
                                    onClick: () =>
                                      onThreadAction?.(thread.id, action.id),
                                  }))}
                                  trigger={
                                    <button
                                      type="button"
                                      className={`${baseClass}__menu-trigger`}
                                      aria-label={
                                        typeof threadMenuLabel === 'function'
                                          ? threadMenuLabel(thread.title)
                                          : `${threadMenuLabel}: ${thread.title}`
                                      }
                                    >
                                      <span
                                        className={iconClass}
                                        aria-hidden="true"
                                      >
                                        more_horiz
                                      </span>
                                    </button>
                                  }
                                />
                              )}
                            </>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                  ))}
                </div>
              ),
          )}
          {moreLabel && (
            <button
              type="button"
              className={`${baseClass}__more`}
              onClick={onShowMore}
            >
              {moreLabel}
            </button>
          )}
    </nav>
  );
}
