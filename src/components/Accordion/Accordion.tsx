'use client';

import React, { useState, useCallback } from 'react';
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

export interface AccordionProps {
  /** List of accordion items */
  items: AccordionItem[];
  /** Allow multiple items open at once */
  multiple?: boolean;
  /** IDs of initially expanded items */
  defaultExpanded?: string[];
  /** Additional CSS classes */
  className?: string;
}

/**
 * Accordion organises content into collapsible sections.
 * Supports single or multiple open panels.
 */
export const Accordion = ({
  items,
  multiple = false,
  defaultExpanded = [],
  className = '',
}: AccordionProps) => {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(defaultExpanded));
  const baseClass = 'ds-accordion';
  const classes = [baseClass, className].filter(Boolean).join(' ');

  const toggle = useCallback(
    (id: string) => {
      setExpanded((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          if (!multiple) next.clear();
          next.add(id);
        }
        return next;
      });
    },
    [multiple],
  );

  return (
    <div className={classes}>
      {items.map((item) => {
        const isOpen = expanded.has(item.id);
        return (
          <div
            key={item.id}
            className={`${baseClass}__item${isOpen ? ` ${baseClass}__item--open` : ''}`}
          >
            <button
              type="button"
              className={`${baseClass}__trigger`}
              aria-expanded={isOpen}
              aria-controls={`${baseClass}-panel-${item.id}`}
              id={`${baseClass}-header-${item.id}`}
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
            <div
              id={`${baseClass}-panel-${item.id}`}
                            aria-labelledby={`${baseClass}-header-${item.id}`}
              className={`${baseClass}__panel`}
            >
              <div className={`${baseClass}__content`}>{item.content}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
