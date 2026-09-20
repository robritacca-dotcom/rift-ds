'use client';

import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import './Reasoning.css';
import '../../fonts/material-symbols.css';

/** Props owned by Reasoning itself — everything else falls through to the root element. */
type ReasoningOwnProps = {
  /** The model is still producing the trace. Opens the panel and shimmers the summary. */
  streaming?: boolean;
  /** Seconds spent reasoning, shown in the summary once complete. */
  duration?: number;
  /** Override the summary line. By default it reports the streaming state and the duration. */
  label?: string;
  /**
   * Replace the summary text with custom content — typically an AgentStatus,
   * pairing the live indicator with the trace disclosure. The node owns its
   * own appearance and announcement, so Reasoning's shimmer and live region
   * stand down.
   */
  summary?: React.ReactNode;
  /**
   * Render the summary line alone, with no chevron, no trigger, and no
   * panel — for a model that reports what it is doing but produces no trace
   * to read. A disclosure that opens onto nothing is a promise the component
   * cannot keep, so it stops being one.
   */
  summaryOnly?: boolean;
  /**
   * Text scale, paired with ChatMessage's sizes: `default` matches default
   * message text, `compact` matches compact message text.
   */
  size?: 'default' | 'compact';
  /** Open state for controlled use. Pair with `onOpenChange`. */
  open?: boolean;
  /** Open state for uncontrolled use. Defaults to open while `streaming`. */
  defaultOpen?: boolean;
  /** Fires whenever the panel opens or closes, from a click or from the stream ending. */
  onOpenChange?: (open: boolean) => void;
  /** Additional CSS classes */
  className?: string;
  /** The reasoning trace. */
  children?: React.ReactNode;
};

export interface ReasoningProps
  extends ReasoningOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof ReasoningOwnProps> {}

/**
 * Reasoning discloses a model's thinking without letting it dominate the
 * response: open while the trace streams in, collapsed to a one-line summary
 * once it finishes.
 *
 * The auto-collapse yields to the reader — once someone has toggled the panel
 * themselves, the stream ending no longer closes it.
 *
 * Only the summary line is a live region. A trace announced token by token
 * floods a screen reader, so the body is ordinary expandable content and the
 * announcement covers the boundaries: thinking, then thought for so long.
 */
export const Reasoning = React.forwardRef<HTMLDivElement, ReasoningProps>(
  (
    {
      streaming = false,
      duration,
      label,
      summary,
      summaryOnly = false,
      size = 'default',
      open,
      defaultOpen,
      onOpenChange,
      className = '',
      children,
      ...rest
    },
    ref,
  ) => {
    const baseClass = 'ds-reasoning';
    const id = useId();
    const panelId = `${id}-panel`;
    const triggerId = `${id}-trigger`;

    const isControlled = open !== undefined;
    const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen ?? streaming);
    const isOpen = isControlled ? open : uncontrolledOpen;

    /* The live→done handoff: when a node summary (an AgentStatus) is
       removed, it fades out in place while the text summary slides left
       into the position the indicator vacated. Consumers just drop the
       `summary` prop; the transition is the component's job. */
    const [leaving, setLeaving] = useState<React.ReactNode>(null);
    const prevSummary = useRef<React.ReactNode>(summary);
    useEffect(() => {
      if (prevSummary.current != null && summary == null) {
        setLeaving(prevSummary.current);
      }
      prevSummary.current = summary;
    }, [summary]);

    /* Once the reader has taken a position on the panel, stop moving it for them */
    const readerDecided = useRef(false);
    const wasStreaming = useRef(streaming);

    useEffect(() => {
      if (streaming === wasStreaming.current) return;
      wasStreaming.current = streaming;
      if (readerDecided.current) return;

      if (!isControlled) setUncontrolledOpen(streaming);
      onOpenChange?.(streaming);
    }, [streaming, isControlled, onOpenChange]);

    const toggle = useCallback(() => {
      readerDecided.current = true;
      const next = !isOpen;
      if (!isControlled) setUncontrolledOpen(next);
      onOpenChange?.(next);
    }, [isOpen, isControlled, onOpenChange]);

    const summaryText =
      label ??
      (streaming
        ? 'Thinking'
        : duration !== undefined
          ? `Thought for ${duration}s`
          : 'Thought process');

    const classes = [
      baseClass,
      `${baseClass}--${size}`,
      isOpen ? `${baseClass}--open` : '',
      streaming ? `${baseClass}--streaming` : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const summaryLine = (
      <span
        className={`${baseClass}__summary${summary ? ` ${baseClass}__summary--node` : ''}${
          leaving != null && summary == null ? ` ${baseClass}__summary--entering` : ''
        }`}
        role={summary ? undefined : 'status'}
        onAnimationEnd={(e) => {
          if (e.target === e.currentTarget) setLeaving(null);
        }}
      >
        {leaving != null && summary == null && (
          <span className={`${baseClass}__summary-leaving`} aria-hidden="true">
            {leaving}
          </span>
        )}
        {summary ?? summaryText}
      </span>
    );

    /* Summary-only keeps the trigger class, so the line sits in exactly the
       same place as it would in a real disclosure — a trace arriving mid
       response promotes it without moving anything. */
    if (summaryOnly) {
      return (
        <div {...rest} ref={ref} className={classes}>
          <span className={`${baseClass}__trigger ${baseClass}__trigger--static`}>
            {summaryLine}
          </span>
        </div>
      );
    }

    return (
      <div {...rest} ref={ref} className={classes}>
        <button
          type="button"
          id={triggerId}
          className={`${baseClass}__trigger`}
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={toggle}
        >
          {summaryLine}
          <span className={`${baseClass}__chevron material-symbols-rounded`} aria-hidden="true">
            expand_more
          </span>
        </button>

        <div className={`${baseClass}__panel`} id={panelId} role="region" aria-labelledby={triggerId}>
          <div className={`${baseClass}__content`}>{children}</div>
        </div>
      </div>
    );
  },
);

Reasoning.displayName = 'Reasoning';
