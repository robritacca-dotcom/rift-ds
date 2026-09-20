'use client';

import React, { useEffect, useRef } from 'react';
import { useStreamReveal } from './useStreamReveal';
import './StreamingText.css';

export type {
  StreamReveal,
  StreamRevealOptions,
  UseStreamRevealOptions,
} from './useStreamReveal';
/* The generated barrel only walks a component folder's .tsx modules, so an
   engine that only ever lived in a .ts file could never be imported from
   the package root — and the headless engine is a documented escape hatch,
   not an implementation detail. Re-exporting it here is what puts it in
   the barrel. Fast-refresh granularity is the price, and it is not one a
   published library pays: the .ts module underneath is where the code
   actually lives. */
/* eslint-disable react-refresh/only-export-components */
export { createStreamReveal, useStreamReveal } from './useStreamReveal';
/* eslint-enable react-refresh/only-export-components */

/** Props owned by StreamingText itself — everything else falls through to the root span. */
type StreamingTextOwnProps = {
  /**
   * The text received so far. Grow it across renders as chunks arrive; the
   * reveal animates through the appended part. A value that does not extend
   * the previous one is treated as a new message and reveals from the start.
   */
  text: string;
  /**
   * Whether the source is still producing text. Keeps the cursor visible
   * between chunks, when the reveal has caught up but more may arrive.
   */
  streaming?: boolean;
  /**
   * Slowest the reveal ever runs, in characters per second — the pace a
   * thin trickle of chunks types at. Defaults to MOTION_STREAM_FLOOR_CPS.
   */
  floorCps?: number;
  /**
   * However much text is waiting, it is fully on screen within this long,
   * in milliseconds — the rate rises with the backlog. Defaults to
   * MOTION_STREAM_DRAIN_MS.
   */
  drainMs?: number;
  /**
   * The retired interval between reveal steps; when set, its equivalent
   * rate becomes the reveal's floor.
   * @deprecated The reveal is frame-driven now — pace it with `floorCps`
   * and `drainMs` instead.
   */
  charIntervalMs?: number;
  /** Shows the blinking cursor while streaming or revealing. */
  cursor?: boolean;
  /**
   * Fires once when the reveal catches up with `text` after `streaming` has
   * ended — the moment the message is fully on screen.
   */
  onRevealComplete?: () => void;
  /** Additional CSS classes */
  className?: string;
};

export interface StreamingTextProps
  extends StreamingTextOwnProps,
    Omit<React.ComponentPropsWithoutRef<'span'>, keyof StreamingTextOwnProps | 'children'> {}

/**
 * StreamingText — the reveal for text that arrives in chunks: an LLM
 * response typing itself out, with a cursor that blinks while more is
 * coming. Feed it the accumulated text on every render and it animates
 * through what was appended from a frame loop that spends real elapsed
 * time: a thin trickle types at the floor rate, and however much lands at
 * once is on screen within the drain window. Under
 * `prefers-reduced-motion` the reveal is skipped and each chunk appears
 * whole. Announcement is the container's job — pair it with an
 * `aria-live` region when the surrounding UI does not already announce
 * the message. When the streamed text needs its own renderer (markdown
 * through a parser), pace it with `useStreamReveal` or
 * `createStreamReveal` from this folder instead — the same engine without
 * the span.
 */
export const StreamingText = React.forwardRef<HTMLSpanElement, StreamingTextProps>(
  (
    {
      text,
      streaming = false,
      floorCps,
      drainMs,
      charIntervalMs,
      cursor = true,
      onRevealComplete,
      className = '',
      ...rest
    },
    ref,
  ) => {
    const baseClass = 'ds-streaming-text';

    const { visible, caughtUp } = useStreamReveal(text, {
      // The legacy interval's equivalent rate: one character per step.
      floorCps: charIntervalMs != null ? 1000 / charIntervalMs : floorCps,
      drainMs,
    });

    const completed = useRef(false);

    useEffect(() => {
      if (!caughtUp) {
        completed.current = false;
        return;
      }
      if (!streaming && text.length > 0 && !completed.current) {
        completed.current = true;
        onRevealComplete?.();
      }
    }, [caughtUp, streaming, text, onRevealComplete]);

    const showCursor = cursor && (streaming || !caughtUp);

    const classes = [baseClass, className].filter(Boolean).join(' ');

    return (
      <span {...rest} ref={ref} className={classes}>
        {visible}
        {showCursor && <span className={`${baseClass}__cursor`} aria-hidden="true" />}
      </span>
    );
  },
);

StreamingText.displayName = 'StreamingText';
