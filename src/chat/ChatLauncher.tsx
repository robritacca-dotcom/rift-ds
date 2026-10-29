'use client';

import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import { useScrollLock } from '../behaviors/useScrollLock';
import { AiButton, type AiButtonProps, type AiButtonSummary } from '../components/AiButton/AiButton';
import { ChatWidget, type ChatWidgetProps } from './ChatWidget';
import { useChatWidget } from './context';
import {
  FLOAT_EDGE_GAP,
  FLOAT_MAX_SCALE,
  clampFloatPosition,
  dockWidthFromDrag,
  isFloatDragStart,
} from './placement';
import { DOCK_QUERY, TAKEOVER_QUERY } from './queries';
import './ChatWidget.css';

/** The id the panel carries, for a host control's `aria-controls`. */
export const CHAT_PANEL_ID = 'ds-chat-panel';

/* The eight size grips of the floating card: which way each edge or corner
   pulls, per axis. */
const FLOAT_GRIPS = [
  { dir: 'n', dx: 0, dy: -1 },
  { dir: 's', dx: 0, dy: 1 },
  { dir: 'e', dx: 1, dy: 0 },
  { dir: 'w', dx: -1, dy: 0 },
  { dir: 'ne', dx: 1, dy: -1 },
  { dir: 'nw', dx: -1, dy: -1 },
  { dir: 'se', dx: 1, dy: 1 },
  { dir: 'sw', dx: -1, dy: 1 },
] as const;

const viewportBounds = () => ({
  left: 0,
  top: 0,
  right: window.innerWidth,
  bottom: window.innerHeight,
});

const subscribeQuery = (query: string) => (onChange: () => void) => {
  const media = window.matchMedia(query);
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
};
const subscribeDock = subscribeQuery(DOCK_QUERY);
const readDocked = () => window.matchMedia(DOCK_QUERY).matches;
const subscribeTakeover = subscribeQuery(TAKEOVER_QUERY);
const readTakeover = () => window.matchMedia(TAKEOVER_QUERY).matches;

export interface ChatLauncherProps {
  /** The floating button's text. */
  label?: string;
  /** The button's icon. */
  icon?: string;
  /**
   * A TLDR panel the button summons on hover: a pre-written summary and
   * prompt chips. A tapped chip opens the chat and sends the chip's
   * `prompt`. The launcher hands it to the closed button's AiButton, which
   * opens the panel on pointer hover; it does no device or hydration gating
   * of its own, so a host that wants the panel on hover-capable devices only,
   * or kept out of server HTML, passes `summary` only there.
   */
  summary?: AiButtonSummary & { chips?: { id: string; label: string; prompt: string }[] };
  /**
   * Render nothing at all: for routes that carry no chrome.
   * Note: not the native `hidden` attribute, which keeps an element mounted and only hides it; the launcher unmounts its button and panel, and spreads no native attributes.
   */
  hidden?: boolean;
  /** The panel's DOM id, for a host control's `aria-controls`. */
  panelId?: string;
  /**
   * The attribute the launcher writes on `<html>` to say how the panel sits
   * (`docked`, `docked-left`, `takeover`), so the host's stylesheet can pad
   * the page or hide it. `false` writes none.
   */
  hostAttribute?: string | false;
  /** Accessible name for the panel. */
  panelLabel?: string;
  /** The words of the floating button's summary panel, over AiButton's English defaults: the panel's name, given the summary's title ("Summary: <title>"), its dismiss button ("Dismiss summary") and its chips' group ("Suggested prompts"). */
  aiButtonLabels?: Pick<AiButtonProps, 'summaryRegionLabel' | 'dismissLabel' | 'suggestionsLabel'>;
  /** Everything the widget takes. The launcher sets the responsive ones itself. */
  widget?: Omit<ChatWidgetProps, 'fullscreenEnabled' | 'placementEnabled' | 'compact' | 'phone'>;
  /** Rendered inside the panel after the widget: for a host's extra chrome. */
  children?: ReactNode;
  /**
   * How the docked panel sits on the page. `raised` (the default) is a glass
   * card with the floating shadow, inset by `--ds-chat-inset`. `inset` is
   * flat: the app surface colour, no shadow, border or blur, and the
   * `--ds-shell-inset` gap, so it matches AppLayout's `inset` content
   * surface beside it. The overlay below the dock threshold takes the same
   * gap but keeps its shadow, since it still covers the page; the floating
   * card and the takeover keep their own look.
   */
  surface?: 'raised' | 'inset';
}

