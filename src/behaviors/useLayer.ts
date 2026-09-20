'use client';

import { useEffect, useRef } from 'react';

/**
 * The dismissal layer stack — the single owner of the document-level Escape
 * and outside-press listeners for every overlay in the library.
 *
 * Before this existed, each open overlay registered its own document keydown,
 * so Escape over a stacked Dialog-in-Drawer closed both at once. The stack
 * routes each interaction to the **topmost** open layer only: Escape
 * dismisses it (or is swallowed when it is not Escape-dismissible — a lower
 * layer must never close through a blocking one), and an outside press
 * dismisses it only when the press lands outside every element the layer
 * claims. Layers below are untouched; one press, one layer.
 *
 * Exactly two document listeners exist while any layer is open, and none
 * while the stack is empty. Registration order is stack order — overlays
 * portal into `document.body` in the order they open, so stack order and
 * paint order agree without reading z-index.
 */

type LayerOptions = {
  /** The overlay's open state — the layer registers while true. */
  open: boolean;
  /** Called when the stack decides this layer should dismiss. */
  onDismiss?: () => void;
  /** Whether Escape dismisses this layer. Default true. */
  dismissOnEscape?: boolean;
  /**
   * Whether a pointerdown outside `getElements()` dismisses this layer.
   * Default false — modal components keep their own backdrop click handler,
   * which is part of their DOM and needs no document listener.
   */
  dismissOnOutsidePress?: boolean;
  /**
   * The elements that count as "inside" for outside-press checks — typically
   * the panel and its trigger. Only read when `dismissOnOutsidePress` is on.
   */
  getElements?: () => (HTMLElement | null | undefined)[];
};

type Layer = { optionsRef: React.RefObject<LayerOptions> };

const layers: Layer[] = [];
let listenersInstalled = false;

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key !== 'Escape') return;
  const top = layers[layers.length - 1];
  if (!top) return;
  const options = top.optionsRef.current;
  // A non-dismissible topmost layer swallows Escape by doing nothing: the
  // layers beneath it must not receive it either.
  if (options.dismissOnEscape === false) return;
  event.preventDefault();
  options.onDismiss?.();
};

const handlePointerDown = (event: PointerEvent) => {
  const top = layers[layers.length - 1];
  if (!top) return;
  const options = top.optionsRef.current;
  if (!options.dismissOnOutsidePress) return;
  const target = event.target instanceof Node ? event.target : null;
  if (!target) return;
  const inside = (options.getElements?.() ?? []).some((el) => el?.contains(target));
  if (!inside) options.onDismiss?.();
};

const syncListeners = () => {
  if (layers.length > 0 && !listenersInstalled) {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('pointerdown', handlePointerDown);
    listenersInstalled = true;
  } else if (layers.length === 0 && listenersInstalled) {
    document.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('pointerdown', handlePointerDown);
    listenersInstalled = false;
  }
};

/**
 * Register an overlay on the dismissal stack while `open` is true. Options
 * are read at event time, so a `dismissOnEscape` toggle takes effect without
 * re-registering (which would wrongly move the layer to the top).
 */
export function useLayer(options: LayerOptions): void {
  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  });

  const { open } = options;
  useEffect(() => {
    if (!open) return;
    const layer: Layer = { optionsRef };
    layers.push(layer);
    syncListeners();
    return () => {
      const index = layers.indexOf(layer);
      if (index !== -1) layers.splice(index, 1);
      syncListeners();
    };
  }, [open]);
}
