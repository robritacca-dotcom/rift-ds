'use client';

import React, {
  useState,
  useEffect,
  useLayoutEffect,
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
 * The nearest ancestor a fixed-position descendant is placed from instead of
 * the viewport: one with a transform, filter, backdrop filter, perspective,
 * layout or paint containment, or a container type. A Dialog panel keeps its
 * entrance scale and the chat panel its backdrop blur, so a tooltip inside
 * either is placed and clamped against that panel's box. Null means the
 * viewport.
 */
function fixedContainingBlock(element: HTMLElement): HTMLElement | null {
  for (let node = element.parentElement; node; node = node.parentElement) {
    const style = getComputedStyle(node);
    const read = (property: string) => style.getPropertyValue(property).trim();
    const containerType = read('container-type');
    if (
      read('transform') !== 'none' ||
      read('filter') !== 'none' ||
      read('backdrop-filter') !== 'none' ||
      read('perspective') !== 'none' ||
      /\b(layout|paint|strict|content)\b/.test(read('contain')) ||
      /\b(transform|filter|perspective)\b/.test(read('will-change')) ||
      (containerType !== '' && containerType !== 'normal')
    ) {
      return node;
    }
  }
  return null;
}

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

    // Placement writes straight onto the panel rather than through state: it
    // runs before paint, so the bubble never shows at a stale position, and a
    // scroll or resize while visible costs no render.
    useLayoutEffect(() => {
      if (!visible) return;
      const anchor = anchorRef.current;
      const panel = panelRef.current;
      if (!anchor || !panel) return;

      const place = () => {
        const trigger = anchor.getBoundingClientRect();
        const { width, height } = panel.getBoundingClientRect();
        // The gap between trigger and bubble is the spacing token, read where
        // it resolves rather than restated as a number.
        const gap = parseFloat(getComputedStyle(panel).getPropertyValue('--gap-100')) || 0;

        const block = fixedContainingBlock(panel);
        const box = block ? block.getBoundingClientRect() : null;
        const inset = block ? block.clientLeft : 0;
        const bounds = box
          ? { left: box.left + inset, top: box.top + inset, right: box.right - inset, bottom: box.bottom - inset }
          : { left: 0, top: 0, right: window.innerWidth, bottom: window.innerHeight };

        const centreX = trigger.left + trigger.width / 2;
        const centreY = trigger.top + trigger.height / 2;
        let x: number;
        let y: number;
        switch (position) {
          case 'bottom':
            x = centreX - width / 2;
            y = trigger.bottom + gap;
            break;
          case 'left':
            x = trigger.left - gap - width;
            y = centreY - height / 2;
            break;
          case 'right':
            x = trigger.right + gap;
            y = centreY - height / 2;
            break;
          default:
            x = centreX - width / 2;
            y = trigger.top - gap - height;
        }
        x = clamp(x, bounds.left + gap, bounds.right - gap - width);
        y = clamp(y, bounds.top + gap, bounds.bottom - gap - height);

        // The arrow follows the trigger's centre along the bubble, held clear
        // of the bubble's corners by twice the gap (half the arrow plus the
        // corner radius).
        const arrowInset = gap * 2;
        const arrow =
          position === 'left' || position === 'right'
            ? clamp(centreY - y, arrowInset, height - arrowInset)
            : clamp(centreX - x, arrowInset, width - arrowInset);

        panel.style.left = `${x - bounds.left}px`;
        panel.style.top = `${y - bounds.top}px`;
        panel.style.setProperty('--ds-tooltip-arrow', `${arrow}px`);
      };

      place();
      window.addEventListener('scroll', place, true);
      window.addEventListener('resize', place);
      return () => {
        window.removeEventListener('scroll', place, true);
        window.removeEventListener('resize', place);
      };
    }, [visible, position, content]);

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
