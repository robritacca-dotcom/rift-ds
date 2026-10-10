import React from 'react';
import { Avatar } from '../Avatar/Avatar';
import { DropdownMenu } from '../DropdownMenu/DropdownMenu';
import { Kbd } from '../Kbd/Kbd';
import { PixelAvatar, distinctPixelInks } from '../PixelAvatar/PixelAvatar';
import { StatusDot } from '../StatusDot/StatusDot';
import type { StatusDotProps } from '../StatusDot/StatusDot';
import './ThreadPanel.css';
import '../../fonts/material-symbols.css';

export interface ThreadPanelThreadAction {
  /** Stable identifier reported through `onThreadAction`. */
  id: string;
  /** Menu row text. */
  label: string;
  /** Leading icon on the menu row — Material Symbol name (string) or custom element (ReactNode). */
  icon?: string | React.ReactNode;
  /** Destructive styling (the error text colour) for delete-like actions. */
  destructive?: boolean;
}

/**
 * What a thread's leading dot reports. Fill says whether the thread wants
 * the reader, colour says what it wants, motion says it is live right now:
 * `idle` is a hollow neutral ring, `working` a pulsing neutral dot, and
 * `unread`, `waiting` and `error` solid dots in the info, warning and error
 * roles.
 */
export type ThreadPanelThreadStatus =
  | 'idle'
  | 'working'
  | 'unread'
  | 'waiting'
  | 'error';

export interface ThreadPanelThread {
  /** Stable identifier: `activeThreadId` matches against it and `onThreadSelect` reports it. */
  id: string;
  /** The thread's one-line title. Overflow fades out under a trailing mask rather than clipping; the full text stays readable in the row's native tooltip. */
  title: string;
  /** Optional href — the row renders as an `<a>` for real navigation instead of a `<button>`. */
  href?: string;
  /** Small trailing annotation in the caption face, e.g. a relative timestamp. */
  meta?: string;
  /** The title is still being generated: the row shows a shimmer bar in the title's place and hides its menu, keeping `title` (e.g. "New chat") as the accessible name. */
  pending?: boolean;
  /** This thread's own menu actions, overriding the panel-wide `threadActions`. */
  actions?: ThreadPanelThreadAction[];
  /** Quiet second line under the title in the caption face — a repo, an environment, a one-line summary. Overflows under the same trailing mask as the title. */
  description?: string;
  /** The thread's state, drawn as the dot leading the row: `idle` (nothing new, nothing running), `working` (an agent is running now), `unread` (finished, not yet seen), `waiting` (blocked on the reader) or `error` (stopped on a failure). Once any thread in the panel carries a status every row draws a dot, the rest reading `idle`, so the titles share one left edge. The dot is decorative; every state but `idle` is also read aloud through `statusLabels`. */
  status?: ThreadPanelThreadStatus;
  /** Legacy boolean for `status: 'unread'`, ignored when `status` is set. @deprecated Use `status: 'unread'` instead. */
  unread?: boolean;
  /** Trailing icon before the meta — Material Symbol name (string) or custom element (ReactNode), e.g. `cloud` for a session that lives remotely. */
  icon?: string | React.ReactNode;
  /** Marks the thread pinned with a trailing pin glyph. A marker only: the host groups pinned threads (typically a leading group) and offers pin/unpin through the row menu. */
  pinned?: boolean;
}

export interface ThreadPanelGroup {
  /** Group heading in the overline face, e.g. a project or repo name. Omit for an unlabelled run of threads. */
  label?: string;
  /** The group's threads, in display order. */
  threads: ThreadPanelThread[];
}

export interface ThreadPanelControl {
  /** Stable identifier reported through `onControlSelect`. */
  id: string;
  /** Leading icon on the row — Material Symbol name (string) or custom element (ReactNode). */
  icon: string | React.ReactNode;
  /** Row text. */
  label: string;
  /** Optional href — the row renders as an `<a>` instead of a `<button>`. */
  href?: string;
}

