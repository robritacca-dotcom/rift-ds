'use client';

import React, { useCallback, useId, useState } from 'react';
import { Spinner } from '../Spinner/Spinner';
import './ToolCall.css';
import '../../fonts/material-symbols.css';

export type ToolCallStatus = 'pending' | 'running' | 'success' | 'error';

/** Fallback status text, used when no `statusLabel` is given. */
const DEFAULT_STATUS_LABELS: Record<ToolCallStatus, string> = {
  pending: 'Needs approval',
  running: 'Running',
  success: 'Done',
  error: 'Failed',
};

/** The glyph that stands in for the spinner once the call has settled. */
const STATUS_ICONS: Record<Exclude<ToolCallStatus, 'running'>, string> = {
  pending: 'pause_circle',
  success: 'check_circle',
  error: 'error',
};

/** Props owned by ToolCall itself — everything else falls through to the root element. */
type ToolCallOwnProps = {
  /** The tool that was invoked, shown in monospace. */
  name: string;
  /** Where the call has got to. Drives the colour, the indicator, and the default status text. */
  status?: ToolCallStatus;
  /** One line describing this particular call, e.g. the target path or query. */
  summary?: string;
  /** How long the call took, e.g. "1.2s". Free text, so callers keep their own formatting. */
  duration?: string;
  /** Override the status text shown beside the indicator. */
  statusLabel?: string;
  /** Open state for controlled use. Pair with `onOpenChange`. */
  open?: boolean;
  /** Open state for uncontrolled use. */
  defaultOpen?: boolean;
  /** Fires whenever the panel opens or closes. */
  onOpenChange?: (open: boolean) => void;
  /**
   * Controls for a call awaiting a decision — allow, deny, always allow.
   * Rendered outside the collapsible panel, so approving never requires
   * expanding the call first.
   */
  actions?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** The call's arguments and result. */
  children?: React.ReactNode;
};

export interface ToolCallProps
  extends ToolCallOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof ToolCallOwnProps> {}

/**
 * ToolCall is the record of one tool invocation: what ran, how it went, how
 * long it took, and — behind a disclosure — the arguments it was given and
 * what it returned.
 *
 * A run is mostly a list of these, so the collapsed header carries everything
 * needed to skim it and the body holds everything needed to audit it.
 */
export const ToolCall = React.forwardRef<HTMLDivElement, ToolCallProps>(
  (
    {
      name,
      status = 'success',
      summary,
      duration,
      statusLabel,
      open,
      defaultOpen = false,
      onOpenChange,
      actions,
      className = '',
      children,
      ...rest
    },
    ref,
  ) => {
    const baseClass = 'ds-tool-call';
    const id = useId();
    const panelId = `${id}-panel`;
    const triggerId = `${id}-trigger`;

    const isControlled = open !== undefined;
    const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
    const isOpen = isControlled ? open : uncontrolledOpen;
    const hasPanel = Boolean(children);

    const toggle = useCallback(() => {
      const next = !isOpen;
      if (!isControlled) setUncontrolledOpen(next);
      onOpenChange?.(next);
    }, [isOpen, isControlled, onOpenChange]);

    const classes = [
      baseClass,
      `${baseClass}--${status}`,
      isOpen ? `${baseClass}--open` : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const header = (
      <>
        <span className={`${baseClass}__indicator`} aria-hidden="true">
          {status === 'running' ? (
            <Spinner size="sm" variant="inherit" />
          ) : (
            <span className="material-symbols-rounded">{STATUS_ICONS[status]}</span>
          )}
        </span>

        <span className={`${baseClass}__name`}>{name}</span>
        {summary && <span className={`${baseClass}__summary`}>{summary}</span>}

        <span className={`${baseClass}__status`}>
          {statusLabel ?? DEFAULT_STATUS_LABELS[status]}
        </span>
        {duration && <span className={`${baseClass}__duration`}>{duration}</span>}

        {hasPanel && (
          <span className={`${baseClass}__chevron material-symbols-rounded`} aria-hidden="true">
            expand_more
          </span>
        )}
      </>
    );

    return (
      <div {...rest} ref={ref} className={classes}>
        {hasPanel ? (
          <button
            type="button"
            id={triggerId}
            className={`${baseClass}__header`}
            aria-expanded={isOpen}
            aria-controls={panelId}
            onClick={toggle}
          >
            {header}
          </button>
        ) : (
          <div className={`${baseClass}__header ${baseClass}__header--static`}>{header}</div>
        )}

        {hasPanel && (
          <div
            className={`${baseClass}__panel`}
            id={panelId}
            role="region"
            aria-labelledby={triggerId}
          >
            <div className={`${baseClass}__content`}>{children}</div>
          </div>
        )}

        {actions && <div className={`${baseClass}__actions`}>{actions}</div>}
      </div>
    );
  },
);

ToolCall.displayName = 'ToolCall';
