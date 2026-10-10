"use client";

import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { AiButton } from "rift-ds/components/AiButton/AiButton";
import { lockBodyScroll, unlockBodyScroll } from "@/lib/scroll-lock";
import { CHROMELESS_ROUTES } from "@/config/chromeless";
import { getPageSummary } from "@/data/page-summaries";
import { DOCK_QUERY, TAKEOVER_QUERY, useSiteChat } from "./ChatContext";
import {
  FLOAT_EDGE_GAP,
  FLOAT_MAX_SCALE,
  clampFloatPosition,
  dockWidthFromDrag,
  isFloatDragStart,
} from "./placement";
import { SiteChat } from "./SiteChat";
import styles from "./SiteChat.module.css";
import { ASSISTANT_NAME } from "@/config/brand.generated";

/* The eight size grips of the floating card: which way each edge or corner
   pulls, per axis. */
const FLOAT_GRIPS = [
  { dir: "n", dx: 0, dy: -1 },
  { dir: "s", dx: 0, dy: 1 },
  { dir: "e", dx: 1, dy: 0 },
  { dir: "w", dx: -1, dy: 0 },
  { dir: "ne", dx: 1, dy: -1 },
  { dir: "nw", dx: -1, dy: -1 },
  { dir: "se", dx: 1, dy: 1 },
  { dir: "sw", dx: -1, dy: 1 },
] as const;

const viewportBounds = () => ({
  left: 0,
  top: 0,
  right: window.innerWidth,
  bottom: window.innerHeight,
});

const subscribeQuery = (query: string) => (onChange: () => void) => {
  const media = window.matchMedia(query);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
};
const subscribeDock = subscribeQuery(DOCK_QUERY);
const readDocked = () => window.matchMedia(DOCK_QUERY).matches;
const subscribeTakeover = subscribeQuery(TAKEOVER_QUERY);
const readTakeover = () => window.matchMedia(TAKEOVER_QUERY).matches;

/* The TLDR panel is hover-summoned, so it exists only where hover exists: a
   touch tap has no dwell to summon it with, and the synthetic mouseenter a
   tap fires would pop the panel in the way of opening the chat. The server
   snapshot is false, so the server always renders the plain FAB and the
   panel mounts after hydration on pointer devices — which is also what
   keeps the FAB immune to the server's idea of the pathname: the root
   route's ISR regeneration can see a pathname the client never would, and
   a summary rendered from it is a hydration mismatch that blanks the whole
   site (React redoes <html> and drops the theme guard's ready mark). */
const HOVER_QUERY = "(hover: hover) and (pointer: fine)";
const subscribeHover = subscribeQuery(HOVER_QUERY);
const readHover = () => window.matchMedia(HOVER_QUERY).matches;

/**
 * The site-wide panel. Mounted once from the root layout, after {children},
 * so it sits last in the tab order and never remounts on navigation — which
 * is what lets a mid-stream answer keep streaming while the visitor reads a
 * different page.
 *
 * Docked (wide screens) it is a non-modal complementary region: no scrim,
 * no focus trap, the page stays fully usable beside it. Overlaying (below
 * the threshold, and in fullscreen view) it is modal: scrim, focus trap,
 * body scroll locked, Escape closes.
 *
 * The visitor picks the seat from the header's Chat position menu: either
 * edge for the dock (and for the overlay below the threshold), or floating,
 * a non-modal card that is moved by its header and sized by its edges.
 * Phones get none of it — the takeover is the only form there.
 */
