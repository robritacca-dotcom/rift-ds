'use client';

import React from 'react';
import './ThreadTabs.css';
import '../../fonts/material-symbols.css';

export interface ThreadTab {
  /** Stable identifier: `activeId` matches against it and the callbacks report it. */
  id: string;
  /** The tab's one-line label. Overflow fades out under a trailing mask rather than clipping; the full text stays readable in the tab's native tooltip. */
  label: string;
  /** Material Symbol name for the tab's leading icon. */
  icon?: string;
  /** The thread holds unseen activity: a small status dot leads the label. The dot is decorative — keep the state readable elsewhere when it must be announced. */
  unread?: boolean;
}

/** Props owned by ThreadTabs itself — everything else falls through to the root `<div>`. */
type ThreadTabsOwnProps = {
  /** The open tabs, in display order. A tab added between renders glides open in place; a removed one folds away while its neighbours slide over. */
  tabs: ThreadTab[];
  /** Id of the tab on stage. Its pill renders filled and carries `aria-current`. */
  activeId?: string;
  /** Fires with the clicked tab's id. */
  onTabSelect?: (id: string) => void;
  /** Fires with the tab's id when its close button is pressed, or Delete lands on the focused tab. The close affordance renders only when this is given. */
  onTabClose?: (id: string) => void;
  /** Accessible name for a tab's close button; the tab's label is appended after it. */
  closeLabel?: string;
  /** Fires when the trailing new-tab button is pressed. The button renders only when this is given. */
  onAdd?: () => void;
  /** Accessible name for the new-tab button. */
  addLabel?: string;
  /** Accessible name for the tab strip. */
  ariaLabel?: string;
  /** Additional CSS classes */
  className?: string;
};

export interface ThreadTabsProps
  extends ThreadTabsOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof ThreadTabsOwnProps> {}

const baseClass = 'ds-thread-tabs';

/** A closed tab held on stage while its exit plays, remembering which
    neighbour it stood after so it folds away in place. */
type LeavingTab = { tab: ThreadTab; afterId: string | null };

/**
 * ThreadTabs is the strip of open chat sessions across a conversation's top
 * edge: pill tabs with a leading glyph, an unread dot, a hover-revealed
 * close button, and a trailing new-tab action. Fully controlled — the host
 * owns which tabs exist and which is active; the strip owns the
 * choreography of a tab arriving and leaving. A removed tab is kept on
 * stage just long enough to fold away (its neighbours slide over as its
 * column collapses), and a new one glides open in place — no measurement,
 * just the grid-track idiom turned sideways.
 *
 * Tabs are a labelled list of buttons, not an ARIA tablist: like
 * ThreadPanel's rows they select sessions rather than switch local panels,
 * and the active tab announces itself with `aria-current`. Arrow keys,
 * Home and End move focus along the strip; Delete closes the focused tab
 * when the host wires `onTabClose`.
 *
 * Forwards a ref to the root `<div>` and spreads unrecognised props onto it.
 */
