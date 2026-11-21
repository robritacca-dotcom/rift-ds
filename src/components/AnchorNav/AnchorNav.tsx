'use client';

import React, { useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useLayer } from '../../behaviors/useLayer';
import './AnchorNav.css';
import '../../behaviors/direction.css';
import { mirrorClass } from '../../behaviors/direction';

export interface AnchorNavItem {
  /** The id of the element the item jumps to (rendered as `href="#id"`) */
  id: string;
  /** Link text */
  label: string;
}

/** Where `fromHeadings` (and `useHeadingItems`) look for the page's sections. */
export interface AnchorNavHeadingSource {
  /** A selector for the element whose headings are listed. Defaults to `main`. */
  root?: string;
  /** Which headings count as sections. Defaults to `h2`. */
  selector?: string;
  /** List nothing until at least this many sections are found, since a rail of one link is no help. Defaults to 2. */
  minItems?: number;
}

/** The plain text of a heading, leaving out its own "#" anchor and any hidden marks. */
const headingText = (heading: Element): string => {
  const copy = heading.cloneNode(true) as Element;
  copy.querySelectorAll('.ds-heading__anchor, .ds-section-title__anchor, [aria-hidden="true"]').forEach((el) => el.remove());
  return (copy.textContent ?? '').trim();
};

const slug = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');

/**
 * The sections of the page, read from its headings: every match of
 * `selector` under `root`, in document order, skipping any inside an
 * `aside` or a `[data-anchor-ignore]` region (a sidebar's headings, or a
 * demo's). A heading's id is its own, else its enclosing section's, else
 * one made from its text and written onto it. Re-reads when the content
 * under `root` changes, so streamed or late content joins the list.
 * Returns an empty list until `minItems` sections are found.
 */
