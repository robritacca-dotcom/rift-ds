'use client';

import { useCallback, useEffect, useRef } from 'react';

/**
 * The dismissal layer stack — the single owner of the document-level Escape
 * and outside-press listeners for every overlay in the library, modal and
 * non-modal alike.
 *
 * Before this existed, each open overlay registered its own document keydown,
 * so Escape over a stacked Dialog-in-Drawer closed both at once, and a
 * popover or menu open inside a Dialog closed together with it. The stack
 * routes each interaction by stack order:
 *
 * - **Escape** goes to the topmost open layer only: it dismisses it, or is
 *   swallowed when that layer is not Escape-dismissible (a lower layer must
 *   never close through a blocking one). One press, one layer. An Escape a
 *   component has already handled (`event.preventDefault()`, say an input
 *   clearing its own text) is left alone.
 * - **An outside press** walks down from the top: every layer the press
 *   lands outside of, and that opts into light dismiss, closes; the walk
 *   stops at the first layer that contains the press or does not
 *   light-dismiss (a modal, which owns its backdrop). So a press on a
 *   Dialog's body closes the menus open above it and leaves the Dialog.
 * - **Backdrop clicks** stay with the modal that draws the backdrop, but a
 *   press that began while another layer was on top was that layer's press:
 *   `ownsPress()` tells the modal so, and it keeps itself open. Without it, a
 *   press on the backdrop closed the open menu at pointerdown and then the
 *   Dialog on click, two layers for one press.
 *
 * Exactly two document listeners exist while any layer is open, and none
 * while the stack is empty. Registration order is stack order: overlays open
 * in the order they are stacked, so stack order and paint order agree
 * without reading z-index.
 */

type LayerOptions = {
  /** The overlay's open state — the layer registers while true. */
  open: boolean;
  /** Called when the stack decides this layer should dismiss. */
  onDismiss?: () => void;
  /** Whether Escape dismisses this layer. Default true. */
  dismissOnEscape?: boolean;
  /**
   * Whether a pointerdown outside `getElements()` dismisses this layer (light
   * dismiss: popovers, menus, listboxes). Default false — modal components
   * keep their own backdrop click handler, which is part of their DOM, and
   * gate it on `ownsPress()`.
   */
  dismissOnOutsidePress?: boolean;
  /**
   * The elements that count as "inside" for outside-press checks — typically
   * the panel and its trigger. Read when `dismissOnOutsidePress` is on, and
   * also to stop the outside-press walk at a layer that contains the press.
   */
  getElements?: () => (HTMLElement | null | undefined)[];
};

export type LayerHandle = {
  /**
   * Whether the current press belongs to this layer: it was the topmost
   * layer when the press began (or, outside a press, is topmost now). Gate a
   * backdrop click on it.
   */
  ownsPress: () => boolean;
};

type Layer = { optionsRef: React.RefObject<LayerOptions> };

const layers: Layer[] = [];
let listenersInstalled = false;
/** The topmost layer when the latest press began; read by `ownsPress()`. */
let pressOwner: Layer | null = null;

const contains = (layer: Layer, target: Node) =>
  (layer.optionsRef.current.getElements?.() ?? []).some((el) => el?.contains(target));

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key !== 'Escape' || event.defaultPrevented) return;
  const top = layers[layers.length - 1];
  if (!top) return;
  const options = top.optionsRef.current;
  // A non-dismissible topmost layer swallows Escape by doing nothing: the
  // layers beneath it must not receive it either.
  event.preventDefault();
  if (options.dismissOnEscape === false) return;
  options.onDismiss?.();
};

const handlePointerDown = (event: PointerEvent) => {
  pressOwner = layers[layers.length - 1] ?? null;
  const target = event.target instanceof Node ? event.target : null;
  if (!target) return;
  // Walk a snapshot: a dismissal can unregister layers mid-walk.
  for (const layer of [...layers].reverse()) {
    const options = layer.optionsRef.current;
    if (!options.dismissOnOutsidePress || contains(layer, target)) break;
    options.onDismiss?.();
  }
};

const syncListeners = () => {
  if (layers.length > 0 && !listenersInstalled) {
    document.addEventListener('keydown', handleKeyDown);
    // Capture, so the press owner is recorded before any handler on the page
    // (a modal's backdrop included) sees the press.
    document.addEventListener('pointerdown', handlePointerDown, true);
    listenersInstalled = true;
  } else if (layers.length === 0 && listenersInstalled) {
    document.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('pointerdown', handlePointerDown, true);
    listenersInstalled = false;
    pressOwner = null;
  }
};

/**
 * Register an overlay on the dismissal stack while `open` is true. Options
 * are read at event time, so a `dismissOnEscape` toggle takes effect without
 * re-registering (which would wrongly move the layer to the top).
 */
export function useLayer(options: LayerOptions): LayerHandle {
  const optionsRef = useRef(options);
  const layerRef = useRef<Layer | null>(null);
  useEffect(() => {
    optionsRef.current = options;
  });

  const { open } = options;
  useEffect(() => {
    if (!open) return;
    const layer: Layer = { optionsRef };
    layerRef.current = layer;
    layers.push(layer);
    syncListeners();
    return () => {
      const index = layers.indexOf(layer);
      if (index !== -1) layers.splice(index, 1);
      // pressOwner keeps pointing at a layer that closed mid-press on purpose:
      // the click that follows still belongs to it, not to the modal below.
      layerRef.current = null;
      syncListeners();
    };
  }, [open]);

  const ownsPress = useCallback(() => {
    const layer = layerRef.current;
    if (!layer) return false;
    return pressOwner ? pressOwner === layer : layers[layers.length - 1] === layer;
  }, []);

  return { ownsPress };
}
