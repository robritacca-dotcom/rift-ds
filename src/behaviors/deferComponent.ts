'use client';

/**
 * deferComponent
 *
 * A closed panel costs nothing: a surface a person has to ask for (a chat
 * panel, an editor behind a menu, a drawing inside a menu) is not part of
 * the page until they do, so its code should not be part of the page's
 * first load either.
 *
 * `deferComponent` wraps a dynamic import as a component that loads when it
 * first renders, and hands back `preload`, which starts the same load
 * early. The load happens once however it starts. Render the component
 * inside a `<Suspense>`, at the point where the surface opens.
 *
 * Deferring alone would trade a faster page for a surface that opens
 * empty, so a deferred surface is always preloaded ahead of the press that
 * opens it:
 *   - on intent: call `preload` from the opener's pointerenter and focus;
 *   - as soon as the page is interactive: `usePreloadWhenIdle(preload)`,
 *     which takes the browser's first idle moment after mounting, with a
 *     short deadline, and stands down for a visitor who asked to save data.
 * With both, the code is there before the surface opens in every ordinary
 * case, and the page's first load never waited for it. For the press that
 * still beats it, give the `<Suspense>` a fallback that draws the surface's
 * frame.
 *
 * It is a trade, to be measured before it is applied: the cost moves from
 * every page load to the surface's first open. It suits a surface that is
 * heavy and opened by few visits, and not one that is light and expected to
 * answer at once.
 *
 * Published as `rift-ds/behaviors/deferComponent`, since an app's own
 * panels follow the same rule; design.md's Performance section owns it.
 */
import { lazy, useEffect, useRef, type ComponentType, type LazyExoticComponent } from 'react';

export interface DeferredComponent<Props> {
  /** The component, loaded when it first renders. Render it inside a Suspense. */
  Component: LazyExoticComponent<ComponentType<Props>>;
  /**
   * Start the load now. Safe to call any number of times, and to pass as an
   * event handler: it takes no arguments, returns nothing and never throws.
   */
  preload: () => void;
}

/**
 * A component that loads when it first renders, and a `preload` that starts
 * the load early.
 *
 * `load` resolves to the component itself, so a named export is picked out
 * of its module where the import is written:
 *
 * ```tsx
 * const DeferredPanel = deferComponent<PanelProps>(() =>
 *   import('./Panel').then((module) => module.Panel),
 * );
 * ```
 *
 * A failed `preload` is not an error: the next `preload`, or the first
 * render, asks again. A load that fails once the component has rendered is
 * one: like any lazy component, it is thrown to the nearest error boundary,
 * and stays failed there.
 */
export function deferComponent<Props>(load: () => Promise<ComponentType<Props>>): DeferredComponent<Props> {
  let pending: Promise<{ default: ComponentType<Props> }> | undefined;
  const start = () => (pending ??= load().then((component) => ({ default: component })));
  return {
    Component: lazy(start),
    preload: () => {
      start().catch(() => {
        // Forgotten, so that whoever asks next starts a fresh load.
        pending = undefined;
      });
    },
  };
}

type SaveData = { connection?: { saveData?: boolean } };

/**
 * How long a page that never goes idle may hold a preload back. Short on
 * purpose: on a slow phone the page stays busy for seconds, and a preload
 * that waited for a quiet moment arrived after the first press did.
 */
const PRELOAD_DEADLINE_MS = 300;

/**
 * Call `preload` as soon as the page is interactive: in the browser's first
 * idle moment after this component mounts, and no later than a short
 * deadline if the page never goes idle. It runs once per mount, and calls
 * the latest function it was given, so an inline function is fine.
 *
 * Waiting for the page to finish loading and then go idle was tried first
 * and measured: on a slow phone the page stays busy for seconds, the
 * preload started late and then queued behind everything else the page
 * fetches after load, and a first press arrived before the code did. The
 * code is off the page's critical path either way; what matters is that
 * its fetch starts early.
 */
export function usePreloadWhenIdle(preload: () => void): void {
  const latest = useRef(preload);
  useEffect(() => {
    latest.current = preload;
  });
  useEffect(() => {
    if ((navigator as Navigator & SaveData).connection?.saveData) return;
    const run = () => latest.current();
    if (typeof window.requestIdleCallback === 'function') {
      const idle = window.requestIdleCallback(run, { timeout: PRELOAD_DEADLINE_MS });
      return () => window.cancelIdleCallback(idle);
    }
    // No idle callback (Safari): the turn after mounting is the closest thing.
    const timer = window.setTimeout(run, 1);
    return () => window.clearTimeout(timer);
  }, []);
}
