'use client';

import { useEffect, useState } from 'react';
import type { AgentStatusState } from '../components/AgentStatus/AgentStatusPatterns';
import { MOTION_FEEDBACK_RESET_MS } from '../tokens/motion';
import { useChatWidget } from './context';

/**
 * What the agent is doing right now, in AgentStatus's vocabulary, for whatever
 * opens the chat: pass it to an AiButton's `state`, so a reply keeps showing
 * its progress on the button after the panel is closed. Read it under a
 * ChatProvider, from something that stays mounted while the panel is open, so
 * the end of a reply is only reported once.
 *
 * `thinking` until the first words, `working` once words or rich content are
 * arriving, `waiting` while a question stands unanswered, then `done` or
 * `error` for a beat as a reply ends. A reply the visitor stopped, or a chat
 * they reset, goes straight back to `idle`.
 */
export function useChatAgentState(): AgentStatusState {
  const { live, turns } = useChatWidget();
  const [ended, setEnded] = useState<'done' | 'error' | null>(null);
  const last = turns[turns.length - 1];

  /* Set while rendering, as a flight's edges are read straight off the state:
     a reply's last render out of flight also holds its committed turn, since
     the hook commits the two together. */
  const inFlight = live !== null;
  const [wasInFlight, setWasInFlight] = useState(inFlight);
  if (wasInFlight !== inFlight) {
    setWasInFlight(inFlight);
    const reported = !inFlight && last?.role === 'assistant' && last.outcome !== 'stopped';
    setEnded(reported ? (last.outcome === 'failed' ? 'error' : 'done') : null);
  }

  useEffect(() => {
    if (!ended) return;
    const timer = setTimeout(() => setEnded(null), MOTION_FEEDBACK_RESET_MS);
    return () => clearTimeout(timer);
  }, [ended]);

  if (live) {
    return live.phase === 'thinking' && !live.content && !live.cards?.length ? 'thinking' : 'working';
  }
  if (last?.role === 'assistant' && last.question && !last.answers) return 'waiting';
  return ended ?? 'idle';
}
