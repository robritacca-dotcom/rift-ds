"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AttachmentTile } from "rift-ds/components/Attachment/AttachmentTile";
import { MentionMenu } from "rift-ds/components/Mention/Mention";
import { filterMentionItems, type MentionItem } from "rift-ds/components/Mention/mentions";
import { ModelPicker } from "rift-ds/components/ModelPicker/ModelPicker";
import { ChatWidget, createSimTransport, useChatWidget } from "rift-ds/chat";
import { DEMO_ARTIFACT_RENDERERS, DEMO_MODELS, DEMO_RENDERERS, demoAgentTabs } from "rift-ds/chat/demo";
import { MOTION_AUTOPLAY_INTERVAL_MS } from "rift-ds/tokens/motion";
import { SiteChatProvider } from "@/components/SiteChat/SiteChatProvider";
import DotBackground from "@/components/DotBackground/DotBackground";
import {
  FINANCE_MENTIONS,
  FINANCE_PERSON,
  FINANCE_PRODUCT,
  FINANCE_REPORT,
  FINANCE_SCRIPT,
  FINANCE_THREADS,
  REEL_COPY,
} from "./reel-script";
import BoardReport from "./BoardReport";
import FinanceBoard from "./FinanceBoard";
import styles from "./HomeChatFrame.module.css";

/* ============================================
   The home page's window onto the chat: the real ChatWidget, open with its
   threads rail, on the playground's dot ground, playing a finance review
   (reel-script.ts) on a loop, from a welcome board of the quarter
   (FinanceBoard.tsx). A collaborator's cursor drives it the way a person
   would: it clicks into the composer and types the first question, drags
   an expense report in, answers the clarifying questions, takes a
   follow-up chip that writes the board report into the artifact panel,
   sends the report to the CFO with a mention, and starts a new chat to
   begin again.

   The stage is a picture to the visitor: inert, hidden from assistive tech,
   and covered by one link into the playground's Chat view. The link sits
   beside the stage rather than around it, since the widget draws links and
   buttons of its own. The cursor's clicks and the file drop are real events
   dispatched on the widget's own controls, so every state on screen is the
   widget's own. Two things are staged: the draft is written through the
   chat's state, since nothing can type into an inert field, and the mention
   menu is the library's MentionMenu laid over the composer, since the
   composer opens its own only for a focused field.

   The stage lays out at a fixed desktop footprint and is scaled to the
   frame's width, so a phone sees the desktop chat in miniature rather than
   its compact layout.
   ============================================ */

const TARGET_HREF = "/playground?view=chat";

/* The demo's artifact kinds, and the reel's board report. */
const ARTIFACT_RENDERERS = {
  ...DEMO_ARTIFACT_RENDERERS,
  [FINANCE_REPORT.kind]: () => <BoardReport />,
};

/* The review footprint for the stage, not a layout token. */
const FOOTPRINT = { w: 1440, h: 960 };

/* The collaborator whose cursor drives the reel: the profile on the rail. */
const CURSOR_NAME = FINANCE_PERSON.split(" ")[0];

/* The send button's name: set on the widget and found by it, in one place. */
const SEND_LABEL = "Send";

/* The reel's beats: a full one to read each finished answer, half of one
   on the welcome and before an answer is picked. */
const READ_BEAT_MS = MOTION_AUTOPLAY_INTERVAL_MS;
const SHORT_BEAT_MS = MOTION_AUTOPLAY_INTERVAL_MS / 2;

/* The cursor's staging, local like the other site demos' timings: travel
   time grows with distance between a floor and a ceiling, a click holds
   for its ring, typing runs at a person's pace with longer gaps at spaces,
   and a hover over the drop zone lets its overlay show. How long the reel
   waits for something to appear before it starts the loop over. */
const MOVE_MIN_MS = 450;
const MOVE_MAX_MS = 1100;
const MOVE_MS_PER_PX = 0.7;
const CLICK_MS = 260;
const TYPE_CHAR_MS = 55;
const TYPE_SPACE_MS = 120;
const DROP_HOVER_MS = 700;
const GIVE_UP_MS = 25000;
const FRAME_GAP_MS = 100;

