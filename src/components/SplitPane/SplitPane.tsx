'use client';

import React, { useRef, useState } from 'react';
import './SplitPane.css';

/** Props owned by SplitPane itself — everything else falls through to the root div. */
type SplitPaneOwnProps = {
  /** The two panes, in order. Children beyond the first two are ignored. */
  children: React.ReactNode;
  /** Which way the panes sit: side by side, or stacked. */
  direction?: 'horizontal' | 'vertical';
  /** First pane's share as a percentage (controlled). Pair with `onSplitChange`. */
  split?: number;
  /** First pane's share as a percentage (uncontrolled initial value). */
  defaultSplit?: number;
  /** Smallest share the first pane can be dragged to, as a percentage. */
  minSplit?: number;
  /** Largest share the first pane can be dragged to, as a percentage. */
  maxSplit?: number;
  /** Fires with the new percentage on every drag step or keyboard resize. */
  onSplitChange?: (split: number) => void;
  /** Accessible name for the resize handle. */
  separatorLabel?: string;
  /** Additional CSS classes */
  className?: string;
};

export interface SplitPaneProps
  extends SplitPaneOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof SplitPaneOwnProps> {}

/** Keyboard resize steps, as percentages of the container. */
const KEY_STEP = 2;
const KEY_STEP_LARGE = 10;

/**
 * SplitPane — two resizable regions with a draggable divider: the sidebar
 * and canvas, the list and detail, the editor and preview. The split is a
 * percentage, so it survives container resizes. The divider is a real
 * `separator`: focusable, arrow keys nudge it (Shift for big steps, Home/End
 * to the limits), and pointer drags use capture so a fast drag can't escape
 * it. Panes clip their content rather than growing the page; a region that
 * should scroll brings its own focusable scroll container, so keyboard
 * users can reach it.
 */
export const SplitPane = React.forwardRef<HTMLDivElement, SplitPaneProps>(
  (
    {
      children,
      direction = 'horizontal',
      split,
      defaultSplit = 50,
      minSplit = 10,
      maxSplit = 90,
      onSplitChange,
      separatorLabel = 'Resize panes',
      className = '',
      ...rest
    },
    ref,
  ) => {
    const baseClass = 'ds-split-pane';

    const [uncontrolledSplit, setUncontrolledSplit] = useState(defaultSplit);
    const [dragging, setDragging] = useState(false);
    // The class rides state; the move handler reads this ref, so a move
    // arriving before the re-render (a fast drag's first frame) still lands.
    const draggingRef = useRef(false);
    const internalRef = useRef<HTMLDivElement | null>(null);

    const setRef = (node: HTMLDivElement | null) => {
      internalRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    };

    const clamp = (value: number) => Math.min(Math.max(value, minSplit), maxSplit);
    const currentSplit = clamp(split ?? uncontrolledSplit);

    const applySplit = (value: number) => {
      const next = clamp(value);
      if (split === undefined) setUncontrolledSplit(next);
      onSplitChange?.(next);
    };

    const splitFromPointer = (e: React.PointerEvent) => {
      const rect = internalRef.current?.getBoundingClientRect();
      if (!rect) return;
      const fraction =
        direction === 'horizontal'
          ? (e.clientX - rect.left) / rect.width
          : (e.clientY - rect.top) / rect.height;
      applySplit(fraction * 100);
    };

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      draggingRef.current = true;
      setDragging(true);
      splitFromPointer(e);
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
      if (!draggingRef.current) return;
      splitFromPointer(e);
    };

    const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
      draggingRef.current = false;
      setDragging(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      const step = e.shiftKey ? KEY_STEP_LARGE : KEY_STEP;
      const shrinkKey = direction === 'horizontal' ? 'ArrowLeft' : 'ArrowUp';
      const growKey = direction === 'horizontal' ? 'ArrowRight' : 'ArrowDown';
      switch (e.key) {
        case shrinkKey:
          e.preventDefault();
          applySplit(currentSplit - step);
          break;
        case growKey:
          e.preventDefault();
          applySplit(currentSplit + step);
          break;
        case 'Home':
          e.preventDefault();
          applySplit(minSplit);
          break;
        case 'End':
          e.preventDefault();
          applySplit(maxSplit);
          break;
      }
    };

    const classes = [
      baseClass,
      `${baseClass}--${direction}`,
      dragging && `${baseClass}--dragging`,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const [first, second] = React.Children.toArray(children);

    return (
      <div
        {...rest}
        ref={setRef}
        className={classes}
        style={
          {
            '--ds-split-pane-split': `${currentSplit}%`,
            ...rest.style,
          } as React.CSSProperties
        }
      >
        <div className={`${baseClass}__pane ${baseClass}__pane--first`}>{first}</div>
        <div
          className={`${baseClass}__separator`}
          role="separator"
          tabIndex={0}
          aria-label={separatorLabel}
          aria-orientation={direction === 'horizontal' ? 'vertical' : 'horizontal'}
          aria-valuenow={Math.round(currentSplit)}
          aria-valuemin={Math.round(minSplit)}
          aria-valuemax={Math.round(maxSplit)}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onKeyDown={handleKeyDown}
        >
          <span className={`${baseClass}__grip`} aria-hidden="true" />
        </div>
        <div className={`${baseClass}__pane ${baseClass}__pane--second`}>{second}</div>
      </div>
    );
  },
);

SplitPane.displayName = 'SplitPane';
