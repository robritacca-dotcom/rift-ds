'use client';

import {
  useState,
  useEffect,
  useRef,
  useId,
  cloneElement,
  isValidElement,
  type ReactNode,
  type ReactElement,
} from 'react';
import './Tooltip.css';
import { MOTION_HOVER_SHOW_DELAY_MS, MOTION_HOVER_HIDE_DELAY_MS } from '../../tokens/motion';

export interface TooltipProps {
  /** Trigger element */
  children?: ReactNode;
  /** Tooltip text content */
  content: string;
  /** Preferred position */
  position?: 'top' | 'bottom' | 'left' | 'right';
  /** Delay before showing (in ms) */
  showDelay?: number;
  /** Delay before hiding (in ms) */
  hideDelay?: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Tooltip component for contextual text labels.
 * Appears on hover or focus with a short delay.
 * Rides the system's floating surface — page background, hairline border,
 * floating shadow — so the bubble stays light in light theme and dark in dark.
 */
export const Tooltip = ({
  children,
  content,
  position = 'top',
  showDelay = MOTION_HOVER_SHOW_DELAY_MS,
  hideDelay = MOTION_HOVER_HIDE_DELAY_MS,
  className = '',
}: TooltipProps) => {
  const [visible, setVisible] = useState(false);
  const showTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const tooltipId = useId();

  const baseClass = 'ds-tooltip';

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

  // Escape dismisses the tooltip while it is visible (WCAG 1.4.13). A
  // document listener rather than a wrapper handler, so it also works when
  // the tooltip was triggered by hover and focus is elsewhere.
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

  // Associate the trigger with the tooltip for screen readers. When the
  // child is a single element, put aria-describedby directly on it.
  const trigger = isValidElement(children)
    ? cloneElement(children as ReactElement<{ 'aria-describedby'?: string }>, {
        'aria-describedby': tooltipId,
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
      className={containerClasses}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {trigger}

      {/*
        No aria-hidden toggle: the trigger's aria-describedby points here, and
        show is delayed, so the description must be computable the moment
        focus lands. The panel is hidden visually by CSS until visible.
      */}
      <span className={panelClasses} role="tooltip" id={tooltipId}>
        {content}
        <span className={`${baseClass}__arrow`} />
      </span>
    </span>
  );
};
