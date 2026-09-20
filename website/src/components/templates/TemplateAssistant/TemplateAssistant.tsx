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
 */

import React from "react";
import { ChatHeader } from "@robr0/design-system/components/ChatHeader/ChatHeader";
import { ChatMessage } from "@robr0/design-system/components/ChatMessage/ChatMessage";
import { ChatThread } from "@robr0/design-system/components/ChatThread/ChatThread";
import { CircularButton } from "@robr0/design-system/components/CircularButton/CircularButton";
import { Composer } from "@robr0/design-system/components/Composer/Composer";
import { PromptSuggestions } from "@robr0/design-system/components/PromptSuggestions/PromptSuggestions";
import {
  readGreeting,
  serverGreeting,
  subscribeClock,
} from "../../SiteChat/greeting";
import styles from "./TemplateAssistant.module.css";

export type TemplateAssistantSuggestion = { id: string; label: string };

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

  if (!open) return null;

  return (
    <aside className={styles.chatPanel} aria-label={title}>
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
  );
}
