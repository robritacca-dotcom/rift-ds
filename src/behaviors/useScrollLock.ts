'use client';

import { useEffect, useRef } from 'react';

/**
 * Page scroll locking for modal overlays, with two strategies and one owner.
 *
 * `pin` (the default) fixes the body in place rather than hiding its
 * overflow. iOS Safari ignores `overflow: hidden` on the body: a touch still
 * scrolls the document, and focusing a field scrolls it programmatically to
 * bring the field above the keyboard — which slides the page out from under
 * the overlay. A fixed body has no scrollable overflow at all, so neither can
 * move it. The body is pinned at its current scroll offset so the page behind
 * the overlay does not visibly jump, and the offset is restored when the last
 * holder releases. `overflow: hidden` rides along so the pinned body cannot
 * grow scrollbars of its own.
 *
 * The pin is **counted**, and the counter is the whole point: closing a
 * Dialog opened over a Drawer must not unlock the Drawer's scroll. The
 * imperative pair (`acquireScrollLock` / `releaseScrollLock`) exposes the
 * same counter to host chrome — a site's nav drawer, a bespoke chat panel —
 * because two locks that cannot see each other each believe they own
 * `document.body`, and whichever releases first unlocks the page under the
 * overlay the other still holds (or restores styles the other already
 * changed). One counter means the first acquire captures and pins, only the
 * last release restores, whichever module it belongs to. The captured inline
 * styles are restored verbatim, never blanked, so a host's own body styling
 * survives a lock cycle.
 *
 * `cancel-events` keeps the document scrollbar rendered and cancels scroll
 * *input* instead — wheel and touch gestures work only inside `allowWithin`.
 * This is CommandPalette's documented design decision (unscrollable-body
 * treatments blink the scrollbar rail out, which reads as a layout jump on
 * classic-scrollbar platforms); it is deliberately not the default because
 * swapping the modals onto it would change their scrollbar rendering.
 * Instances are independent — overlapping cancel-events locks stack
 * harmlessly.
 */

type ScrollLockOptions = {
  /** Which locking strategy to use. Default `'pin'`. */
  strategy?: 'pin' | 'cancel-events';
  /** For `cancel-events`: the scrollable region that keeps receiving input. */
  allowWithin?: React.RefObject<HTMLElement | null>;
};

const PINNED_PROPS = ['position', 'top', 'left', 'right', 'overflow'] as const;

let pinCount = 0;
let pinnedScrollY = 0;
let previousBodyStyle: Partial<Record<(typeof PINNED_PROPS)[number], string>> = {};

/**
 * Take one hold on the shared page scroll lock — the counter behind the
 * hook's `pin` strategy. For overlays outside this library (host chrome)
 * that must not fight the modal components over `document.body`. Every
 * acquire needs exactly one matching release.
 */
export function acquireScrollLock(): void {
  if (pinCount === 0) {
    const { style } = document.body;
    pinnedScrollY = window.scrollY;
    previousBodyStyle = {};
    for (const prop of PINNED_PROPS) previousBodyStyle[prop] = style[prop];
    style.position = 'fixed';
    style.top = `-${pinnedScrollY}px`;
    style.left = '0';
    style.right = '0';
    style.overflow = 'hidden';
  }
  pinCount += 1;
}

/**
 * Release one hold on the shared page scroll lock. The body styles and the
 * scroll offset are restored only when the last hold anywhere releases; an
 * unbalanced release never touches the page.
 */
export function releaseScrollLock(): void {
  if (pinCount === 0) return;
  pinCount -= 1;
  if (pinCount > 0) return;
  const { style } = document.body;
  for (const prop of PINNED_PROPS) style[prop] = previousBodyStyle[prop] ?? '';
  /* Instant, not smooth: hosts opt the html element into smooth scrolling,
     and this is a restore, not a movement the visitor should see. */
  window.scrollTo({ top: pinnedScrollY, behavior: 'instant' });
}

export function useScrollLock(active: boolean, options?: ScrollLockOptions): void {
  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  });

  const strategy = options?.strategy ?? 'pin';
  useEffect(() => {
    if (!active) return;

    if (strategy === 'pin') {
      acquireScrollLock();
      return releaseScrollLock;
    }

    const block = (event: Event) => {
      const allow = optionsRef.current?.allowWithin?.current;
      const target = event.target instanceof Node ? event.target : null;
      if (allow && target && allow.contains(target)) return;
      event.preventDefault();
    };
    document.addEventListener('wheel', block, { passive: false });
    document.addEventListener('touchmove', block, { passive: false });
    return () => {
      document.removeEventListener('wheel', block);
      document.removeEventListener('touchmove', block);
    };
  }, [active, strategy]);
}