/* Where the expense report waits to be picked up, in footprint pixels:
   over the empty right of the conversation, clear of the composer. */
const FILE_START = { x: 1180, y: 300 };

/** Thrown into the reel when the frame unmounts, to unwind it quietly. */
const CANCELLED = Symbol("cancelled");

/* The pointer states the stage cannot have for real: it is inert, so
   nothing in it is ever hovered or focused. The reel marks what the cursor
   rests on, and what it types into, with these attributes instead. */
const STAGED_HOVER = "data-staged-hover";
const STAGED_FOCUS = "data-staged-focus";
const STAGED_STATES: [RegExp, string][] = [
  [/:hover\b/g, `[${STAGED_HOVER}]`],
  [/:focus-within\b/g, `[${STAGED_FOCUS}]`],
];
const STAGED_STYLE_ID = "home-chat-staged-states";

/** Every rule on the page that styles :hover or :focus-within, restated
    for the matching staged attribute, inside the same media queries. Read
    from the stylesheets themselves, so a component's hover and focus looks
    are never copied by hand and cannot drift. */
function stagedStateRules(rules: CSSRuleList): string[] {
  const out: string[] = [];
  for (const rule of Array.from(rules)) {
    if (rule instanceof CSSStyleRule) {
      if (!STAGED_STATES.some(([pattern]) => rule.selectorText.search(pattern) >= 0)) continue;
      const selector = STAGED_STATES.reduce((text, [pattern, attr]) => text.replace(pattern, attr), rule.selectorText);
      out.push(`${selector}{${rule.style.cssText}}`);
    } else if (rule instanceof CSSMediaRule || rule instanceof CSSSupportsRule) {
      const inner = stagedStateRules(rule.cssRules);
      if (inner.length) out.push(`@${rule instanceof CSSMediaRule ? "media" : "supports"} ${rule.conditionText}{${inner.join("")}}`);
    }
  }
  return out;
}

/** Adds the staged-state rules to the page once. */
function installStagedStates() {
  if (document.getElementById(STAGED_STYLE_ID)) return;
  const rules: string[] = [];
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      rules.push(...stagedStateRules(sheet.cssRules));
    } catch {
      /* A cross-origin sheet (the web fonts) hides its rules; nothing in it
         styles the widget. */
    }
  }
  const style = document.createElement("style");
  style.id = STAGED_STYLE_ID;
  style.textContent = rules.join("\n");
  document.head.appendChild(style);
}

/** The staged overlays the reel raises: the dragged file and the mention menu. */
interface Staging {
  file: { x: number; y: number; carried: boolean } | null;
  mention: { x: number; y: number; items: MentionItem[]; query: string } | null;
}

