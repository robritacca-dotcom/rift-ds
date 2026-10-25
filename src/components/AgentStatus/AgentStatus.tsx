'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { AgentStatusPattern, AgentStatusState } from './AgentStatusPatterns';
import './AgentStatus.css';

/** The dot grid — 12 cells, row-major. CSS owns which cell lights when. */
const DOT_COUNT = 12;

/** Fallback copy per state, used when no `label` is given. */
const DEFAULT_LABELS: Record<AgentStatusState, string> = {
  idle: 'Idle',
  thinking: 'Thinking',
  working: 'Working',
  waiting: 'Waiting for you',
  done: 'Done',
  error: 'Failed',
};

/** States where the matrix animates and the label may shimmer. */
const ACTIVE_STATES: readonly AgentStatusState[] = ['thinking', 'working', 'waiting'];

/** Props owned by AgentStatus itself — everything else falls through to the root element. */
type AgentStatusOwnProps = {
  /** What the agent is doing. Drives the colour, the default label, and whether the matrix animates. */
  state?: AgentStatusState;
  /** Status text. Falls back to a default for the state. Ignored when `children` are given. */
  label?: string;
  /** Which dot-matrix choreography to run. */
  pattern?: AgentStatusPattern;
  /**
   * Sweep a highlight across the label while the agent is active. Defaults to
   * on for `thinking`, `working` and `waiting`, off for the resting states.
   */
  shimmer?: boolean;
  /**
   * Indicator and text scale, paired with ChatMessage's sizes: `default`
   * matches default message text, `compact` matches compact message text.
   * `sm` and `md` are legacy aliases for `compact` and `default`.
   */
  size?: 'default' | 'compact' | 'sm' | 'md';
  /** `inline` sits in a line of content; `bar` is a full-width row for the top of a panel. */
  variant?: 'inline' | 'bar';
  /** Additional CSS classes */
  className?: string;
  /** Status text, when it needs markup the `label` string cannot express. */
  children?: React.ReactNode;
};

export interface AgentStatusProps
  extends AgentStatusOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof AgentStatusOwnProps> {}

/**
 * AgentStatus reports what an agent is doing right now: a dot-matrix indicator
 * beside a line of status text.
 *
 * Colour carries meaning rather than decoration — the three working states are
 * monochrome, and only `waiting`, `done` and `error` take a status colour.
 * The whole thing is one polite live region, so a screen reader hears the state
 * change without the caller wiring anything up.
 */
export const AgentStatus = React.forwardRef<HTMLDivElement, AgentStatusProps>(
  (
    {
      state = 'thinking',
      label,
      pattern = 'orbit',
      shimmer,
      size = 'default',
      variant = 'inline',
      className = '',
      children,
      ...rest
    },
    ref,
  ) => {
    const baseClass = 'ds-agent-status';
    const isActive = ACTIVE_STATES.includes(state);
    const isShimmering = shimmer ?? isActive;
    // Legacy aliases: sm/md predate the chat set settling on ChatMessage's names.
    const resolvedSize = size === 'sm' ? 'compact' : size === 'md' ? 'default' : size;

    /* When the label string changes, the old text fades up and out while
       the new one fades up and in — a status that narrates progress should
       glide between steps, not snap. Only string labels transition;
       `children` are consumer-owned markup and render as-is. */
    const resolvedLabel = label ?? DEFAULT_LABELS[state];
    const [outgoing, setOutgoing] = useState<string | null>(null);
    const lastLabel = useRef(resolvedLabel);
    useEffect(() => {
      if (children != null) return;
      if (lastLabel.current !== resolvedLabel) {
        setOutgoing(lastLabel.current);
        lastLabel.current = resolvedLabel;
      }
    }, [resolvedLabel, children]);
    const isSwapping = outgoing !== null;

    const classes = [
      baseClass,
      `${baseClass}--${state}`,
      `${baseClass}--${pattern}`,
      `${baseClass}--${resolvedSize}`,
      `${baseClass}--${variant}`,
      isActive ? `${baseClass}--animated` : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div {...rest} ref={ref} className={classes} role="status">
        <span className={`${baseClass}__matrix`} aria-hidden="true">
          {Array.from({ length: DOT_COUNT }, (_, i) => (
            <span key={i} className={`${baseClass}__dot`} />
          ))}
        </span>
        <span
          className={`${baseClass}__label${
            isShimmering ? ` ${baseClass}__label--shimmer` : ''
          }${isSwapping ? ` ${baseClass}__label--swapping` : ''}`}
        >
          {children ?? (
            <>
              {isSwapping && (
                <span
                  className={`${baseClass}__label-text ${baseClass}__label-text--out`}
                  aria-hidden="true"
                >
                  {outgoing}
                </span>
              )}
              <span
                key={resolvedLabel}
                className={`${baseClass}__label-text${
                  isSwapping ? ` ${baseClass}__label-text--in` : ''
                }`}
                onAnimationEnd={(e) => {
                  if (e.target === e.currentTarget) setOutgoing(null);
                }}
              >
                {resolvedLabel}
              </span>
            </>
          )}
        </span>
      </div>
    );
  },
);

AgentStatus.displayName = 'AgentStatus';

/** The mark's square grid: 4x4, row-major. CSS owns which cell lights when. */
const MARK_DOT_COUNT = 16;

/** Props owned by AgentStatusMark itself — everything else falls through to the <span>. */
type AgentStatusMarkOwnProps = {
  /** What the agent is doing. Drives the colour and whether the dots animate, as on AgentStatus. */
  state?: AgentStatusState;
  /** Additional CSS classes */
  className?: string;
};

export interface AgentStatusMarkProps
  extends AgentStatusMarkOwnProps,
    Omit<React.ComponentPropsWithoutRef<'span'>, keyof AgentStatusMarkOwnProps | 'children'> {}

/**
 * AgentStatus's dots at icon size, for an icon slot: a square 4x4 grid sized
 * by `--icon-size`, drawn inside a Material Symbol's live area, so it swaps
 * with a glyph without moving or outgrowing it. The dots orbit the edge in
 * AgentStatus's cycle and colours. AiButton's status is the first host.
 * Hidden from assistive technology; the host announces the state.
 */
export const AgentStatusMark = React.forwardRef<HTMLSpanElement, AgentStatusMarkProps>(
  ({ state = 'working', className = '', ...rest }, ref) => {
    const baseClass = 'ds-agent-status-mark';
    const classes = [
      baseClass,
      `${baseClass}--${state}`,
      ACTIVE_STATES.includes(state) ? `${baseClass}--animated` : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');
    return (
      <span aria-hidden="true" {...rest} ref={ref} className={classes}>
        {Array.from({ length: MARK_DOT_COUNT }, (_, i) => (
          <span key={i} className={`${baseClass}__dot`} />
        ))}
      </span>
    );
  },
);

AgentStatusMark.displayName = 'AgentStatusMark';
