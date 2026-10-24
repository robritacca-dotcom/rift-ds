"use client";

/**
 * The Templates view: one template screen, live, under the playground's
 * levers, staged the way the Chat view stages the widget. The templates
 * rail (TemplatesRail, beside this folder) picks which one; it opens on
 * the marketing dashboard, the list's first. Desktop fills the safe zone
 * between the two panels and carries the same edge grips, so a drag
 * reflows the template through its real breakpoints; Mobile puts the
 * template's phone version in the chat stage's bezel (a template with a
 * phone screen of its own, as the dashboard has, stages that instead).
 * Only the picked template ever runs: the rail shows stills.
 *
 * The templates are full-viewport app shells (a fixed sidebar, a fixed phone
 * stage), so they cannot sit inline in the workspace: each renders in a
 * same-origin iframe of its own template route, the templates carousel's
 * trick. The levers write inline custom properties on the playground's
 * <html> and load Google Fonts links into its <head>, so the frame mirrors
 * all three (the properties, the font links, and data-theme/data-brand) on
 * load and on every change. The frame keeps its own page floor, so the
 * template reads exactly as it does full screen (a cleared floor would
 * also let the browser's opaque backdrop for a cross-color-scheme frame
 * show through as a grey slab).
 */

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { MOTION_SCROLL_SETTLE_MS } from "rift-ds/tokens/motion";
import { STAGED_PRODUCT_NAME_ATTR } from "@/components/templates/useStagedProductName";
import { APP_FRAME_ATTR } from "@/components/templates/AppFrame/AppFrame";
import chatStyles from "./ChatView.module.css";
import { templatesSidebarLinks } from "@/config/navigation";
import styles from "./TemplatesView.module.css";

/* A template whose phone version is a screen of its own: the Mobile stage
   (and a phone) shows that one. Every other template is responsive, so
   its own route at phone width is its phone version. */
const PHONE_SCREENS: Record<string, string> = {
  "/templates/marketing-dashboard": "/templates/mobile-dashboard",
};

const templateTitle = (href: string) =>
  `${templatesSidebarLinks.find((link) => link.href === href)?.label ?? "Template"} template`;

/* The bezel's screen: the chat stage's mobile preset, a real phone
   viewport. Narrower than the template's framed breakpoint, so the
   template renders the bare app and this bezel is the only handset. */
const PHONE = { w: 390, h: 844 };

/** Marks the frame's mirrored font links, so a resync skips them. */
const MIRRORED_FONT_ATTR = "data-playground-font";

/** Marks the frame's injected scrollbar sheet, so a resync skips it. */
const SCROLLBAR_STYLE_ATTR = "data-playground-scrollbars";
/** Set on the frame's root while anything inside it is scrolling. */
const SCROLLING_ATTR = "data-playground-scrolling";

/* The staged app's scrollbars stay out of the picture until a scroll: the
   gutter is kept (so a classic scrollbar never reflows the app as it
   appears), only the thumb is clear at rest. */
const SCROLLBAR_CSS = `
html, html * { scrollbar-width: thin; scrollbar-color: transparent transparent; }
html[${SCROLLING_ATTR}], html[${SCROLLING_ATTR}] * { scrollbar-color: var(--color-divider) transparent; }
`;

/* The stage centres the template, so a drag moves both opposing edges;
   doubling the delta keeps the grabbed edge under the cursor (the Chat
   view's factor). */
const CENTERED_DRAG_FACTOR = 2;

type ResizeAxis = "x" | "y" | "both";

export interface TemplatesViewProps {
  /** The picked template's route. */
  template: string;
  /** Which version to stage: the desktop app or its phone version. */
  size: "desktop" | "mobile";
  /** Stage the phone version in the bezel. A phone-sized playground is
      already a phone, so it gets the bare app filling the stage instead. */
  device: boolean;
  /** The Product name lever, shown in place of the template's own name. */
  productName: string;
}

