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
import { useAnchoredPosition } from '../../behaviors/useAnchoredPosition';
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

const clamp = (value: number, min: number, max: number) =>
  max < min ? min : Math.min(Math.max(value, min), max);

/**
 * Tooltip component for contextual text labels.
 * Appears on hover or focus with a short delay.
 * Rides the system's floating surface — page background, hairline border,
 * floating shadow — so the bubble stays light in light theme and dark in dark.
 *
 * The panel stays in the trigger's DOM position (so it keeps the trigger's
 * stacking context and any theme scoped above it) but is `position: fixed`,
 * placed from the trigger's rectangle each time it shows and again on scroll
 * and resize while visible. That is what lets a tooltip inside a scroll
 * container — a bordered table's wrapper, a rail — show whole instead of
 * being clipped at the container's edge. The panel is clamped inside the box
 * it is placed from (the viewport, or the transformed or blurred ancestor
 * that positions it), and the arrow slides along the bubble to stay on the
 * trigger's centre when the clamp moves the bubble off it.
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
    const anchorRef = useRef<HTMLSpanElement | null>(null);
    const panelRef = useRef<HTMLSpanElement | null>(null);
    const tooltipId = useId();

    const baseClass = 'ds-tooltip';

    const setRefs = (node: HTMLSpanElement | null) => {
      anchorRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    };

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

    // Placement writes straight onto the panel rather than through state
    // (src/behaviors/useAnchoredPosition): it runs before paint, so the bubble
    // never shows at a stale position, and a scroll or resize costs no render.
    // The arrow follows the trigger's centre along the bubble, held clear of
    // the bubble's corners by twice the gap (half the arrow plus the corner
    // radius).
    useAnchoredPosition({
      open: visible,
      anchorRef,
      panelRef,
      side: position,
      align: 'center',
      gapProperty: '--gap-100',
      onPlace: ({ side, x, y, width, height, anchor }) => {
        const panel = panelRef.current;
        if (!panel) return;
        const gap = parseFloat(getComputedStyle(panel).getPropertyValue('--gap-100')) || 0;
        const inset = gap * 2;
        const arrow =
          side === 'left' || side === 'right'
            ? clamp(anchor.top + anchor.height / 2 - y, inset, height - inset)
            : clamp(anchor.left + anchor.width / 2 - x, inset, width - inset);
        panel.style.setProperty('--ds-tooltip-arrow', `${arrow}px`);
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
        ref={setRefs}
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
          description survives), so a hidden panel is never measured or placed.
        */}
        <span ref={panelRef} className={panelClasses} role="tooltip" id={tooltipId}>
          {content}
          <span className={`${baseClass}__arrow`} />
        </span>
      </span>
    );
  },
);

Tooltip.displayName = 'Tooltip';
