'use client';

/**
 * The streaming reveal engine — the pacing behind StreamingText, published
 * on its own for a consumer whose streamed text needs a renderer the
 * component cannot own (markdown through a parser, code through a
 * highlighter). The site's own chat paces its responses through this
 * engine and renders them itself.
 *
 * A real model's deltas arrive in phrase-sized clumps at irregular
 * intervals. Rendering each one the moment it lands is honest but reads as
 * blocky text, however smoothly the surface renders — the unevenness is in
 * the arrival times, not the drawing. So the engine holds what has arrived
 * and reveals it at a steady rate, from a requestAnimationFrame loop that
 * spends real elapsed time, so the pace is frame-rate independent and a
 * fast stream never triggers more than one render per frame.
 *
 * The rate scales with the backlog rather than being fixed: whatever is
 * waiting is fully on screen within `drainMs`, and a thin trickle still
 * moves at `floorCps`. The defaults live in tokens/motion.ts with the
 * other JS timings.
 */

import { useEffect, useRef, useState } from 'react';
import { MOTION_STREAM_DRAIN_MS, MOTION_STREAM_FLOOR_CPS } from '../../tokens/motion';

export interface StreamRevealOptions {
  /** Receives the visible slice each time the reveal moves it. */
  onUpdate: (visible: string) => void;
  /**
   * Slowest the reveal ever runs, in characters per second. Defaults to
   * MOTION_STREAM_FLOOR_CPS.
   */
  floorCps?: number;
  /**
   * However much text is waiting, it is fully on screen within this long,
   * in milliseconds. Defaults to MOTION_STREAM_DRAIN_MS.
   */
  drainMs?: number;
  /**
   * Whether appended text is paced at all. Pass false (or a function
   * returning false — it is read on every append) to show each chunk
   * whole: the reduced-motion path.
   */
  paced?: boolean | (() => boolean);
}

export interface StreamReveal {
  /** Text the source produced since the last call — paced onto the screen. */
  append: (chunk: string) => void;
  /** Everything that has arrived, on screen now — for stops and aborts. */
  flush: () => void;
  /**
   * Replace what has arrived wholesale and show it immediately, unpaced —
   * for text that is not the stream speaking (a notice, an error), or to
   * seed text that should not animate.
   */
  showWhole: (text: string) => void;
  /** Drop everything and reveal `text` as a new message, from zero. */
  restart: (text: string) => void;
  /**
   * Resolves once the reveal has caught up with everything that arrived —
   * immediately when it already has.
   */
  drained: () => Promise<void>;
  /** Stop the frame loop. Nothing more is revealed until the next append. */
  cancel: () => void;
}

/**
 * Create a reveal for one streamed message. The caller owns rendering:
 * `onUpdate` fires with the visible slice, at most once per frame.
 */
export function createStreamReveal(options: StreamRevealOptions): StreamReveal {
  let arrived = '';
  let revealed = 0;
  let rafId: number | null = null;
  let lastFrame = 0;
  let resolvers: Array<() => void> = [];

  const isPaced = () => {
    const paced = options.paced;
    return typeof paced === 'function' ? paced() : paced !== false;
  };

  const settle = () => {
    const pending = resolvers;
    resolvers = [];
    for (const resolve of pending) resolve();
  };

  const cancel = () => {
    if (rafId != null) cancelAnimationFrame(rafId);
    rafId = null;
    lastFrame = 0;
  };

  const schedule = () => {
    if (rafId == null) rafId = requestAnimationFrame(frame);
  };

  function frame(now: number) {
    rafId = null;
    // The first frame has no elapsed time to spend, so it reveals nothing
    // but starts the clock.
    const seconds = lastFrame === 0 ? 0 : (now - lastFrame) / 1000;
    lastFrame = now;
    const backlog = arrived.length - revealed;
    if (backlog > 0 && seconds > 0) {
      const floorCps = options.floorCps ?? MOTION_STREAM_FLOOR_CPS;
      const drainMs = options.drainMs ?? MOTION_STREAM_DRAIN_MS;
      // The further behind, the faster the reveal — whatever is waiting
      // drains within the window instead of typing for seconds.
      const cps = Math.max(floorCps, backlog / (drainMs / 1000));
      revealed = Math.min(arrived.length, revealed + Math.max(1, Math.round(cps * seconds)));
      options.onUpdate(arrived.slice(0, revealed));
    }
    if (revealed < arrived.length) schedule();
    else {
      lastFrame = 0;
      settle();
    }
  }

  const flush = () => {
    cancel();
    if (revealed < arrived.length) {
      revealed = arrived.length;
      options.onUpdate(arrived);
    }
    settle();
  };

  return {
    append: (chunk) => {
      if (chunk === '') return;
      arrived += chunk;
      if (isPaced()) schedule();
      else flush();
    },
    flush,
    showWhole: (text) => {
      cancel();
      arrived = text;
      revealed = text.length;
      options.onUpdate(text);
      settle();
    },
    restart: (text) => {
      cancel();
      arrived = text;
      revealed = 0;
      options.onUpdate('');
      if (arrived === '') return;
      if (isPaced()) schedule();
      else flush();
    },
    drained: () =>
      revealed >= arrived.length
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            resolvers.push(resolve);
            schedule();
          }),
    cancel,
  };
}

export interface UseStreamRevealOptions {
  /**
   * Slowest the reveal ever runs, in characters per second. Defaults to
   * MOTION_STREAM_FLOOR_CPS.
   */
  floorCps?: number;
  /**
   * However much text is waiting, it is fully on screen within this long,
   * in milliseconds. Defaults to MOTION_STREAM_DRAIN_MS.
   */
  drainMs?: number;
}

/**
 * The declarative face of the engine, for React surfaces: feed it the
 * accumulated text on every render and read back the paced slice. Text
 * present on mount shows whole; a value that does not extend the previous
 * one is a new message and reveals from zero. Checks
 * `prefers-reduced-motion` itself, since no CSS guard can see a frame
 * loop, and shows each chunk whole under it.
 */
export function useStreamReveal(
  text: string,
  { floorCps, drainMs }: UseStreamRevealOptions = {}
): { visible: string; caughtUp: boolean } {
  const [revealedText, setRevealedText] = useState(text);
  const engineRef = useRef<StreamReveal | null>(null);
  const floorCpsRef = useRef(floorCps);
  const drainMsRef = useRef(drainMs);
  const previous = useRef(text);

  useEffect(() => () => engineRef.current?.cancel(), []);

  // The engine reads its options live at frame time (through the getters
  // below), so a tuned prop lands without a reset.
  useEffect(() => {
    floorCpsRef.current = floorCps;
    drainMsRef.current = drainMs;
  }, [floorCps, drainMs]);

  useEffect(() => {
    if (engineRef.current === null) {
      engineRef.current = createStreamReveal({
        onUpdate: setRevealedText,
        paced: () => !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        get floorCps() {
          return floorCpsRef.current;
        },
        get drainMs() {
          return drainMsRef.current;
        },
      });
      // Mount text shows whole; only what arrives after it animates.
      engineRef.current.showWhole(previous.current);
    }
    if (text === previous.current) return;
    const engine = engineRef.current;
    if (text.startsWith(previous.current)) engine.append(text.slice(previous.current.length));
    else engine.restart(text);
    previous.current = text;
  }, [text]);

  // A replacement renders before the effect restarts the reveal — never
  // show the old message's slice against the new text.
  const visible = text.startsWith(revealedText) ? revealedText : '';
  return { visible, caughtUp: visible.length >= text.length };
}