export default function HomeChatFrame() {
  const frameRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [staging, setStaging] = useState<Staging>({ file: null, mention: null });

  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const scale = width > 0 ? width / FOOTPRINT.w : 0;
  const transport = useMemo(() => createSimTransport(FINANCE_SCRIPT.build()), []);

  return (
    <div
      ref={frameRef}
      className={styles.frame}
      style={{ aspectRatio: `${FOOTPRINT.w} / ${FOOTPRINT.h}` }}
    >
      {scale > 0 && (
        <div
          ref={stageRef}
          className={styles.stage}
          style={{ width: FOOTPRINT.w, height: FOOTPRINT.h, transform: `scale(${scale})` }}
          aria-hidden="true"
          inert
        >
          <DotBackground contained />
          <SiteChatProvider
            transport={transport}
            renderers={DEMO_RENDERERS}
            artifactRenderers={ARTIFACT_RENDERERS}
            threads={FINANCE_THREADS}
          >
            <Reel
              frameRef={frameRef}
              stageRef={stageRef}
              cursorRef={cursorRef}
              fileRef={fileRef}
              setStaging={setStaging}
            />
            <div className={styles.card}>
              {/* Every control the playground stage shows: the header's
                  agent, artifact, full-screen and close buttons, the session
                  tabs, and the composer's attachments, mentions and model
                  picker. */}
              <ChatWidget
                title={FINANCE_PRODUCT}
                tagline="What should we look at today?"
                showStarters={false}
                widgets={<FinanceBoard />}
                widgetsWidth="wide"
                threads
                threadsProps={{ defaultExpanded: true, profile: { name: FINANCE_PERSON, meta: "Founder" } }}
                tabs
                fileAttachments
                mentions={FINANCE_MENTIONS}
                composerActions={<ModelPicker models={DEMO_MODELS} placement="top" />}
                sendLabel={SEND_LABEL}
                agent={{
                  defaultOpen: false,
                  tabs: demoAgentTabs(FINANCE_PRODUCT),
                  profile: { name: FINANCE_PRODUCT, status: "Connected" },
                }}
                artifacts
              />
            </div>
          </SiteChatProvider>
          {staging.mention && (
            <MentionMenu
              className={styles.mentionMenu}
              style={{ transform: `translate(${staging.mention.x}px, ${staging.mention.y}px)` }}
              items={staging.mention.items}
              activeId={staging.mention.items[0]?.id}
              query={staging.mention.query}
            />
          )}
          {staging.file && (
            <div
              ref={fileRef}
              className={styles.file}
              data-carried={staging.file.carried || undefined}
              style={{ transform: `translate(${staging.file.x}px, ${staging.file.y}px)` }}
            >
              <AttachmentTile name={REEL_COPY.file} kind="pdf" meta="248 KB" />
            </div>
          )}
          <Cursor ref={cursorRef} />
        </div>
      )}
      <Link href={TARGET_HREF} className={styles.hit} aria-label="Open the AI chat playground" />
    </div>
  );
}

/** The staged pointer, dressed as a collaborator's cursor so it never reads
    as the visitor's own: a rounded arrow, or an I-beam while it types, with
    a name tag trailing it and a ring that pulses on a click. Positioned by
    the reel, never by React state. */
function Cursor({ ref }: { ref: React.Ref<HTMLDivElement> }) {
  return (
    <div ref={ref} className={styles.cursor} data-mode="pointer">
      <span className={styles.ring} />
      <svg className={styles.arrow} viewBox="0 0 28 28" width="30" height="30">
        <path d="M4.2 3.1 24.5 10.6c1.2.45 1.15 2.15-.07 2.52l-8.6 2.62-2.66 8.6c-.37 1.22-2.07 1.27-2.52.07L3.1 4.2c-.33-.88.22-1.43 1.1-1.1Z" />
      </svg>
      <svg className={styles.beam} viewBox="0 0 16 28" width="16" height="28">
        <path d="M3 2h4l1 1 1-1h4v2.5h-3V23.5h3V26H9l-1-1-1 1H3v-2.5h3V4.5H3z" />
      </svg>
      <span className={styles.tag}>{CURSOR_NAME}</span>
    </div>
  );
}

/** Opens the panel, then plays the finance review from the welcome once
    the frame is first in view, and loops it until the frame unmounts.
    Renders nothing of its own. */
