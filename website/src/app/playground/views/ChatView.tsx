"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AiButton } from "rift-ds/components/AiButton/AiButton";
import { ModelPicker } from "rift-ds/components/ModelPicker/ModelPicker";
import {
  ChatWidget,
  dockWidthFromDrag,
  isFloatDragStart,
  useChatWidget,
  useTakeoverViewport,
} from "rift-ds/chat";
import {
  DEMO_MENTIONS,
  DEMO_MODELS,
  DEMO_STARTERS,
  DemoWelcome,
  demoAgentTabs,
  type DemoWelcomeVariant,
} from "rift-ds/chat/demo";
import styles from "./ChatView.module.css";

/** The composer's placeholder when the Placeholder lever is empty. The
    simulated stage has mentions on, so its line says how to reach them;
    the live stage has none to offer and keeps the plain ask. */
export const defaultChatPlaceholder = (simulated: boolean) =>
  simulated ? "Ask anything, @ for entities or / for commands" : "Ask anything";

export type TransportMode = "live" | "sim";
type ResizeAxis = "x" | "y" | "both";

/* Review targets, not layout tokens. Two footprints are enough: the
   desktop card, which rests filling the stage's safe zone (its size
   derives from the available space; w/h here are only the drag baseline
   the type shares), and the mobile preset, a real phone viewport rendered
   edge-to-edge in a bezel, the presentation a phone visitor actually gets
   (the site panel drops its card chrome below 720px). */
export const STAGE_SIZES = {
  desktop: { label: "Desktop", w: 880, h: 956, device: false, notch: false },
  mobile: { label: "Mobile (390px)", w: 390, h: 844, device: true, notch: true },
} as const;
export type StageSize = keyof typeof STAGE_SIZES;

export interface ChatViewProps {
  /** The widget's header brand: follows the Product name lever. */
  title: string;
  /** The review footprint: desktop as a resizable card, mobile in a bezel. */
  size: StageSize;
  /** The composer's placeholder copy; empty falls back to `defaultChatPlaceholder`. */
  placeholder: string;
  /** What the welcome screen holds under the composer: the starters, one
      of the demo fillings, or nothing. */
  welcome: DemoWelcomeVariant;
  /** The dragged size, held by the page so it survives a switch to the
      Components view and back, and dies with the playground like every
      other lever. */
  manual: { w?: number; h?: number };
  /** Reports a drag's partial size; the page merges it functionally. */
  onManual: (next: { w?: number; h?: number }) => void;
  /** The takeover is a desktop affordance: compact screens are already
      edge-to-edge, so the page withholds it there. */
  allowFullscreen: boolean;
  /** The Simulated transport is active: the composer swaps the site's live
      model picker for the mock picker and the attach button, and the rails
      stage their demo data. */
  simControls: boolean;
  /** Stage the open-sessions tab strip across the conversation's top. */
  railTabs: boolean;
  /** Stage the agent pane on the conversation's trailing edge: the agent's
      portrait over its activity, approvals, automations and personalisation.
      Wide cards seat it inline, narrow ones raise it as a bottom sheet from
      the header's agent button. */
  agentRail: boolean;
  /** The Artifact panel lever: seats the widget's artifact panel. */
  artifactPanel: boolean;
}

/**
 * The Chat view: the package's ChatWidget on a stage, re-themed by the same
 * levers as everything else. The provider lives up in the page, wrapped
 * around the whole layout, so the event rail and the compact Drawer can
 * direct the same conversation the stage renders, and the transcript
 * survives a switch to the Components view and back. The widget's title
 * follows the Product name lever and its copy is deliberately generic: the
 * stage shows a consumer's product, not the site's own assistant.
 *
 * The thread lifecycle (the shimmering new row, pin and unpin, inline
 * rename, delete, the synced tabs) is the widget's own, over the provider's
 * `threads` options; the page shapes those from the rail levers. What this
 * view owns is the stage: the card, its grips, the bezel, the dock and
 * floating seats, and the takeover glide.
 */
