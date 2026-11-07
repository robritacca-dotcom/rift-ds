"use client";

/**
 * The template screens' shared mock assistant: the site chat's docked-panel
 * anatomy (header, thread, centred composer, starter pills, disclaimer)
 * restated over canned answers, so every template plugs in the same AI
 * surface the way a real product would plug in a live one. Each template
 * passes its own suggestions and replies over its own page data; the panel
 * owns the conversation state and the focus contract.
 *
 * A screen demonstrating a live assistant passes a real ChatWidget as `chat`
 * instead: the panel keeps its modes and grip, gains the launcher's open, close
 * and full-screen motion, and the mock's props go unused.
 *
 * An answer plays the way a live model's does, on the library's Reasoning and
 * StreamingText: the reasoning arrives a step at a time, folds away to its
 * duration, then the answer streams in chunks. Under reduced motion it is
 * simply there.
 *
 * Suggestion labels follow the site-wide chip budget (SUGGESTION_MAX_CHARS,
 * 40): a chip never wraps, so a longer question runs off the panel's edge.
 *
 * The panel also owns the site chat's responsive contract (design.md's AI
 * chat responsive rule), so no host restates it:
 *
 * - Docked (DOCK_QUERY, while the page keeps DOCK_PAGE_MIN_WIDTH beside the
 *   panel; widened past that it overlays): a non-modal complementary region.
 *   The host reserves the width (TemplateShell does it for the family) on the
 *   same rule, read through useDockViewport.
 *   Docked, the panel carries the site chat's widen grip, which writes
 *   --ds-chat-width per frame (registered in scripts/gestures.json).
 * - Overlay (below the dock threshold): modal over a scrim, with a focus
 *   trap, the body scroll lock, and Escape or a scrim tap to close.
 * - Takeover (TAKEOVER_QUERY): the panel fills the viewport, still modal.
 *
 * Inside TemplateShell's inset layout (the `surface` prop, defaulted from the
 * shell's context) the dock sits at the shell's gap as a plane matching the
 * inset surface beside it, hairline and floating shadow included, and the
 * overlay takes the same gap: ChatLauncher's `surface="inset"`, except that
 * the library's dock is flat and the shell's surface is not.
 *
 * A host that seats the panel inside its own frame (the mobile dashboard's
 * phone) passes `placement="contained"` and keeps none of that: the frame,
 * not the viewport, is the panel's world there.
 */

import React from "react";
import { lockBodyScroll, unlockBodyScroll } from "@/lib/scroll-lock";
import { dockWidthFromDrag, readGreeting, serverGreeting, subscribeClock, useDockViewport } from "rift-ds/chat";
import { ChatHeader } from "rift-ds/components/ChatHeader/ChatHeader";
import { ChatMessage } from "rift-ds/components/ChatMessage/ChatMessage";
import { ChatThread } from "rift-ds/components/ChatThread/ChatThread";
import { CircularButton } from "rift-ds/components/CircularButton/CircularButton";
import { Composer } from "rift-ds/components/Composer/Composer";
import { PromptSuggestions } from "rift-ds/components/PromptSuggestions/PromptSuggestions";
import { Reasoning } from "rift-ds/components/Reasoning/Reasoning";
import { StreamingText } from "rift-ds/components/StreamingText/StreamingText";
import { MOTION_AUTOPLAY_INTERVAL_MS } from "rift-ds/tokens/motion";
import { TemplateShellContext } from "../TemplateShell/context";
import styles from "./TemplateAssistant.module.css";

export type TemplateAssistantSuggestion = { id: string; label: string };


const FOCUSABLE =
  'button:not([disabled]), a[href], textarea:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

/* The staged model's pace: how long a reasoning step takes to arrive, and how
   often a chunk of the answer lands. */
const REASONING_STEP_MS = MOTION_AUTOPLAY_INTERVAL_MS / 5;
const STREAM_CHUNK_MS = MOTION_AUTOPLAY_INTERVAL_MS / 100;
const STREAM_CHUNK_WORDS = 2;

const DEFAULT_REASONING = [
  "Reading the question",
  "Checking the numbers on this page",
  "Drafting the answer",
];

