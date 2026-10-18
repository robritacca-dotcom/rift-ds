import { fitsChip } from './suggestions';
import type { ChatTurn } from './types';

/* ============================================
   Follow-up suggestions.

   Asked for once, after an assistant turn commits, and attached to that turn.
   Deliberately outside the ChatTransport contract: the suggestions are
   written from the finished answer, so a transport carrying them would have
   to hold its stream open past the last word. A transport that can produce
   them cheaply (a script does) yields a `followups` event instead, and the
   two paths meet at the same field on the turn.

   Every failure is silent, but never empty-handed. The pending row promises
   chips (a shimmer that resolves to nothing reads as a failure), so a request
   that comes back with no usable suggestions falls back to a written pool
   rather than collapsing. An error message where a suggestion should be is
   still the one thing this module never shows.
   ============================================ */

/** Chips offered under one answer. */
export const MAX_FOLLOWUPS = 3;

/**
 * The written fallbacks a host that passes none gets: generic by design, so
 * any of them makes sense under any answer. A host whose chat is about one
 * product writes its own pool and passes it to the provider.
 */
export const DEFAULT_FALLBACK_FOLLOWUPS: readonly string[] = [
  'Can you say more about that?',
  'What should I do next?',
  'Where can I read more?',
  'Can you give an example?',
  'What are the alternatives?',
];

/**
 * Three questions from a fallback pool, rotated by the turn id (stable
 * across re-renders) and skipping one identical to what the visitor just
 * asked: offering their own question back would read as not listening.
 */
export function pickFallbackFollowups(
  pool: readonly string[],
  turnId: string,
  question: string
): string[] {
  const asked = question.trim().toLowerCase();
  const usable = pool.filter((label) => label.toLowerCase() !== asked && fitsChip(label));
  let hash = 0;
  for (const char of turnId) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return Array.from(
    { length: Math.min(MAX_FOLLOWUPS, usable.length) },
    (_, index) => usable[(hash + index) % usable.length]
  );
}

/**
 * Suggestions have no value once the visitor has moved on, and the widget
 * never blocks on them, so a slow one is simply dropped.
 */
export const FOLLOWUPS_TIMEOUT_MS = 10_000;

/** A source of follow-up questions for a finished answer. */
export type FollowupsSource = (
  question: string,
  answer: string,
  signal: AbortSignal
) => Promise<string[]>;

/**
 * A source that asks an HTTP endpoint speaking the follow-ups protocol
 * (`createFollowupsHandler` on the server): POST `{ question, answer }`,
 * read `{ suggestions: string[] }`. Resolves to an empty array on any
 * failure, which the provider stores as-is: it records that the turn was
 * asked about and had nothing to offer, then substitutes the fallbacks.
 */
export function createFollowupsFetcher(endpoint = '/api/chat/followups'): FollowupsSource {
  return async (question, answer, signal) => {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, answer }),
        signal,
      });
      if (!response.ok) return [];

      const payload: unknown = await response.json();
      const suggestions = (payload as { suggestions?: unknown })?.suggestions;
      if (!Array.isArray(suggestions)) return [];

      /* The handler parses the model's output already. This second pass is
         not distrust of the handler but of the network between them: whatever
         arrives is about to be rendered as something the host appears to be
         saying, and the chip budget is enforced wherever a suggestion enters
         the UI. */
      return suggestions
        .filter((item): item is string => typeof item === 'string' && fitsChip(item))
        .slice(0, MAX_FOLLOWUPS);
    } catch {
      return [];
    }
  };
}

/**
 * The turn to ask about, or null when there is nothing to ask about yet:
 * the newest turn must be a committed assistant answer that came from a
 * backend (an exchange id is the marker, as it is for the thumbs), has
 * not been asked about already, and asks no question of its own.
 */
export function followupTarget(
  turns: ChatTurn[]
): { id: string; question: string; answer: string } | null {
  const last = turns[turns.length - 1];
  if (!last || last.role !== 'assistant') return null;
  if (!last.exchangeId || last.followups || last.text === '') return null;
  /* A turn that asks the visitor something already ends in a choice. Its
     question is the next step; chips beside it would compete with it. */
  if (last.question) return null;

  // The question this answer replied to, which is the turn before it.
  const question = turns[turns.length - 2];
  if (!question || question.role !== 'user') return null;

  return { id: last.id, question: question.text, answer: last.text };
}
