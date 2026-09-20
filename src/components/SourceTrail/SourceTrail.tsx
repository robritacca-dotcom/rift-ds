'use client';

import React, { useCallback, useId, useState } from 'react';
import { SourceChip } from '../SourceChip/SourceChip';
import { Spinner } from '../Spinner/Spinner';
import './SourceTrail.css';
import '../../fonts/material-symbols.css';

export type SourceTrailStatus = 'pending' | 'active' | 'done';

/** The glyph beside a settled row — the active row shows a spinner instead. */
const STATUS_ICONS: Record<Exclude<SourceTrailStatus, 'active'>, string> = {
  pending: 'circle',
  done: 'check_circle',
};

/** Announced to screen readers alongside each source's title. */
const STATUS_TEXT: Record<SourceTrailStatus, string> = {
  pending: 'Not opened yet',
  active: 'Reading now',
  done: 'Read',
};

/** One source the agent opened while answering. */
export interface SourceTrailItem {
  /** The source name, passed through to the row's SourceChip. */
  title: string;
  /** Optional link to the source — the chip renders as an anchor. */
  href?: string;
  /** Leading icon for the chip — a Material Symbol name (string) or custom element (ReactNode). */
  icon?: string | React.ReactNode;
  /** Where the visit has got to. Drives the row's indicator; defaults to done. */
  status?: SourceTrailStatus;
  /** Supporting line, e.g. what the source contributed to the answer. */
  detail?: string;
}

/** Props owned by SourceTrail itself — everything else falls through to the root element. */
type SourceTrailOwnProps = {
  /** The sources, in the order the agent opened them. */
  items: SourceTrailItem[];
  /**
   * Header text. Left unset, it is computed from the items —
   * "Reading 3 sources" while any is still pending or active,
   * "Read 3 sources" once every visit has settled.
   */
  title?: string;
  /** Still researching: newly appended rows animate in. */
  streaming?: boolean;
  /** Open state for controlled use. Pair with `onOpenChange`. */
  open?: boolean;
  /** Open state for uncontrolled use. */
  defaultOpen?: boolean;
  /** Fires whenever the panel opens or closes. */
  onOpenChange?: (open: boolean) => void;
  /** Additional CSS classes */
  className?: string;
};

export interface SourceTrailProps
  extends SourceTrailOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof SourceTrailOwnProps> {}

/**
 * SourceTrail is the research trail under an agent's answer: the sources it
 * opened, in order, each with a status and an optional note on what it
 * contributed. SourceChip is the atom; this is the list — a count header
 * with a disclosure, so a long trail collapses to one line.
 *
 * While `streaming`, appended rows animate in (pure CSS, so the global
 * reduced-motion guard covers it) and the active row carries a spinner.
 */
export const SourceTrail = React.forwardRef<HTMLDivElement, SourceTrailProps>(
  (
    {
      items,
      title,
      streaming = false,
      open,
      defaultOpen = true,
      onOpenChange,
      className = '',
      ...rest
    },
    ref,
  ) => {
    const baseClass = 'ds-source-trail';
    const id = useId();
    const panelId = `${id}-panel`;
    const triggerId = `${id}-trigger`;

    const isControlled = open !== undefined;
    const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
    const isOpen = isControlled ? open : uncontrolledOpen;

    const toggle = useCallback(() => {
      const next = !isOpen;
      if (!isControlled) setUncontrolledOpen(next);
      onOpenChange?.(next);
    }, [isOpen, isControlled, onOpenChange]);

    const unsettled = items.some(
      (item) => item.status === 'pending' || item.status === 'active',
    );
    const count = items.length;
    const heading =
      title ??
      (unsettled || streaming
        ? `Reading ${count} source${count === 1 ? '' : 's'}`
        : `Read ${count} source${count === 1 ? '' : 's'}`);

    const classes = [
      baseClass,
      isOpen ? `${baseClass}--open` : '',
      streaming ? `${baseClass}--streaming` : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div {...rest} ref={ref} className={classes}>
        <button
          type="button"
          id={triggerId}
          className={`${baseClass}__header`}
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={toggle}
        >
          <span className={`${baseClass}__indicator`} aria-hidden="true">
            {unsettled || streaming ? (
              <Spinner size="sm" variant="inherit" />
            ) : (
              <span className="material-symbols-rounded">travel_explore</span>
            )}
          </span>
          <span className={`${baseClass}__heading`}>{heading}</span>
          <span className={`${baseClass}__chevron material-symbols-rounded`} aria-hidden="true">
            expand_more
          </span>
        </button>

        <div
          className={`${baseClass}__panel`}
          id={panelId}
          role="region"
          aria-labelledby={triggerId}
        >
          <ol className={`${baseClass}__list`}>
            {items.map((item, index) => {
              const status = item.status ?? 'done';
              return (
                <li
                  key={`${item.title}-${index}`}
                  className={`${baseClass}__row ${baseClass}__row--${status}`}
                >
                  <span className={`${baseClass}__row-indicator`} aria-hidden="true">
                    {status === 'active' ? (
                      <Spinner size="sm" variant="inherit" />
                    ) : (
                      <span className="material-symbols-rounded">{STATUS_ICONS[status]}</span>
                    )}
                  </span>
                  <SourceChip
                    title={item.title}
                    href={item.href}
                    icon={item.icon}
                    target={item.href ? '_blank' : undefined}
                    rel={item.href ? 'noopener noreferrer' : undefined}
                  />
                  {item.detail && (
                    <span className={`${baseClass}__detail`}>{item.detail}</span>
                  )}
                  <span className={`${baseClass}__sr`}>{STATUS_TEXT[status]}</span>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    );
  },
);

SourceTrail.displayName = 'SourceTrail';
