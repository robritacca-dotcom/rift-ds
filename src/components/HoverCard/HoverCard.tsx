'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import './HoverCard.css';
import { MOTION_HOVER_SHOW_DELAY_MS, MOTION_HOVER_HIDE_DELAY_MS } from '../../tokens/motion';

type HoverCardOwnProps = {
  /** Trigger element */
  children?: React.ReactNode;
  /** Panel content — arbitrary elements, unlike Tooltip's plain text. In running text inside a `<p>`, keep it phrasing-level (spans): a block element would end the paragraph mid-parse. */
  content: React.ReactNode;
  /** Preferred position */
  position?: 'top' | 'bottom' | 'left' | 'right';
  /** Delay before showing (in ms) */
  showDelay?: number;
  /** Delay before hiding (in ms) */
  hideDelay?: number;
  /** Additional CSS classes */
  className?: string;
};

export interface HoverCardProps
  extends HoverCardOwnProps,
    Omit<React.ComponentPropsWithoutRef<'span'>, keyof HoverCardOwnProps> {}

/**
 * Rich preview panel that opens from hover or focus — a profile card behind
 * a username, a component summary behind a link. Where Tooltip names a
 * control in a line of text, HoverCard previews a destination; its panel is
 * interactive, stays open while the pointer is inside it, and dresses like
 * the other floating panels (Popover, the menus).
 *
 * The hidden panel is `visibility: hidden`, so it stays out of the
 * accessibility tree and tab order until shown. Escape dismisses it.
 */
export const HoverCard = React.forwardRef<HTMLSpanElement, HoverCardProps>(
  (
    {
      children,
      content,
      position = 'bottom',
      showDelay = MOTION_HOVER_SHOW_DELAY_MS,
      hideDelay = MOTION_HOVER_HIDE_DELAY_MS,
      className = '',
      ...rest
    },
    ref,
  ) => {
    const [visible, setVisible] = useState(false);
    const showTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
    const hideTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
    const panelId = useId();

    const baseClass = 'ds-hover-card';

    const show = () => {
      clearTimeout(hideTimeoutRef.current);
      showTimeoutRef.current = setTimeout(() => setVisible(true), showDelay);
    };

    const hide = () => {
      clearTimeout(showTimeoutRef.current);
      hideTimeoutRef.current = setTimeout(() => setVisible(false), hideDelay);
    };

    useEffect(() => {
      return () => {
        clearTimeout(showTimeoutRef.current);
        clearTimeout(hideTimeoutRef.current);
      };
    }, []);

    // Escape dismisses while visible, wherever focus is (WCAG 1.4.13).
    useEffect(() => {
      if (!visible) return;
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          clearTimeout(showTimeoutRef.current);
          clearTimeout(hideTimeoutRef.current);
          setVisible(false);
        }
      };
      document.addEventListener('keydown', onKeyDown);
      return () => document.removeEventListener('keydown', onKeyDown);
    }, [visible]);

    // Focus moving within the container (trigger → a link in the panel)
    // must not close the card; only focus leaving it entirely does.
    const handleBlur = (event: React.FocusEvent<HTMLSpanElement>) => {
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
        hide();
      }
    };

    const trigger = React.isValidElement(children)
      ? React.cloneElement(children as React.ReactElement<{ 'aria-expanded'?: boolean; 'aria-controls'?: string }>, {
          'aria-expanded': visible,
          'aria-controls': visible ? panelId : undefined,
        })
      : children;

    const containerClasses = [baseClass, className].filter(Boolean).join(' ');
    const panelClasses = [
      `${baseClass}__panel`,
      `${baseClass}__panel--${position}`,
      visible ? `${baseClass}__panel--visible` : '',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <span
        {...rest}
        ref={ref}
        className={containerClasses}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={handleBlur}
      >
        {trigger}

        {/* A <span> panel, like Tooltip's bubble: the whole card must survive
            inside a <p>, where a <div> would end the paragraph mid-parse. */}
        <span className={panelClasses} id={panelId}>
          {content}
        </span>
      </span>
    );
  },
);

HoverCard.displayName = 'HoverCard';