export interface ThreadPanelProject {
  /** Stable identifier: `activeProjectId` matches against it and `onProjectSelect` reports it. */
  id: string;
  /** The project's name. */
  label: string;
  /** Leading icon on the row — Material Symbol name (string) or custom element (ReactNode). Omit it and the row draws the project's generated PixelAvatar, which is the default mark. */
  icon?: string | React.ReactNode;
  /** Seed for the generated PixelAvatar a project wears when it has no `icon`. Defaults to `label`; pass a stable id so a renamed project keeps its character. The panel spreads the inks across its projects, so neighbours differ in colour as well as shape. */
  pixelAvatar?: string;
  /** Small trailing annotation in the caption face, e.g. how recently the project was touched. */
  meta?: string;
  /** Optional href — the row renders as an `<a>` instead of a `<button>`. */
  href?: string;
}

export interface ThreadPanelProfile {
  /** The signed-in person's display name; also seeds the Avatar's initials. */
  name: string;
  /** Quiet caption beside the name, e.g. the plan or workspace. */
  meta?: string;
  /** Replace the initials Avatar with a custom element, e.g. an `<Avatar src>`. */
  avatar?: React.ReactNode;
}

/** Props owned by ThreadPanel itself — everything else falls through to the root `<div>`. */
type ThreadPanelOwnProps = {
  /** The history, in display order. A flat list is one group with no label. */
  groups: ThreadPanelGroup[];
  /** Id of the thread on stage. Its row renders filled and carries `aria-current`. */
  activeThreadId?: string;
  /** Fires with the clicked thread's id. Rows with an `href` navigate as well. */
  onThreadSelect?: (id: string) => void;
  /** Shared menu actions for every thread row, behind a hover-revealed trailing trigger; a thread's own `actions` overrides the set. The menu renders only when `onThreadAction` is also given, and never on a `pending` row. */
  threadActions?: ThreadPanelThreadAction[];
  /** Fires with the thread's id and the chosen action's id. */
  onThreadAction?: (threadId: string, actionId: string) => void;
  /** Spoken text for each thread status, read after the row's title; the dot itself is decorative. Merged over the English defaults (Working, Unread, Needs input, Failed). `idle` is silent unless given a label here. */
  statusLabels?: Partial<Record<ThreadPanelThreadStatus, string>>;
  /** Accessible name for a row's menu trigger; the thread's title is appended after it. */
  threadMenuLabel?: string;
  /** Id of the thread being renamed: its row swaps to an inline text field, prefilled with the title and selected. The host owns the state, like everything else. */
  renamingThreadId?: string;
  /** Fires with the thread's id and the trimmed new title when a rename commits (Enter, or focus leaving the field). An empty or unchanged value fires `onRenameCancel` instead. */
  onThreadRename?: (threadId: string, title: string) => void;
  /** Fires when a rename ends without a change: Escape, an empty value, or an unchanged title. */
  onRenameCancel?: () => void;
  /** Accessible name for the inline rename field. */
  renameLabel?: string;
  /** Brand mark slot at the top, e.g. a logo `<img>`. While collapsed it doubles as the expand button, AppSidebar's contract. */
  logo?: React.ReactNode;
  /** Brand name beside the logo. The header row renders only when `logo`, `logoText`, or `onExpandedChange` is given. */
  logoText?: string;
  /** Text for the new-thread row. The row renders when this, `onNewThread`, or `newThreadHref` is given. */
  newThreadLabel?: string;
  /** Icon for the new-thread row — Material Symbol name (string) or custom element (ReactNode). Defaults to the pen-in-a-box `edit_square`, the same glyph chat headers use for New chat. */
  newThreadIcon?: string | React.ReactNode;
  /** Keyboard hint rendered as compact Kbds at the row's trailing edge, e.g. `["Ctrl", "N"]`. Decorative — the host owns the actual binding. */
  newThreadShortcut?: string[];
  /** Fires when the new-thread row is clicked. */
  onNewThread?: () => void;
  /** Optional href — the new-thread row renders as an `<a>`. */
  newThreadHref?: string;
  /** Standing rows between the new-thread action and the history, e.g. Automations or Settings. */
  controls?: ThreadPanelControl[];
  /** Fires with the clicked control's id. Rows with an `href` navigate as well. */
  onControlSelect?: (id: string) => void;
  /** Project rows between the standing controls and the history, under their own overline header. The section renders only when non-empty; collapsed, the rows fold to icon circles like the controls. */
  projects?: ThreadPanelProject[];
  /** The projects section's overline header text. */
  projectsLabel?: string;
  /** Id of the open project. Its row renders filled and carries `aria-current`. */
  activeProjectId?: string;
  /** Fires with the clicked project's id. Rows with an `href` navigate as well. */
  onProjectSelect?: (id: string) => void;
  /** Fires when the header's trailing new-project button is pressed. The button renders only when this is given. */
  onProjectCreate?: () => void;
  /** Accessible name for the new-project button. */
  newProjectLabel?: string;
  /** Text for the quiet trailing row that reveals older threads, e.g. "Show 20 more". Renders only when given. */
  moreLabel?: string;
  /** Fires when the more row is clicked. */
  onShowMore?: () => void;
  /** Accessible name for the scrollable history region. */
  historyLabel?: string;
  /** Whether the panel is expanded (280px, labels and history showing). Collapsed it is AppSidebar's 64px icon rail: circular icon rows, the history faded out, the avatar alone in the footer. */
  expanded?: boolean;
  /** Fires with the next state when the toggle (or, collapsed, the logo) is pressed. The toggle renders only when this is given; the panel is controlled, so the host owns the state. */
  onExpandedChange?: (expanded: boolean) => void;
  /** Accessible name for the header toggle while expanded. */
  collapseLabel?: string;
  /** Accessible name for the expand affordance while collapsed. */
  expandLabel?: string;
  /** The signed-in person, rendered as the footer's Avatar row. */
  profile?: ThreadPanelProfile;
  /** Rendered in the footer above the profile row — a theme toggle, a storage meter. Fades out while collapsed, AppSidebar's contract. */
  footerSlot?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
};

