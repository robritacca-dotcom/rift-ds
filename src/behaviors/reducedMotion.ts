'use client';

import { useSyncExternalStore } from 'react';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/* The two attributes on <html> that ask for less motion without the OS
   setting: data-motion="reduce" on its own, and the AAA mode
   (data-a11y="aaa"), which always implies it. src/tokens/aaa.css reads the
   same pair for the CSS side. */
const MOTION_ATTRIBUTES = ['data-motion', 'data-a11y'];

/**
 * True when the visitor has asked for less motion: the OS setting, or the
 * host's own switch on `<html>` (`data-motion="reduce"`, or the AAA mode).
 * The CSS guard in the token files cannot see a timer or a frame loop, so
 * every component that moves in JavaScript asks here. False during SSR.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  const root = document.documentElement;
  return (
    window.matchMedia(REDUCED_MOTION_QUERY).matches ||
    root.getAttribute('data-motion') === 'reduce' ||
    root.getAttribute('data-a11y') === 'aaa'
  );
}

/** Calls back whenever the answer to `prefersReducedMotion` may change. */
export function subscribeReducedMotion(callback: () => void): () => void {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener('change', callback);
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: MOTION_ATTRIBUTES });
  return () => {
    query.removeEventListener('change', callback);
    observer.disconnect();
  };
}

/**
 * `prefersReducedMotion` as live state: re-renders when the OS setting or
 * the host's switch flips. False on the server and the hydration render.
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribeReducedMotion, prefersReducedMotion, () => false);
}
