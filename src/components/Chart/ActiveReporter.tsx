'use client';

import { useEffect, useRef } from 'react';
import type { ChartActiveHandler } from './BarChart';

interface ActiveReporterProps {
  /** Whether recharts has a point active: the pointer over the plot, or the keyboard cursor on a point. */
  active?: boolean;
  /** The tooltip's entries; each carries the row of `data` it was drawn from. */
  payload?: { payload?: Record<string, unknown> }[];
  /** The active point's x-axis value, the fallback for finding its row. */
  label?: string | number;
  /** The chart's data, as the consumer passed it. */
  data: Record<string, unknown>[];
  /** The chart's x-axis key. */
  xKey: string;
  /** The consumer's callback. */
  onActiveChange: ChartActiveHandler;
}

/**
 * Reports the active point of a cartesian chart to the consumer: the row of
 * `data` under the pointer or the keyboard cursor, and null once neither is
 * on the plot.
 *
 * It renders nothing and sits inside each chart's tooltip content, because
 * that is the one place recharts hands over the active point for a pointer
 * and for its keyboard layer alike, in every 3.x release. The row is found
 * by identity first (recharts passes the consumer's own object through) and
 * by the x-axis value as the fallback. The callback fires only when the
 * active row changes, never per pointer move, and once more with null when
 * the chart unmounts while a point is active.
 */
export function ActiveReporter({ active, payload, label, data, xKey, onActiveChange }: ActiveReporterProps) {
  const handlerRef = useRef(onActiveChange);
  useEffect(() => {
    handlerRef.current = onActiveChange;
  });

  let index = -1;
  if (active && payload?.length) {
    const row = payload[0]?.payload;
    index = row ? data.indexOf(row) : -1;
    if (index === -1 && label !== undefined) index = data.findIndex((entry) => entry[xKey] === label);
  }

  const lastIndex = useRef(-1);
  useEffect(() => {
    if (index === lastIndex.current) return;
    lastIndex.current = index;
    if (index >= 0) handlerRef.current(data[index], index);
    else handlerRef.current(null, null);
  }, [index, data]);

  useEffect(
    () => () => {
      if (lastIndex.current !== -1) handlerRef.current(null, null);
    },
    [],
  );

  return null;
}