export interface ThreadPanelProps
  extends ThreadPanelOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof ThreadPanelOwnProps> {}

const baseClass = 'ds-thread-panel';

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
}: {
  className: string;
  href?: string;
  onClick?: () => void;
  ariaCurrent?: 'page' | 'true';
  title?: string;
  children: React.ReactNode;
}) {
  if (href) {
    return (
      <a
        className={className}
        href={href}
        onClick={onClick}
        aria-current={ariaCurrent === 'true' ? 'page' : ariaCurrent}
        title={title}
      >
        {children}
      </a>
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
 * ThreadPanel is the session-history rail of a chat or agent product: brand
 * header, a new-thread action with an optional shortcut hint, standing
 * control rows, an optional projects section with its own new-project
 * button, the grouped thread history (the one region that scrolls), and a
 * footer for the profile row and host furniture like a theme toggle.
 * Thread rows scale from a bare title to the full detail anatomy: a
 * leading status dot, a quiet description line, a trailing glyph, a pin marker,
 * and the meta caption.
 *
 * Fully controlled and stateless: the host owns the active thread, the
 * navigation, the expanded state, and what selecting a row means. Every
 * section is optional, so the panel scales from a bare thread list to the
 * full anatomy. Thread rows carry the lifecycle affordances of a real chat
 * history: a `pending` thread shows a shimmer in its title's place while
 * the host generates a name, `threadActions` puts a hover-revealed overflow
 * menu (DropdownMenu, compact) on every row for rename and delete, and
 * `renamingThreadId` swaps a row to an inline rename field — all still
 * controlled from outside. Expand and collapse follow AppSidebar's
 * choreography: the panel owns its width (280px expanded, a 64px icon rail
 * collapsed), the sweeping clip and the labels' opacity fades carry the
 * transition, rows collapse to circular icon buttons, and while collapsed
 * the logo doubles as the expand button. Carries no `'use client'`
 * directive — rendered without callbacks (href navigation only) it works
 * from a React Server Component; the menu and rename affordances need
 * callbacks, so they belong to client hosts by nature.
 *
 * Forwards a ref to the root `<div>` and spreads unrecognised props onto it.
 */
export const ThreadPanel = React.forwardRef<HTMLDivElement, ThreadPanelProps>(
  (
    {
      groups,
      activeThreadId,
      onThreadSelect,
      threadActions,
      onThreadAction,
      statusLabels,
      threadMenuLabel = 'Thread options',
      renamingThreadId,
      onThreadRename,
      onRenameCancel,
      renameLabel = 'Rename thread',
      logo,
      logoText,
      newThreadLabel,
      newThreadIcon = 'edit_square',
      newThreadShortcut,
      onNewThread,
      newThreadHref,
      controls,
      onControlSelect,
      projects,
      projectsLabel = 'Projects',
      activeProjectId,
      onProjectSelect,
      onProjectCreate,
      newProjectLabel = 'New project',
      moreLabel,
      onShowMore,
      historyLabel = 'Thread history',
      expanded = true,
      onExpandedChange,
      collapseLabel = 'Collapse the panel',
      expandLabel = 'Expand the panel',
      profile,
      footerSlot,
      className = '',
      ...rest
    },
    ref,
  ) => {
    /* The dot column is all or nothing: one thread with a status seats a
       dot on every row, so the titles keep a shared left edge. */
    const dotted = groups.some((group) =>
      group.threads.some((thread) => thread.status || thread.unread),
    );
    const labels = { ...DEFAULT_STATUS_LABELS, ...statusLabels };

    const classes = [
      baseClass,
      expanded && `${baseClass}--expanded`,
      dotted && `${baseClass}--dotted`,
      className,
    ]
      .filter(Boolean)
      .join(' ');
    const iconClass = 'material-symbols-rounded';
    /* One ink per project row, spread so neighbours differ. */
    const projectInks = distinctPixelInks(
      (projects ?? []).map((project) => project.pixelAvatar ?? project.label),
    );

    const showHeader = Boolean(logo || logoText || onExpandedChange);
    const showNew = Boolean(newThreadLabel || onNewThread || newThreadHref);
    const showFooter = Boolean(footerSlot || profile);

    /* Collapsed, the logo is the expand affordance (AppSidebar's pattern);
       the toggle carries it only while expanded, or always when there is
       no logo to hand the job to. */
    const logoExpands = Boolean(logo && !expanded && onExpandedChange);
    const toggle = onExpandedChange && (
      <button
        type="button"
        className={[
          `${baseClass}__toggle`,
          !logo && `${baseClass}__toggle--standalone`,
        ]
          .filter(Boolean)
          .join(' ')}
        aria-label={expanded ? collapseLabel : expandLabel}
        aria-expanded={expanded}
        onClick={() => onExpandedChange(!expanded)}
      >
        <span className={iconClass} aria-hidden="true">
          {expanded ? 'left_panel_close' : 'left_panel_open'}
        </span>
      </button>
    );

    /* Collapsed, the whole rail is an expand target: a click on its dead
       space opens it, while clicks on the rows keep their own jobs. Only
       attached when it can fire, so a callback-less render stays valid in
       a Server Component. */
    const expandOnClick =
      !expanded && onExpandedChange
        ? (e: React.MouseEvent<HTMLDivElement>) => {
            rest.onClick?.(e);
            const target = e.target as HTMLElement;
            if (target.closest("button, a, [role='button']")) return;
            onExpandedChange(true);
          }
        : undefined;

    return (
      <div
        {...rest}
        ref={ref}
        className={classes}
        onClick={expandOnClick ?? rest.onClick}
      >
        {showHeader && (
          <div
            className={[
              `${baseClass}__header`,
              !logo && `${baseClass}__header--bare`,
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <div
              className={`${baseClass}__header-inner`}
              onClick={logoExpands ? () => onExpandedChange?.(true) : undefined}
              role={logoExpands ? 'button' : undefined}
              tabIndex={logoExpands ? 0 : undefined}
              aria-label={logoExpands ? expandLabel : undefined}
              onKeyDown={
                logoExpands
                  ? (e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onExpandedChange?.(true);
                      }
                    }
                  : undefined
              }
            >
              {logo && (
                <span className={`${baseClass}__logo`} aria-hidden="true">
                  {logo}
                </span>
              )}
              {logoText && (
                <span className={`${baseClass}__brand`}>{logoText}</span>
              )}
            </div>
            {toggle}
          </div>
        )}

        {showNew && (
          <ActionRow
            className={`${baseClass}__new`}
            href={newThreadHref}
            onClick={onNewThread}
          >
            <span
              className={`${baseClass}__new-icon${typeof newThreadIcon === 'string' ? ` ${iconClass}` : ''}`}
              aria-hidden="true"
            >
              {newThreadIcon}
            </span>
            <span className={`${baseClass}__new-label`}>
              {newThreadLabel ?? 'New thread'}
            </span>
            {newThreadShortcut && newThreadShortcut.length > 0 && (
              <span className={`${baseClass}__new-kbd`} aria-hidden="true">
                {newThreadShortcut.map((key) => (
                  <Kbd key={key} size="compact">
                    {key}
                  </Kbd>
                ))}
              </span>
            )}
          </ActionRow>
        )}

        {controls && controls.length > 0 && (
          <div className={`${baseClass}__controls`}>
            {controls.map((control) => (
              <ActionRow
                key={control.id}
                className={`${baseClass}__control`}
                href={control.href}
                onClick={
                  onControlSelect
                    ? () => onControlSelect(control.id)
                    : undefined
                }
              >
                <span
                  className={`${baseClass}__control-icon${typeof control.icon === 'string' ? ` ${iconClass}` : ''}`}
                  aria-hidden="true"
                >
                  {control.icon}
                </span>
                <span className={`${baseClass}__control-label`}>
                  {control.label}
                </span>
              </ActionRow>
            ))}
          </div>
        )}

        {projects && projects.length > 0 && (
          <div className={`${baseClass}__projects`}>
            <div className={`${baseClass}__projects-header`}>
              <span className={`${baseClass}__projects-label`}>
                {projectsLabel}
              </span>
              {onProjectCreate && (
                <button
                  type="button"
                  className={`${baseClass}__projects-add`}
                  aria-label={newProjectLabel}
                  onClick={onProjectCreate}
                >
                  <span className={iconClass} aria-hidden="true">
                    add
                  </span>
                </button>
              )}
            </div>
            <ul className={`${baseClass}__list`} aria-label={projectsLabel}>
              {projects.map((project, projectIndex) => {
                const active = project.id === activeProjectId;
                return (
                  <li key={project.id} className={`${baseClass}__row`}>
                    <ActionRow
                      className={[
                        `${baseClass}__project`,
                        active && `${baseClass}__project--active`,
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      href={project.href}
                      onClick={
                        onProjectSelect
                          ? () => onProjectSelect(project.id)
                          : undefined
                      }
                      ariaCurrent={
                        active ? (project.href ? 'page' : 'true') : undefined
                      }
                      title={project.label}
                    >
                      {project.icon == null ? (
                        <span
                          className={`${baseClass}__project-icon ${baseClass}__project-icon--avatar`}
                          aria-hidden="true"
                        >
                          <PixelAvatar
                            name={project.pixelAvatar ?? project.label}
                            ink={projectInks[projectIndex]}
                          />
                        </span>
                      ) : (
                        <span
                          className={`${baseClass}__project-icon${typeof project.icon === 'string' ? ` ${iconClass}` : ''}`}
                          aria-hidden="true"
                        >
                          {project.icon}
                        </span>
                      )}
                      <span className={`${baseClass}__project-label`}>
                        {project.label}
                      </span>
                      {project.meta && (
                        <span className={`${baseClass}__meta`}>
                          {project.meta}
                        </span>
                      )}
                    </ActionRow>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <nav className={`${baseClass}__history`} aria-label={historyLabel}>
          {groups.map(
            (group, index) =>
              group.threads.length > 0 && (
                <div
                  key={group.label ?? index}
                  className={`${baseClass}__group`}
                >
                  {group.label && (
                    <span className={`${baseClass}__group-label`}>
                      {group.label}
                    </span>
                  )}
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
                                  <span className={`${baseClass}__status-label`}>
                                    {statusLabel}
                                  </span>
                                )}
                                {!thread.pending &&
                                  (thread.icon ||
                                    thread.pinned ||
                                    thread.meta) && (
                                    <span className={`${baseClass}__trail`}>
                                      {thread.icon && (
                                        <span
                                          className={`${baseClass}__thread-icon${typeof thread.icon === 'string' ? ` ${iconClass}` : ''}`}
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
                                      aria-label={`${threadMenuLabel}: ${thread.title}`}
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

        {showFooter && (
          <div className={`${baseClass}__footer`}>
            {footerSlot && (
              <div className={`${baseClass}__footer-slot`}>{footerSlot}</div>
            )}
            {profile && (
              <div
                className={`${baseClass}__profile`}
                title={expanded ? undefined : profile.name}
              >
                {profile.avatar ?? <Avatar name={profile.name} size="sm" />}
                <span className={`${baseClass}__profile-name`}>
                  {profile.name}
                </span>
                {profile.meta && (
                  <span className={`${baseClass}__profile-meta`}>
                    {profile.meta}
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  },
);

ThreadPanel.displayName = 'ThreadPanel';
