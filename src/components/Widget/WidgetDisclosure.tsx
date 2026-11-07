'use client';

import React, { useState } from 'react';
import '../../fonts/material-symbols.css';

/** Props owned by WidgetDisclosure itself. */
export interface WidgetDisclosureProps {
  /** The id the header button's region is named from. */
  idBase: string;
  /** The tile's heading, which becomes the button's text. */
  title: string;
  /** The heading element the button sits in. */
  titleAs: 'h2' | 'h3' | 'h4';
  /** The count already written in the tile's locale. */
  count?: string;
  /** The header's trailing slot, kept outside the button. */
  action?: React.ReactNode;
  /** The description paragraph, kept under the heading and outside the button. */
  description?: React.ReactNode;
  /** Whether the section is open (controlled). */
  open?: boolean;
  /** Whether the section starts open (uncontrolled). */
  defaultOpen: boolean;
  /** Called with the new open state. */
  onOpenChange?: (open: boolean) => void;
  /** The body and footer the button shows and hides. */
  children: React.ReactNode;
}

/**
 * The collapsible half of Widget: the header whose title is a disclosure
 * button, and the region it shows and hides. Internal: Widget renders it
 * when `collapsible` is set, so the tile itself stays server-renderable.
 */
export function WidgetDisclosure({
  idBase,
  title,
  titleAs: Title,
  count,
  action,
  description,
  open: openProp,
  defaultOpen,
  onOpenChange,
  children,
}: WidgetDisclosureProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const open = openProp ?? uncontrolledOpen;
  const regionId = `${idBase}-region`;
  const toggle = () => {
    const next = !open;
    if (openProp === undefined) setUncontrolledOpen(next);
    onOpenChange?.(next);
  };
  return (
    <>
      <header className="ds-widget__header">
        <div className="ds-widget__heading">
          <Title className="ds-widget__title">
            <button
              type="button"
              className="ds-widget__toggle"
              aria-expanded={open}
              aria-controls={regionId}
              onClick={toggle}
            >
              <span className="ds-widget__toggle-text">{title}</span>
              {count !== undefined && <span className="ds-widget__count">{count}</span>}
              <span className="ds-widget__chevron material-symbols-rounded" aria-hidden="true">
                expand_more
              </span>
            </button>
          </Title>
          {description}
        </div>
        {action && <span className="ds-widget__action">{action}</span>}
      </header>
      <div className="ds-widget__region" id={regionId} hidden={!open}>
        {children}
      </div>
    </>
  );
}
