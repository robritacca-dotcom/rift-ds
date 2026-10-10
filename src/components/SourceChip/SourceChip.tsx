'use client';

import React, { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import './SourceChip.css';
import '../../fonts/material-symbols.css';
import { MOTION_HOVER_SHOW_DELAY_MS, MOTION_HOVER_HIDE_DELAY_MS } from '../../tokens/motion';

/** Props owned by SourceChip itself — everything else falls through to the root element. */
type SourceChipOwnProps = {
  /** The source name, e.g. "Design tokens quarterly". Truncates with an ellipsis when long. */
  title: string;
  /** Citation number, rendered as a leading numeral in its own small badge circle. Wins the leading slot over `logo` and `icon`. */
  index?: number;
  /**
   * The glyph for a source with neither a number nor a logo — a Material Symbol
   * name (string) or custom element (ReactNode). Defaults to a globe, so the
   * leading slot is never empty.
   */
  icon?: string | React.ReactNode;
  /** Optional href — renders as an `<a>` instead of a `<span>`. */
  href?: string;
  /**
   * The passage the answer drew on. Setting it gives the chip a preview panel
   * that opens on hover, focus or press: the full title over this excerpt.
   * Without an `href` the chip then renders as a `<button>`, so the preview
   * is reachable from the keyboard.
   */
  excerpt?: string;
  /** Where the source lives, shown as the preview's top line, e.g. "docs.acme.com". Only rendered with `excerpt`. */
  source?: string;
  /**
   * The source's logo or favicon — an image URL (string) or a custom element
   * (ReactNode), cropped to a circle. It fills the chip's leading slot when
   * there is no `index`, and always leads the preview's top line. Decorative:
   * the title and `source` text carry the name.
   */
  logo?: string | React.ReactNode;
  /** A short trailing fact for the preview's top line, e.g. "Updated 3 days ago". Only rendered with `excerpt`. */
  meta?: string;
  /** Additional CSS classes */
  className?: string;
};

export interface SourceChipProps
  extends SourceChipOwnProps,
    Omit<React.ComponentPropsWithoutRef<'a'>, keyof SourceChipOwnProps> {}

/** Breathing room kept between the preview and the edge of whatever clips it. */
const PREVIEW_EDGE_MARGIN = 8;

/** Closes whichever chip's preview is showing, so only one is ever open. */
let closeOpenPreview: (() => void) | null = null;

/**
 * The box the preview must stay inside: the viewport, narrowed by every
 * ancestor that clips its overflow (a chat's scrolling message list).
 */
function clipBounds(el: HTMLElement) {
  const bounds = { top: 0, left: 0, right: window.innerWidth, bottom: window.innerHeight };
  for (let node = el.parentElement; node; node = node.parentElement) {
    const { overflowX, overflowY } = getComputedStyle(node);
    const rect = node.getBoundingClientRect();
    if (overflowX !== 'visible') {
      bounds.left = Math.max(bounds.left, rect.left);
      bounds.right = Math.min(bounds.right, rect.right);
    }
    if (overflowY !== 'visible') {
      bounds.top = Math.max(bounds.top, rect.top);
      bounds.bottom = Math.min(bounds.bottom, rect.bottom);
    }
  }
  return bounds;
}

/**
 * SourceChip is the numbered citation pill linking a claim to its source.
 * It renders inline after a sentence or in a sources row under an assistant
 * chat message: a leading slot — the citation number, the source's logo in
 * a circle, or a globe — beside a truncating source title.
 *
 * Renders an `<a>` when `href` is supplied, a `<button>` when it has a preview
 * but nowhere to link, and a plain `<span>` otherwise. Forwards a ref to
 * whichever element it renders, and spreads unrecognised props onto it —
 * `target` and `rel` pass through as native anchor attributes.
 *
 * With an `excerpt` the chip previews its source: a floating panel that opens
 * above the chip on hover or focus, flips below when there is no room, and
 * slides sideways to stay inside whatever clips it. Escape dismisses it.
 */
export const SourceChip = React.forwardRef<
  HTMLAnchorElement | HTMLButtonElement | HTMLSpanElement,
  SourceChipProps
>(({ title, index, icon = 'language', href, excerpt, source, logo, meta, className = '', ...rest }, ref) => {
  const baseClass = 'ds-source-chip';
  const hasPreview = Boolean(excerpt);

  const [visible, setVisible] = useState(false);
  const showTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const hostRef = useRef<HTMLSpanElement>(null);
  const panelRef = useRef<HTMLSpanElement>(null);
  const panelId = useId();

  const clearTimers = () => {
    clearTimeout(showTimeoutRef.current);
    clearTimeout(hideTimeoutRef.current);
  };

  const show = () => {
    clearTimeout(hideTimeoutRef.current);
    showTimeoutRef.current = setTimeout(() => setVisible(true), MOTION_HOVER_SHOW_DELAY_MS);
  };

  const hide = () => {
    clearTimeout(showTimeoutRef.current);
    hideTimeoutRef.current = setTimeout(() => setVisible(false), MOTION_HOVER_HIDE_DELAY_MS);
  };

  /** A press is a deliberate ask, so it skips the hover delay. */
  const showNow = () => {
    clearTimers();
    setVisible(true);
  };

  useEffect(() => clearTimers, []);

  // While open: Escape dismisses from anywhere (WCAG 1.4.13), and so does a
  // press outside — touch browsers do not reliably blur on an outside tap.
  useEffect(() => {
    if (!visible) return;
    const close = () => {
      clearTimers();
      setVisible(false);
    };
    // One preview at a time: a chip held open by keyboard focus gives way
    // when the pointer opens its neighbour.
    closeOpenPreview?.();
    closeOpenPreview = close;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    const onPointerDown = (e: PointerEvent) => {
      if (!hostRef.current?.contains(e.target as Node)) close();
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      if (closeOpenPreview === close) closeOpenPreview = null;
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [visible]);

  // Place the panel before it paints: above the chip and flush with its
  // leading edge, flipped below when the space above is short, and shifted
  // sideways until it sits inside the clip bounds.
  useLayoutEffect(() => {
    const host = hostRef.current;
    const panel = panelRef.current;
    if (!visible || !host || !panel) return;

    const bounds = clipBounds(host);
    const anchor = host.getBoundingClientRect();
    const width = panel.offsetWidth;
    const height = panel.offsetHeight;

    const roomAbove = anchor.top - bounds.top - PREVIEW_EDGE_MARGIN;
    const roomBelow = bounds.bottom - anchor.bottom - PREVIEW_EDGE_MARGIN;
    const side = roomAbove >= height || roomAbove >= roomBelow ? 'top' : 'bottom';

    const minLeft = bounds.left + PREVIEW_EDGE_MARGIN;
    const maxLeft = bounds.right - PREVIEW_EDGE_MARGIN - width;
    const left = Math.max(minLeft, Math.min(anchor.left, maxLeft));

    panel.dataset.side = side;
    panel.style.setProperty('--ds-source-chip-shift', `${Math.round(left - anchor.left)}px`);
  }, [visible]);

  const element = href ? 'a' : hasPreview ? 'button' : 'span';

  const classes = [
    baseClass,
    href ? `${baseClass}--link` : '',
    element !== 'span' ? `${baseClass}--interactive` : '',
    visible ? `${baseClass}--open` : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const logoMark = logo ? (typeof logo === 'string' ? <img src={logo} alt="" /> : logo) : null;

  // The leading slot is never empty: the citation number, else the source's
  // logo, else a glyph (the globe unless `icon` says otherwise).
  const leading =
    index !== undefined ? (
      <span className={`${baseClass}__index`}>
        <span className={`${baseClass}__numeral`}>{index}</span>
      </span>
    ) : logoMark ? (
      <span className={`${baseClass}__logo`} aria-hidden="true">
        {logoMark}
      </span>
    ) : icon ? (
      <span className={`${baseClass}__icon`} aria-hidden="true">
        {typeof icon === 'string' ? (
          <span className="material-symbols-rounded">{icon}</span>
        ) : (
          icon
        )}
      </span>
    ) : null;

  const content = (
    <>
      {leading}
      <span className={`${baseClass}__title`}>{title}</span>
    </>
  );

  // The preview describes the chip, so assistive tech reads the excerpt with
  // the title whether or not the panel is showing.
  const describedBy = hasPreview ? panelId : undefined;

  const chip =
    element === 'a' ? (
      <a
        aria-describedby={describedBy}
        {...rest}
        ref={ref as React.Ref<HTMLAnchorElement>}
        className={classes}
        href={href}
      >
        {content}
      </a>
    ) : element === 'button' ? (
      <button
        type="button"
        aria-describedby={describedBy}
        {...(rest as React.ComponentPropsWithoutRef<'button'>)}
        ref={ref as React.Ref<HTMLButtonElement>}
        className={classes}
      >
        {content}
      </button>
    ) : (
      <span
        {...(rest as React.ComponentPropsWithoutRef<'span'>)}
        ref={ref as React.Ref<HTMLSpanElement>}
        className={classes}
      >
        {content}
      </span>
    );

  if (!hasPreview) return chip;

  const handleBlur = (event: React.FocusEvent<HTMLSpanElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) hide();
  };

  return (
    <span
      ref={hostRef}
      className={`${baseClass}-host`}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={handleBlur}
      onClick={showNow}
    >
      {chip}

      {/* Spans throughout, like Tooltip's bubble: an inline citation sits
          inside a <p>, where a <div> would end the paragraph mid-parse. */}
      <span
        ref={panelRef}
        id={panelId}
        role="tooltip"
        className={`${baseClass}__preview${visible ? ` ${baseClass}__preview--visible` : ''}`}
      >
        {(logo || source || meta || href) && (
          <span className={`${baseClass}__preview-top`}>
            {logoMark && (
              <span className={`${baseClass}__logo`} aria-hidden="true">
                {logoMark}
              </span>
            )}
            {source && <span className={`${baseClass}__preview-source`}>{source}</span>}
            {meta && <span className={`${baseClass}__preview-meta`}>{meta}</span>}
            {href && (
              <span
                className={`${baseClass}__preview-open material-symbols-rounded`}
                aria-hidden="true"
              >
                arrow_outward
              </span>
            )}
          </span>
        )}
        <span className={`${baseClass}__preview-title`}>{title}</span>
        <span className={`${baseClass}__preview-excerpt`}>{excerpt}</span>
      </span>
    </span>
  );
});

SourceChip.displayName = 'SourceChip';
