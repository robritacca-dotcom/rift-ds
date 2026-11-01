"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MOTION_AUTOPLAY_INTERVAL_MS } from "rift-ds/tokens/motion";
import { Button } from "rift-ds/components/Button/Button";
import { SegmentedControl } from "rift-ds/components/SegmentedControl/SegmentedControl";
import DotBackground from "@/components/DotBackground/DotBackground";
import { DEVICES, syncTemplateFrame } from "@/components/TemplateFrame/TemplateFrame";
import {
  Cursor,
  DEVICE_SEGMENTS,
  FOOTPRINT,
  HEADER_MIN,
  HEADER_ROOM,
  HEADER_TOGGLE_LABELS_MIN,
  PHONE,
} from "@/components/HomeChatFrame/HomeChatFrame";
import chatStyles from "@/components/HomeChatFrame/HomeChatFrame.module.css";
import styles from "./HomeDashboardFrame.module.css";

/* ============================================
   The home page's window onto a whole screen: the analytics template, live
   in a same-origin iframe (a template sizes itself from the viewport, so it
   needs a viewport of its own, the way TemplateFrame draws the carousel's)
   and scaled to the frame's width. A collaborator's cursor drives it: it
   rests on two cities, opens and closes the rail's menus, asks the assistant
   a question, reads a bar of the live chart, opens a range menu, describes
   the table it wants and watches the rows change, undoes that, and starts
   again. Describe answers from the template's own interpreter, never a
   model, so the loop costs nothing.

   It wears the chat frame's shell, at the chat frame's footprint: the dot
   ground, the inset card, and a header with the name, a device toggle and
   the key links. Like the chat it holds its shape on a narrow screen, a
   miniature of the desktop with the header stood down. The toggle stands a
   phone on the ground instead, the template in its app dressing, and a
   fingertip does the part of the script a thumb can. The page keeps a
   1440px viewport inside the card, scaled to fit, so the template's layout
   and its docked assistant are the desktop's.

   The stage is a picture to the visitor: inert, hidden from assistive tech,
   and covered by one link to the template. The cursor and its ring are the
   chat frame's. Every state on screen is the template's own, reached by real
   events dispatched on its real controls.

   Two stages never run at once: the document loads only as the frame nears
   the viewport, the script starts when it is in view, and out of view it
   waits at its next beat with the page's own loops, the map's pulses among
   them, paused. Under reduced motion there is no script,
   only the page at rest. If the script loses a control it stops, and the
   page stays as it is.
   ============================================ */

const HREF = "/templates/analytics";
const TITLE = "Analytics";
const CURSOR_NAME = "Ines";

/* The header's key links. */
const HEADER_LINKS = [
  { href: HREF, label: "Template", icon: "open_in_new" },
  { href: "/playground", label: "Playground", icon: "palette" },
];

/* Holds every CSS loop in the page while the frame is out of view. */
const PAUSED_ATTR = "data-frame-paused";
const PAUSE_STYLE_ID = "frame-pause";
const PAUSE_STYLE = `[${PAUSED_ATTR}] *, [${PAUSED_ATTR}] *::before, [${PAUSED_ATTR}] *::after { animation-play-state: paused !important; }`;

/* The OS strips float over the page, so it runs the whole screen and scrolls
   under them, blurred and faded. Its own bars keep clear of them. */
const PHONE_SAFE_AREA_ID = "phone-safe-area";
const PHONE_SAFE_AREA = `
  .ds-top-app-bar { padding-block-start: 54px; }
  .ds-bottom-nav { margin-block-end: 24px; }
`;

function dressPage(doc: Document, designH: number, phone: boolean) {
  syncTemplateFrame(doc, designH, phone);
  if (!doc.getElementById(PAUSE_STYLE_ID)) {
    const style = doc.createElement("style");
    style.id = PAUSE_STYLE_ID;
    style.textContent = PAUSE_STYLE;
    doc.head.appendChild(style);
  }
  if (phone && !doc.getElementById(PHONE_SAFE_AREA_ID)) {
    const style = doc.createElement("style");
    style.id = PHONE_SAFE_AREA_ID;
    style.textContent = PHONE_SAFE_AREA;
    doc.head.appendChild(style);
  }
}