/**
 * The site-wide panel. Mount it once, after the page content, so it sits
 * last in the tab order and never remounts on navigation, which is what
 * lets a mid-stream answer keep streaming while the visitor reads a
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
 * Phones get none of it: the takeover is the only form there.
 *
 * The host contract: the launcher sets `hostAttribute` on `<html>` and
 * writes the chosen dock width to `--ds-chat-width` there; a host's
 * stylesheet pads the page beside a docked panel and hides it behind a
 * takeover from those two facts (the package's own stylesheet does not
 * touch the host's body). The panel's geometry reads `--ds-chat-width`,
 * `--ds-chat-inset` and `--ds-chat-float-height`, defaulted on `:root`.
 */
export function ChatLauncher({
  label = 'Ask',
  icon = 'forum',
  summary,
  hidden = false,
  panelId = CHAT_PANEL_ID,
  hostAttribute = 'data-chat',
  panelLabel = 'Chat',
  aiButtonLabels,
  widget,
  children,
  surface = 'raised',
}: ChatLauncherProps) {
  const { open, setOpen, panelPhase, view, side, floating, returnFocusRef, send } =
    useChatWidget();

  const launchSuggestion = (id: string) => {
    const chip = summary?.chips?.find((c) => c.id === id);
    if (!chip) return;
    setOpen(true);
    send(chip.prompt);
  };
  const docked = useSyncExternalStore(subscribeDock, readDocked, () => false);
  /* Phone widths: the panel fills the viewport, so it is a takeover whatever
     the view says; the expand toggle is hidden there rather than offering a
     switch from full screen to full screen. */
  const takeover = useSyncExternalStore(subscribeTakeover, readTakeover, () => false);

  const isFull = view === 'full' || takeover;
  /* Floating, the panel is a free card over the page: never modal, never
     insetting the page, at any width above the takeover. */
  const isFloating = floating && !isFull;
  const isDocked = docked && !isFull && !isFloating;
  const modal = open && !hidden && (isFull || (!docked && !isFloating));
  const showPanel = open && !hidden;
  /* Presence outlives `open` by the exit beat, so the close animation is
     seen; every behaviour above keys on `open` and lets go immediately. */
  const renderPanel = (open || panelPhase === 'closing') && !hidden;

  /* The page's relationship to the panel, as an attribute on <html> so the
     host's styling needs no subscription anywhere else:

     - docked: html[data-chat="docked"] is the host's cue to pad the body
       and offset a sticky header, so the page slides over beside the
       panel. The left dock is the same on the other side, under its own
       value, "docked-left". Floating sets nothing: the page keeps its full
       width under the card.
     - takeover (phone widths): html[data-chat="takeover"] is the cue to
       hide the page around the panel, which leaves the fixed layer for
       normal flow at the visual viewport's height: the chat is the document. That is what lets
       the soft keyboard be the browser's problem rather than the panel's.
       A viewport-sized position: fixed panel is exactly what iOS Safari
       renders short under the keyboard, so no fixed geometry is trusted
       there. Hiding the page collapses the document, so the scroll offset
       is read before the attribute lands and restored, instantly, when the
       page comes back. A layout effect, so the in-flow panel never paints
       once below the footer before the page hides. */
  useLayoutEffect(() => {
    if (!hostAttribute) return;
    const root = document.documentElement;
    if (showPanel && takeover) {
      const scrollY = window.scrollY;
      root.setAttribute(hostAttribute, 'takeover');
      window.scrollTo({ top: 0, behavior: 'instant' });
      return () => {
        root.removeAttribute(hostAttribute);
        window.scrollTo({ top: scrollY, behavior: 'instant' });
      };
    }
    if (showPanel && isDocked) {
      root.setAttribute(hostAttribute, side === 'left' ? 'docked-left' : 'docked');
      return () => root.removeAttribute(hostAttribute);
    }
    root.removeAttribute(hostAttribute);
  }, [showPanel, isDocked, side, takeover, hostAttribute]);

  /* Modal mode owns the page behind it. Not on phones: there the page is
     hidden rather than covered, so there is nothing behind to hold still.
     The library's shared counter, so a Dialog opened over the panel and the
     panel can close in either order without unlocking the page under the
     survivor. */
  useScrollLock(modal && !takeover);

  const panelRef = useRef<HTMLDivElement | null>(null);

  /* The takeover is as tall as what the visitor can see. iOS Safari never
     shrinks 100dvh for the soft keyboard (and ignores interactive-widget), so
     a 100dvh document leaves Safari to scroll the composer into view by its
     own rules: the header scrolls off the top and a band of empty panel
     opens under the composer. The visual viewport is the one number that
     shrinks with the keyboard, so the panel takes its height and follows its
     pan, written to the DOM per frame rather than through state. */
  useLayoutEffect(() => {
    const panel = panelRef.current;
    const vv = window.visualViewport;
    if (!showPanel || !takeover || !panel || !vv) return;
    let frame = 0;
    const sync = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        panel.style.setProperty('--ds-chat-viewport-height', `${vv.height}px`);
        panel.style.setProperty('--ds-chat-viewport-top', `${vv.offsetTop}px`);
      });
    };
    sync();
    vv.addEventListener('resize', sync);
    vv.addEventListener('scroll', sync);
    return () => {
      cancelAnimationFrame(frame);
      vv.removeEventListener('resize', sync);
      vv.removeEventListener('scroll', sync);
      panel.style.removeProperty('--ds-chat-viewport-height');
      panel.style.removeProperty('--ds-chat-viewport-top');
    };
  }, [showPanel, takeover]);

  /* Closing restores focus to whichever launcher opened the panel, when it
     is still on the page. */
  const wasOpen = useRef(false);
  useEffect(() => {
    if (wasOpen.current && !open) {
      const target = returnFocusRef.current;
      if (target && target.isConnected) target.focus();
    }
    wasOpen.current = open;
  }, [open, returnFocusRef]);

  /* Drag-to-widen, docked view only. Pointer capture, primary button,
     cancel-safe; the panel's outer edge is fixed, so the width delta is the
     inverted pointer delta. A mouse affordance: the panel stays fully usable
     at its resting width without it. */
  const dragRef = useRef<{ startX: number; width: number } | null>(null);
  const [resizing, setResizing] = useState(false);

  const beginResize = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.pointerType === 'mouse' && e.button !== 0) || dragRef.current) return;
    const rect = panelRef.current?.getBoundingClientRect();
    if (!rect) return;
    dragRef.current = { startX: e.clientX, width: rect.width };
    e.currentTarget.setPointerCapture(e.pointerId);
    setResizing(true);
    /* Suppresses the glides and page text selection while the pointer drives
       the geometry frame by frame (the panel's own rule, and the host's). */
    document.documentElement.setAttribute('data-chat-resizing', '');
  };

  const moveResize = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    /* The drag writes the variable back onto <html>, so everything sized
       from it (the host's body inset, a sticky header's offset) slides with
       the panel edge for free. The chosen width holds for the session. */
    const width = dockWidthFromDrag(drag.width, e.clientX - drag.startX, side);
    document.documentElement.style.setProperty('--ds-chat-width', `${width}px`);
  };

  const endResize = () => {
    dragRef.current = null;
    setResizing(false);
    document.documentElement.removeAttribute('data-chat-resizing');
  };

  /* Drag-to-move, floating view only. The position is null until the first
     drag (the stylesheet's default corner applies), then lives in state as
     viewport pixels. During the drag the pointer writes the two variables
     straight onto the node, so the transcript underneath does not re-render
     per frame; the state commit on release makes React agree. */
  const [floatPos, setFloatPos] = useState<{ x: number; y: number } | null>(null);
  const moveRef = useRef<{ dx: number; dy: number; x: number; y: number } | null>(null);

  const clampFloat = (x: number, y: number, rect: DOMRect) =>
    clampFloatPosition(x, y, rect, viewportBounds());

  const beginMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isFloating || moveRef.current) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (!isFloatDragStart(e.target)) return;
    const rect = e.currentTarget.getBoundingClientRect();
    moveRef.current = { dx: e.clientX - rect.left, dy: e.clientY - rect.top, x: rect.left, y: rect.top };
    /* Capture keeps the drag alive when the pointer outruns the card. It
       throws for a pointer the browser no longer considers active, and a
       drag that merely loses that is better than one that never starts. */
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* see above */
    }
    document.documentElement.setAttribute('data-chat-resizing', '');
  };

  const moveMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const move = moveRef.current;
    if (!move) return;
    const node = e.currentTarget;
    const next = clampFloat(e.clientX - move.dx, e.clientY - move.dy, node.getBoundingClientRect());
    move.x = next.x;
    move.y = next.y;
    node.style.setProperty('--ds-chat-float-x', `${next.x}px`);
    node.style.setProperty('--ds-chat-float-y', `${next.y}px`);
  };

  const endMove = () => {
    const move = moveRef.current;
    if (!move) return;
    moveRef.current = null;
    setFloatPos({ x: move.x, y: move.y });
    document.documentElement.removeAttribute('data-chat-resizing');
  };

  /* Drag-to-size, floating view only. The resting size is both the default
     and the floor; each axis grows to FLOAT_MAX_SCALE of it, or to the
     viewport edge if that comes first. An edge that is pulled moves; the
     opposite one holds still, so a north or west grip rewrites the position
     as well. */
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
    if ((e.pointerType === 'mouse' && e.button !== 0) || sizeRef.current) return;
    const rect = panelRef.current?.getBoundingClientRect();
    if (!rect) return;
    e.stopPropagation();
    const root = getComputedStyle(document.documentElement);
    const inset = parseFloat(root.getPropertyValue('--ds-chat-inset')) || 0;
    const minW = parseFloat(root.getPropertyValue('--ds-chat-width')) || rect.width;
    /* The resting height is the stylesheet's: the variable, or the viewport
       between the insets when that is shorter. */
    const restH = parseFloat(root.getPropertyValue('--ds-chat-float-height')) || rect.height;
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
    } catch {
      /* see beginMove */
    }
    document.documentElement.setAttribute('data-chat-resizing', '');
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
    node.style.setProperty('--ds-chat-float-x', `${next.x}px`);
    node.style.setProperty('--ds-chat-float-y', `${next.y}px`);
    node.style.setProperty('--ds-chat-float-w', `${next.w}px`);
    node.style.setProperty('--ds-chat-float-h', `${next.h}px`);
  };

  const endSize = () => {
    const drag = sizeRef.current;
    if (!drag) return;
    sizeRef.current = null;
    setFloatPos({ x: drag.next.x, y: drag.next.y });
    setFloatSize({ w: drag.next.w, h: drag.next.h });
    document.documentElement.removeAttribute('data-chat-resizing');
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
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [isFloating, floatPos]);

  if (hidden) return null;

  /* Closed: the FAB is the persistent entry point, bottom right on every
     page, never remounting on navigation (so focus restore works everywhere). */
  if (!renderPanel) {
    return (
      <div className="ds-chat-launcher__fab">
        <AiButton
          {...aiButtonLabels}
          label={label}
          icon={icon}
          aria-expanded={false}
          aria-controls={panelId}
          summary={
            summary
              ? {
                  overline: summary.overline,
                  title: summary.title,
                  caption: summary.caption,
                  text: summary.text,
                  suggestions:
                    summary.suggestions ??
                    summary.chips?.map(({ id, label: chipLabel }) => ({ id, label: chipLabel })),
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
    /* The widget handles Escape-in-fullscreen itself (and stops propagation);
       this one closes the panel from panel view. */
    if (event.key === 'Escape') {
      /* An Escape a menu or picker inside the panel already handled closed
         that layer, not the panel. */
      if (!event.defaultPrevented) setOpen(false);
      return;
    }
    /* A minimal focus trap, only while modal: Tab wraps within the panel.
       Docked mode is non-modal by design: focus flows through the page. */
    if (modal && event.key === 'Tab' && panelRef.current) {
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

  const panelClass = [
    'ds-chat-launcher__panel',
    side === 'left' ? 'ds-chat-launcher__panel--left' : '',
    isFloating ? 'ds-chat-launcher__panel--floating' : '',
    isFull ? 'ds-chat-launcher__panel--full' : '',
    // Inset: the dock and the overlay both sit at the shell's gap; only the
    // dock goes flat, since the overlay still covers the page.
    surface === 'inset' && !isFloating && !isFull ? 'ds-chat-launcher__panel--inset' : '',
    surface === 'inset' && docked && !isFloating && !isFull ? 'ds-chat-launcher__panel--flat' : '',
    panelPhase === 'closing' ? 'ds-chat-launcher__panel--closing' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      {modal && !isFull && (
        <div className="ds-chat-launcher__scrim" onClick={() => setOpen(false)} aria-hidden="true" />
      )}
      <div
        ref={panelRef}
        id={panelId}
        className={panelClass}
        style={
          isFloating && (floatPos || floatSize)
            ? ({
                ...(floatPos && {
                  '--ds-chat-float-x': `${floatPos.x}px`,
                  '--ds-chat-float-y': `${floatPos.y}px`,
                }),
                ...(floatSize && {
                  '--ds-chat-float-w': `${floatSize.w}px`,
                  '--ds-chat-float-h': `${floatSize.h}px`,
                }),
              } as React.CSSProperties)
            : undefined
        }
        onPointerDown={beginMove}
        onPointerMove={moveMove}
        onPointerUp={endMove}
        onPointerCancel={endMove}
        role={modal ? 'dialog' : 'complementary'}
        aria-modal={modal || undefined}
        aria-label={panelLabel}
        onKeyDown={handleKeyDown}
      >
        {/* compact tracks the host's width, not the view: a takeover on a
            phone still wants phone insets, where one on a desktop does not. */}
        <ChatWidget
          {...widget}
          fullscreenEnabled={!takeover}
          placementEnabled={!takeover}
          compact={takeover || !isFull}
          phone={takeover}
        />
        {children}
        {/* The size grips, inside the card's edge rather than straddling it,
            because the panel clips its own overflow. Pointer-only, like the
            dock's widen grip. */}
        {isFloating &&
          FLOAT_GRIPS.map(({ dir, dx, dy }) => (
            <div
              key={dir}
              className="ds-chat-launcher__float-grip"
              data-dir={dir}
              aria-hidden="true"
              onPointerDown={(e) => beginSize(e, dx, dy)}
              onPointerMove={moveSize}
              onPointerUp={endSize}
              onPointerCancel={endSize}
            />
          ))}
      </div>
      {/* The widen grip, docked form only. It rides the panel's inner edge
          as a fixed sibling (the panel clips its own overflow, so a
          straddling child would be cut in half). */}
      {showPanel && isDocked && (
        <div
          className={[
            'ds-chat-launcher__dock-handle',
            side === 'left' ? 'ds-chat-launcher__dock-handle--left' : '',
            surface === 'inset' ? 'ds-chat-launcher__dock-handle--inset' : '',
            resizing ? 'ds-chat-launcher__dock-handle--resizing' : '',
          ]
            .filter(Boolean)
            .join(' ')}
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
