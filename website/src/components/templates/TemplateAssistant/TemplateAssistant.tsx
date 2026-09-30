"use client";

/**
 * The template screens' shared mock assistant: the site chat's docked-panel
 * anatomy (header, thread, centred composer, starter pills, disclaimer)
 * restated over canned answers, so every template plugs in the same AI
 * surface the way a real product would plug in a live one. Each template
 * passes its own suggestions and replies over its own page data; the panel
 * owns the conversation state and the focus contract.
 *
 * Suggestion labels follow the site-wide chip budget (SUGGESTION_MAX_CHARS,
 * 40): a chip never wraps, so a longer question runs off the panel's edge.
 *
 * The panel also owns the site chat's responsive contract (design.md's AI
 * chat responsive rule), so no host restates it:
 *
 * - Docked (DOCK_QUERY): a non-modal complementary region. The host reserves
 *   the width by gating its own padding rule on the same breakpoint.
 * - Overlay (below the dock threshold): modal over a scrim, with a focus
 *   trap, the body scroll lock, and Escape or a scrim tap to close.
 * - Takeover (TAKEOVER_QUERY): the panel fills the viewport, still modal.
 *
 * A host that seats the panel inside its own frame (the mobile dashboard's
 * phone) passes `placement="contained"` and keeps none of that: the frame,
 * not the viewport, is the panel's world there.
 */

import React from "react";
import { lockBodyScroll, unlockBodyScroll } from "@/lib/scroll-lock";
import { DOCK_QUERY } from "../../SiteChat/ChatContext";
import { ChatHeader } from "rift-ds/components/ChatHeader/ChatHeader";
import { ChatMessage } from "rift-ds/components/ChatMessage/ChatMessage";
import { ChatThread } from "rift-ds/components/ChatThread/ChatThread";
import { CircularButton } from "rift-ds/components/CircularButton/CircularButton";
import { Composer } from "rift-ds/components/Composer/Composer";
import { PromptSuggestions } from "rift-ds/components/PromptSuggestions/PromptSuggestions";
import {
  readGreeting,
  serverGreeting,
  subscribeClock,
} from "../../SiteChat/greeting";
import styles from "./TemplateAssistant.module.css";

export type TemplateAssistantSuggestion = { id: string; label: string };

const subscribeDock = (onChange: () => void) => {
  const media = window.matchMedia(DOCK_QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
};
const readDocked = () => window.matchMedia(DOCK_QUERY).matches;

const FOCUSABLE =
  'button:not([disabled]), a[href], textarea:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

export interface TemplateAssistantProps {
  /** Whether the panel renders; the host owns the open state. */
  open: boolean;
  /** Fired by the panel's close control. */
  onClose: () => void;
  /** The conversation's name in the panel header, e.g. "Boardline AI". */
  title: string;
  /** The welcome invitation under the greeting, naming what to ask about. */
  askLine: string;
  /** Conversation starters; each id keys into `replies`. */
  suggestions: TemplateAssistantSuggestion[];
  /** Canned answers by suggestion id. */
  replies: Record<string, string>;
  /** The answer for anything typed rather than tapped. */
  fallback: string;
  /** One caption line under the composer. */
  disclaimer: string;
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
}

export default function TemplateAssistant({
  open,
  onClose,
  title,
  askLine,
  suggestions,
  replies,
  fallback,
  disclaimer,
  className,
  placement = "viewport",
}: TemplateAssistantProps) {
  const [value, setValue] = React.useState("");
  const [turns, setTurns] = React.useState<
    { id: number; role: "user" | "assistant"; text: string }[]
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
      { id: current.length + 1, role: "assistant", text: reply },
    ]);
    focusComposer();
  };

  const empty = turns.length === 0;

  /* The server snapshot is "not docked", matching the stylesheet's default
     geometry; the panel only renders once opened, which is always after
     hydration, so the first paint already has the real answer. */
  const docked = React.useSyncExternalStore(
    subscribeDock,
    readDocked,
    () => false
  );
  const viewport = placement === "viewport";
  const modal = open && viewport && !docked;

  /* Modal mode owns the page behind it, the site panel's rule. */
  React.useEffect(() => {
    if (!modal) return;
    lockBodyScroll("template-assistant");
    return () => unlockBodyScroll("template-assistant");
  }, [modal]);

  const panelRef = React.useRef<HTMLElement | null>(null);
  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key === "Escape") {
      onClose();
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

  if (!open) return null;

  return (
    <>
    {modal && (
      <div className={styles.scrim} onClick={onClose} aria-hidden="true" />
    )}
    <aside
      ref={panelRef}
      className={[styles.chatPanel, viewport && styles.viewport, className]
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
              {turns.map((turn) => (
                <ChatMessage key={turn.id} role={turn.role}>
                  {turn.text}
                </ChatMessage>
              ))}
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
            <Composer
              ref={composerRef}
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
    </aside>
    </>
  );
}
