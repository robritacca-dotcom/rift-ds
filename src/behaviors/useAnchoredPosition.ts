'use client';

import { useLayoutEffect, useRef } from 'react';

/**
 * Anchored positioning: the one way every popup in the library places itself
 * against the control that opened it (menus, listboxes, pickers, popovers,
 * hover cards, tooltips).
 *
 * The panel stays where it is in the DOM, so it keeps the trigger's stacking
 * context and any theme scoped above it, but is `position: fixed`, placed
 * from the anchor's rectangle. A fixed panel is not clipped by an ancestor's
 * `overflow`, which is what lets a menu inside a table's scroll wrapper, a
 * rail or a card show whole. Portals would escape the same way but would
 * leave the theme scope; floating-ui would solve it at the cost of a
 * dependency. This is the approach Tooltip proved first.
 *
 * On every placement it:
 * - puts the panel on the preferred side, flipping to the opposite side when
 *   the preferred one has too little room and the opposite has more;
 * - shifts it along the edge to stay inside its box, a margin clear of the
 *   edge (`--gap-200` unless the component says otherwise);
 * - optionally caps its height to the room on the side it took (a list then
 *   scrolls inside rather than running off the screen);
 * - optionally sets its minimum width to the anchor's, so a listbox is never
 *   narrower than the control that opened it, and always publishes the
 *   anchor's width as `--ds-anchor-width` for a panel that should match it
 *   exactly;
 * - marks the side it landed on as `data-side` (and `data-align`), so the
 *   entrance can grow from the anchor whichever way the panel flipped;
 * - hides it (an inline `visibility: hidden`, flagged `data-anchor-hidden`)
 *   while the anchor is scrolled wholly out of view, so a panel never hangs
 *   at the screen's edge over nothing.
 *
 * The placement outlives the open state on purpose: a panel that eases out
 * when it closes keeps its place for the exit instead of snapping back into
 * flow mid-fade.
 *
 * It re-places on scroll (any scroll container, captured), on resize, and
 * when the panel or the anchor changes size, once per animation frame, and
 * writes straight to the DOM: placement never costs a React render, the same
 * reasoning the gesture rule gives (design.md, the playground's resize
 * record).
 *
 * The room a panel has is the viewport's. An ancestor with a transform,
 * filter, backdrop filter, perspective or containment (a Dialog panel's
 * entrance scale, the chat panel's blur) becomes the fixed panel's
 * containing block, which moves the
 * coordinates it is placed in; only when that ancestor also clips its
 * overflow does the room narrow to its box.
 */

export type AnchoredSide = 'top' | 'bottom' | 'left' | 'right';
export type AnchoredAlign = 'start' | 'center' | 'end';

export type AnchoredPlacement = {
  /** The side the panel took after flipping. */
  side: AnchoredSide;
  /** The panel's position in the box, in px from the box's top left. */
  x: number;
  y: number;
  /** The panel's size as placed. */
  width: number;
  height: number;
  /** The anchor's rectangle, in the same coordinates. */
  anchor: { left: number; top: number; width: number; height: number };
};

export type AnchoredPositionOptions = {
  /** Whether the panel is showing. Placement runs only while true. */
  open: boolean;
  /** The control the panel is anchored to. */
  anchorRef: React.RefObject<HTMLElement | null>;
  /** The panel being placed. */
  panelRef: React.RefObject<HTMLElement | null>;
  /** The preferred side. Default `bottom`. */
  side?: AnchoredSide;
  /** Where along that side the panel lines up with the anchor. Default `start`. */
  align?: AnchoredAlign;
  /**
   * The custom property that holds the gap between anchor and panel, read
   * where it resolves so it is never restated as a number. Default
   * `--gap-200`.
   */
  gapProperty?: string;
  /**
   * The custom property that holds the margin a panel keeps from the box's
   * edge when it shifts to stay inside. Default `--gap-200`, so a panel never
   * sits tighter to the screen's edge than that, whatever its trigger gap.
   */
  edgeProperty?: string;
  /** Whether the panel may flip to the opposite side. Default true. */
  flip?: boolean;
  /** Cap the panel's height to the room on its side, for a list that scrolls inside. Default false. */
  fitHeight?: boolean;
  /** Set the panel's minimum width to the anchor's. Default false. */
  matchWidth?: boolean;
  /** Called after every placement, for a detail the panel draws itself (an arrow). */
  onPlace?: (placement: AnchoredPlacement) => void;
  /**
   * Which of several anchors is open, for a component that shows one panel
   * at a time against different controls (FilterBar's chips): a change
   * re-reads the refs and places afresh. Leave undefined for one anchor.
   */
  target?: string | number | null;
};

