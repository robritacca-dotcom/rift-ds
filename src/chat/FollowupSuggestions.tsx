'use client';

import { createContext, useContext } from 'react';
import { PromptSuggestions } from '../components/PromptSuggestions/PromptSuggestions';
import { useChatWidget } from './context';

/* Carried by context, like the reply row's labels, because the row sits under
   ChatWidget through AssistantTurn; ChatWidget's `followupsLabel` feeds it. */
// eslint-disable-next-line react-refresh/only-export-components -- the label context is the row's one input from ChatWidget and lives with the row
export const FollowupSuggestionsLabelContext = createContext('Follow-up questions');

/**
 * The follow-up questions under a finished answer. Deliberately the same
 * component, layout and scale as the welcome screen's conversation starters:
 * one pattern for "here is something you could ask", whether the conversation
 * has started or not. The only difference is where the questions come from.
 *
 * Tapping one sends it as the next message and keeps the row as the record
 * of that choice: the chip checked, the rest dimmed and inert. A tap while a
 * response is already streaming is ignored by `send`, the same as pressing
 * enter in the composer would be, and leaves the row as it was.
 *
 * While the questions are still being generated, `pending` shows the row's
 * shimmer placeholders in their place: a real loading state, unlike the
 * welcome starters' staged one.
 */
export function FollowupSuggestions({
  turnId,
  suggestions,
  pending = false,
  entrance = true,
  chosen,
  chosenLabel,
}: {
  /** The turn these belong to; makes each suggestion's id unique in the thread. */
  turnId: string;
  suggestions: string[];
  /** The follow-ups request is still in flight; show placeholders. */
  pending?: boolean;
  /** Play the chips' staggered pop-in. Off for rows remounted by a reopen, whose suggestions already arrived once. */
  entrance?: boolean;
  /** The label already sent from this row, which keeps the row as a record. */
  chosen?: string;
  /** Visually hidden text read after the sent suggestion. Defaults to PromptSuggestions' "(chosen)". */
  chosenLabel?: string;
}) {
  const { chooseFollowup } = useChatWidget();
  const rowLabel = useContext(FollowupSuggestionsLabelContext);

  const items = suggestions.map((label, index) => ({
    id: `${turnId}-followup-${index}`,
    label,
  }));

  return (
    <PromptSuggestions
      className="ds-chat-widget__followups"
      layout="stack"
      ariaLabel={rowLabel}
      chosenLabel={chosenLabel}
      pending={pending}
      entrance={entrance}
      suggestions={items}
      value={chosen !== undefined ? items.find((item) => item.label === chosen)?.id : undefined}
      onValueChange={(id) => {
        const item = items.find((candidate) => candidate.id === id);
        if (item) chooseFollowup(turnId, item.label);
      }}
    />
  );
}
