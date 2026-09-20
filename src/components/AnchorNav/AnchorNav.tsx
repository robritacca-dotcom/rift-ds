'use client';

import React, { useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import './AnchorNav.css';

export interface AnchorNavItem {
  /** The id of the element the item jumps to (rendered as `href="#id"`) */
  id: string;
  /** Link text */
  label: string;
}

type AnchorNavOwnProps = {
  /** The on-page sections to list, in document order */
  items: AnchorNavItem[];
  /** Visual form: `list` renders the inline "On this page" rail; `floating` collapses to a stack of short lines that expands into a panel on hover, keyboard focus, or tap, so it can ride a page edge without taking column width */
  variant?: 'list' | 'floating';
  /** Header text above the list; pass an empty string to render no header */
  title?: string;
  /** Material Symbols icon name beside the header; pass an empty string for none */
  icon?: string;
  /** Controlled active item id — set it to drive the highlight yourself and skip scroll tracking */
  activeId?: string;
  /** Fires when the tracked (or clicked) active item changes */
  onActiveChange?: (id: string) => void;
  /** Distance in px from the viewport top at which a section counts as current, e.g. a sticky header's height */
  offset?: number;
};

export interface AnchorNavProps
  extends AnchorNavOwnProps,
    Omit<React.ComponentPropsWithoutRef<'nav'>, keyof AnchorNavOwnProps> {}

/**
 * An "On this page" list of anchor links that tracks the reader's position.
 *
 * Uncontrolled by default: a scroll listener marks the last section whose top
 * has passed `offset` as current. Pass `activeId` to control the highlight
 * instead (no listener is attached). The active link carries
 * `aria-current="location"`.
 *
 * The `floating` variant collapses the list to a minimap of short lines and
 * expands the full panel on hover or keyboard focus (the links stay focusable
 * while collapsed, so tabbing in opens it). A tap opens it where hover
 * doesn't exist; Escape or a click elsewhere closes it again.
 */
export const AnchorNav = React.forwardRef<HTMLElement, AnchorNavProps>(
  (
    {
      items,
      variant = 'list',
      title = 'On this page',
      icon = 'toc',
      activeId,
      onActiveChange,
      offset = 96,
      className,
      onKeyDown,
      ...rest
    },
    ref
  ) => {
    const navRef = useRef<HTMLElement>(null);
    useImperativeHandle(ref, () => navRef.current as HTMLElement);

    const floating = variant === 'floating';
    const [open, setOpen] = useState(false);

    const isControlled = activeId !== undefined;
    const [trackedId, setTrackedId] = useState<string | undefined>(undefined);
    const currentId = isControlled ? activeId : trackedId;

    const onActiveChangeRef = useRef(onActiveChange);
    onActiveChangeRef.current = onActiveChange;

    const setActive = useCallback(
      (id: string | undefined) => {
        setTrackedId((prev) => {
          if (id !== undefined && id !== prev) onActiveChangeRef.current?.(id);
          return id;
        });
      },
      []
    );

    // Scroll tracking: the current section is the last one whose top sits at
    // or above `offset`; before the first section, the first item is current.
    useEffect(() => {
      if (isControlled || items.length === 0) return;
      let frame = 0;
      const measure = () => {
        frame = 0;
        let current = items[0]?.id;
        for (const item of items) {
          const el = document.getElementById(item.id);
          if (!el) continue;
          if (el.getBoundingClientRect().top <= offset + 1) current = item.id;
        }
        setActive(current);
      };
      const schedule = () => {
        if (frame === 0) frame = window.requestAnimationFrame(measure);
      };
      measure();
      window.addEventListener('scroll', schedule, { passive: true });
      window.addEventListener('resize', schedule);
      return () => {
        window.removeEventListener('scroll', schedule);
        window.removeEventListener('resize', schedule);
        if (frame !== 0) window.cancelAnimationFrame(frame);
      };
    }, [isControlled, items, offset, setActive]);

    // Tap-to-open only exists on the floating variant; a click elsewhere or
    // Escape closes it again.
    useEffect(() => {
      if (!open) return;
      const onPointerDown = (event: PointerEvent) => {
        if (navRef.current && !navRef.current.contains(event.target as Node)) setOpen(false);
      };
      document.addEventListener('pointerdown', onPointerDown);
      return () => document.removeEventListener('pointerdown', onPointerDown);
    }, [open]);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
      onKeyDown?.(event);
      if (floating && event.key === 'Escape') {
        setOpen(false);
        // Collapse the :focus-within expansion too
        const focused = document.activeElement;
        if (focused instanceof HTMLElement && navRef.current?.contains(focused)) focused.blur();
      }
    };

    const classes = [
      'ds-anchor-nav',
      floating && 'ds-anchor-nav--floating',
      floating && open && 'ds-anchor-nav--open',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const header = title ? (
      <p className="ds-anchor-nav__header">
        {icon && (
          <span className="material-symbols-rounded ds-anchor-nav__icon" aria-hidden="true">
            {icon}
          </span>
        )}
        {title}
      </p>
    ) : null;

    const list = (
      <ul className="ds-anchor-nav__list">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={
                item.id === currentId
                  ? 'ds-anchor-nav__link ds-anchor-nav__link--active'
                  : 'ds-anchor-nav__link'
              }
              aria-current={item.id === currentId ? 'location' : undefined}
              onClick={(event) => {
                if (!isControlled) setActive(item.id);
                else onActiveChangeRef.current?.(item.id);
                if (floating) {
                  setOpen(false);
                  // Release :focus-within so the panel folds away after the jump
                  event.currentTarget.blur();
                }
              }}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    );

    return (
      <nav
        ref={navRef}
        aria-label={title || 'On this page'}
        className={classes}
        {...rest}
        onKeyDown={handleKeyDown}
      >
        {floating ? (
          <>
            <div className="ds-anchor-nav__lines" aria-hidden="true" onClick={() => setOpen(true)}>
              {items.map((item) => (
                <span
                  key={item.id}
                  className={
                    item.id === currentId
                      ? 'ds-anchor-nav__line ds-anchor-nav__line--active'
                      : 'ds-anchor-nav__line'
                  }
                />
              ))}
            </div>
            <div className="ds-anchor-nav__panel">
              {header}
              {list}
            </div>
          </>
        ) : (
          <>
            {header}
            {list}
          </>
        )}
      </nav>
    );
  }
);

AnchorNav.displayName = 'AnchorNav';
