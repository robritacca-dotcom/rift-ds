"use client";

import { PromptSuggestions } from "@robr0/design-system/components/PromptSuggestions/PromptSuggestions";
import { useSiteChat } from "./ChatContext";
import styles from "./SiteChat.module.css";

/**
 * The follow-up questions under a finished answer. Deliberately the same
 * component, layout and scale as the welcome screen's conversation starters:
 * one pattern for "here is something you could ask", whether the conversation
 * has started or not. The only difference is where the questions come from —
 * the welcome screen's are written for the page, these are written from the
 * answer the visitor just read.
 *
 * Tapping one sends it as the next message. A tap while a response is already
 * streaming is ignored by `send`, the same as pressing enter in the composer
 * would be.
 *
 * While the questions are still being generated, `pending` shows the row's
 * shimmer placeholders in their place — a real loading state, unlike the
 * welcome starters' staged one: the fetch to /api/chat/followups is genuinely
 * in flight, and the row resolves to chips or to nothing when it lands.
 */
export function FollowupSuggestions({
  turnId,
  suggestions,
  pending = false,
  entrance = true,
}: {
  /** The turn these belong to; makes each suggestion's id unique in the thread. */
  turnId: string;
  suggestions: string[];
  /** The follow-ups request is still in flight; show placeholders. */
  pending?: boolean;
  /** Play the chips' staggered pop-in. Off for rows remounted by a reopen, whose suggestions already arrived once. */
  entrance?: boolean;
}) {
  const { send } = useSiteChat();

  const items = suggestions.map((label, index) => ({
    id: `${turnId}-followup-${index}`,
    label,
  }));

  return (
    <PromptSuggestions
      className={styles.followups}
      layout="stack"
      ariaLabel="Follow-up questions"
      pending={pending}
      entrance={entrance}
      suggestions={items}
      onValueChange={(id) => {
        const item = items.find((candidate) => candidate.id === id);
        if (item) send(item.label);
      }}
    />
  );
}