/**
 * The nearest ancestor a fixed-position descendant is placed from instead of
 * the viewport. Null means the viewport.
 */
export function fixedContainingBlock(element: HTMLElement): HTMLElement | null {
  for (let node = element.parentElement; node; node = node.parentElement) {
    const style = getComputedStyle(node);
    const read = (property: string) => style.getPropertyValue(property).trim();
    // A container-type ancestor is not one: container queries no longer
    // imply layout containment, so a fixed panel inside a container-query
    // header is still placed from the viewport.
    if (
      read('transform') !== 'none' ||
      read('filter') !== 'none' ||
      read('backdrop-filter') !== 'none' ||
      read('perspective') !== 'none' ||
      /\b(layout|paint|strict|content)\b/.test(read('contain')) ||
      /\b(transform|filter|perspective)\b/.test(read('will-change'))
    ) {
      return node;
    }
  }
  return null;
}

const clamp = (value: number, min: number, max: number) =>
  max < min ? min : Math.min(Math.max(value, min), max);

const OPPOSITE: Record<AnchoredSide, AnchoredSide> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
};

/** Places `panelRef` against `anchorRef` while `open`. See the module comment. */
export function useAnchoredPosition({
  open,
  anchorRef,
  panelRef,
  side = 'bottom',
  align = 'start',
  gapProperty = '--gap-200',
  edgeProperty = '--gap-200',
  flip = true,
  fitHeight = false,
  matchWidth = false,
  onPlace,
  target,
}: AnchoredPositionOptions): void {
  // The callback is read through a ref so a new function each render does not
  // restart the listeners.
  const onPlaceRef = useRef(onPlace);
  useLayoutEffect(() => {
    onPlaceRef.current = onPlace;
  });

  useLayoutEffect(() => {
    if (!open) return;
    const anchor = anchorRef.current;
    const panel = panelRef.current;
    if (!anchor || !panel) return;

    // Taking the panel out of flow is the hook's job, so a component's CSS
    // only ever describes the panel, never where it sits.
    panel.style.position = 'fixed';
    panel.style.inset = 'auto';
    panel.style.margin = '0';

    const place = () => {
      // Two different facts about an ancestor that becomes the fixed panel's
      // containing block: it moves the panel's coordinate origin, always; it
      // limits where the panel can show only when it also clips its
      // overflow. A blurred panel that does not clip leaves the room the
      // viewport's.
      const block = fixedContainingBlock(panel);
      const blockBox = block ? block.getBoundingClientRect() : null;
      const origin = blockBox
        ? { left: blockBox.left + block!.clientLeft, top: blockBox.top + block!.clientTop }
        : { left: 0, top: 0 };
      // The layout viewport, without the scrollbar a panel must not sit under.
      const bounds = {
        left: 0,
        top: 0,
        right: document.documentElement.clientWidth,
        bottom: document.documentElement.clientHeight,
      };
      if (block && blockBox) {
        const style = getComputedStyle(block);
        if (style.overflowX !== 'visible') {
          bounds.left = Math.max(bounds.left, origin.left);
          bounds.right = Math.min(bounds.right, origin.left + block.clientWidth);
        }
        if (style.overflowY !== 'visible') {
          bounds.top = Math.max(bounds.top, origin.top);
          bounds.bottom = Math.min(bounds.bottom, origin.top + block.clientHeight);
        }
      }

      const a = anchor.getBoundingClientRect();
      const panelStyle = getComputedStyle(panel);
      const gap = parseFloat(panelStyle.getPropertyValue(gapProperty)) || 0;
      const edge = parseFloat(panelStyle.getPropertyValue(edgeProperty)) || 0;

      panel.style.setProperty('--ds-anchor-width', `${a.width}px`);
      if (matchWidth) panel.style.minWidth = `${a.width}px`;
      // Measure at the natural height before choosing a side.
      if (fitHeight) panel.style.maxHeight = '';
      // The layout size, not the drawn one: an entrance that scales the panel
      // in would otherwise have it shifted as if it were smaller, then grow
      // back past the edge.
      const width = panel.offsetWidth;
      let height = panel.offsetHeight;

      const room: Record<AnchoredSide, number> = {
        top: a.top - bounds.top - gap - edge,
        bottom: bounds.bottom - a.bottom - gap - edge,
        left: a.left - bounds.left - gap - edge,
        right: bounds.right - a.right - gap - edge,
      };
      const vertical = side === 'top' || side === 'bottom';
      const need = vertical ? height : width;
      let chosen = side;
      if (flip && room[side] < need && room[OPPOSITE[side]] > room[side]) {
        chosen = OPPOSITE[side];
      }

      if (fitHeight && vertical && height > room[chosen]) {
        height = Math.max(room[chosen], 0);
        panel.style.maxHeight = `${height}px`;
      }

      let x: number;
      let y: number;
      if (chosen === 'top' || chosen === 'bottom') {
        y = chosen === 'bottom' ? a.bottom + gap : a.top - gap - height;
        x =
          align === 'center'
            ? a.left + a.width / 2 - width / 2
            : align === 'end'
              ? a.right - width
              : a.left;
      } else {
        x = chosen === 'right' ? a.right + gap : a.left - gap - width;
        y =
          align === 'center'
            ? a.top + a.height / 2 - height / 2
            : align === 'end'
              ? a.bottom - height
              : a.top;
      }
      x = clamp(x, bounds.left + edge, bounds.right - edge - width);
      y = clamp(y, bounds.top + edge, bounds.bottom - edge - height);

      panel.style.left = `${x - origin.left}px`;
      panel.style.top = `${y - origin.top}px`;
      panel.dataset.side = chosen;
      panel.dataset.align = align;

      const offscreen =
        a.bottom < bounds.top || a.top > bounds.bottom || a.right < bounds.left || a.left > bounds.right;
      if (offscreen) {
        panel.dataset.anchorHidden = '';
        panel.style.visibility = 'hidden';
      } else if ('anchorHidden' in panel.dataset) {
        delete panel.dataset.anchorHidden;
        panel.style.removeProperty('visibility');
      }

      onPlaceRef.current?.({
        side: chosen,
        x: x - origin.left,
        y: y - origin.top,
        width,
        height,
        anchor: { left: a.left - origin.left, top: a.top - origin.top, width: a.width, height: a.height },
      });
    };

    let frame = 0;
    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        place();
      });
    };

    place();
    window.addEventListener('scroll', schedule, true);
    window.addEventListener('resize', schedule);
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(schedule);
    observer?.observe(panel);
    observer?.observe(anchor);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule, true);
      window.removeEventListener('resize', schedule);
      observer?.disconnect();
      if ('anchorHidden' in panel.dataset) {
        delete panel.dataset.anchorHidden;
        panel.style.removeProperty('visibility');
      }
    };
  }, [open, target, anchorRef, panelRef, side, align, gapProperty, edgeProperty, flip, fitHeight, matchWidth]);
}
