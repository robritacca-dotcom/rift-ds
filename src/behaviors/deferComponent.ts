'use client';

/**
 * deferComponent
 *
 * A closed panel costs nothing: a surface a person has to ask for (a chat
 * panel, a palette, an editor behind a menu) is not part of the page until
 * they do, so its code should not be part of the page's first load either.
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
 * case, and the page's first load never waited for it.
 *
 * Published as `rift-ds/behaviors/deferComponent`, since an app's own panels follow the same rule; design.md's Performance section owns it.
 */
import { lazy, useEffect, type ComponentType, type LazyExoticComponent } from 'react';

export interface DeferredComponent<Props> {
  /** The component, loaded when it first renders. Render it inside a Suspense. */
  Component: LazyExoticComponent<ComponentType<Props>>;
  /**
   * Start the load now. Safe to call any number of times, and as an event
   * handler. Resolves to whether the code arrived, never rejects.
   */
  preload: () => Promise<boolean>;
}

export function deferComponent<Props>(load: () => Promise<ComponentType<Props>>): DeferredComponent<Props> {
  let pending: Promise<{ default: ComponentType<Props> }> | undefined;
  const start = () => (pending ??= load().then((component) => ({ default: component })));
  return {
    Component: lazy(start),
    // A failed early load is not an error yet: the render will ask again,
    // so the promise resolves either way, with whether the code arrived.
    preload: () =>
      start().then(
        () => true,
        () => {
          pending = undefined;
          return false;
        },
      ),
  };
}

type SaveData = { connection?: { saveData?: boolean } };

/**
 * Call `preload` as soon as the page is interactive: in the browser's first
 * idle moment after this component mounts, and no later than a short
 * deadline if the page never goes idle.
 *
 * Waiting for the page to finish loading and then go idle was tried first
 * and measured: on a slow phone the page stays busy for seconds, the
 * preload started late and then queued behind everything else the page
 * fetches after load, and a first press arrived before the code did. The
 * code is off the page's critical path either way; what matters is that
 * its fetch starts early.
 */
export function usePreloadWhenIdle(preload: () => unknown): void {
  useEffect(() => {
    if ((navigator as Navigator & SaveData).connection?.saveData) return;
    const run = () => {
      preload();
    };
    if (typeof window.requestIdleCallback === 'function') {
      // The deadline: a page that is still busy preloads anyway.
      const idle = window.requestIdleCallback(run, { timeout: 300 });
      return () => window.cancelIdleCallback(idle);
    }
    // No idle callback (Safari): the turn after mounting is the closest thing.
    const timer = window.setTimeout(run, 1);
    return () => window.clearTimeout(timer);
  }, [preload]);
}
