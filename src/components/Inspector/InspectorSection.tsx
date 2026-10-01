'use client';

import React, { useState } from 'react';
import './Inspector.css';
import '../../fonts/material-symbols.css';

/** Props owned by InspectorSection itself — everything else falls through to the <section>. */
type InspectorSectionOwnProps = {
  /** The section's heading, shown on its header row. Not the native tooltip `title` attribute. */
  title: string;
  /** Whether the section is expanded (controlled). Pair with `onOpenChange`. */
  open?: boolean;
  /** Whether an uncontrolled section starts expanded. */
  defaultOpen?: boolean;
  /** Called with the next expanded state when the header is pressed. */
  onOpenChange?: (open: boolean) => void;
  /** The section's controls, stacked one rhythm apart. */
  children?: React.ReactNode;
  /** Additional CSS classes, applied to the <section>. */
  className?: string;
};

export interface InspectorSectionProps
  extends InspectorSectionOwnProps,
    Omit<React.ComponentPropsWithoutRef<'section'>, keyof InspectorSectionOwnProps> {}

/**
 * A collapsible, titled run of inspector controls: the header row toggles
 * it, and stacked sections are divided by a hairline. The general-purpose
 * counterpart, a bordered set of content panels, is Accordion.
 *
 * Two behaviours separate it from Accordion. The body clips only while
 * closed or animating, and goes `overflow: visible` once settled open, so
 * a Dropdown menu inside can open past the section's edge. And a closed
 * body is `inert`, so its controls leave the tab order rather than sitting
 * focusable at zero height. Forwards a ref to the <section> and spreads
 * unrecognised props onto it.
 */
export const InspectorSection = React.forwardRef<HTMLElement, InspectorSectionProps>(
  (
    { title, open, defaultOpen = false, onOpenChange, children, className = '', ...rest },
    ref,
  ) => {
    const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
    const isOpen = open ?? uncontrolledOpen;
    /* True once the open animation has finished. transitionend fires even
       under reduced motion, whose guard shortens durations to 0.01ms
       rather than zero, so this always lands. */
    const [settled, setSettled] = useState(isOpen);
    const baseId = React.useId();
    const panelId = `${baseId}-panel`;
    const headerId = `${baseId}-header`;

    const toggle = () => {
      const next = !isOpen;
      setSettled(false);
      if (open === undefined) setUncontrolledOpen(next);
      onOpenChange?.(next);
    };

    const classes = [
      'ds-inspector-section',
      isOpen ? 'ds-inspector-section--open' : '',
      isOpen && settled ? 'ds-inspector-section--settled' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <section {...rest} ref={ref} className={classes}>
        <button
          type="button"
          id={headerId}
          className="ds-inspector-section__trigger"
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={toggle}
        >
          <span>{title}</span>
          <span
            className="ds-inspector-section__icon material-symbols-rounded"
            aria-hidden="true"
          >
            expand_more
          </span>
        </button>
        <div
          id={panelId}
          role="region"
          aria-labelledby={headerId}
          className="ds-inspector-section__panel"
          inert={!isOpen}
          onTransitionEnd={(event) => {
            if (event.target !== event.currentTarget) return;
            if (isOpen) setSettled(true);
          }}
        >
          <div className="ds-inspector-section__body">{children}</div>
        </div>
      </section>
    );
  },
);

InspectorSection.displayName = 'InspectorSection';