/** One staged answer: its reasoning, a step at a time, then its text. */
function AssistantReply({ text, steps }: { text: string; steps: string[] }) {
  /* A reply only mounts after a press, in the browser, so this is safe to read here. */
  const [still] = React.useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const words = React.useMemo(() => text.split(/(?<= )/), [text]);
  const [shownSteps, setShownSteps] = React.useState(still ? steps.length + 1 : 1);
  const [shownWords, setShownWords] = React.useState(still ? words.length : 0);
  const [open, setOpen] = React.useState(!still);
  const thinking = shownSteps <= steps.length;
  const streaming = !thinking && shownWords < words.length;

  React.useEffect(() => {
    if (still) return;
    let timer: number;
    const stream = () => {
      setShownWords((count) => {
        const next = count + STREAM_CHUNK_WORDS;
        if (next < words.length) timer = window.setTimeout(stream, STREAM_CHUNK_MS);
        return Math.min(next, words.length);
      });
    };
    const think = (step: number) => {
      timer = window.setTimeout(() => {
        setShownSteps(step + 1);
        if (step < steps.length) think(step + 1);
        else {
          setOpen(false);
          stream();
        }
      }, REASONING_STEP_MS);
    };
    think(1);
    return () => window.clearTimeout(timer);
  }, [still, steps, words]);

  return (
    <ChatMessage role="assistant">
      <Reasoning
        streaming={thinking}
        duration={Math.round((steps.length * REASONING_STEP_MS) / 1000)}
        open={open}
        onOpenChange={setOpen}
      >
        {steps.slice(0, shownSteps).map((step) => (
          <p key={step} className={styles.reasoningStep}>
            {step}
          </p>
        ))}
      </Reasoning>
      {!thinking && (
        <StreamingText text={words.slice(0, shownWords).join("")} streaming={streaming} cursor={streaming} />
      )}
    </ChatMessage>
  );
}

export interface TemplateAssistantProps {
  /** Whether the panel renders; the host owns the open state. */
  open: boolean;
  /** Fired by the panel's close control. */
  onClose: () => void;
  /** The conversation's name in the panel header, e.g. "Boardline AI". */
  title: string;
  /**
   * A live chat to seat instead of the mock thread (a ChatWidget): the panel
   * keeps its modes and its grip and the mock's props go unused. A screen with a
   * live chat is the exception; the family's assistant is the mock.
   */
  chat?: React.ReactNode;
  /** With `chat`: `full` fills the viewport and is modal, the widget's expand control's view. */
  view?: "panel" | "full";
  /** With `chat`: the exit beat after a close, for which the panel stays on screen to leave. */
  closing?: boolean;
  /** The welcome invitation under the greeting, naming what to ask about. */
  askLine?: string;
  /** Conversation starters; each id keys into `replies`. */
  suggestions?: TemplateAssistantSuggestion[];
  /** Canned answers by suggestion id. */
  replies?: Record<string, string>;
  /** The answer for anything typed rather than tapped. */
  fallback?: string;
  /** The reasoning steps an answer shows first, by suggestion id; a general three otherwise. */
  reasoning?: Record<string, string[]>;
  /** One caption line under the composer. */
  disclaimer?: string;
  /**
   * Extra class on the panel, for a host that places it somewhere other
   * than the right edge of the viewport (the mobile dashboard hosts it as a
   * full-screen sheet inside its phone).
   */
  className?: string;
  /**
   * `viewport` (the default) follows the site chat's dock, overlay and
   * takeover modes. `contained` is for a host that seats the panel inside a
   * frame of its own and places it with `className`.
   */
  placement?: "viewport" | "contained";
  /**
   * How the docked panel sits on the page, ChatLauncher's `surface`:
   * `raised` is the glass card with the floating shadow, `inset` the
   * plane on the app surface colour at the shell's gap, with the inset
   * surface's hairline and shadow, and `flush` the flush shell's: edge to
   * edge and full height behind a hairline divider, nothing raised.
   * Defaults to the enclosing TemplateShell's layout (`flush` and `inset`
   * for those, `raised` for floating). The overlay keeps its raised card
   * over the page; the takeover is unchanged.
   */
  surface?: "raised" | "inset" | "flush";
}