export default function ChatView({
  title,
  size,
  placeholder,
  welcome,
  manual,
  onManual,
  allowFullscreen,
  simControls,
  railTabs,
  agentRail,
  artifactPanel,
}: ChatViewProps) {
  const { open, setOpen, view, side, floating, returnFocusRef, send } = useChatWidget();

  /* A real phone viewport: the stage-size lever is hidden there and the
     widget goes fluid, so the preset alone cannot say it is a phone. */
  const phoneViewport = useTakeoverViewport();

  /* The provider defaults to closed (the site's resting state); the view
     exists to look at the widget, so it opens on arrival. */
  useEffect(() => {
    setOpen(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Closing hands focus to the launcher so the keyboard never lands on
     <body>. Opening is handled inside the widget (composer focus). */
  const launcherRef = useRef<HTMLButtonElement | HTMLAnchorElement | null>(null);
  useEffect(() => {
    if (!open) launcherRef.current?.focus();
  }, [open]);

  /* ---------- manual resize via the edge handles ----------
     The stage centres the widget, so a drag moves both opposing edges:
     deltas are doubled to keep the grabbed edge under the cursor. Sizes
     are clamped by the CSS min/max. */
  const widgetRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{
    axis: ResizeAxis;
    xSign: number;
    startX: number;
    startY: number;
    width: number;
    height: number;
  } | null>(null);
  const [resizing, setResizing] = useState(false);

  const beginResize = (e: React.PointerEvent<HTMLDivElement>) => {
    // Primary button only, one drag at a time: a second concurrent pointer
    // must not hijack an in-flight drag's baseline.
    if ((e.pointerType === "mouse" && e.button !== 0) || dragRef.current) return;
    const axis = e.currentTarget.dataset.axis as ResizeAxis;
    const rect = widgetRef.current?.getBoundingClientRect();
    if (!axis || !rect) return;
    dragRef.current = {
      axis,
      // Dragging the left edge outward means a negative pointer delta.
      xSign: e.currentTarget.dataset.edge === "left" ? -1 : 1,
      startX: e.clientX,
      startY: e.clientY,
      width: rect.width,
      height: rect.height,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
    setResizing(true);
  };

  /* The stage centres the widget, so a drag moves both opposing edges;
     doubling the delta keeps the grabbed edge under the cursor. */
  const CENTERED_DRAG_FACTOR = 2;

  /* One size per animation frame, however fast the pointer reports: a
     chart on the stage (the dashboard welcome, a chart card) answers every
     re-render that moves its ticks with a recharts store dispatch of its
     own, and pointer events arriving faster than frames stacked those past
     React's nested-update limit (error #185, recharts/recharts#7563). Both
     grips queue their latest value here; a release flushes it so the card
     lands where the pointer let go. */
  const pendingSizeRef = useRef<{ w?: number; h?: number } | null>(null);
  const pendingDockRef = useRef<number | null>(null);
  const sizeFrameRef = useRef(0);
  const flushSize = () => {
    sizeFrameRef.current = 0;
    const next = pendingSizeRef.current;
    const dock = pendingDockRef.current;
    pendingSizeRef.current = null;
    pendingDockRef.current = null;
    if (next) onManual(next);
    if (dock != null) setDockWidth(dock);
  };
  const queueSize = () => {
    if (!sizeFrameRef.current) sizeFrameRef.current = requestAnimationFrame(flushSize);
  };
  const flushSizeNow = () => {
    cancelAnimationFrame(sizeFrameRef.current);
    flushSize();
  };
  useEffect(() => () => cancelAnimationFrame(sizeFrameRef.current), []);

  const moveResize = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    const next: { w?: number; h?: number } = {};
    if (drag.axis !== "y")
      next.w = Math.round(
        drag.width + (e.clientX - drag.startX) * CENTERED_DRAG_FACTOR * drag.xSign
      );
    if (drag.axis !== "x")
      next.h = Math.round(drag.height + (e.clientY - drag.startY) * CENTERED_DRAG_FACTOR);
    pendingSizeRef.current = next;
    queueSize();
  };

  const endResize = () => {
    dragRef.current = null;
    flushSizeNow();
    setResizing(false);
    /* A card that grew may now reach past the stage from where it was
       moved to; one frame later, once the new size has rendered. */
    requestAnimationFrame(reclampOffset);
  };

  /* ---------- the docked card's widen grip ----------
     The site's docked panel widens from its inner edge between two walls;
     the stage's docked card is its stand-in, so it gets the same grip and
     the same walls (dockWidthFromDrag owns both). The outer edge is held
     by the stage, so the delta is the pointer's own, no centred doubling.
     The width is the view's to keep: it survives a trip to floating and
     back, and dies with the view. */
  const [dockWidth, setDockWidth] = useState<number | null>(null);
  const dockDragRef = useRef<{ startX: number; width: number } | null>(null);

  const beginDockResize = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.pointerType === "mouse" && e.button !== 0) || dockDragRef.current) return;
    const rect = widgetRef.current?.getBoundingClientRect();
    if (!rect) return;
    dockDragRef.current = { startX: e.clientX, width: rect.width };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    setResizing(true);
  };

  const moveDockResize = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dockDragRef.current;
    if (!drag) return;
    pendingDockRef.current = dockWidthFromDrag(drag.width, e.clientX - drag.startX, side);
    queueSize();
  };

  const endDockResize = () => {
    dockDragRef.current = null;
    flushSizeNow();
    setResizing(false);
  };

  /* ---------- the floating card's move ----------
     The site's floating panel is dragged by its header (ChatLauncher); the
     stage card is that seat's stand-in, so it moves the same way. The walls
     are the stage's own content box rather than the viewport, which keeps
     the card off the rails and the two bars, so a card at its resting fit,
     which fills that box, has nowhere to go until it is sized down. The
     offset is a relative nudge on the frame, not a transform: a transformed
     ancestor would capture the takeover's position: fixed. */
  const stageRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<HTMLDivElement | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [moving, setMoving] = useState(false);
  const moveRef = useRef<{
    startX: number;
    startY: number;
    origin: { x: number; y: number };
    /* How far the frame may travel each way from where the drag began. */
    room: { left: number; right: number; up: number; down: number };
  } | null>(null);

  /* The room between the frame and the stage's content box, per side;
     never negative, so a card already past a wall simply cannot go
     further that way. */
  const measureRoom = () => {
    const stage = stageRef.current;
    const frame = frameRef.current;
    if (!stage || !frame) return null;
    const box = stage.getBoundingClientRect();
    const pad = getComputedStyle(stage);
    const rect = frame.getBoundingClientRect();
    return {
      left: Math.max(0, rect.left - (box.left + parseFloat(pad.paddingLeft))),
      right: Math.max(0, box.right - parseFloat(pad.paddingRight) - rect.right),
      up: Math.max(0, rect.top - (box.top + parseFloat(pad.paddingTop))),
      down: Math.max(0, box.bottom - parseFloat(pad.paddingBottom) - rect.bottom),
    };
  };

  const beginMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!placeable || !floating || fullPhase !== "closed" || moveRef.current) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if (!isFloatDragStart(e.target)) return;
    const room = measureRoom();
    if (!room) return;
    moveRef.current = { startX: e.clientX, startY: e.clientY, origin: offset, room };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    setMoving(true);
  };

  const moveMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const move = moveRef.current;
    if (!move) return;
    const dx = Math.min(move.room.right, Math.max(-move.room.left, e.clientX - move.startX));
    const dy = Math.min(move.room.down, Math.max(-move.room.up, e.clientY - move.startY));
    setOffset({ x: Math.round(move.origin.x + dx), y: Math.round(move.origin.y + dy) });
  };

  const endMove = () => {
    if (!moveRef.current) return;
    moveRef.current = null;
    setMoving(false);
  };

  /* Pulls a moved card back inside the stage after the stage or the card
     changed size under it. */
  const reclampOffset = () => {
    const stage = stageRef.current;
    const frame = frameRef.current;
    if (!stage || !frame) return;
    const box = stage.getBoundingClientRect();
    const pad = getComputedStyle(stage);
    const rect = frame.getBoundingClientRect();
    const overRight = rect.right - (box.right - parseFloat(pad.paddingRight));
    const overLeft = box.left + parseFloat(pad.paddingLeft) - rect.left;
    const overDown = rect.bottom - (box.bottom - parseFloat(pad.paddingBottom));
    const overUp = box.top + parseFloat(pad.paddingTop) - rect.top;
    setOffset((current) => {
      /* Past one wall, slide back by the overshoot; past both, the card is
         simply wider than the stage and centring is the fair answer. */
      const x =
        overRight > 0 && overLeft > 0 ? 0 : overRight > 0 ? current.x - overRight : overLeft > 0 ? current.x + overLeft : current.x;
      const y =
        overDown > 0 && overUp > 0 ? 0 : overDown > 0 ? current.y - overDown : overUp > 0 ? current.y + overUp : current.y;
      return x === current.x && y === current.y ? current : { x: Math.round(x), y: Math.round(y) };
    });
  };

  useEffect(() => {
    window.addEventListener("resize", reclampOffset);
    return () => window.removeEventListener("resize", reclampOffset);
  }, []);

  /* The devtools-style readout: the widget's actual rendered size while a
     grip is being dragged, the rect rather than the requested size, so the
     CSS clamps are visible the moment a drag hits one. Read a frame later
     rather than inside the effect, so the readout's own update never chains
     onto the commit the drag caused (see the frame coalescing above), and
     an unchanged size sets nothing. */
  const [readout, setReadout] = useState<{ w: number; h: number } | null>(null);
  useEffect(() => {
    if (!resizing) return;
    const raf = requestAnimationFrame(() => {
      const rect = widgetRef.current?.getBoundingClientRect();
      if (!rect) return;
      const w = Math.round(rect.width);
      const h = Math.round(rect.height);
      setReadout((current) => (current?.w === w && current?.h === h ? current : { w, h }));
    });
    return () => cancelAnimationFrame(raf);
  }, [manual, dockWidth, resizing]);

  const preset = STAGE_SIZES[size];
  const isDevice = preset.device;
  /* The header's Chat position menu, and the seats it offers, belong to the
     desktop card, the same gate as the takeover, for the same reason: a
     phone is already edge to edge. */
  const placeable = allowFullscreen && !isDevice;
  /* Docked, the card takes the site panel's docked footprint against one
     edge of the stage: its resting width, the stage's full height. */
  const stageDocked = placeable && !floating;
  const isCompact = preset.w < 500 || stageDocked;
  /* The takeover: the widget's own expand button drives the view; the stage
     just dresses the widget as a full-viewport surface while it lasts. */
  const isFull = allowFullscreen && !isDevice && view === "full";

  /* ---------- the takeover glide (the live panel's animation) ----------
     The site panel glides because it is always fixed: only animatable
     properties change. The stage widget is in-flow, so the same feel
     needs a FLIP: pin the card as fixed at its current rect, let the
     transition carry it to the viewport, and reverse on the way out. A
     spacer holds the card's slot meanwhile, and is also the measured
     return target, so a scroll during fullscreen can't strand the card. */
  type FullPhase = "closed" | "pinned" | "open" | "closing";
  const [fullPhase, setFullPhase] = useState<FullPhase>("closed");
  /* State, not a ref: the rect is read during render (the pinned style,
     the spacer's footprint), and it only changes at phase transitions. */
  const [flipRect, setFlipRect] = useState<{
    x: number;
    y: number;
    w: number;
    h: number;
  } | null>(null);
  const spacerRef = useRef<HTMLDivElement | null>(null);

  /* The phase machine reacts to the context's view flipping, and each
     step must measure the DOM the previous step produced. */
  useLayoutEffect(() => {
    if (isFull && fullPhase === "closed") {
      const r = widgetRef.current?.getBoundingClientRect();
      if (r) setFlipRect({ x: r.x, y: r.y, w: r.width, h: r.height });
      setFullPhase("pinned");
    } else if (!isFull && (fullPhase === "open" || fullPhase === "pinned")) {
      const r = spacerRef.current?.getBoundingClientRect();
      if (r) setFlipRect({ x: r.x, y: r.y, w: r.width, h: r.height });
      setFullPhase("closing");
    }
  }, [isFull, fullPhase]);

  /* Two frames between pin and release, so the transition has a starting
     geometry to leave from. */
  useEffect(() => {
    if (fullPhase !== "pinned") return;
    const raf = requestAnimationFrame(() =>
      requestAnimationFrame(() => setFullPhase("open"))
    );
    return () => cancelAnimationFrame(raf);
  }, [fullPhase]);

  /* The glide home ends on transitionend; the timeout is the reduced-motion
     fallback (zeroed durations fire no event). */
  useEffect(() => {
    if (fullPhase !== "closing") return;
    const el = widgetRef.current;
    const done = () => setFullPhase("closed");
    el?.addEventListener("transitionend", done, { once: true });
    const fallback = setTimeout(done, 600);
    return () => {
      el?.removeEventListener("transitionend", done);
      clearTimeout(fallback);
    };
  }, [fullPhase]);

  const takeover = fullPhase !== "closed";
  const pinnedStyle =
    (fullPhase === "pinned" || fullPhase === "closing") && flipRect
      ? {
          top: flipRect.y,
          left: flipRect.x,
          width: flipRect.w,
          height: flipRect.h,
        }
      : undefined;

  const widgetEl = (
    <div
      ref={widgetRef}
      className={[
        styles.widget,
        isDevice ? styles.widgetDevice : "",
        /* Resting sizes stay fitted to the column and viewport; a manual
           drag drops the matching clamp so the card can grow past both:
           the workspace edge is the one wall that remains. The takeover
           carries no fit clamps at all, or they would cap it. */
        !takeover && !isDevice && !stageDocked && manual.w == null ? styles.widgetFitW : "",
        !takeover && !isDevice && !stageDocked && manual.h == null ? styles.widgetFitH : "",
        !takeover && stageDocked ? styles.widgetDocked : "",
        !takeover && placeable && floating ? styles.widgetFloating : "",
        takeover ? styles.widgetFull : "",
      ]
        .filter(Boolean)
        .join(" ")}
      /* Pinned phases hold the card's rect so the glide has somewhere to
         start and land; open lets the class's viewport geometry rule; in
         device mode the screen wrapper owns the size. Otherwise only a
         manual drag sizes the card inline: at rest the fit classes derive
         its size from the stage's available space, with the CSS clamps
         over both. */
      style={
        takeover
          ? pinnedStyle
          : isDevice
            ? undefined
            : stageDocked
              ? { width: dockWidth ?? undefined }
              : { width: manual.w, height: manual.h }
      }
      onPointerDown={beginMove}
      onPointerMove={moveMove}
      onPointerUp={endMove}
      onPointerCancel={endMove}
    >
      <ChatWidget
        fullscreenEnabled={allowFullscreen && !isDevice}
        placementEnabled={placeable}
        compact={isCompact}
        /* The bezel previews a phone, and a phone is one: both get the
           stacked welcome the site's takeover shows. */
        phone={isDevice || phoneViewport}
        title={title}
        placeholder={
          placeholder.trim() === "" ? defaultChatPlaceholder(simControls) : placeholder
        }
        showStarters={welcome === "starters"}
        /* The Welcome lever's other fillings ride the widget slot. The
           dashboard runs long, so it always turns the welcome into a page;
           the tiles and cards only fit beside the greeting on the
           full-screen stage, so on the card and in the bezel they scroll
           too, rather than being dropped for want of height. */
        widgets={
          welcome === "links" || welcome === "cards" || welcome === "dashboard" ? (
            <DemoWelcome variant={welcome} onAsk={(prompt) => send(prompt)} />
          ) : undefined
        }
        widgetsLayout={welcome === "dashboard" || !isFull ? "scroll" : "fit"}
        widgetsWidth={welcome === "dashboard" ? "wide" : "column"}
        tagline="How can we help you today?"
        /* The staged product's chat history: the widget's built-in rail over
           the provider's thread lifecycle, which the page shapes from the
           rail levers. The slide-over sheet names the product and skips the
           collapse (the scrim is its dismissal); the wide inline rail skips
           the brand (the chat header already says it) and offers the
           collapse instead. Simulated-transport set dressing like the mock
           picker: on Live the threads stand down and the widget reverts to
           the site's classic look. */
        threads={simControls}
        threadsProps={{
          logo: <span className={styles.threadsLogoDot} />,
          logoText: title,
          profile: { name: "Jordan Reyes", meta: "Pro" },
        }}
        /* The artifact panel, staged like the agent pane and gated the same
           way: its artifacts come from the demo script. */
        artifacts={simControls && artifactPanel}
        /* The agent pane, staged like the threads rail and gated the same
           way: simulated transport only, since it stands for a consumer's
           own agent rather than this site's chat. */
        agent={
          simControls && agentRail
            ? {
                tabs: demoAgentTabs(title),
                profile: {
                  name: title,
                  status: "Connected",
                  onEdit: () => {},
                  editLabel: `Edit ${title}`,
                },
              }
            : undefined
        }
        /* The strip of open sessions, staged like the rail: desktop card
           only (the bezel and a real phone keep the plain header). */
        tabs={simControls && railTabs && !isDevice && !phoneViewport}
        starters={DEMO_STARTERS}
        /* Real files on the simulated stage: the picker, paste and drop all
           work, previews are built in the browser, and nothing is uploaded.
           The live stage keeps the site's text-only composer. */
        fileAttachments={simControls}
        /* Mentions ride the same switch: mock people, files and skills on
           the simulated stage, nothing on the live one. */
        mentions={simControls ? DEMO_MENTIONS : undefined}
        composerActions={
          simControls ? (
            /* Working mock: the panel opens and the pill follows the choice,
               but nothing routes anywhere; the script is the script whatever
               the pill says. */
            <ModelPicker models={DEMO_MODELS} placement="top" />
          ) : undefined
        }
      />
    </div>
  );

  return (
    <div
      ref={stageRef}
      className={`${styles.stage} ${
        stageDocked ? (side === "left" ? styles.stageDockLeft : styles.stageDockRight) : ""
      }`}
    >
      {open ? (
        <div
          ref={frameRef}
          className={`${styles.widgetFrame} ${resizing || moving ? styles.resizing : ""}`}
          /* Only the floating card carries its nudge; docking seats it
             against the edge and remembers the spot for the way back. */
          style={placeable && floating ? { left: offset.x, top: offset.y } : undefined}
        >
          {/* Holds the card's slot while the widget is off being the
              takeover: the stage doesn't collapse, and coming back has a
              measurable target. */}
          {takeover && (
            <div
              ref={spacerRef}
              className={styles.spacer}
              style={{ width: flipRect?.w, height: flipRect?.h }}
              aria-hidden="true"
            />
          )}
          {isDevice ? (
            <div className={styles.deviceShell}>
              {/* The screen: OS chrome above and below the widget, one
                  glass surface behind all three. The strips are set
                  dressing, hidden from the tree like the grips. */}
              <div
                className={styles.deviceScreen}
                style={{ width: preset.w, height: preset.h }}
              >
                <div className={styles.statusBar} aria-hidden="true">
                  <span className={styles.statusTime}>9:41</span>
                  {preset.notch && <span className={styles.dynamicIsland} />}
                  <span className={styles.statusIcons}>
                    <span className="material-symbols-rounded">
                      signal_cellular_alt
                    </span>
                    <span className="material-symbols-rounded">wifi</span>
                    <span className="material-symbols-rounded">battery_full</span>
                  </span>
                </div>
                {widgetEl}
                <div className={styles.homeBar} aria-hidden="true">
                  <span className={styles.homeIndicator} />
                </div>
              </div>
            </div>
          ) : (
            widgetEl
          )}

          {/* Resize grips: review tooling, straddling the widget edges so
              they stay clear of the thread's scrollbar. Mouse-driven only;
              the device presets are fixed hardware sizes, so the grips
              disappear there. pointercancel ends a drag too, or an
              interrupted drag would leave transitions and text selection
              disabled. */}
          {!isDevice &&
            !stageDocked &&
            fullPhase === "closed" &&
            (
              [
                { cls: styles.handleLeft, axis: "x", edge: "left" },
                { cls: styles.handleRight, axis: "x", edge: undefined },
                { cls: styles.handleBottom, axis: "y", edge: undefined },
                { cls: styles.handleCorner, axis: "both", edge: undefined },
              ] as const
            ).map(({ cls, axis, edge }) => (
              <div
                key={axis + (edge ?? "")}
                className={`${styles.handle} ${cls}`}
                aria-hidden="true"
                data-axis={axis}
                data-edge={edge}
                onPointerDown={beginResize}
                onPointerMove={moveResize}
                onPointerUp={endResize}
                onPointerCancel={endResize}
              />
            ))}

          {/* Docked, one grip: the site panel's widen handle, on the edge
              that faces the stage. */}
          {stageDocked && fullPhase === "closed" && (
            <div
              className={`${styles.handle} ${
                side === "left" ? styles.handleRight : styles.handleLeft
              }`}
              aria-hidden="true"
              onPointerDown={beginDockResize}
              onPointerMove={moveDockResize}
              onPointerUp={endDockResize}
              onPointerCancel={endDockResize}
            />
          )}

          {resizing && readout && (
            <div className={styles.sizeReadout} aria-hidden="true">
              {readout.w} &times; {readout.h}
            </div>
          )}
        </div>
      ) : (
        <div className={styles.launcher}>
          <AiButton
            ref={launcherRef}
            label={`Ask ${title}`}
            icon="forum"
            aria-expanded={false}
            onClick={() => {
              returnFocusRef.current = null;
              setOpen(true);
            }}
          />
        </div>
      )}
    </div>
  );
}