/* How far past the viewport the frame counts as near enough to load. */
const LOAD_MARGIN = "25%";

/* The script's beats, the chat reel's, and its cursor staging. */
const READ_BEAT_MS = MOTION_AUTOPLAY_INTERVAL_MS;
const SHORT_BEAT_MS = MOTION_AUTOPLAY_INTERVAL_MS / 2;
const MOVE_MIN_MS = 450;
const MOVE_MAX_MS = 1100;
const MOVE_MS_PER_PX = 0.7;
const CLICK_MS = 260;
const TYPE_CHAR_MS = 55;
const TYPE_SPACE_MS = 120;
const SCROLL_MS_PER_PX = 0.9;
const SCROLL_MAX_MS = 1400;
const GIVE_UP_MS = 15000;
/* The room a scrolled-to panel leaves above it for the template's top bar. */
const SCROLL_CLEARANCE = 96;

/* What the script asks for on the template's page. */
const CITIES = ["London", "Tokyo"];
const PHONE_CITIES = ["London", "Lagos"];
const ASK_LABEL = "Ask AI";
const QUESTION = "Who is on the site now?";
/* The answer's last words, so the script waits out its reasoning and stream. */
const ANSWER = "the most, at 483.";
const CLOSE_CHAT_LABEL = "Close chat";
const LIVE_PANEL = 'section[aria-label="Active users per minute"]';
const SOURCE_PANEL = 'section[aria-label="Active users by source"]';
const CITY_TABLE = 'section[aria-label="Active users by city"]';
const OVERVIEW_PANEL = 'section[aria-label="This week\'s overview"]';
const MENU_ROWS = ["Audience", "Acquisition"];
const NEW_CHAT_LABEL = "New chat";
const DESCRIBE_LABEL = "Describe";
const DESCRIBE_SENTENCE = "Organic cities over 60 users, most views first";
const DESCRIBE_APPLY_LABEL = "Apply";
const DESCRIBE_DONE = "Showing ";
const UNDO_LABEL = "Undo";

/** Thrown into the script when the frame unmounts, to unwind it quietly. */
const CANCELLED = Symbol("cancelled");

type Device = "desktop" | "mobile";