function Reel({
  frameRef,
  stageRef,
  cursorRef,
  fileRef,
  setStaging,
}: {
  frameRef: React.RefObject<HTMLDivElement | null>;
  stageRef: React.RefObject<HTMLDivElement | null>;
  cursorRef: React.RefObject<HTMLDivElement | null>;
  fileRef: React.RefObject<HTMLDivElement | null>;
  setStaging: React.Dispatch<React.SetStateAction<Staging>>;
}) {
  const chat = useChatWidget();
  /* The latest state and actions, read as the reel runs. */
  const chatRef = useRef(chat);
  useEffect(() => {
    chatRef.current = chat;
  });
  const [inView, setInView] = useState(false);

  /* Open at mount, deferred so React's development double-mount opens once. */
  useEffect(() => {
    const open = window.setTimeout(() => chatRef.current.setOpen(true), 0);
    return () => window.clearTimeout(open);
  }, []);

  /* The reel starts when the frame is first seen, so a visitor arrives at
     the welcome rather than halfway through an answer. */
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      setInView(true);
      observer.disconnect();
    }, { threshold: 0.3 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [frameRef]);

  useEffect(() => {
    if (!inView) return;
    installStagedStates();
    let alive = true;
    const timers = new Set<number>();
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    /* Where the cursor is, in footprint pixels; it enters from the lower right. */
    const at = { x: FOOTPRINT.w * 0.82, y: FOOTPRINT.h * 0.9 };
    let swing = 1;
    /* The staged file, while the cursor carries it: its offset from the tip. */
    let carrying: { dx: number; dy: number } | null = null;

    const live = () => {
      if (!alive) throw CANCELLED;
    };
    const sleep = (ms: number) =>
      new Promise<void>((resolve) => {
        const id = window.setTimeout(() => {
          timers.delete(id);
          resolve();
        }, ms);
        timers.add(id);
      }).then(live);

    /** Resolves with the check's first truthy value, tried each frame. The
        give-up clock counts watched time only: a frame gap longer than
        FRAME_GAP_MS is a hidden tab, and counts as one frame, so a visitor
        who comes back is not met by a reel that gave up while they were
        away. */
    const waitFor = <T,>(check: () => T | null | undefined | false) =>
      new Promise<T>((resolve, reject) => {
        let waited = 0;
        let last = performance.now();
        const tick = () => {
          if (!alive) return reject(CANCELLED);
          const found = check();
          if (found) return resolve(found);
          const now = performance.now();
          waited += Math.min(now - last, FRAME_GAP_MS);
          last = now;
          if (waited > GIVE_UP_MS) return reject(new Error("reel: gave up waiting"));
          requestAnimationFrame(tick);
        };
        tick();
      });

    const stage = () => stageRef.current!;
    const scaleNow = () => stage().getBoundingClientRect().width / FOOTPRINT.w;

    const place = () => {
      const el = cursorRef.current;
      if (el) el.style.transform = `translate(${at.x}px, ${at.y}px)`;
      const file = fileRef.current;
      if (file && carrying) file.style.transform = `translate(${at.x + carrying.dx}px, ${at.y + carrying.dy}px)`;
    };
    place();

    /** A point on `el` in footprint pixels: its centre, or near the start
        of a text field, where a person would click to type. */
    const pointOn = (el: Element, text = false) => {
      const s = stage().getBoundingClientRect();
      const k = s.width / FOOTPRINT.w;
      const r = el.getBoundingClientRect();
      const x = text ? r.left + Math.min(r.width * 0.25, 160 * k) : r.left + r.width / 2;
      return { x: (x - s.left) / k, y: (r.top + r.height / 2 - s.top) / k };
    };

    /** Where `prefix` ends in a text field's first line, in footprint
        pixels: the field's text start plus the prefix's width in its font. */
    const measure = document.createElement("canvas").getContext("2d");
    const textStart = (field: HTMLElement, prefix: string) => {
      const s = stage().getBoundingClientRect();
      const k = s.width / FOOTPRINT.w;
      const style = getComputedStyle(field);
      const left = (field.getBoundingClientRect().left - s.left) / k + parseFloat(style.paddingInlineStart);
      if (!measure) return left;
      measure.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      return left + measure.measureText(prefix).width;
    };

    /* What the cursor rests on wears its hover look, through the staged
       :hover rules: the element and every ancestor, as :hover applies. */
    let hovered: Element[] = [];
    const unhover = () => {
      hovered.forEach((el) => el.removeAttribute(STAGED_HOVER));
      hovered = [];
    };
    const hover = (el: Element) => {
      unhover();
      for (let node: Element | null = el; node && node !== stageRef.current; node = node.parentElement) {
        node.setAttribute(STAGED_HOVER, "");
        hovered.push(node);
      }
    };

    /** Swoops the cursor to a point along a curve, easing in and out. */
    const moveTo = (to: { x: number; y: number }) => {
      unhover();
      const from = { ...at };
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const dist = Math.hypot(dx, dy);
      if (still || dist < 1) {
        Object.assign(at, to);
        place();
        return Promise.resolve();
      }
      /* The curve bows to one side of the straight line, alternating, so
         successive moves read as a hand rather than a plotter. */
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

    const setMode = (mode: "pointer" | "text") => cursorRef.current?.setAttribute("data-mode", mode);

    const ring = async () => {
      const el = cursorRef.current;
      el?.removeAttribute("data-pressed");
      /* Read layout so the ring's animation restarts on a repeat click. */
      void el?.offsetWidth;
      el?.setAttribute("data-pressed", "");
      await sleep(CLICK_MS);
    };

    /** The press a person's click makes, dispatched on the real control. */
    const press = (el: Element) => {
      const init = { bubbles: true, cancelable: true, view: window };
      el.dispatchEvent(new PointerEvent("pointerdown", init));
      el.dispatchEvent(new MouseEvent("mousedown", init));
      el.dispatchEvent(new PointerEvent("pointerup", init));
      el.dispatchEvent(new MouseEvent("mouseup", init));
      el.dispatchEvent(new MouseEvent("click", init));
    };

    /** Waits until a scrolling container has held still for a few frames. */
    const settled = (scroller: Element) => {
      let last = -1;
      let steady = 0;
      return waitFor(() => {
        const top = scroller.scrollTop;
        steady = top === last ? steady + 1 : 0;
        last = top;
        return steady >= 8;
      });
    };

    /** Brings a conversation element into view the way a person would:
        the jump arrow when the thread offers it, else a scroll of the
        thread itself, so nothing is clicked behind the composer. */
    const reveal = async (el: Element) => {
      const scroller = el.closest(".ds-chat-thread");
      if (!scroller || !el.closest(".ds-chat-thread__content")) return;
      const composer = stage().querySelector(".ds-composer");
      const shown = () => {
        const s = scroller.getBoundingClientRect();
        const floor = Math.min(s.bottom, composer?.getBoundingClientRect().top ?? s.bottom);
        const r = el.getBoundingClientRect();
        return { below: r.bottom - (floor - 12 * scaleNow()), above: s.top + 12 * scaleNow() - r.top };
      };
      let gap = shown();
      if (gap.below <= 0 && gap.above <= 0) return;
      const jump = scroller.querySelector(".ds-chat-thread__jump--visible");
      if (gap.below > 0 && jump) {
        await moveTo(pointOn(jump));
        hover(jump);
        await ring();
        press(jump);
        await settled(scroller);
        gap = shown();
        if (gap.below <= 0 && gap.above <= 0) return;
      }
      /* What is left, the cursor scrolls: it rests over the thread, and the
         thread glides by the gap, measured on screen and scrolled in the
         stage's own unscaled pixels. */
      await moveTo(pointOn(scroller));
      const by = (gap.below > 0 ? gap.below : -gap.above) / scaleNow();
      scroller.scrollBy({ top: by, behavior: still ? "instant" : "smooth" });
      await settled(scroller);
    };

    /** Reveals, swoops to, rings and clicks a real control. Found afresh at
        each stage: a control can remount while the cursor travels (a
        question set re-keys its options per step), and a click on the node
        it replaced would land nowhere. */
    const clickEl = async (find: () => Element | null | undefined) => {
      await reveal(await waitFor(find));
      await moveTo(pointOn(await waitFor(find)));
      hover(await waitFor(find));
      await ring();
      press(await waitFor(find));
    };

    const button = (scope: string, label: string) => {
      const found = [...stage().querySelectorAll<HTMLElement>(`${scope} button`)].filter((b) =>
        b.textContent?.trim().includes(label)
      );
      return found[found.length - 1];
    };

    /** Waits until the reply to what was just sent has finished. */
    const replied = (before: number) =>
      waitFor(() => {
        const { turns, streaming } = chatRef.current;
        return turns.length >= before + 2 && !streaming && turns[turns.length - 1].role === "assistant";
      });

    const typeText = async (text: string) => {
      const base = chatRef.current.draft;
      if (still) {
        chatRef.current.setDraft(base + text);
        return;
      }
      for (let i = 1; i <= text.length; i++) {
        chatRef.current.setDraft(base + text.slice(0, i));
        await sleep(text[i - 1] === " " ? TYPE_SPACE_MS : TYPE_CHAR_MS);
      }
    };

    const field = () => waitFor(() => stage().querySelector<HTMLElement>(".ds-composer__textarea"));

    /** The composer's focused look while the cursor types into it, from the
        staged :focus-within rules. */
    const stagedFocus = (on: boolean) => {
      const composer = stage().querySelector(".ds-composer");
      if (on) composer?.setAttribute(STAGED_FOCUS, "");
      else composer?.removeAttribute(STAGED_FOCUS);
    };

    /** Clicks into the composer and types `text`; a mention in it opens the
        staged menu at its trigger, and the cursor picks the person. */
    const compose = async (text: string, mention?: { query: string; id: string }) => {
      const input = await field();
      await moveTo(pointOn(input, true));
      hover(input);
      await ring();
      stagedFocus(true);
      setMode("text");
      const item = mention && FINANCE_MENTIONS[0].items.find((i) => i.id === mention.id);
      const at = item ? text.indexOf(`@${item.label}`) : -1;
      if (mention && item && at >= 0) {
        await typeText(text.slice(0, at));
        await typeText(`@${mention.query}`);
        /* The menu opens above the field's first line, at the trigger,
           where the composer's own would. */
        const r = pointOn(input, true);
        const items = filterMentionItems(FINANCE_MENTIONS[0].items, mention.query);
        const x = textStart(input, text.slice(0, at));
        setStaging((s) => ({ ...s, mention: { x, y: r.y - 24, items, query: mention.query } }));
        const row = await waitFor(() => stage().querySelector(".ds-mention-menu [role=option]"));
        await sleep(SHORT_BEAT_MS / 3);
        setMode("pointer");
        await moveTo(pointOn(row));
        hover(row);
        await ring();
        setStaging((s) => ({ ...s, mention: null }));
        chatRef.current.setDraft(`${text.slice(0, at)}@${item.label} `);
        await moveTo(pointOn(input, true));
        setMode("text");
        await typeText(text.slice(at + item.label.length + 2));
      } else {
        await typeText(text);
      }
      setMode("pointer");
    };

    /* Sending keeps the focus a person's click would, until the reply is
       under way; the field lets it go then, as it does when the cursor
       leaves for anything else. */
    const send = async () => {
      await clickEl(() => stage().querySelector(`.ds-composer [aria-label="${SEND_LABEL}"]:not(:disabled)`));
      stagedFocus(false);
    };

    /** Picks up the expense report and drops it on the composer: the drop
        zone's own overlay shows on the hover, and the drop is a real file. */
    const dropFile = async () => {
      setStaging((s) => ({ ...s, file: { ...FILE_START, carried: false } }));
      const tile = await waitFor(() => fileRef.current);
      await sleep(SHORT_BEAT_MS / 3);
      const grab = pointOn(tile);
      await moveTo(grab);
      await ring();
      carrying = { dx: FILE_START.x - grab.x, dy: FILE_START.y - grab.y };
      setStaging((s) => ({ ...s, file: s.file && { ...s.file, carried: true } }));
      const zone = await waitFor(() => stage().querySelector(".ds-composer"));
      const data = new DataTransfer();
      data.items.add(new File([new Uint8Array(248 * 1024)], REEL_COPY.file, { type: "application/pdf" }));
      const drag = (type: string) => zone.dispatchEvent(new DragEvent(type, { bubbles: true, cancelable: true, dataTransfer: data }));
      await moveTo(pointOn(zone));
      drag("dragenter");
      drag("dragover");
      await sleep(DROP_HOVER_MS);
      drag("drop");
      carrying = null;
      setStaging((s) => ({ ...s, file: null }));
      await waitFor(() => zone.querySelector(".ds-attachment-tile"));
    };

    /** Answers the newest question card, one pick per question. A
        single-choice pick in a set moves the card on by itself; where it
        does not, the cursor takes the footer's Next or Send. */
    const answer = async (picks: readonly string[]) => {
      const card = () => [...stage().querySelectorAll(".ds-question-card")].at(-1);
      await waitFor(card);
      const before = chatRef.current.turns.length;
      const step = () => card()?.querySelector(".ds-question-card__step")?.textContent ?? "";
      const onward = () =>
        [...(card()?.querySelectorAll(".ds-question-card__footer button:not(:disabled)") ?? [])].find((b) =>
          /^(Next|Send)$/.test(b.textContent?.trim() ?? "")
        );
      await sleep(SHORT_BEAT_MS);
      for (const pick of picks) {
        const at = step();
        await clickEl(() =>
          [...(card()?.querySelectorAll(".ds-question-card__option") ?? [])].find((o) => o.textContent?.includes(pick))
        );
        /* Whichever comes first: the card steps on, the answer goes out,
           or the footer offers the way on. */
        const next = await waitFor(() =>
          step() !== at || chatRef.current.turns.length > before ? "moved" : onward() ? "button" : null
        );
        if (next === "button") {
          await sleep(SHORT_BEAT_MS / 4);
          await clickEl(onward);
        }
      }
      await replied(before);
    };

    const chip = (label: string) => clickEl(() => button(".ds-prompt-suggestions", label));

    /** A new chat from the rail's button, with the finished conversation
        dropped from the history so the rail and tabs hold the fixtures
        alone however long the loop runs. */
    const newChat = async (click: boolean) => {
      setStaging({ file: null, mention: null });
      carrying = null;
      setMode("pointer");
      unhover();
      stagedFocus(false);
      const played = chatRef.current.threads.activeThreadId;
      const hadTurns = chatRef.current.turns.length > 0;
      chatRef.current.setDraft("");
      if (click) await clickEl(() => button("", "New chat"));
      else chatRef.current.threads.startNew();
      if (!hadTurns) return;
      /* Removed once the new chat is the active one, so the rail never
         treats the removal as closing the chat on screen. */
      await waitFor(() => chatRef.current.threads.activeThreadId !== played);
      chatRef.current.threads.remove(played);
    };

    const exchange = async (act: () => Promise<void>) => {
      const before = chatRef.current.turns.length;
      await act();
      await replied(before);
    };

    const play = async () => {
      /* A reel that starts on a chat already under way (a hot reload in
         development) clears it first, so the script plays from the top. */
      if (chatRef.current.turns.length > 0) await newChat(false).catch(() => {});
      while (alive) {
        try {
          /* A beat on the welcome board before anything moves. */
          await sleep(SHORT_BEAT_MS);
          /* 1. The quarter's revenue, typed into the composer. */
          await exchange(async () => {
            await compose(REEL_COPY.revenue);
            await send();
          });
          await sleep(READ_BEAT_MS);
          /* 2. The expense report, dragged in and asked about. */
          await exchange(async () => {
            await dropFile();
            await compose(REEL_COPY.spend);
            await send();
          });
          await sleep(READ_BEAT_MS);
          /* 3. A runway question that needs two answers first. */
          await exchange(async () => {
            await compose(REEL_COPY.runway);
            await send();
          });
          await answer(REEL_COPY.runwayPicks);
          await sleep(READ_BEAT_MS);
          /* 4. The board update, from a follow-up chip: a report that
             opens itself in the artifact panel. */
          await exchange(() => chip(REEL_COPY.board));
          await sleep(READ_BEAT_MS);
          /* 5. The report sent to the CFO, with a mention. */
          await exchange(async () => {
            await compose(REEL_COPY.handoff, REEL_COPY.mention);
            await send();
          });
          await sleep(READ_BEAT_MS);
          /* Back to the welcome the way a person would get there. */
          await newChat(true);
        } catch (error) {
          if (error === CANCELLED || !alive) return;
          /* Something never appeared: start over from a clean welcome. */
          await newChat(false).catch(() => {});
        }
      }
    };
    void play();

    return () => {
      alive = false;
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [inView, stageRef, cursorRef, fileRef, setStaging]);

  return null;
}
