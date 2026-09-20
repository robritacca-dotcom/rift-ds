'use client';

import React, { useRef } from 'react';
import './Toolbar.css';
import { getFocusable } from '../../behaviors/focusable';

/** Props owned by Toolbar itself — everything else falls through to the root div. */
type ToolbarOwnProps = {
  /** Accessible name for the toolbar — what a screen reader calls the group. */
  label: string;
  /** Which way the controls run. */
  orientation?: 'horizontal' | 'vertical';
  /**
   * `default` is an attached bar on the container fill; `floating` is the
   * glass pill for controls hovering over content — position it with your own
   * layout (the component never fixes itself to the viewport).
   */
  variant?: 'default' | 'floating';
  /** The toolbar's controls — group unrelated clusters with `ToolbarSeparator`. */
  children?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
};

export interface ToolbarProps
  extends ToolbarOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof ToolbarOwnProps> {}

/**
 * Toolbar — a grouped strip of controls sharing one shell: buttons, toggles,
 * segmented controls, separated into clusters. Announces as `role="toolbar"`
 * and moves focus with the arrow keys (Home/End jump to the ends), following
 * the toolbar keyboard pattern, while every control keeps its natural tab
 * stop.
 *
 * The `floating` variant is the glass pill for controls that hover over
 * content — a canvas's zoom cluster, a stage's own instruments. The shell is
 * unpositioned by design; the consumer's layout decides where it floats.
 */
export const Toolbar = React.forwardRef<HTMLDivElement, ToolbarProps>(
  (
    {
      label,
      orientation = 'horizontal',
      variant = 'default',
      children,
      className = '',
      onKeyDown,
      ...rest
    },
    ref,
  ) => {
    const baseClass = 'ds-toolbar';
    const rootRef = useRef<HTMLDivElement | null>(null);

    /** Keep the internal ref (used by arrow-key focus) while honouring a forwarded one. */
    const setRootRef = (node: HTMLDivElement | null) => {
      rootRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(e);
      if (e.defaultPrevented || !rootRef.current) return;

      const nextKey = orientation === 'vertical' ? 'ArrowDown' : 'ArrowRight';
      const prevKey = orientation === 'vertical' ? 'ArrowUp' : 'ArrowLeft';
      if (e.key !== nextKey && e.key !== prevKey && e.key !== 'Home' && e.key !== 'End') return;

      const items = getFocusable(rootRef.current);
      const current = items.indexOf(document.activeElement as HTMLElement);
      // Arrow keys only steer between the toolbar's own controls; a control
      // with internal arrow behaviour (a segmented control's tabs) keeps its
      // keys by calling preventDefault before the event bubbles here.
      if (items.length === 0 || current === -1) return;

      e.preventDefault();
      const target =
        e.key === 'Home'
          ? 0
          : e.key === 'End'
            ? items.length - 1
            : e.key === nextKey
              ? (current + 1) % items.length
              : (current - 1 + items.length) % items.length;
      items[target].focus();
    };

    const classes = [
      baseClass,
      `${baseClass}--${orientation}`,
      `${baseClass}--${variant}`,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div
        {...rest}
        ref={setRootRef}
        className={classes}
        role="toolbar"
        aria-label={label}
        aria-orientation={orientation}
        onKeyDown={handleKeyDown}
      >
        {children}
      </div>
    );
  },
);

Toolbar.displayName = 'Toolbar';

/** A hairline divider between a Toolbar's control clusters. */
export const ToolbarSeparator = () => (
  <span className="ds-toolbar__separator" aria-hidden="true" />
);