export function SiteChatMount() {
  const { open, setOpen, panelPhase, view, side, floating, returnFocusRef, send } = useSiteChat();
  const pathname = usePathname();

  /* The FAB's TLDR panel: per-route content from the page-summaries data,
     summoned by hovering the button (AiButton owns the hover mechanics).
     Deliberately not auto-revealed — an uninvited panel is an interruption;
     the component's summaryPinned prop is there if that call ever changes.
     Hover-capable devices only, and never in the server HTML — see
     HOVER_QUERY above for why both halves are load-bearing. */
  const canHover = useSyncExternalStore(subscribeHover, readHover, () => false);
  const summary = canHover ? getPageSummary(pathname) : null;

  const launchSuggestion = (id: string) => {
    const chipDef = summary?.chips.find((c) => c.id === id);
    if (!chipDef) return;
    setOpen(true);
    send(chipDef.prompt);
  };
  const docked = useSyncExternalStore(subscribeDock, readDocked, () => false);
  /* Phone widths: the panel fills the viewport, so it is a takeover whatever
     the view says — the expand toggle is hidden there rather than offering a
     switch from full screen to full screen. */
  const takeover = useSyncExternalStore(subscribeTakeover, readTakeover, () => false);

  const denied = CHROMELESS_ROUTES.has(pathname);
  const isFull = view === "full" || takeover;
  /* Floating, the panel is a free card over the page — never modal, never
     insetting the page, at any width above the takeover. */
  const isFloating = floating && !isFull;
  const isDocked = docked && !isFull && !isFloating;
  const modal = open && !denied && (isFull || (!docked && !isFloating));
  const showPanel = open && !denied;
  /* Presence outlives `open` by the exit beat, so the close animation is
     seen; every behavior above keys on `open` and lets go immediately. */
  const renderPanel = (open || panelPhase === "closing") && !denied;

  /* The page's relationship to the panel, as an attribute on <html> so the
     styling needs no subscription anywhere else (globals.css owns the
     rules, MegaNav.module.css reads the docked pair):

     - docked: html[data-chat="docked"] pads the body and offsets the fixed
       sticky header, so the page slides over beside the panel. The left
       dock is the same on the other side, under its own value,
       html[data-chat="docked-left"]. Floating sets nothing: the page keeps
       its full width under the card.
     - takeover (phone widths): html[data-chat="takeover"] hides the page
       around the panel, which leaves the fixed layer for normal flow at
       100dvh (SiteChat.module.css) — the chat *is* the document. That is
       what lets the soft keyboard be Safari's problem rather than the
       panel's: it scrolls the document to show the focused composer, as it
       does for any page with a field at the bottom, with no viewport
       arithmetic on our side. A viewport-sized position: fixed panel is
       exactly what iOS 26.0 Safari renders short under the keyboard, and
       every number it reports about that state is suspect, so no fixed
       geometry is trusted there. Hiding the page collapses the document,
       so the scroll offset is read before the attribute lands and restored,
       instantly, when the page comes back. A layout effect, so the in-flow
       panel never paints once below the footer before the page hides. */
  useLayoutEffect(() => {
    const root = document.documentElement;
    if (showPanel && takeover) {
      const scrollY = window.scrollY;
      root.setAttribute("data-chat", "takeover");
      window.scrollTo({ top: 0, behavior: "instant" });
      return () => {
        root.removeAttribute("data-chat");
        window.scrollTo({ top: scrollY, behavior: "instant" });
      };
    }
    if (showPanel && isDocked) {
      /* The left dock is its own value rather than a second attribute, so
         every existing "docked" rule keeps meaning the right edge untouched. */
      root.setAttribute("data-chat", side === "left" ? "docked-left" : "docked");
      return () => root.removeAttribute("data-chat");
    }
    root.removeAttribute("data-chat");
  }, [showPanel, isDocked, side, takeover]);

  /* Modal mode owns the page behind it. Not on phones: there the page is
     hidden rather than covered, so there is nothing behind to hold still. */
  useEffect(() => {
    if (!modal || takeover) return;
    lockBodyScroll("site-chat");
    return () => unlockBodyScroll("site-chat");
  }, [modal, takeover]);

  const panelRef = useRef<HTMLDivElement | null>(null);

  /* Closing restores focus to whichever launcher opened the panel, when it
     is still on the page (the header remounts per route). */
  const wasOpen = useRef(false);
  useEffect(() => {
    if (wasOpen.current && !open) {
      const target = returnFocusRef.current;
      if (target && target.isConnected) target.focus();
    }
    wasOpen.current = open;
  }, [open, returnFocusRef]);

  /* Drag-to-widen, docked view only. Same pointer choreography as the
     bench's grips (pointer capture, primary button, cancel-safe); the panel's
     right edge is fixed, so the width delta is simply the inverted pointer
     delta — no centred doubling. Mouse-driven review affordance like the
     bench's; the panel stays fully usable at its resting width without it. */
  const dragRef = useRef<{ startX: number; width: number } | null>(null);
  const [resizing, setResizing] = useState(false);

  const beginResize = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.pointerType === "mouse" && e.button !== 0) || dragRef.current) return;
    const rect = panelRef.current?.getBoundingClientRect();
    if (!rect) return;
    dragRef.current = { startX: e.clientX, width: rect.width };
    e.currentTarget.setPointerCapture(e.pointerId);
    setResizing(true);
    /* Suppresses the body inset's glide and page text selection while the
       pointer drives the width frame by frame (globals.css). */
    document.documentElement.setAttribute("data-chat-resizing", "");
  };

  const moveResize = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    /* The drag writes the variable back onto <html>, so the body inset and
       the MegaNav content inset — both derived from it — slide with the
       panel edge for free. */
    const width = dockWidthFromDrag(drag.width, e.clientX - drag.startX, side);
    /* The chosen width survives close/reopen for the session; everything
       sized from the variable follows it. */
    document.documentElement.style.setProperty("--layout-chat-width", `${width}px`);
  };

  const endResize = () => {
    dragRef.current = null;
    setResizing(false);
    document.documentElement.removeAttribute("data-chat-resizing");
  };

  /* Drag-to-move, floating view only. The position is null until
     the first drag (the stylesheet's default corner applies), then lives in
     state as viewport pixels. During the drag the pointer writes the two
     variables straight onto the node, so the transcript underneath does not
     re-render per frame; the state commit on release makes React agree. */
  const [floatPos, setFloatPos] = useState<{ x: number; y: number } | null>(null);
  const moveRef = useRef<{ dx: number; dy: number; x: number; y: number } | null>(null);

  const clampFloat = (x: number, y: number, rect: DOMRect) =>
    clampFloatPosition(x, y, rect, viewportBounds());

  const beginMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isFloating || moveRef.current) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if (!isFloatDragStart(e.target)) return;
    const rect = e.currentTarget.getBoundingClientRect();
    moveRef.current = { dx: e.clientX - rect.left, dy: e.clientY - rect.top, x: rect.left, y: rect.top };
    /* Capture keeps the drag alive when the pointer outruns the card. It
       throws for a pointer the browser no longer considers active, and a
       drag that merely loses that is better than one that never starts. */
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    /* Same attribute as the widen grip: it suspends the panel's glide and
       page text selection while the pointer drives the geometry. */
    document.documentElement.setAttribute("data-chat-resizing", "");
  };

  const moveMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const move = moveRef.current;
    if (!move) return;
    const node = e.currentTarget;
    const next = clampFloat(e.clientX - move.dx, e.clientY - move.dy, node.getBoundingClientRect());
    move.x = next.x;
    move.y = next.y;
    node.style.setProperty("--chat-float-x", `${next.x}px`);
    node.style.setProperty("--chat-float-y", `${next.y}px`);
  };

  const endMove = () => {
    const move = moveRef.current;
    if (!move) return;
    moveRef.current = null;
    setFloatPos({ x: move.x, y: move.y });
    document.documentElement.removeAttribute("data-chat-resizing");
  };

  /* Drag-to-size, floating view only. The resting size is both
     the default and the floor; each axis grows to FLOAT_MAX_SCALE of it, or
     to the viewport edge if that comes first. An edge that is pulled moves;
     the opposite one holds still, so a north or west grip rewrites the
     position as well. Same direct-to-node writes as the move drag. */
  const [floatSize, setFloatSize] = useState<{ w: number; h: number } | null>(null);
  const sizeRef = useRef<{
    dx: number;
    dy: number;
    startX: number;
    startY: number;
    rect: DOMRect;
    minW: number;
    minH: number;
    next: { x: number; y: number; w: number; h: number };
  } | null>(null);

  const beginSize = (e: React.PointerEvent<HTMLDivElement>, dx: number, dy: number) => {
    if ((e.pointerType === "mouse" && e.button !== 0) || sizeRef.current) return;
    const rect = panelRef.current?.getBoundingClientRect();
    if (!rect) return;
    e.stopPropagation();
    const root = getComputedStyle(document.documentElement);
    const inset = parseFloat(root.getPropertyValue("--layout-chat-inset")) || 0;
    const minW = parseFloat(root.getPropertyValue("--layout-chat-width")) || rect.width;
    /* The resting height is the stylesheet's: the token, or the viewport
       between the insets when that is shorter (.panelFloating). */
    const restH = parseFloat(root.getPropertyValue("--layout-chat-float-height")) || rect.height;
    const minH = Math.min(restH, window.innerHeight - inset * 2);
    sizeRef.current = {
      dx,
      dy,
      startX: e.clientX,
      startY: e.clientY,
      rect,
      minW,
      minH,
      next: { x: rect.left, y: rect.top, w: rect.width, h: rect.height },
    };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    document.documentElement.setAttribute("data-chat-resizing", "");
  };

  const moveSize = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = sizeRef.current;
    const node = panelRef.current;
    if (!drag || !node) return;
    const { rect, next } = drag;
    if (drag.dx !== 0) {
      /* The room between the held edge and the viewport, on the pulled side. */
      const room =
        drag.dx > 0 ? window.innerWidth - FLOAT_EDGE_GAP - rect.left : rect.right - FLOAT_EDGE_GAP;
      const max = Math.max(drag.minW, Math.min(drag.minW * FLOAT_MAX_SCALE, room));
      next.w = Math.round(
        Math.min(max, Math.max(drag.minW, rect.width + drag.dx * (e.clientX - drag.startX)))
      );
      next.x = Math.round(drag.dx > 0 ? rect.left : rect.right - next.w);
    }
    if (drag.dy !== 0) {
      const room =
        drag.dy > 0 ? window.innerHeight - FLOAT_EDGE_GAP - rect.top : rect.bottom - FLOAT_EDGE_GAP;
      const max = Math.max(drag.minH, Math.min(drag.minH * FLOAT_MAX_SCALE, room));
      next.h = Math.round(
        Math.min(max, Math.max(drag.minH, rect.height + drag.dy * (e.clientY - drag.startY)))
      );
      next.y = Math.round(drag.dy > 0 ? rect.top : rect.bottom - next.h);
    }
    node.style.setProperty("--chat-float-x", `${next.x}px`);
    node.style.setProperty("--chat-float-y", `${next.y}px`);
    node.style.setProperty("--chat-float-width", `${next.w}px`);
    node.style.setProperty("--chat-float-height", `${next.h}px`);
  };

  const endSize = () => {
    const drag = sizeRef.current;
    if (!drag) return;
    sizeRef.current = null;
    setFloatPos({ x: drag.next.x, y: drag.next.y });
    setFloatSize({ w: drag.next.w, h: drag.next.h });
    document.documentElement.removeAttribute("data-chat-resizing");
  };

  /* A shrinking window must not strand the card off screen. */
  useEffect(() => {
    if (!isFloating || !floatPos) return;
    const onResize = () => {
      const rect = panelRef.current?.getBoundingClientRect();
      if (!rect) return;
      setFloatPos((pos) => {
        if (!pos) return pos;
        const next = clampFloat(pos.x, pos.y, rect);
        return next.x === pos.x && next.y === pos.y ? pos : next;
      });
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [isFloating, floatPos]);

  if (denied) return null;

  /* Closed: the FAB is the persistent entry point — bottom right, on every page, never
     remounting on navigation (so focus restore works everywhere). */
  if (!renderPanel) {
    return (
      <div className={styles.fab}>
        <AiButton
          label={`Ask ${ASSISTANT_NAME}`}
          icon="forum"
          aria-expanded={false}
          aria-controls="site-chat-panel"
          summary={
            summary
              ? {
                  title: summary.title,
                  caption: summary.caption,
                  text: summary.text,
                  suggestions: summary.chips.map(({ id, label }) => ({ id, label })),
                }
              : undefined
          }
          onSummarySuggestion={launchSuggestion}
          onClick={(event) => {
            returnFocusRef.current = event.currentTarget;
            setOpen(true);
          }}
        />
      </div>
    );
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    /* SiteChat handles Escape-in-fullscreen itself (and stops propagation);
       this one closes the panel from panel view. */
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }
    /* A minimal focus trap, only while modal: Tab wraps within the panel.
       Docked mode is non-modal by design — focus flows through the page. */
    if (modal && event.key === "Tab" && panelRef.current) {
      const focusables = panelRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], textarea:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  };

  return (
    <>
      {modal && !isFull && (
        <div
          className={styles.scrim}
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}
      <div
        ref={panelRef}
        id="site-chat-panel"
        className={`${styles.panel} ${side === "left" ? styles.panelLeft : ""} ${
          isFloating ? styles.panelFloating : ""
        } ${isFull ? styles.panelFull : ""} ${panelPhase === "closing" ? styles.panelClosing : ""}`}
        style={
          isFloating && (floatPos || floatSize)
            ? ({
                ...(floatPos && {
                  "--chat-float-x": `${floatPos.x}px`,
                  "--chat-float-y": `${floatPos.y}px`,
                }),
                ...(floatSize && {
                  "--chat-float-width": `${floatSize.w}px`,
                  "--chat-float-height": `${floatSize.h}px`,
                }),
              } as React.CSSProperties)
            : undefined
        }
        onPointerDown={beginMove}
        onPointerMove={moveMove}
        onPointerUp={endMove}
        onPointerCancel={endMove}
        role={modal ? "dialog" : "complementary"}
        aria-modal={modal || undefined}
        aria-label="Site chat"
        onKeyDown={handleKeyDown}
      >
        {/* compact tracks the host's width, not the view: a takeover on a
            phone still wants phone insets, where one on a desktop does not. */}
        <SiteChat
          fullscreenEnabled={!takeover}
          placementEnabled={!takeover}
          compact={takeover || !isFull}
          /* A phone viewport stacks the welcome screen (greeting centred in
             the thread, starters over a bottom-pinned composer), because the keyboard
             is about to take the lower half of it. */
          phone={takeover}
        />
        {/* The size grips — inside the card's edge rather than straddling
            it, because the panel clips its own overflow. Pointer-only, like
            the dock's widen grip. */}
        {isFloating &&
          FLOAT_GRIPS.map(({ dir, dx, dy }) => (
            <div
              key={dir}
              className={styles.floatGrip}
              data-dir={dir}
              aria-hidden="true"
              onPointerDown={(e) => beginSize(e, dx, dy)}
              onPointerMove={moveSize}
              onPointerUp={endSize}
              onPointerCancel={endSize}
            />
          ))}
      </div>
      {/* The widen grip — the bench's edge handle, docked form only. It
          rides the panel's inner edge (the left on the right dock, the right
          on the left dock) as a fixed sibling (the panel clips its
          own overflow, so a straddling child would be cut in half). */}
      {showPanel && isDocked && (
        <div
          className={`${styles.dockHandle} ${side === "left" ? styles.dockHandleLeft : ""} ${
            resizing ? styles.dockHandleResizing : ""
          }`}
          aria-hidden="true"
          onPointerDown={beginResize}
          onPointerMove={moveResize}
          onPointerUp={endResize}
          onPointerCancel={endResize}
        />
      )}
    </>
  );
}

