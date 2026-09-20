'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MOTION_HOVER_HIDE_DELAY_MS } from '../../tokens/motion';
import './Popover.css';

export interface PopoverProps {
  /** Trigger element */
  children: React.ReactNode;
  /** Popover content */
  content: React.ReactNode;
  /** Component size */
  size?: 'default' | 'compact';
  /** Preferred position */
  position?: 'top' | 'bottom' | 'left' | 'right';
  /** Trigger mode */
  trigger?: 'click' | 'hover';
  /** Whether the popover is open (controlled mode) */
  open?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Accessible label for the trigger */
  ariaLabel?: string;
  /** Additional CSS classes for the popover panel */
  className?: string;
}

/**
 * Popover component for contextual overlays.
 * Wraps a trigger element and displays content in a
 * positioned panel. Supports click and hover triggers
 * with automatic outside-click dismissal.
 */
/**
 * Whether an element may legally carry aria-expanded / aria-haspopup.
 * Intrinsic tags are checked against the interactive set; a custom component
 * is assumed to render a real control (every component in this library
 * spreads unrecognised props onto its primary node).
 */
const INTERACTIVE_TAGS = new Set(['button', 'a', 'input', 'select', 'textarea', 'summary']);
const canCarryPopoverSemantics = (el: React.ReactElement): boolean =>
  typeof el.type === 'string' ? INTERACTIVE_TAGS.has(el.type) : true;

export const Popover = ({
  children,
  content,
  size = 'default',
  position = 'bottom',
  trigger = 'click',
  open: controlledOpen,
  onOpenChange,
  ariaLabel,
  className = '',
}: PopoverProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  const setOpen = useCallback((next: boolean) => {
    if (!isControlled) {
      setInternalOpen(next);
    }
    onOpenChange?.(next);
  }, [isControlled, onOpenChange]);

  useEffect(() => {
    return () => clearTimeout(hoverTimeoutRef.current);
  }, []);

  // Click outside to close
  useEffect(() => {
    if (!isOpen || trigger !== 'click') return;

    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, trigger, setOpen]);

  // Escape key to close
  useEffect(() => {
    if (!isOpen) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, setOpen]);

  const handleClick = () => {
    if (trigger === 'click') {
      setOpen(!isOpen);
    }
  };

  const handleMouseEnter = () => {
    if (trigger === 'hover') {
      clearTimeout(hoverTimeoutRef.current);
      setOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (trigger === 'hover') {
      hoverTimeoutRef.current = setTimeout(() => setOpen(false), MOTION_HOVER_HIDE_DELAY_MS);
    }
  };

  const baseClass = 'ds-popover';
  const sizeClass = `${baseClass}--${size}`;
  const positionClass = `${baseClass}__panel--${position}`;
  const openClass = isOpen ? `${baseClass}__panel--open` : '';

  const containerClasses = [baseClass, className].filter(Boolean).join(' ');
  const panelClasses = [`${baseClass}__panel`, sizeClass, positionClass, openClass]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={containerClasses}
      ref={containerRef}
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
      <div className={`${baseClass}__trigger`} onClick={handleClick}>
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
};
