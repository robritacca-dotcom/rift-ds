'use client';

import React, {
  useState,
  useEffect,
  useRef,
  useId,
  cloneElement,
  isValidElement,
  type ReactNode,
  type ReactElement,
} from 'react';
import { useLayer } from '../../behaviors/useLayer';
import './Tooltip.css';
import { MOTION_HOVER_SHOW_DELAY_MS, MOTION_HOVER_HIDE_DELAY_MS } from '../../tokens/motion';

type TooltipOwnProps = {
  /** Trigger element */
  children?: ReactNode;
  /**
   * Tooltip text content. Replaces the native `content` attribute, which only
   * means something on a `<meta>` element.
   */
  content: string;
  /** Preferred position */
  position?: 'top' | 'bottom' | 'left' | 'right';
  /** Delay before showing (in ms) */
  showDelay?: number;
  /** Delay before hiding (in ms) */
  hideDelay?: number;
  /** Additional CSS classes */
  className?: string;
};

export interface TooltipProps
  extends TooltipOwnProps,
    Omit<React.ComponentPropsWithoutRef<'span'>, keyof TooltipOwnProps> {}

/**
 * Tooltip component for contextual text labels.
 * Appears on hover or focus with a short delay.
 * Rides the system's floating surface — page background, hairline border,
 * floating shadow — so the bubble stays light in light theme and dark in dark.
 *
 * A visible tooltip is a layer on the shared dismissal stack
 * (src/behaviors/useLayer): Escape hides it wherever focus is (WCAG 1.4.13),
 * and hides only it, so inside a Dialog the first Escape clears the tooltip
 * and the second closes the Dialog.
 */
export const Tooltip = React.forwardRef<HTMLSpanElement, TooltipProps>(
  (
    {
      children,
      content,
      position = 'top',
      showDelay = MOTION_HOVER_SHOW_DELAY_MS,
      hideDelay = MOTION_HOVER_HIDE_DELAY_MS,
      className = '',
      onMouseEnter,
      onMouseLeave,
      onFocus,
      onBlur,
      ...rest
    },
    ref,
  ) => {
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

    useLayer({
      open: visible,
      onDismiss: () => {
        clearTimeout(showTimeoutRef.current);
        clearTimeout(hideTimeoutRef.current);
        setVisible(false);
      },
    });

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
        {...rest}
        ref={ref}
        className={containerClasses}
        onMouseEnter={(event) => {
          onMouseEnter?.(event);
          show();
        }}
        onMouseLeave={(event) => {
          onMouseLeave?.(event);
          hide();
        }}
        onFocus={(event) => {
          onFocus?.(event);
          show();
        }}
        onBlur={(event) => {
          onBlur?.(event);
          hide();
        }}
      >
        {trigger}

        {/*
          No aria-hidden toggle: the trigger's aria-describedby points here, and
          show is delayed, so the description must be computable the moment
          focus lands. The panel hides with display:none (accessible-name
          computation includes hidden nodes referenced by IDREF, so the
          description survives), which keeps an edge-adjacent panel out of the
          page's scrollable overflow while hidden.
        */}
        <span className={panelClasses} role="tooltip" id={tooltipId}>
          {content}
          <span className={`${baseClass}__arrow`} />
        </span>
      </span>
    );
  },
);

Tooltip.displayName = 'Tooltip';