export default function TemplatesView({
  template,
  size,
  device,
  productName,
}: TemplatesViewProps) {
  const href = size === "mobile" ? (PHONE_SCREENS[template] ?? template) : template;
  const title = templateTitle(href);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const mirroredKeys = useRef<string[]>([]);
  /* Which template's document has loaded and taken the theme. A new
     template is a new document, so the frame hides until it has, and the
     stored look never flashes first. */
  const [readyHref, setReadyHref] = useState<string | null>(null);
  const ready = readyHref === href;
  const hrefRef = useRef(href);
  useEffect(() => {
    hrefRef.current = href;
  }, [href]);
  const productNameRef = useRef(productName);
  const sizeRef = useRef(size);

  const sync = useCallback(() => {
    const doc = frameRef.current?.contentDocument;
    if (!doc?.documentElement || !doc.head) return;
    const root = document.documentElement;
    const frameRoot = doc.documentElement;

    const theme = root.getAttribute("data-theme") ?? "dark";
    frameRoot.setAttribute("data-theme", theme);
    /* The playground suspends data-brand while it is mounted (its levers
       edit the raw token layer), so the frame's stored pick goes too. */
    const brand = root.getAttribute("data-brand");
    if (brand) frameRoot.setAttribute("data-brand", brand);
    else frameRoot.removeAttribute("data-brand");

    /* The Product name lever, which the template reads from this
       attribute (useStagedProductName), so typing never reloads the frame. */
    frameRoot.setAttribute(STAGED_PRODUCT_NAME_ATTR, productNameRef.current);

    /* The Mobile stage is a phone preview, so it carries the flag the
       templates carousel's Mobile mode sets (AppFrame.tsx owns it): a
       template dresses as an app here too, and a narrowed Desktop stage,
       which is only a narrow window, never does. */
    if (sizeRef.current === "mobile") frameRoot.setAttribute(APP_FRAME_ATTR, "");
    else frameRoot.removeAttribute(APP_FRAME_ATTR);

    /* The levers' overrides: every custom property inline on the root,
       replacing the previous mirror so a reset lever clears in the frame. */
    for (const key of mirroredKeys.current) frameRoot.style.removeProperty(key);
    const keys: string[] = [];
    for (let i = 0; i < root.style.length; i++) {
      const name = root.style.item(i);
      if (!name.startsWith("--")) continue;
      frameRoot.style.setProperty(name, root.style.getPropertyValue(name));
      keys.push(name);
    }
    mirroredKeys.current = keys;

    /* The typeface levers' stylesheets, which only the playground loads. */
    document
      .querySelectorAll<HTMLLinkElement>('link[id^="playground-font-"]')
      .forEach((link) => {
        if (doc.querySelector(`link[${MIRRORED_FONT_ATTR}="${link.id}"]`)) return;
        const copy = doc.createElement("link");
        copy.rel = "stylesheet";
        copy.href = link.href;
        copy.setAttribute(MIRRORED_FONT_ATTR, link.id);
        doc.head.appendChild(copy);
      });

    /* The scrollbars, shown while scrolling and hidden once it settles.
       Scroll does not bubble, so a capturing listener catches every
       scroller in the app, the document's own included. */
    if (!doc.head.querySelector(`style[${SCROLLBAR_STYLE_ATTR}]`)) {
      const style = doc.createElement("style");
      style.setAttribute(SCROLLBAR_STYLE_ATTR, "");
      style.textContent = SCROLLBAR_CSS;
      doc.head.appendChild(style);
      let settle: number | undefined;
      doc.addEventListener(
        "scroll",
        () => {
          frameRoot.setAttribute(SCROLLING_ATTR, "");
          window.clearTimeout(settle);
          settle = window.setTimeout(
            () => frameRoot.removeAttribute(SCROLLING_ATTR),
            MOTION_SCROLL_SETTLE_MS
          );
        },
        { capture: true, passive: true }
      );
    }

    setReadyHref(hrefRef.current);
  }, []);

  /* The name is a prop, not a root attribute, so it re-syncs itself. */
  useEffect(() => {
    productNameRef.current = productName;
    sync();
  }, [productName, sync]);

  /* The stage size is a prop too, and Desktop and Mobile can stage the
     same route without a reload, so a flip re-syncs the app-frame flag. */
  useEffect(() => {
    sizeRef.current = size;
    sync();
  }, [size, sync]);

  /* Re-sync on every lever move (the inline style), theme flip, and brand
     change. */
  useEffect(() => {
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["style", "data-theme", "data-brand"],
    });
    return () => observer.disconnect();
  }, [sync]);

  /* ---------- manual resize via the edge grips ----------
     The Chat view's model: the dragged size is inline, the resting size
     is the fit classes', and the CSS walls clamp both. */
  const boardRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    axis: ResizeAxis;
    xSign: number;
    startX: number;
    startY: number;
    width: number;
    height: number;
  } | null>(null);
  const [manual, setManual] = useState<{ w?: number; h?: number }>({});
  const [resizing, setResizing] = useState(false);

  const beginResize = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.pointerType === "mouse" && e.button !== 0) || dragRef.current) return;
    const axis = e.currentTarget.dataset.axis as ResizeAxis;
    const rect = boardRef.current?.getBoundingClientRect();
    if (!axis || !rect) return;
    dragRef.current = {
      axis,
      xSign: e.currentTarget.dataset.edge === "left" ? -1 : 1,
      startX: e.clientX,
      startY: e.clientY,
      width: rect.width,
      height: rect.height,
    };
    /* Dropping the fit classes is React's job: commit the starting size on
       the dragged axes now (a discrete event, so it lands before the first
       move writes the DOM). */
    const start: { w?: number; h?: number } = {};
    if (axis !== "y") start.w = Math.round(rect.width);
    if (axis !== "x") start.h = Math.round(rect.height);
    setManual((m) => ({ ...m, ...start }));
    e.currentTarget.setPointerCapture(e.pointerId);
    setResizing(true);
  };

  /* A drag renders nothing until the pointer lets go: the grips write the
     size straight onto the board one frame at a time, and the readout's
     text onto its node, and the release commits the final size through
     React. The Chat view's resize owns the reasoning (React 19.2 counts a
     commit that ends with the next move queued as a nested update, and a
     real drag over a re-rendering stage reached its limit, error #185). */
  const pendingSizeRef = useRef<{ w?: number; h?: number } | null>(null);
  const sizeFrameRef = useRef(0);
  const readoutRef = useRef<HTMLDivElement | null>(null);
  const paintReadout = (board: HTMLElement) => {
    const out = readoutRef.current;
    if (!out) return;
    const rect = board.getBoundingClientRect();
    out.textContent = `${Math.round(rect.width)} × ${Math.round(rect.height)}`;
  };
  const paintSize = () => {
    sizeFrameRef.current = 0;
    const board = boardRef.current;
    if (!board) return;
    const next = pendingSizeRef.current;
    if (next?.w != null) board.style.width = `${next.w}px`;
    if (next?.h != null) board.style.height = `${next.h}px`;
    paintReadout(board);
  };
  const commitSize = () => {
    cancelAnimationFrame(sizeFrameRef.current);
    paintSize();
    const next = pendingSizeRef.current;
    pendingSizeRef.current = null;
    if (next) setManual((m) => ({ ...m, ...next }));
  };
  useEffect(() => () => cancelAnimationFrame(sizeFrameRef.current), []);
  useLayoutEffect(() => {
    if (resizing && boardRef.current) paintReadout(boardRef.current);
  }, [resizing]);

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
    if (!sizeFrameRef.current) sizeFrameRef.current = requestAnimationFrame(paintSize);
  };

  const endResize = () => {
    dragRef.current = null;
    commitSize();
    setResizing(false);
  };

  const frame = (
    <iframe
      key={href}
      ref={frameRef}
      src={href}
      title={title}
      className={`${styles.frame} ${ready ? styles.frameReady : ""}`}
      onLoad={sync}
    />
  );

  return (
    <div className={chatStyles.stage}>
      <div
        className={[
          chatStyles.widgetFrame,
          resizing ? chatStyles.resizing : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {device ? (
          <div className={chatStyles.deviceShell}>
            {/* The chat stage's bezel: OS strips around the app, set
                dressing hidden from the tree. */}
            <div
              className={`${chatStyles.deviceScreen} ${styles.deviceScreen}`}
              style={{ width: PHONE.w, height: PHONE.h }}
            >
              <div className={chatStyles.statusBar} aria-hidden="true">
                <span className={chatStyles.statusTime}>9:41</span>
                <span className={chatStyles.dynamicIsland} />
                <span className={chatStyles.statusIcons}>
                  <span className="material-symbols-rounded">signal_cellular_alt</span>
                  <span className="material-symbols-rounded">wifi</span>
                  <span className="material-symbols-rounded">battery_full</span>
                </span>
              </div>
              <div className={styles.deviceApp}>{frame}</div>
              <div className={chatStyles.homeBar} aria-hidden="true">
                <span className={chatStyles.homeIndicator} />
              </div>
            </div>
          </div>
        ) : (
          <>
            <div
              ref={boardRef}
              className={[
                styles.board,
                manual.w == null ? chatStyles.widgetFitW : "",
                manual.h == null ? chatStyles.widgetFitH : "",
                resizing ? styles.boardResizing : "",
              ]
                .filter(Boolean)
                .join(" ")}
              style={{ width: manual.w, height: manual.h }}
            >
              {frame}
            </div>

            {/* The Chat view's grips: straddling the edges, mouse-driven,
                gone on compact screens (its stylesheet owns that).
                pointercancel ends a drag too. */}
            {(
              [
                { cls: chatStyles.handleLeft, axis: "x", edge: "left" },
                { cls: chatStyles.handleRight, axis: "x", edge: undefined },
                { cls: chatStyles.handleBottom, axis: "y", edge: undefined },
                { cls: chatStyles.handleCorner, axis: "both", edge: undefined },
              ] as const
            ).map(({ cls, axis, edge }) => (
              <div
                key={axis + (edge ?? "")}
                className={`${chatStyles.handle} ${cls}`}
                aria-hidden="true"
                data-axis={axis}
                data-edge={edge}
                onPointerDown={beginResize}
                onPointerMove={moveResize}
                onPointerUp={endResize}
                onPointerCancel={endResize}
                /* Double-click returns the template to the resting fit. */
                onDoubleClick={() => setManual({})}
              />
            ))}

            {resizing && (
              <div ref={readoutRef} className={chatStyles.sizeReadout} aria-hidden="true" />
            )}
          </>
        )}
      </div>
    </div>
  );
}