export default function HomeDashboardFrame() {
  const frameRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const visible = useRef(false);
  const [width, setWidth] = useState(0);
  const [near, setNear] = useState(false);
  const [seen, setSeen] = useState(false);
  const [loaded, setLoaded] = useState<Device | null>(null);
  const [stopped, setStopped] = useState(false);

  const [device, setDevice] = useState<Device>("desktop");
  /* The desktop page inside the card: its scale, and its height at that scale. */
  const [page, setPage] = useState<{ k: number; h: number } | null>(null);

  const phone = device === "mobile";
  const footprint = FOOTPRINT;
  const scale = width > 0 ? width / footprint.w : 0;
  const staged = scale > 0;
  const showHeader = width === 0 || width >= HEADER_MIN;
  const toggleLabels = width >= HEADER_TOGGLE_LABELS_MIN;
  const designH = phone ? PHONE.h : (page?.h ?? DEVICES.desktop.h);

  /* With the header gone there is no toggle back, so a frame narrowed while
     on the phone returns to the desktop, set as it renders. */
  if (!showHeader && phone) setDevice("desktop");

  /* Layout pixels, so the stage's own scale does not count. */
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    const measure = () => {
      const k = card.clientWidth / DEVICES.desktop.w;
      setPage({ k, h: card.clientHeight / k });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(card);
    return () => observer.disconnect();
  }, [staged, phone, showHeader]);

  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const resize = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    resize.observe(el);
    const load = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setNear(true);
      },
      { rootMargin: LOAD_MARGIN }
    );
    load.observe(el);
    const view = new IntersectionObserver(
      ([entry]) => {
        visible.current = entry.isIntersecting;
        iframeRef.current?.contentDocument?.documentElement.toggleAttribute(PAUSED_ATTR, !entry.isIntersecting);
        if (entry.isIntersecting) setSeen(true);
      },
      { threshold: 0.3 }
    );
    view.observe(el);
    return () => {
      resize.disconnect();
      load.disconnect();
      view.disconnect();
    };
  }, []);

  /* The page inside follows the site's theme and preset, live. */
  useEffect(() => {
    const sync = () => {
      const doc = iframeRef.current?.contentDocument;
      if (doc) dressPage(doc, designH, phone);
    };
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "data-brand"],
    });
    return () => observer.disconnect();
  }, [designH, phone]);

  useEffect(() => {
    if (!seen || loaded !== device) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const iframe = iframeRef.current;
    const doc = iframe?.contentDocument;
    const win = doc?.defaultView as (Window & typeof globalThis) | null | undefined;
    if (!iframe || !doc || !win) return;

    let alive = true;
    const timers = new Set<number>();
    /* Where the cursor is, in footprint pixels; it enters from the lower
       right, or low on the phone's own screen. */
    const at = phone
      ? { x: footprint.w / 2, y: footprint.h * 0.7 }
      : { x: footprint.w * 0.82, y: footprint.h * 0.9 };
    let swing = 1;

    const live = () => {
      if (!alive) throw CANCELLED;
    };

    const waitFor = <T,>(check: () => T | null | undefined | false, limit = GIVE_UP_MS) =>
      new Promise<T>((resolve, reject) => {
        const start = performance.now();
        const tick = () => {
          if (!alive) return reject(CANCELLED);
          const found = check();
          if (found) return resolve(found);
          /* A hidden tab or a frame scrolled away is not a lost control. */
          if (performance.now() - start > limit && visible.current && !document.hidden) {
            return reject(new Error("reel: gave up waiting"));
          }
          const id = window.setTimeout(tick, SHORT_BEAT_MS / 10);
          timers.add(id);
        };
        tick();
      });

    /* A beat, held until the frame is back in view. */
    const sleep = async (ms: number) => {
      await new Promise<void>((resolve) => {
        const id = window.setTimeout(() => {
          timers.delete(id);
          resolve();
        }, ms);
        timers.add(id);
      });
      live();
      await waitFor(() => visible.current, Infinity);
    };

    const place = () => {
      const el = cursorRef.current;
      if (el) el.style.transform = `translate(${at.x}px, ${at.y}px)`;
    };
    place();

    /** A point in the page's own pixels, in footprint pixels. */
    const toStage = (x: number, y: number) => {
      const s = stageRef.current!.getBoundingClientRect();
      const f = iframe.getBoundingClientRect();
      const k = s.width / footprint.w;
      /* The page's own pixels are scaled again inside the card. */
      const inner = f.width / k / iframe.offsetWidth;
      return { x: (f.left - s.left) / k + x * inner, y: (f.top - s.top) / k + y * inner };
    };

    /** Swoops the cursor along a curve, as the chat reel's does. */
    const moveTo = (x: number, y: number) => {
      const to = toStage(x, y);
      const from = { ...at };
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 1) return Promise.resolve();
      swing = -swing;
      const bow = Math.min(dist * 0.22, 140) * swing;
      const ctrl = { x: from.x + dx / 2 - (dy / dist) * bow, y: from.y + dy / 2 + (dx / dist) * bow };
      const duration = Math.min(MOVE_MAX_MS, Math.max(MOVE_MIN_MS, dist * MOVE_MS_PER_PX));
      return new Promise<void>((resolve, reject) => {
        const start = performance.now();
        const frame = (now: number) => {
          if (!alive) return reject(CANCELLED);
          const t = Math.min(1, (now - start) / duration);
          const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
          const u = 1 - e;
          at.x = u * u * from.x + 2 * u * e * ctrl.x + e * e * to.x;
          at.y = u * u * from.y + 2 * u * e * ctrl.y + e * e * to.y;
          place();
          if (t < 1) requestAnimationFrame(frame);
          else resolve();
        };
        requestAnimationFrame(frame);
      });
    };

    const moveToEl = (el: Element) => {
      const r = el.getBoundingClientRect();
      return moveTo(r.left + r.width / 2, r.top + r.height / 2);
    };

    const ring = async () => {
      const el = cursorRef.current;
      el?.removeAttribute("data-pressed");
      /* Read layout so the ring's animation restarts on a repeat click. */
      void el?.offsetWidth;
      el?.setAttribute("data-pressed", "");
      await sleep(CLICK_MS);
    };

    const click = async (el: HTMLElement) => {
      await moveToEl(el);
      await ring();
      el.click();
    };

    /* The pointer entering and leaving, as the page's handlers hear it. */
    const enter = (el: Element) => {
      /* No relatedTarget: React ignores an over that names a page element as
         where it came from, leaving the enter to that element's out. */
      const init = { bubbles: true };
      el.dispatchEvent(new win.PointerEvent("pointerover", init));
      el.dispatchEvent(new win.MouseEvent("mouseover", init));
    };
    const leave = (el: Element) => {
      const init = { bubbles: true };
      el.dispatchEvent(new win.PointerEvent("pointerout", init));
      el.dispatchEvent(new win.MouseEvent("mouseout", init));
    };

    const shown = (el: Element | null | undefined): el is HTMLElement =>
      !!el && el.getBoundingClientRect().width > 0;
    /* Icons are ligatures, so a button's text can carry its icon's name too. */
    const button = (text: string, scope = "button") =>
      Array.from(doc.querySelectorAll<HTMLElement>(scope)).find(
        (el) => el.textContent?.includes(text) && shown(el)
      );
    const labelled = (label: string) =>
      doc.querySelector<HTMLElement>(`button[aria-label="${label}"]`);

    /** Types into a field the way a person does, through React's own setter. */
    const type = async (field: HTMLTextAreaElement, sentence: string) => {
      const setValue = Object.getOwnPropertyDescriptor(win.HTMLTextAreaElement.prototype, "value")!.set!;
      cursorRef.current?.setAttribute("data-mode", "text");
      for (let i = 1; i <= sentence.length; i += 1) {
        setValue.call(field, sentence.slice(0, i));
        field.dispatchEvent(new win.Event("input", { bubbles: true }));
        await sleep(sentence[i - 1] === " " ? TYPE_SPACE_MS : TYPE_CHAR_MS);
      }
      cursorRef.current?.setAttribute("data-mode", "pointer");
    };

    /** Opens each of the rail's menus in turn, then closes the last. */
    const browseMenus = async () => {
      for (const row of MENU_ROWS) {
        await click(await waitFor(() => button(row, "nav button")));
        await sleep(SHORT_BEAT_MS);
      }
      await click(await waitFor(() => button(MENU_ROWS[MENU_ROWS.length - 1], "nav button")));
      await sleep(SHORT_BEAT_MS);
    };

    /** Opens a range menu and closes it again, on the panel beside the chart. */
    const browseRange = async () => {
      const trigger = await waitFor(() =>
        doc.querySelector<HTMLElement>(`${OVERVIEW_PANEL} [aria-haspopup="listbox"]`)
      );
      await click(trigger);
      await sleep(READ_BEAT_MS / 2);
      await click(trigger);
      await sleep(SHORT_BEAT_MS / 2);
    };

    /** Asks the table for something in words, watches it change, undoes it. */
    const describeTable = async () => {
      const table = await waitFor(() => doc.querySelector(CITY_TABLE));
      await scrollTo(table, table);
      await sleep(SHORT_BEAT_MS);
      await click(await waitFor(() => button(DESCRIBE_LABEL, `${CITY_TABLE} button`)));
      const field = await waitFor(() =>
        doc.querySelector<HTMLTextAreaElement>('.ds-table-toolbar__command-row[data-open] textarea')
      );
      await moveToEl(field);
      await ring();
      await type(field, DESCRIBE_SENTENCE);
      await sleep(SHORT_BEAT_MS / 2);
      await click(await waitFor(() => labelled(DESCRIBE_APPLY_LABEL)));
      await waitFor(() => doc.body.textContent?.includes(DESCRIBE_DONE));
      await sleep(READ_BEAT_MS);
      await click(await waitFor(() => button(UNDO_LABEL)));
      await sleep(SHORT_BEAT_MS);
    };

    /** The element that scrolls the page: the inset surface, or the document. */
    const scrollerOf = (el: Element): Element => {
      for (let node = el.parentElement; node && node !== doc.body; node = node.parentElement) {
        const { overflowY } = win.getComputedStyle(node);
        if ((overflowY === "auto" || overflowY === "scroll") && node.scrollHeight > node.clientHeight) return node;
      }
      return doc.scrollingElement ?? doc.documentElement;
    };

    /** Glides the page so `el` sits under the top bar, or back to the top. */
    const scrollTo = (el: Element | null, anchor: Element) => {
      const scroller = scrollerOf(anchor);
      const from = scroller.scrollTop;
      const to = el ? from + el.getBoundingClientRect().top - SCROLL_CLEARANCE : 0;
      const duration = Math.min(SCROLL_MAX_MS, Math.abs(to - from) * SCROLL_MS_PER_PX);
      if (duration < 1) return Promise.resolve();
      return new Promise<void>((resolve, reject) => {
        const start = performance.now();
        const frame = (now: number) => {
          if (!alive) return reject(CANCELLED);
          const t = Math.min(1, (now - start) / duration);
          const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
          scroller.scrollTop = from + (to - from) * e;
          if (t < 1) requestAnimationFrame(frame);
          else resolve();
        };
        requestAnimationFrame(frame);
      });
    };

    const visitCity = async (name: string) => {
      const marker = await waitFor(() => doc.querySelector(`button[aria-label^="${name}"]`));
      await moveToEl(marker);
      enter(marker);
      await sleep(READ_BEAT_MS);
      leave(marker);
    };

    /** Runs the cursor along the live chart, its tooltip following. */
    const readChart = async () => {
      const panel = await waitFor(() => doc.querySelector(LIVE_PANEL));
      const chart = await waitFor(() => panel.querySelector(".recharts-wrapper"));
      await scrollTo(panel, panel);
      const r = chart.getBoundingClientRect();
      const y = r.top + r.height * 0.5;
      for (const along of [0.45, 0.72]) {
        const x = r.left + r.width * along;
        await moveTo(x, y);
        const init = { bubbles: true, clientX: x, clientY: y };
        chart.dispatchEvent(new win.MouseEvent("mouseover", init));
        chart.dispatchEvent(new win.MouseEvent("mousemove", init));
        await sleep(SHORT_BEAT_MS);
      }
      const end = { bubbles: true };
      chart.dispatchEvent(new win.MouseEvent("mouseout", end));
      chart.dispatchEvent(new win.MouseEvent("mouseleave", end));
    };

    const run = async () => {
      const anchor = await waitFor(() => doc.querySelector(LIVE_PANEL));
      await sleep(SHORT_BEAT_MS);
      for (;;) {
        for (const city of phone ? PHONE_CITIES : CITIES) await visitCity(city);

        if (phone) {
          await scrollTo(doc.querySelector(LIVE_PANEL), anchor);
          await sleep(READ_BEAT_MS);
          await scrollTo(doc.querySelector(SOURCE_PANEL), anchor);
          await sleep(READ_BEAT_MS);
        } else {
          await browseMenus();

          /* The assistant docks beside the map and the page makes room. */
          await click(await waitFor(() => button(ASK_LABEL)));
          await sleep(SHORT_BEAT_MS);
          await click(await waitFor(() => button(QUESTION)));
          await waitFor(() => doc.body.textContent?.includes(ANSWER));
          await sleep(READ_BEAT_MS);
          /* A fresh chat, so the question is on offer again next time round. */
          await click(await waitFor(() => labelled(NEW_CHAT_LABEL)));
          await sleep(SHORT_BEAT_MS / 2);
          await click(await waitFor(() => labelled(CLOSE_CHAT_LABEL)));
          await sleep(SHORT_BEAT_MS);

          await readChart();
          await browseRange();
          await describeTable();
        }

        await scrollTo(null, anchor);
        await sleep(SHORT_BEAT_MS);
      }
    };

    run().catch((error) => {
      if (error !== CANCELLED) setStopped(true);
    });

    return () => {
      alive = false;
      timers.forEach((id) => window.clearTimeout(id));
    };
    // footprint follows device, which is in the list.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seen, loaded, device, phone]);

  const iframe = near && (phone || page) && (
    <iframe
      key={device}
      ref={iframeRef}
      src={HREF}
      title={TITLE}
      className={phone ? styles.page : styles.scaledPage}
      style={
        !phone && page
          ? { width: DEVICES.desktop.w, height: page.h, transform: `scale(${page.k})` }
          : undefined
      }
      tabIndex={-1}
      onLoad={(event) => {
        const doc = event.currentTarget.contentDocument;
        if (doc) {
          dressPage(doc, designH, phone);
          doc.documentElement.toggleAttribute(PAUSED_ATTR, !visible.current);
        }
        setStopped(false);
        setLoaded(device);
      }}
    />
  );

  return (
    <div
      ref={frameRef}
      className={chatStyles.frame}
      style={{
        aspectRatio: `${footprint.w} / ${footprint.h}`,
        "--stage-scale": scale,
        "--header-room": `${HEADER_ROOM}px`,
      } as React.CSSProperties}
    >
      {scale > 0 && (
        <div
          ref={stageRef}
          className={chatStyles.stage}
          style={{
            width: footprint.w,
            height: footprint.h,
            paddingBlockStart: showHeader ? HEADER_ROOM : undefined,
            transform: `scale(${scale})`,
          }}
          aria-hidden="true"
          inert
        >
          <DotBackground contained />
          {phone ? (
            <div className={chatStyles.phone}>
              <div
                className={`${chatStyles.phoneScreen} ${styles.phoneScreen}`}
                style={{ width: PHONE.w, height: PHONE.h }}
              >
                <div className={styles.phonePage}>{iframe}</div>
                <div className={`${chatStyles.statusBar} ${styles.statusStrip}`}>
                  <span className={chatStyles.statusTime}>9:41</span>
                  <span className={chatStyles.island} />
                  <span className={chatStyles.statusIcons}>
                    <span className="material-symbols-rounded">signal_cellular_alt</span>
                    <span className="material-symbols-rounded">wifi</span>
                    <span className="material-symbols-rounded">battery_full</span>
                  </span>
                </div>
                <div className={`${chatStyles.homeBar} ${styles.homeStrip}`}>
                  <span className={chatStyles.homeIndicator} />
                </div>
              </div>
            </div>
          ) : (
            <div ref={cardRef} className={chatStyles.card}>
              {iframe}
            </div>
          )}
          {!stopped && <Cursor key={`cursor-${device}`} ref={cursorRef} touch={phone} name={CURSOR_NAME} />}
        </div>
      )}
      <Link href={HREF} className={chatStyles.hit} aria-label="Open the analytics template" />
      {/* The header sits above the link, so a press on the toggle or its
          links does its own thing rather than opening the template. */}
      {showHeader && (
        <div className={chatStyles.header}>
          <h2 className={chatStyles.headerTitle}>{TITLE}</h2>
          <SegmentedControl
            segments={DEVICE_SEGMENTS}
            value={device}
            onValueChange={(next) => setDevice(next as Device)}
            size="compact"
            showLabels={toggleLabels}
            aria-label="Preview the template on"
          />
          <div className={chatStyles.headerLinks}>
            {HEADER_LINKS.map((link) => (
              <Button
                key={link.href}
                href={link.href}
                label={link.label}
                variant="tertiary"
                size="compact"
                iconLeft={link.icon}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
