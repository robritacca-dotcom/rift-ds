"use client";

import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { AiButton } from "@robr0/design-system/components/AiButton/AiButton";
import { lockBodyScroll, unlockBodyScroll } from "@/lib/scroll-lock";
import { CHROMELESS_ROUTES } from "@/config/chromeless";
import { getPageSummary } from "@/data/page-summaries";
import { DOCK_QUERY, TAKEOVER_QUERY, useSiteChat } from "./ChatContext";
import { SiteChat } from "./SiteChat";
import styles from "./SiteChat.module.css";

/* The docked panel's drag-to-widen range. The minimum mirrors the
   --layout-chat-width default in globals.css (the resting width); the
   maximum is a little over half again as wide. The drag writes the variable
   back onto <html>, so the body inset and the MegaNav content inset — both
   derived from the same variable — slide with the panel edge for free. */
const PANEL_MIN_WIDTH = 420;
const PANEL_MAX_WIDTH = 655;

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
 */
export function SiteChatMount() {
  const { open, setOpen, panelPhase, view, returnFocusRef, send } = useSiteChat();
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
  const modal = open && !denied && (isFull || !docked);
  const showPanel = open && !denied;
  /* Presence outlives `open` by the exit beat, so the close animation is
     seen; every behavior above keys on `open` and lets go immediately. */
  const renderPanel = (open || panelPhase === "closing") && !denied;

  /* The page's relationship to the panel, as an attribute on <html> so the
     styling needs no subscription anywhere else (globals.css owns both
     rules, MegaNav.module.css reads the first):

     - docked: html[data-chat="docked"] pads the body and offsets the fixed
       sticky header, so the page slides over beside the panel.
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
    if (showPanel && docked && !isFull) {
      root.setAttribute("data-chat", "docked");
      return () => root.removeAttribute("data-chat");
    }
    root.removeAttribute("data-chat");
  }, [showPanel, docked, isFull, takeover]);

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
    const width = Math.round(
      Math.min(PANEL_MAX_WIDTH, Math.max(PANEL_MIN_WIDTH, drag.width + (drag.startX - e.clientX)))
    );
    /* The chosen width survives close/reopen for the session; everything
       sized from the variable follows it. */
    document.documentElement.style.setProperty("--layout-chat-width", `${width}px`);
  };

  const endResize = () => {
    dragRef.current = null;
    setResizing(false);
    document.documentElement.removeAttribute("data-chat-resizing");
  };

  if (denied) return null;

  /* Closed: the FAB is the persistent entry point — bottom right, on every page, never
     remounting on navigation (so focus restore works everywhere). */
  if (!renderPanel) {
    return (
      <div className={styles.fab}>
        <AiButton
          label="Ask robr0 GPT"
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
        className={`${styles.panel} ${isFull ? styles.panelFull : ""} ${
          panelPhase === "closing" ? styles.panelClosing : ""
        }`}
        role={modal ? "dialog" : "complementary"}
        aria-modal={modal || undefined}
        aria-label="Site chat"
        onKeyDown={handleKeyDown}
      >
        {/* compact tracks the host's width, not the view: a takeover on a
            phone still wants phone insets, where one on a desktop does not. */}
        <SiteChat
          fullscreenEnabled={!takeover}
          compact={takeover || !isFull}
          /* A phone viewport stacks the welcome screen (greeting centred in
             the thread, starters over a bottom-pinned composer), because the keyboard
             is about to take the lower half of it. */
          phone={takeover}
        />
      </div>
      {/* The widen grip — the bench's left handle, docked form only. It
          rides the panel's left edge as a fixed sibling (the panel clips its
          own overflow, so a straddling child would be cut in half). */}
      {showPanel && docked && !isFull && (
        <div
          className={`${styles.dockHandle} ${resizing ? styles.dockHandleResizing : ""}`}
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

