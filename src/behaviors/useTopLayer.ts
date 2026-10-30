'use client';

import { useLayoutEffect, type RefObject } from 'react';

/**
 * Lifts a panel into the browser's top layer while `open`, so it paints
 * above everything on the page: every z-index, every stacking context, every
 * `overflow` clip. Tooltips always sit here; no layer token can rank above
 * the top layer, so nothing a page or a host does can cover one.
 *
 * The panel renders with `popover="manual"` and this hook calls
 * `showPopover()` / `hidePopover()`. A panel that must stay in the
 * accessibility tree at rest (SegmentedControl's segment labels, which are
 * the segments' names) cannot carry the attribute, since a closed popover is
 * `display: none`; the hook adds it for as long as the panel is shown and
 * takes it off again. A manual popover has no light dismiss
 * and closes no other popover, so dismissal stays with the shared layer
 * stack (src/behaviors/useLayer). The panel keeps its place in the DOM, so
 * it still inherits the custom properties of any theme scoped above it; only
 * where it paints changes.
 *
 * Call it before useAnchoredPosition in the component: layout effects run in
 * order, and the anchored hook must see the panel already in the top layer,
 * where the viewport is its containing block whatever its ancestors
 * transform (`fixedContainingBlock` returns null for an open popover).
 *
 * The panel's CSS adds `overlay` to its transition list with
 * `allow-discrete`, so the exit fade still plays in the top layer, and sets
 * `overflow: visible` over the popover default so an arrow outside the box
 * still draws. A browser without the Popover API leaves the panel where it
 * was, stacking at its layer token.
 */
export function useTopLayer({
  open,
  panelRef,
  target,
}: {
  open: boolean;
  panelRef: RefObject<HTMLElement | null>;
  /** Changes when the ref is pointed at a different panel, as useAnchoredPosition's `target`. */
  target?: unknown;
}): void {
  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!open || !panel || typeof panel.showPopover !== 'function') return;
    const added = !panel.hasAttribute('popover');
    if (added) panel.setAttribute('popover', 'manual');
    if (!panel.matches(':popover-open')) panel.showPopover();
    return () => {
      if (panel.isConnected && panel.matches(':popover-open')) panel.hidePopover();
      if (added) panel.removeAttribute('popover');
    };
  }, [open, panelRef, target]);
}
