"use client";

import { useEffect, useRef, useState } from "react";
import { MOTION_FEEDBACK_RESET_MS } from "@robr0/design-system/tokens/motion";
import type { ChatTurn } from "@/hooks/useChat";
import { useSiteChat } from "./ChatContext";
import styles from "./SiteChat.module.css";

/**
 * The row under a committed assistant turn: copy, and, when the server
 * logged the exchange, thumbs up and down. The sim transport never sends an
 * exchange id, so the bench shows copy alone — the thumbs would have nothing
 * to rate.
 *
 * Deliberately not the library's MessageActions component: its items API
 * swaps an icon by name, which cannot crossfade, and this row's copied-tick
 * (status colour, scale-and-fade swap) and filled chosen thumb both need
 * styling per element that the items shape does not carry.
 *
 * Copy takes the turn's raw markdown, not the rendered text: it pastes back
 * into anything that reads markdown, and plain readers still get the words.
 */
export function ResponseActions({ turn }: { turn: ChatTurn }) {
  const { setTurnFeedback } = useSiteChat();
  const [copied, setCopied] = useState(false);
  const revertTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (revertTimer.current !== null) window.clearTimeout(revertTimer.current);
    },
    []
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(turn.text);
    } catch {
      // Clipboard denied: nothing was copied, so the button must not say it was.
      return;
    }
    setCopied(true);
    if (revertTimer.current !== null) window.clearTimeout(revertTimer.current);
    revertTimer.current = window.setTimeout(() => setCopied(false), MOTION_FEEDBACK_RESET_MS);
  };

  const vote = (verdict: "up" | "down") => {
    if (!turn.exchangeId || turn.feedback === verdict) return;
    // Optimistic on purpose: the verdict is the visitor's fact, so it shows
    // immediately; a write the network loses is worth less than a spinner.
    setTurnFeedback(turn.id, verdict);
    void fetch("/api/chat/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: turn.exchangeId, verdict }),
    }).catch(() => {});
  };

  return (
    <>
      <button
        type="button"
        className={styles.actionButton}
        onClick={copy}
        aria-label={copied ? "Copied" : "Copy response"}
      >
        {/* Both icons occupy the same cell; the swap is a crossfade-and-scale
            between them, not a text change, which is what makes it animatable. */}
        <span
          className={`${styles.actionIcon} ${copied ? styles.actionIconHidden : ""} material-symbols-rounded`}
          aria-hidden="true"
        >
          content_copy
        </span>
        <span
          className={`${styles.actionIcon} ${styles.actionIconTick} ${copied ? "" : styles.actionIconHidden} material-symbols-rounded`}
          aria-hidden="true"
        >
          check
        </span>
      </button>

      {turn.exchangeId && (
        <>
          <button
            type="button"
            className={styles.actionButton}
            onClick={() => vote("up")}
            aria-label="Good response"
            aria-pressed={turn.feedback === "up"}
          >
            <span className={`${styles.actionIcon} material-symbols-rounded`} aria-hidden="true">
              thumb_up
            </span>
          </button>
          <button
            type="button"
            className={styles.actionButton}
            onClick={() => vote("down")}
            aria-label="Bad response"
            aria-pressed={turn.feedback === "down"}
          >
            <span className={`${styles.actionIcon} material-symbols-rounded`} aria-hidden="true">
              thumb_down
            </span>
          </button>
        </>
      )}

      {/* The visual state change is silent to a screen reader; this is not. */}
      <span className={styles.srOnly} aria-live="polite">
        {copied ? "Copied to clipboard" : ""}
      </span>
    </>
  );
}