export const ThreadTabs = React.forwardRef<HTMLDivElement, ThreadTabsProps>(
  (
    {
      tabs,
      activeId,
      onTabSelect,
      onTabClose,
      closeLabel = 'Close thread',
      onAdd,
      addLabel = 'New thread',
      ariaLabel = 'Open threads',
      className = '',
      ...rest
    },
    ref,
  ) => {
    const iconClass = 'material-symbols-rounded';
    const listRef = React.useRef<HTMLUListElement | null>(null);

    /* Tabs that have finished (or skipped) their entrance. Seeded with the
       initial set so the first paint is calm — only tabs that arrive later
       animate in. A ref, not state: the entering class simply stays on
       through the animation and any re-render mid-flight, and the finished
       animation never re-runs. */
    const enteredRef = React.useRef<Set<string>>(
      new Set(tabs.map((tab) => tab.id)),
    );

    /* Exit choreography: when a tab disappears from props it moves to the
       leaving list (derived during render, so it never skips a frame) and
       stays on stage until its fold-away animation ends. A tab re-added
       mid-exit simply returns to the live list. */
    const [prevTabs, setPrevTabs] = React.useState(tabs);
    const [leaving, setLeaving] = React.useState<LeavingTab[]>([]);
    if (prevTabs !== tabs) {
      setPrevTabs(tabs);
      const nextIds = new Set(tabs.map((tab) => tab.id));
      const removed = prevTabs.filter((tab) => !nextIds.has(tab.id));
      setLeaving((current) => {
        const kept = current.filter((l) => !nextIds.has(l.tab.id));
        const added = removed.map((tab) => {
          const index = prevTabs.findIndex((p) => p.id === tab.id);
          return {
            tab,
            afterId: index > 0 ? prevTabs[index - 1].id : null,
          };
        });
        return added.length > 0 || kept.length !== current.length
          ? [...kept, ...added]
          : current;
      });
    }

    /* The render order: the live tabs, with each leaving tab spliced back
       after the neighbour it stood behind, so it folds away in place. */
    const entries = React.useMemo(() => {
      const list = tabs.map((tab) => ({ tab, leaving: false }));
      for (const l of leaving) {
        const index =
          l.afterId == null
            ? 0
            : list.findIndex((entry) => entry.tab.id === l.afterId) + 1;
        list.splice(index < 0 ? list.length : index, 0, {
          tab: l.tab,
          leaving: true,
        });
      }
      return list;
    }, [tabs, leaving]);

    const liveTriggers = () =>
      Array.from(
        listRef.current?.querySelectorAll<HTMLElement>(
          `.${baseClass}__item:not(.${baseClass}__item--leaving) .${baseClass}__trigger`,
        ) ?? [],
      );

    const moveFocus = (from: HTMLElement, key: string) => {
      const triggers = liveTriggers();
      const index = triggers.indexOf(from);
      if (index < 0 || triggers.length === 0) return;
      let target: HTMLElement | undefined;
      if (key === 'ArrowRight') {
        target = triggers[(index + 1) % triggers.length];
      } else if (key === 'ArrowLeft') {
        target = triggers[(index - 1 + triggers.length) % triggers.length];
      } else if (key === 'Home') {
        target = triggers[0];
      } else if (key === 'End') {
        target = triggers[triggers.length - 1];
      }
      target?.focus();
    };

    /* Closing hands focus to a neighbour before the tab leaves, but only
       when focus was inside the closing tab — a pointer close elsewhere
       keeps the user's focus where they put it. */
    const closeTab = (id: string, from: HTMLElement) => {
      const item = from.closest(`.${baseClass}__item`);
      if (item && item.contains(document.activeElement)) {
        const items = Array.from(
          listRef.current?.querySelectorAll<HTMLElement>(
            `.${baseClass}__item:not(.${baseClass}__item--leaving)`,
          ) ?? [],
        );
        const index = items.indexOf(item as HTMLElement);
        const neighbour = items[index + 1] ?? items[index - 1];
        neighbour
          ?.querySelector<HTMLElement>(`.${baseClass}__trigger`)
          ?.focus();
      }
      onTabClose?.(id);
    };

    const classes = [baseClass, className].filter(Boolean).join(' ');

    return (
      <div {...rest} ref={ref} className={classes}>
        <ul className={`${baseClass}__list`} aria-label={ariaLabel} ref={listRef}>
          {entries.map(({ tab, leaving: isLeaving }) => {
            const active = !isLeaving && tab.id === activeId;
            const entering =
              !isLeaving && !enteredRef.current.has(tab.id);
            return (
              <li
                key={tab.id}
                className={[
                  `${baseClass}__item`,
                  entering && `${baseClass}__item--entering`,
                  isLeaving && `${baseClass}__item--leaving`,
                ]
                  .filter(Boolean)
                  .join(' ')}
                onAnimationEnd={(e) => {
                  if (e.target !== e.currentTarget) return;
                  if (e.animationName === 'ds-thread-tabs-in') {
                    enteredRef.current.add(tab.id);
                  } else if (e.animationName === 'ds-thread-tabs-out') {
                    enteredRef.current.delete(tab.id);
                    setLeaving((current) =>
                      current.filter((l) => l.tab.id !== tab.id),
                    );
                  }
                }}
              >
                <div className={`${baseClass}__cell`}>
                  <div
                    className={[
                      `${baseClass}__tab`,
                      active && `${baseClass}__tab--active`,
                      onTabClose && `${baseClass}__tab--closable`,
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <button
                      type="button"
                      className={`${baseClass}__trigger`}
                      title={tab.label}
                      aria-current={active ? 'true' : undefined}
                      tabIndex={isLeaving ? -1 : 0}
                      onClick={
                        onTabSelect && !isLeaving
                          ? () => onTabSelect(tab.id)
                          : undefined
                      }
                      onKeyDown={(e) => {
                        if (
                          e.key === 'ArrowRight' ||
                          e.key === 'ArrowLeft' ||
                          e.key === 'Home' ||
                          e.key === 'End'
                        ) {
                          e.preventDefault();
                          moveFocus(e.currentTarget, e.key);
                        } else if (e.key === 'Delete' && onTabClose) {
                          e.preventDefault();
                          closeTab(tab.id, e.currentTarget);
                        }
                      }}
                    >
                      {tab.unread && (
                        <span
                          className={`${baseClass}__unread`}
                          aria-hidden="true"
                        />
                      )}
                      {tab.icon && (
                        <span
                          className={`${baseClass}__icon ${iconClass}`}
                          aria-hidden="true"
                        >
                          {tab.icon}
                        </span>
                      )}
                      <span className={`${baseClass}__label`}>{tab.label}</span>
                    </button>
                    {onTabClose && (
                      <button
                        type="button"
                        className={`${baseClass}__close`}
                        aria-label={`${closeLabel}: ${tab.label}`}
                        tabIndex={isLeaving ? -1 : 0}
                        onClick={(e) => closeTab(tab.id, e.currentTarget)}
                      >
                        <span className={iconClass} aria-hidden="true">
                          close
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        {onAdd && (
          <button
            type="button"
            className={`${baseClass}__add`}
            aria-label={addLabel}
            onClick={onAdd}
          >
            <span className={iconClass} aria-hidden="true">
              add
            </span>
          </button>
        )}
      </div>
    );
  },
);

ThreadTabs.displayName = 'ThreadTabs';
