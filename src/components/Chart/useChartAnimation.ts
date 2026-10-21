import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

/** The animation props every recharts graphical item takes. */
export interface ChartAnimationProps {
  /** recharts' own 'auto' while an entrance is due, so its reduced-motion and SSR guard still applies; false once it has played */
  isAnimationActive: 'auto' | false;
  /** Counts the series that have finished, so the flag drops after the last one */
  onAnimationEnd: () => void;
  /** Set only for a series paced by the wrapper (see `durationMs`) */
  animationDuration?: number;
}

export interface ChartAnimationOptions {
  /**
   * The entrance duration for a series that never reports an end (recharts'
   * Scatter has no end callback). The hook passes it through as
   * `animationDuration` and drops the flag on a timer of twice that length:
   * the timer starts a commit or two before the sweep does, and a late drop
   * costs nothing where an early one would cut the tail.
   */
  durationMs?: number;
}

/**
 * Holds a chart's entrance animation to mount and to new data.
 *
 * recharts keys each series' animation to its computed geometry, and a
 * container resize recomputes that geometry, so every width step of a
 * dragged panel replayed the whole entrance frame by frame. The contract
 * is design.md's: a chart animates on mount and when its data changes,
 * and a resize is a re-layout only.
 *
 * `isAnimationActive` is `'auto'` from mount, or from a change of `data`
 * identity, until every series has reported `onAnimationEnd`, then `false`:
 * a remounted animation step with `isAnimationActive={false}` renders once,
 * straight at its end state. Spread the result onto each series;
 * `seriesCount` is how many carry it, so the flag only drops once the last
 * has finished (a ComboChart's bar ends long before its line). Under
 * reduced motion or in SSR no series ever reports, and the flag stays
 * `'auto'`, which recharts resolves to off either way.
 *
 * The end callback keeps one identity per entrance: recharts restarts the
 * animation when the callback it holds changes, so a fresh one per render
 * would replay what this hook exists to stop.
 */
export function useChartAnimation(
  data: unknown,
  seriesCount = 1,
  { durationMs }: ChartAnimationOptions = {},
): ChartAnimationProps {
  /* Derived during render, so the series that mount with the new data
     already carry 'auto': a flag set from an effect could land a render
     late, after recharts has keyed the new geometry. Each entrance is a
     cycle, and the ends counted against it are only its own. */
  const [seenData, setSeenData] = useState(data);
  const [cycle, setCycle] = useState(0);
  const [ended, setEnded] = useState(0);
  if (seenData !== data) {
    setSeenData(data);
    setCycle((c) => c + 1);
    setEnded(0);
  }

  /* A cancelled entrance never reports, but its last frame can land in the
     gap between the new cycle's commit and the cancel, so an end is counted
     only when it comes from the cycle now on screen. Written in the layout
     phase, ahead of any animation frame. */
  const currentCycle = useRef(cycle);
  useLayoutEffect(() => {
    currentCycle.current = cycle;
  }, [cycle]);

  const onAnimationEnd = useCallback(() => {
    if (currentCycle.current !== cycle) return;
    setEnded((n) => n + 1);
  }, [cycle]);

  /* The timed fallback, armed once per cycle while a duration is set. */
  useEffect(() => {
    if (durationMs == null) return undefined;
    const timer = window.setTimeout(() => setEnded(seriesCount), durationMs * 2);
    return () => window.clearTimeout(timer);
  }, [durationMs, cycle, seriesCount]);

  return {
    isAnimationActive: ended < seriesCount ? 'auto' : false,
    onAnimationEnd,
    ...(durationMs == null ? {} : { animationDuration: durationMs }),
  };
}
