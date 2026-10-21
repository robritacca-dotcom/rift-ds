'use client';

import React, { useState, useId } from 'react';
import './Accordion.css';
import '../../fonts/material-symbols.css';

export interface AccordionItem {
  /** Unique identifier */
  id: string;
  /** Header text */
  title: string;
  /** Body content */
  content: React.ReactNode;
}

/** Props owned by Accordion itself — everything else falls through to the wrapper. */
type AccordionOwnProps = {
  /** List of accordion items */
  items: AccordionItem[];
  /** Allow multiple items open at once */
  multiple?: boolean;
  /**
   * IDs of the expanded items, for a controlled accordion. Leave it undefined
   * to let the component keep its own open state, seeded from
   * `defaultExpanded`.
   */
  expanded?: string[];
  /** IDs of initially expanded items when the accordion is uncontrolled */
  defaultExpanded?: string[];
  /** Called with the IDs of the expanded items after the user opens or closes one */
  onExpandedChange?: (expanded: string[]) => void;
  /** Additional CSS classes */
  className?: string;
};

export interface AccordionProps
  extends AccordionOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof AccordionOwnProps | 'children'> {}

/**
 * Accordion organises content into collapsible sections.
 * Supports single or multiple open panels.
 *
 * Forwards a ref to the wrapping element and spreads unrecognised props onto
 * it.
 */
export const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(
  (
    {
      items,
      multiple = false,
      expanded,
      defaultExpanded = [],
      onExpandedChange,
      className = '',
      ...rest
    },
    ref,
  ) => {
    const isControlled = expanded !== undefined;
    const [internalExpanded, setInternalExpanded] = useState<string[]>(defaultExpanded);
    const openIds = isControlled ? expanded : internalExpanded;
    // Header and panel ids are scoped to this instance, so two accordions
    // whose items share ids never point at each other's panels.
    const instanceId = useId();
    const baseClass = 'ds-accordion';
    const classes = [baseClass, className].filter(Boolean).join(' ');

    const toggle = (id: string) => {
      const next = openIds.includes(id)
        ? openIds.filter((openId) => openId !== id)
        : multiple
          ? [...openIds, id]
          : [id];
      if (!isControlled) setInternalExpanded(next);
      onExpandedChange?.(next);
    };

    return (
      <div {...rest} ref={ref} className={classes}>
        {items.map((item) => {
          const isOpen = openIds.includes(item.id);
          const headerId = `${instanceId}-header-${item.id}`;
          const panelId = `${instanceId}-panel-${item.id}`;
          return (
            <div
              key={item.id}
              className={`${baseClass}__item${isOpen ? ` ${baseClass}__item--open` : ''}`}
            >
              <button
                type="button"
                className={`${baseClass}__trigger`}
                aria-expanded={isOpen}
                aria-controls={panelId}
                id={headerId}
                onClick={() => toggle(item.id)}
              >
                <span className={`${baseClass}__title`}>{item.title}</span>
                <span
                  className={`${baseClass}__icon material-symbols-rounded`}
                  aria-hidden="true"
                >
                  expand_more
                </span>
              </button>
              {/* A closed panel is still laid out (its rows collapse to zero for
                  the transition), so `inert` takes its content out of the tab
                  order and the accessibility tree until it opens. */}
              <div
                id={panelId}
                aria-labelledby={headerId}
                className={`${baseClass}__panel`}
                inert={!isOpen}
              >
                <div className={`${baseClass}__content`}>{item.content}</div>
              </div>
            </div>
          );
        })}
      </div>
    );
  },
);

Accordion.displayName = 'Accordion';
