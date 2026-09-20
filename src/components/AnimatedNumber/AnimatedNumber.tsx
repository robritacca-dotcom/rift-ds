'use client';

import React, { useEffect, useRef, useState } from 'react';
import './AnimatedNumber.css';
import { MOTION_COUNT_UP_MS } from '../../tokens/motion';

/** Props owned by AnimatedNumber itself — everything else falls through to the root span. */
type AnimatedNumberOwnProps = {
  /** The number to display. Changing it tweens the display from the previous value. */
  value: number;
  /** Decimal places shown throughout the tween and at rest. Ignored when `format` is set. */
  decimals?: number;
  /**
   * Formats the displayed number — currency, units, compact notation. Called
   * on every animation frame, so keep it pure and cheap.
   */
  format?: (value: number) => string;
  /**
   * Tween length in ms. Defaults to the shared `MOTION_COUNT_UP_MS` constant;
   * an animation pace, so the tween is skipped entirely under reduced motion.
   */
  duration?: number;
  /** Counts up from zero on first render. Turn off to arrive settled and animate only on later changes. */
  animateOnMount?: boolean;
  /** Additional CSS classes */
  className?: string;
};

export interface AnimatedNumberProps
  extends AnimatedNumberOwnProps,
    Omit<React.ComponentPropsWithoutRef<'span'>, keyof AnimatedNumberOwnProps | 'children'> {}

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia(REDUCED_MOTION_QUERY).matches;

/** Decelerating curve — the count lands softly instead of stopping dead. */
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * AnimatedNumber — a number that counts to its value. On mount it counts up
 * from zero; when `value` changes it tweens from the previous value, easing
 * out so the landing reads as arrival rather than a stop. The digits sit on
 * tabular figures so the layout never jitters while they roll.
 *
 * Screen readers hear only the settled value: the rolling digits are
 * `aria-hidden` behind a visually hidden span carrying the target.
 * Under `prefers-reduced-motion` the tween is skipped and the value snaps.
 */
export const AnimatedNumber = React.forwardRef<HTMLSpanElement, AnimatedNumberProps>(
  (
    {
      value,
      decimals = 0,
      format,
      duration = MOTION_COUNT_UP_MS,
      animateOnMount = true,
      className = '',
      ...rest
    },
    ref,
  ) => {
    const baseClass = 'ds-animated-number';

    // The value currently painted. Starts at 0 when the mount animates, so
    // SSR markup and the first client frame agree.
    const [display, setDisplay] = useState(animateOnMount ? 0 : value);
    const displayRef = useRef(display);
    displayRef.current = display;
    const frameRef = useRef(0);

    useEffect(() => {
      const from = displayRef.current;
      if (from === value) return;

      if (prefersReducedMotion() || duration <= 0) {
        setDisplay(value);
        return;
      }

      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min((now - start) / duration, 1);
        const eased = easeOutCubic(t);
        setDisplay(t >= 1 ? value : from + (value - from) * eased);
        if (t < 1) frameRef.current = requestAnimationFrame(tick);
      };
      frameRef.current = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(frameRef.current);
    }, [value, duration]);

    const fmt =
      format ??
      ((n: number) =>
        n.toLocaleString(undefined, {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }));

    const classes = [baseClass, className].filter(Boolean).join(' ');

    return (
      <span {...rest} ref={ref} className={classes}>
        <span className={`${baseClass}__value`} aria-hidden="true">
          {fmt(display)}
        </span>
        <span className={`${baseClass}__sr`}>{fmt(value)}</span>
      </span>
    );
  },
);

AnimatedNumber.displayName = 'AnimatedNumber';
