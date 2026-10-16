'use client';

import { useSyncExternalStore } from 'react';

/**
 * Reduced motion, as one answer for every component that moves in
 * JavaScript (charts, counters, the globe). CSS motion already obeys the
 * guard in tokens-motion.css; these are the animations CSS cannot reach.
 *
 * Two inputs, either one enough:
 *   - the OS preference, `prefers-reduced-motion: reduce`;
 *   - `data-motion="reduce"` on <html>, a host's own switch (the site's
 *     max accessibility mode sets it) for when the page, not the OS, has
 *     decided nothing should move.
 *
 * The attribute is watched live, so flipping it stops motion in place.
 * The server snapshot is false: a component renders its moving form on the
 * server and settles on the client's first paint.
 */

export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
export const REDUCED_MOTION_ATTRIBUTE = 'data-motion';

/** The current answer, for code that checks once (a timer about to start). */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia(REDUCED_MOTION_QUERY).matches ||
    document.documentElement.getAttribute(REDUCED_MOTION_ATTRIBUTE) === 'reduce'
  );
}

function subscribe(callback: () => void) {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener('change', callback);
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: [REDUCED_MOTION_ATTRIBUTE],
  });
  return () => {
    query.removeEventListener('change', callback);
    observer.disconnect();
  };
}

const getServerSnapshot = () => false;

/** The live answer, for render: re-renders when either input changes. */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, prefersReducedMotion, getServerSnapshot);
}