// A hook beside the component it feeds; Fast Refresh only loses state for
// this module on an edit, which is acceptable for a library file.
// eslint-disable-next-line react-refresh/only-export-components
export function useHeadingItems(source: AnchorNavHeadingSource | undefined): AnchorNavItem[] {
  const [items, setItems] = useState<AnchorNavItem[]>([]);
  const root = source?.root ?? 'main';
  const selector = source?.selector ?? 'h2';
  const minItems = source?.minItems ?? 2;
  const enabled = source !== undefined;

  useEffect(() => {
    if (!enabled) return;
    const container = document.querySelector(root);
    const scan = () => {
      const used = new Set<string>();
      const found: AnchorNavItem[] = [];
      for (const heading of container?.querySelectorAll(selector) ?? []) {
        if (heading.closest('aside, [data-anchor-ignore]')) continue;
        const label = headingText(heading);
        if (!label) continue;
        let id = heading.id || heading.closest('section[id]')?.id || '';
        if (!id) {
          const base = slug(label) || 'section';
          id = base;
          let n = 2;
          while (used.has(id) || document.getElementById(id)) id = `${base}-${n++}`;
          heading.id = id;
        }
        if (used.has(id)) continue;
        used.add(id);
        found.push({ id, label });
      }
      const next = found.length >= minItems ? found : [];
      setItems((prev) =>
        prev.length === next.length && prev.every((p, i) => p.id === next[i].id && p.label === next[i].label)
          ? prev
          : next,
      );
    };
    scan();
    if (!container) return;
    const observer = new MutationObserver(scan);
    observer.observe(container, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, [enabled, root, selector, minItems]);

  return items;
}

type AnchorNavOwnProps = {
  /** The on-page sections to list, in document order. Leave it out and pass `fromHeadings` to read them from the page. */
  items?: AnchorNavItem[];
  /**
   * Read the sections from the page's headings instead of listing them:
   * `{}` lists every `h2` in `main`, and `root`, `selector` and `minItems`
   * narrow it. Ignored when `items` is passed. Renders nothing until enough
   * sections are found.
   */
  fromHeadings?: AnchorNavHeadingSource;
  /** Visual form: `list` renders the inline "On this page" rail; `floating` collapses to a stack of short lines that expands into a panel on hover, keyboard focus, or tap, so it can ride a page edge without taking column width */
  variant?: 'list' | 'floating';
  /**
   * Header text above the list; pass an empty string to render no header.
   * Note: this shadows the native `title` tooltip attribute, which AnchorNav does not expose.
   */
  title?: string;
  /** Icon beside the header — Material Symbol name (string) or custom element (ReactNode); pass an empty string for none */
  icon?: string | React.ReactNode;
  /** Controlled active item id — set it to drive the highlight yourself and skip scroll tracking */
  activeId?: string;
  /** Fires when the tracked (or clicked) active item changes */
  onActiveChange?: (id: string) => void;
  /** Distance in px from the viewport top at which a section counts as current, e.g. a sticky header's height. A heading with a larger `scroll-margin-top` counts from there, so a jump to it always marks it. */
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
      items: itemsProp,
      fromHeadings,
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
    const discovered = useHeadingItems(itemsProp ? undefined : fromHeadings);
    const items = itemsProp ?? discovered;

    const floating = variant === 'floating';
    const [open, setOpen] = useState(false);

    const isControlled = activeId !== undefined;
    const [trackedId, setTrackedId] = useState<string | undefined>(undefined);
    const currentId = isControlled ? activeId : trackedId;

    // The latest callback, read by the scroll handler without re-subscribing.
    const onActiveChangeRef = useRef(onActiveChange);
    useEffect(() => {
      onActiveChangeRef.current = onActiveChange;
    });

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
    // The link last pressed, which the foot of the page keeps marked.
    const pressedRef = useRef<string | undefined>(undefined);
    useEffect(() => {
      if (isControlled || items.length === 0) return;
      let frame = 0;
      const measure = () => {
        frame = 0;
        let current = items[0]?.id;
        for (const item of items) {
          const el = document.getElementById(item.id);
          if (!el) continue;
          // A jump lands a heading at its own scroll margin (clearing a
          // sticky header), so a section is current from there too: the
          // link just pressed is the one marked, first time.
          const margin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
          if (el.getBoundingClientRect().top <= Math.max(offset, margin) + 1) current = item.id;
        }
        // At the foot of the page the last sections can never reach the top,
        // so the link just pressed stays marked while it is on screen, and
        // otherwise the last section is the current one.
        const root = document.documentElement;
        if (window.innerHeight + window.scrollY >= root.scrollHeight - 2) {
          const pressed = pressedRef.current ? document.getElementById(pressedRef.current) : null;
          const top = pressed?.getBoundingClientRect().top;
          current = pressed && top !== undefined && top >= 0 && top < window.innerHeight
            ? pressedRef.current!
            : items[items.length - 1].id;
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

    // Tap-to-open only exists on the floating variant; a press elsewhere or
    // Escape closes it again, through the shared layer stack, so neither also
    // closes a Dialog beneath.
    useLayer({
      open,
      onDismiss: () => setOpen(false),
      dismissOnOutsidePress: true,
      getElements: () => [navRef.current],
    });

    const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
      onKeyDown?.(event);
      if (floating && event.key === 'Escape') {
        // Handled while the floating panel is open or focus-expanded: the
        // layer stack leaves a prevented Escape alone.
        if (open || navRef.current?.contains(document.activeElement)) event.preventDefault();
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
        {icon &&
          (typeof icon === 'string' ? (
            <span className={`material-symbols-rounded ds-anchor-nav__icon ${mirrorClass(icon)}`} aria-hidden="true">
              {icon}
            </span>
          ) : (
            <span className="ds-anchor-nav__icon" aria-hidden="true">
              {icon}
            </span>
          ))}
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
                pressedRef.current = item.id;
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

    // Reading the page found too few sections to be worth a rail.
    if (!itemsProp && items.length === 0) return null;

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