export default function TemplateAssistant({
  open,
  onClose,
  title,
  chat,
  view = "panel",
  closing = false,
  askLine,
  suggestions = [],
  replies = {},
  fallback = "",
  reasoning,
  disclaimer,
  className,
  placement = "viewport",
  surface: surfaceProp,
}: TemplateAssistantProps) {
  const shellLayout = React.useContext(TemplateShellContext);
  const surface =
    surfaceProp ?? (shellLayout === "inset" ? "inset" : shellLayout === "flush" ? "flush" : "raised");
  const [value, setValue] = React.useState("");
  const [turns, setTurns] = React.useState<
    { id: number; role: "user" | "assistant"; text: string; steps?: string[] }[]
  >([]);

  const greeting = React.useSyncExternalStore(
    subscribeClock,
    readGreeting,
    serverGreeting
  );

  /* The text field is ready to type into whenever a conversation can start:
     on open, on new chat, and again after every send (the site chat's
     focus contract). */
  const composerRef = React.useRef<HTMLTextAreaElement | null>(null);
  const focusComposer = () => composerRef.current?.focus();
  React.useEffect(() => {
    if (open) focusComposer();
  }, [open]);

  const ask = (text: string, replyId?: string) => {
    const reply = (replyId && replies[replyId]) || fallback;
    setTurns((current) => [
      ...current,
      { id: current.length, role: "user", text },
      {
        id: current.length + 1,
        role: "assistant",
        text: reply,
        steps: (replyId && reasoning?.[replyId]) || DEFAULT_REASONING,
      },
    ]);
    focusComposer();
  };

  const empty = turns.length === 0;

  /* The server snapshot is "not docked", matching the stylesheet's default
     geometry; the panel only renders once opened, which is always after
     hydration, so the first paint already has the real answer. It docks
     only while the page keeps the room the dock threshold promises, so a
     panel widened past that overlays instead (the package's rule). */
  const docked = useDockViewport();
  const viewport = placement === "viewport";
  const full = viewport && view === "full";
  const modal = open && viewport && (!docked || full);

  /* Modal mode owns the page behind it, the site panel's rule. */
  React.useEffect(() => {
    if (!modal) return;
    lockBodyScroll("template-assistant");
    return () => unlockBodyScroll("template-assistant");
  }, [modal]);

  const panelRef = React.useRef<HTMLElement | null>(null);

  /* The widen grip, docked or overlaying: the site chat's (ChatLauncher's dock
     handle, restated). A drag writes --ds-chat-width onto <html> frame by
     frame, so the panel and the room TemplateShell reserves for it (both
     sized from --layout-chat-width) follow the edge without a re-render;
     React state only changes as the drag starts and ends. */
  const dragRef = React.useRef<{ startX: number; width: number } | null>(null);
  const [resizing, setResizing] = React.useState(false);
  const beginResize = (event: React.PointerEvent<HTMLDivElement>) => {
    if ((event.pointerType === "mouse" && event.button !== 0) || dragRef.current) return;
    const rect = panelRef.current?.getBoundingClientRect();
    if (!rect) return;
    dragRef.current = { startX: event.clientX, width: rect.width };
    event.currentTarget.setPointerCapture(event.pointerId);
    setResizing(true);
    document.documentElement.setAttribute("data-chat-resizing", "");
  };
  const moveResize = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    const width = dockWidthFromDrag(drag.width, event.clientX - drag.startX, "right");
    document.documentElement.style.setProperty("--ds-chat-width", `${width}px`);
  };
  const endResize = () => {
    dragRef.current = null;
    setResizing(false);
    document.documentElement.removeAttribute("data-chat-resizing");
  };
  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key === "Escape") {
      /* A menu or picker inside a live chat that handled it closed itself. */
      if (!event.defaultPrevented) onClose();
      return;
    }
    /* Tab wraps inside the panel only while it is modal; docked, focus
       flows through the page beside it. */
    if (modal && event.key === "Tab" && panelRef.current) {
      const focusables =
        panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE);
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

  if (!open && !closing) return null;

  return (
    <>
    {modal && !full && (
      <div className={styles.scrim} onClick={onClose} aria-hidden="true" />
    )}
    <aside
      ref={panelRef}
      className={[
        styles.chatPanel,
        viewport && styles.viewport,
        // Inset: the dock and the overlay both sit at the shell's gap; only
        // the dock becomes the surface's plane, since the overlay still
        // covers the page.
        viewport && !full && surface === "inset" && styles.inset,
        viewport && !modal && surface === "inset" && styles.flat,
        // Flush: the dock runs edge to edge behind a hairline; the overlay
        // still covers the page, so it keeps the raised card.
        viewport && !modal && !full && surface === "flush" && styles.flushDock,
        modal && !full && styles.overScrim,
        chat && styles.live,
        closing && styles.closing,
        full && styles.full,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      role={modal ? "dialog" : undefined}
      aria-modal={modal || undefined}
      aria-label={title}
      onKeyDown={handleKeyDown}
    >
      {/* The site chat's internal anatomy, restated over mock state: a
          zero-basis top region and a growing bottom region split the height
          while the thread is empty, centring the composer; the first
          utterance collapses the bottom region and the transcript takes
          over. */}
      {chat ?? (
      <div className={styles.chat}>
        <div className={styles.chatTopRegion}>
          <ChatHeader
            title={title}
            actions={
              <>
                <CircularButton
                  icon="edit_square"
                  variant="tertiary"
                  ariaLabel="New chat"
                  tooltipPosition="bottom"
                  onClick={() => {
                    setTurns([]);
                    setValue("");
                    focusComposer();
                  }}
                />
                <CircularButton
                  icon="close"
                  variant="tertiary"
                  ariaLabel="Close chat"
                  tooltipPosition="bottom"
                  onClick={onClose}
                />
              </>
            }
          />
          <div className={styles.chatBody}>
            <ChatThread className={styles.chatThread}>
              {turns.map((turn) =>
                turn.role === "assistant" ? (
                  <AssistantReply key={turn.id} text={turn.text} steps={turn.steps ?? DEFAULT_REASONING} />
                ) : (
                  <ChatMessage key={turn.id} role={turn.role}>
                    {turn.text}
                  </ChatMessage>
                )
              )}
            </ChatThread>
            {empty && (
              <div className={styles.chatWelcomeTop}>
                <div className={styles.chatWelcomeGreeting}>
                  <p className={styles.chatWelcomeHello}>{greeting}</p>
                  <p className={styles.chatWelcomeAsk}>{askLine}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <footer className={styles.chatFooter}>
          <div className={styles.chatComposerColumn}>
            {/* No context note, attachments or model picker, so the
                one-row chat composer, as ChatWidget picks with none. */}
            <Composer
              ref={composerRef}
              inline="chat"
              aiGlow
              sendLabel="Send"
              placeholder="Ask anything"
              value={value}
              onValueChange={setValue}
              onSubmit={(submitted) => {
                ask(submitted);
                setValue("");
              }}
            />
          </div>
        </footer>

        <div
          className={`${styles.chatBottomRegion} ${
            empty ? styles.chatBottomRegionWelcome : ""
          }`}
        >
          {empty && (
            <div className={styles.chatStartersColumn}>
              <PromptSuggestions
                layout="stack"
                ariaLabel="Conversation starters"
                suggestions={suggestions}
                onValueChange={(id) => {
                  const suggestion = suggestions.find((s) => s.id === id);
                  if (suggestion) ask(suggestion.label, id);
                }}
              />
            </div>
          )}
          <div className={styles.chatDisclaimerRow}>
            <p className={styles.chatDisclaimer}>{disclaimer}</p>
          </div>
        </div>
      </div>
      )}
    </aside>
    {viewport && !full && !closing && (
      // Docked and as the overlay, in the same range: narrowed back inside
      // the page's room, the overlay docks again as the grip lets go. A
      // fixed sibling on the panel's inner edge: the panel clips its own
      // overflow, so a straddling child would be cut in half.
      <div
        className={[
          styles.dockHandle,
          surface === "inset" && styles.dockHandleInset,
          surface === "flush" && styles.dockHandleFlush,
          resizing && styles.dockHandleResizing,
        ]
          .filter(Boolean)
          .join(" ")}
        data-chat-grip=""
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
