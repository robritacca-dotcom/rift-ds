'use client';

import { createContext, useContext, useId, useLayoutEffect } from 'react';
import { ChatWidgetContext } from './context';

/** The id of the assistant turn a card is drawn in, so a card's wait is recorded against its reply. */
export const TurnIdContext = createContext<string | null>(null);

/**
 * Report that the card this is called from waits on the reader, such as a
 * proposed change with Confirm still to press. The wait is recorded once, on
 * the chat provider, and everything that reports the agent reads it from
 * there: the reply's status line reads as waiting for approval, and
 * `useChatAgentState` returns `waiting` for whatever opens the chat, so the
 * two can never disagree. Outside a chat turn it does nothing.
 *
 * Pass the card's own stable `key` when it has one: the wait then outlives
 * the card being unmounted with the panel closed, which is when the opener's
 * state matters most, and ends only when the card says it no longer waits.
 * Without a key the wait ends when the card unmounts.
 *
 * A layout effect, so the line never paints its finished form for a frame
 * before the card's wait is counted.
 */
export function useTurnAwaiting(awaiting: boolean, key?: string): void {
  const setAwaiting = useContext(ChatWidgetContext)?.setAwaiting;
  const turnId = useContext(TurnIdContext);
  const ownKey = useId();
  const entry = key ?? ownKey;
  const sticky = key !== undefined;
  useLayoutEffect(() => {
    if (!setAwaiting || !turnId) return;
    setAwaiting(entry, awaiting ? turnId : null);
    if (sticky) return;
    return () => setAwaiting(entry, null);
  }, [setAwaiting, turnId, entry, awaiting, sticky]);
}
