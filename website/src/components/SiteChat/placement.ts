/**
 * Where a chat panel sits: docked to either edge, or popped out as a
 * floating card the visitor moves and sizes. One roster, so the header menu
 * (SiteChat), the site mount and the playground stage all name the same
 * three seats the same way. design.md's Site chat pattern owns the
 * behaviour each seat promises.
 *
 * No React and no component imports, like DOCK_QUERY's home in
 * ChatContext: hosts deep in the tree read it without pulling the widget.
 */

/** The edge a docked panel takes, and the edge it overlays from below the dock threshold. */
export type ChatSide = "left" | "right";

/** A panel's seat: a dock edge, or floating free of both. */
export type ChatPlacement = ChatSide | "floating";

/* The menu's rows, in menu order. The two dock glyphs are deliberately
   crossed with their names: Material's dock_to_right draws the panel bar on
   the left, and the row wants the picture of where the panel ends up. */
export const CHAT_PLACEMENTS: readonly {
  id: ChatPlacement;
  label: string;
  icon: string;
}[] = [
  { id: "right", label: "Dock right", icon: "dock_to_left" },
  { id: "left", label: "Dock left", icon: "dock_to_right" },
  { id: "floating", label: "Floating", icon: "picture_in_picture" },
];

/** The roster entry for a placement — the header trigger wears its icon. */
export const chatPlacement = (id: ChatPlacement) =>
  CHAT_PLACEMENTS.find((placement) => placement.id === id) ?? CHAT_PLACEMENTS[0];

/* A docked panel's drag-to-widen range. The minimum mirrors the
   --layout-chat-width default in globals.css (the resting width); the
   maximum is a little over half again as wide. One pair for every host
   with a dock, so the site panel and the playground's docked stage card
   stop at the same two walls. */
export const DOCK_MIN_WIDTH = 420;
export const DOCK_MAX_WIDTH = 655;

/** A docked panel's width after a grip drag: the inner edge is the one
    that moves, and it faces the other way on the left dock. */
export function dockWidthFromDrag(
  startWidth: number,
  pointerDelta: number,
  side: ChatSide
): number {
  const grown = startWidth + (side === "left" ? pointerDelta : -pointerDelta);
  return Math.round(Math.min(DOCK_MAX_WIDTH, Math.max(DOCK_MIN_WIDTH, grown)));
}

/* How far the size grips grow a floating card past its resting size, per
   axis. The resting size is also the floor. */
export const FLOAT_MAX_SCALE = 1.2;

/* A floating card never leaves its bounds: it stops this far short of
   every edge, moved or sized. */
export const FLOAT_EDGE_GAP = 8;

/* A floating card is moved by its header, minus the header's controls. */
const FLOAT_DRAG_ZONE = ".ds-chat-header";
const FLOAT_DRAG_EXEMPT =
  "button, a, input, textarea, select, [role='button'], [role='menu']";

/** Whether a pointerdown on `target` should start moving a floating card. */
export function isFloatDragStart(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  return Boolean(target.closest(FLOAT_DRAG_ZONE)) && !target.closest(FLOAT_DRAG_EXEMPT);
}

/** Holds a moved card inside `bounds`, FLOAT_EDGE_GAP off each edge. A card
    larger than the bounds pins to the leading edge rather than oscillating. */
export function clampFloatPosition(
  x: number,
  y: number,
  size: { width: number; height: number },
  bounds: { left: number; top: number; right: number; bottom: number }
): { x: number; y: number } {
  const minX = bounds.left + FLOAT_EDGE_GAP;
  const minY = bounds.top + FLOAT_EDGE_GAP;
  return {
    x: Math.round(Math.min(Math.max(minX, bounds.right - size.width - FLOAT_EDGE_GAP), Math.max(minX, x))),
    y: Math.round(Math.min(Math.max(minY, bounds.bottom - size.height - FLOAT_EDGE_GAP), Math.max(minY, y))),
  };
}
