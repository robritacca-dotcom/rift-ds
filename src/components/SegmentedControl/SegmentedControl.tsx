'use client';

import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
import './SegmentedControl.css';
import '../../fonts/material-symbols.css';

export interface Segment {
  /** Unique value for this segment */
  value: string;
  /** Display label */
  label: string;
  /** Optional Material Symbol icon name */
  icon?: string;
  /** Whether disabled */
  disabled?: boolean;
}

export interface SegmentedControlProps {
  /** Array of segments */
  segments: Segment[];
  /** Currently active segment value */
  activeSegment: string;
  /** Callback when segment changes */
  onSegmentChange?: (value: string) => void;
  /** Component size */
  size?: 'default' | 'compact';
  /** Visual treatment of the active segment — teal by default, `neutral` fills it grey */
  variant?: 'primary' | 'neutral';
  /** Full width — segments fill container */
  fullWidth?: boolean;
  /** Accessible label for the tablist */
  ariaLabel?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Segmented control for toggling between related views.
 * A horizontal set of mutually exclusive options with a
 * pill-shaped active indicator. Supports icons and keyboard navigation.
 */
export const SegmentedControl = ({
  segments,
  activeSegment,
  onSegmentChange,
  size = 'default',
  variant = 'primary',
  fullWidth = false,
  ariaLabel,
  className = '',
}: SegmentedControlProps) => {
  const baseClass = 'ds-segmented-control';
  const sizeClass = `${baseClass}--${size}`;
  const variantClass = `${baseClass}--${variant}`;
  const fullWidthClass = fullWidth ? `${baseClass}--full-width` : '';
  const containerRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  // False until the pill has been measured onto the active segment; before
  // that (SSR and the first client frame) the active segment paints its own
  // background so the control never renders selection-less.
  const [pillReady, setPillReady] = useState(false);
  const hasPositionedRef = useRef(false);
  // Pending double-rAF that arms animated moves — see positionPill.
  const armFrameRef = useRef(0);

  const classes = [
    baseClass,
    sizeClass,
    variantClass,
    fullWidthClass,
    pillReady ? `${baseClass}--pill-ready` : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // Writes the active segment's measured box onto the pill. Animated moves
  // tween transform/width via the CSS transition; un-animated ones (first
  // paint, resize, font swap) suspend it so the pill snaps into place.
  const positionPill = useCallback(
    (animate: boolean) => {
      const container = containerRef.current;
      const pill = pillRef.current;
      if (!container || !pill) return;
      const active = container.querySelector<HTMLButtonElement>(
        `[data-segment-value="${CSS.escape(activeSegment)}"]`
      );
      // A zero-width measurement means the control is hidden (or not laid
      // out yet) — keep the per-segment fallback and try again when the
      // resize observer reports a real size.
      if (!active || active.offsetWidth === 0) {
        if (armFrameRef.current) {
          cancelAnimationFrame(armFrameRef.current);
          armFrameRef.current = 0;
        }
        hasPositionedRef.current = false;
        setPillReady(false);
        return;
      }
      if (!animate) pill.style.transition = 'none';
      pill.style.width = `${active.offsetWidth}px`;
      pill.style.height = `${active.offsetHeight}px`;
      pill.style.transform = `translate(${active.offsetLeft}px, ${active.offsetTop}px)`;
      if (!animate) {
        // Flush the suspended write before restoring the transition.
        void pill.offsetWidth;
        pill.style.transition = '';
      }
      // Arm animated moves only once the browser has painted this box. A
      // position written before first paint must snap — hydration renders
      // with the server's segment, and the store correction that follows
      // re-positions before anything is painted; animating that correction
      // would slide the pill across the control on every page load (the
      // header theme toggle was the visible case). Two frames, because the
      // first rAF fires before the pending frame paints.
      if (!hasPositionedRef.current && armFrameRef.current === 0) {
        armFrameRef.current = requestAnimationFrame(() => {
          armFrameRef.current = requestAnimationFrame(() => {
            armFrameRef.current = 0;
            hasPositionedRef.current = true;
          });
        });
      }
      setPillReady(true);
    },
    [activeSegment]
  );

  // Keep the resize observer's callback pointed at the latest measurement
  // closure without recreating the observer per segment change.
  const latestPositionPill = useRef(positionPill);
  useLayoutEffect(() => {
    latestPositionPill.current = positionPill;
  }, [positionPill]);

  useLayoutEffect(() => {
    positionPill(hasPositionedRef.current);
  }, [positionPill, segments, size, fullWidth]);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container || typeof ResizeObserver === 'undefined') return;
    // The observer fires once on observe(); when the layout effect above
    // already positioned the pill for that frame, skip it — otherwise the
    // initial callback would cut an in-flight slide short. When it didn't
    // (the control mounted hidden or unsized), the fire is a real chance
    // to measure. Later fires are real resizes and always reposition.
    let initialFire = true;
    const observer = new ResizeObserver(() => {
      if (initialFire) {
        initialFire = false;
        if (hasPositionedRef.current) return;
      }
      latestPositionPill.current(false);
    });
    observer.observe(container);
    return () => {
      observer.disconnect();
      if (armFrameRef.current) {
        cancelAnimationFrame(armFrameRef.current);
        armFrameRef.current = 0;
      }
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent, idx: number) => {
    const enabledSegments = segments.filter((s) => !s.disabled);
    const currentEnabledIdx = enabledSegments.findIndex((s) => s.value === segments[idx].value);

    let nextIdx = -1;

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      nextIdx = (currentEnabledIdx + 1) % enabledSegments.length;
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      nextIdx = (currentEnabledIdx - 1 + enabledSegments.length) % enabledSegments.length;
    } else if (e.key === 'Home') {
      e.preventDefault();
      nextIdx = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      nextIdx = enabledSegments.length - 1;
    }

    if (nextIdx >= 0) {
      const nextSegment = enabledSegments[nextIdx];
      onSegmentChange?.(nextSegment.value);

      // Focus the button
      const buttons = containerRef.current?.querySelectorAll(
        `[data-segment-value]`
      ) as NodeListOf<HTMLButtonElement>;
      buttons?.forEach((btn) => {
        if (btn.dataset.segmentValue === nextSegment.value) {
          btn.focus();
        }
      });
    }
  };

  return (
    <div className={classes} role="tablist" aria-label={ariaLabel} ref={containerRef}>
      <span className={`${baseClass}__pill`} aria-hidden="true" ref={pillRef} />
      {segments.map((segment, idx) => {
        const isActive = segment.value === activeSegment;
        const btnClasses = [
          `${baseClass}__segment`,
          isActive ? `${baseClass}__segment--active` : '',
          segment.disabled ? `${baseClass}__segment--disabled` : '',
        ]
          .filter(Boolean)
          .join(' ');

        return (
          <button
            key={segment.value}
            type="button"
            role="tab"
            className={btnClasses}
            aria-selected={isActive}
            aria-disabled={segment.disabled || undefined}
            disabled={segment.disabled}
            tabIndex={isActive ? 0 : -1}
            data-segment-value={segment.value}
            onClick={() => {
              if (!segment.disabled) {
                onSegmentChange?.(segment.value);
              }
            }}
            onKeyDown={(e) => handleKeyDown(e, idx)}
          >
            {segment.icon && (
              <span
                className={`${baseClass}__icon material-symbols-rounded`}
                aria-hidden="true"
              >
                {segment.icon}
              </span>
            )}
            <span className={`${baseClass}__label`}>{segment.label}</span>
          </button>
        );
      })}
    </div>
  );
};
