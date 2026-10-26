'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLayer } from '../../behaviors/useLayer';
import { useAnchoredPosition } from '../../behaviors/useAnchoredPosition';
import { MOTION_HOVER_HIDE_DELAY_MS } from '../../tokens/motion';
import './Popover.css';

type PopoverOwnProps = {
  /** Trigger element */
  children: React.ReactNode;
  /**
   * Popover content. Replaces the native `content` attribute, which only
   * means something on a `<meta>` element.
   */
  content: React.ReactNode;
  /** Component size */
  size?: 'default' | 'compact';
  /**
   * The panel's surface. `panel` (the default) is the content panel: a
   * 16px inset and the container border. `menu` is DropdownMenu's own
   * surface (its 4px inset, input border and corner), for a popover that
   * sits among menus and should read as one of them, such as a table
   * toolbar's sort or column panel.
   */
  surface?: 'panel' | 'menu';
  /** Preferred position. `left` and `right` are screen sides; `start` and `end` follow the reading direction, so `end` opens to the right in English and to the left in Arabic. */
  position?: 'top' | 'bottom' | 'left' | 'right' | 'start' | 'end';
  /** Trigger mode */
  trigger?: 'click' | 'hover';
  /** Whether the popover is open (controlled mode) */
  open?: boolean;
  /** Whether the popover starts open when uncontrolled */
  defaultOpen?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Accessible label for the trigger and the panel; the panel is named "Popover" when it is omitted */
  ariaLabel?: string;
  /** Additional CSS classes for the popover's root wrapper, which holds the trigger and the panel */
  className?: string;
};

export interface PopoverProps
  extends PopoverOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof PopoverOwnProps> {}

/**
 * Whether an element may legally carry aria-expanded / aria-haspopup.
 * Intrinsic tags are checked against the interactive set; a custom component
 * is assumed to render a real control (every component in this library
 * spreads unrecognised props onto its primary node).
 */
const INTERACTIVE_TAGS = new Set(['button', 'a', 'input', 'select', 'textarea', 'summary']);
const canCarryPopoverSemantics = (el: React.ReactElement): boolean =>
  typeof el.type === 'string' ? INTERACTIVE_TAGS.has(el.type) : true;

/**
 * Popover component for contextual overlays.
 * Wraps a trigger element and displays content in a
 * positioned panel. Supports click and hover triggers.
 * Dismissal goes through the shared layer stack (src/behaviors/useLayer):
 * Escape closes it before anything beneath it, and in click mode a press
 * outside closes it without closing a Dialog it sits in.
 */
export const Popover = React.forwardRef<HTMLDivElement, PopoverProps>(
  (
    {
      children,
      content,
      size = 'default',
      surface = 'panel',
      position = 'bottom',
      trigger = 'click',
      open: controlledOpen,
      defaultOpen = false,
      onOpenChange,
      ariaLabel,
      className = '',
      onMouseEnter,
      onMouseLeave,
      ...rest
    },
    ref,
  ) => {
    const [internalOpen, setInternalOpen] = useState(defaultOpen);
    const containerRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

    const setContainerRef = (node: HTMLDivElement | null) => {
      containerRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    };

    const isControlled = controlledOpen !== undefined;
    const isOpen = isControlled ? controlledOpen : internalOpen;

    const setOpen = useCallback(
      (next: boolean) => {
        if (!isControlled) {
          setInternalOpen(next);
        }
        onOpenChange?.(next);
      },
      [isControlled, onOpenChange],
    );

    useEffect(() => {
      return () => clearTimeout(hoverTimeoutRef.current);
    }, []);

    useLayer({
      open: isOpen,
      onDismiss: () => setOpen(false),
      dismissOnOutsidePress: trigger === 'click',
      getElements: () => [containerRef.current],
    });

    const handleClick = () => {
      if (trigger === 'click') {
        setOpen(!isOpen);
      }
    };

    const handleMouseEnter = (event: React.MouseEvent<HTMLDivElement>) => {
      onMouseEnter?.(event);
      if (trigger === 'hover') {
        clearTimeout(hoverTimeoutRef.current);
        setOpen(true);
      }
    };

    const handleMouseLeave = (event: React.MouseEvent<HTMLDivElement>) => {
      onMouseLeave?.(event);
      if (trigger === 'hover') {
        hoverTimeoutRef.current = setTimeout(() => setOpen(false), MOTION_HOVER_HIDE_DELAY_MS);
      }
    };

    // The panel is placed against the trigger by the shared anchored-position
    // behaviour: fixed, so a scroll container cannot clip it, on the preferred
    // side, flipped when that side has no room, and shifted to stay on screen.
    useAnchoredPosition({
      open: isOpen,
      anchorRef: triggerRef,
      panelRef,
      side: position,
      align: 'start',
      gapProperty: '--gap-050',
    });

    const baseClass = 'ds-popover';
    const sizeClass = `${baseClass}--${size}`;
    const positionClass = `${baseClass}__panel--${position}`;
    const openClass = isOpen ? `${baseClass}__panel--open` : '';

    const containerClasses = [baseClass, className].filter(Boolean).join(' ');
    const surfaceClass = surface === 'menu' ? `${baseClass}__panel--menu` : '';
    const panelClasses = [`${baseClass}__panel`, sizeClass, surfaceClass, positionClass, openClass]
      .filter(Boolean)
      .join(' ');

    return (
      <div
        {...rest}
        className={containerClasses}
        ref={setContainerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/*
          The trigger content is consumer-supplied and is normally already a
          control. Putting role="button" on the wrapper nested one interactive
          element inside another — instead, clone the popover semantics onto the
          real control, and only synthesise a button when there is nothing to
          clone onto.
        */}
        <div ref={triggerRef} className={`${baseClass}__trigger`} onClick={handleClick}>
          {React.isValidElement(children) && canCarryPopoverSemantics(children) ? (
            React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
              'aria-expanded': isOpen,
              'aria-haspopup': 'dialog',
              ...(ariaLabel ? { 'aria-label': ariaLabel } : {}),
            })
          ) : trigger === 'click' ? (
            <button
              type="button"
              aria-expanded={isOpen}
              aria-haspopup="dialog"
              aria-label={ariaLabel}
            >
              {children}
            </button>
          ) : (
            children
          )}
        </div>

        <div
          ref={panelRef}
          className={panelClasses}
          role="dialog"
          // role="dialog" requires an accessible name.
          aria-label={ariaLabel || 'Popover'}
          aria-hidden={!isOpen}
        >
          {content}
        </div>
      </div>
    );
  },
);

Popover.displayName = 'Popover';
