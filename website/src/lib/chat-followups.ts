import type { ChatTurn } from "@/hooks/useChat";
import { fitsChip } from "@/lib/chat-suggestions";

/* ============================================
   Follow-up suggestions.

   Asked for once, after an assistant turn commits, and attached to that turn.
   Deliberately outside the ChatTransport contract: the suggestions are
   written from the finished answer, so a transport carrying them would have
   to hold its stream open past the last word — see the route's own note for
   why that is the wrong trade. A transport that *can* produce them cheaply
   (the sim does, from a script) yields a `followups` event instead, and the
   two paths meet at the same field on the turn.

   Every failure is silent, but never empty-handed. The pending row promises
   chips — a shimmer that resolves to nothing reads as a failure — so a
   request that comes back with no usable suggestions falls back to the
   written pool below rather than collapsing. An error message where a
   suggestion should be is still the one thing this module never shows.
   ============================================ */

/** Chips offered under one answer. */
const MAX_SUGGESTIONS = 3;

/**
 * The written fallbacks, offered when the generated set comes back empty —
 * a slow upstream call, a guardrail pause, or five candidates that all ran
 * past the chip budget all land here. Generic by design, so any of them
 * makes sense under any answer; the pick rotates by turn id so back-to-back
 * misses do not repeat a set. Written copy on the chip row, so
 * `scripts/validate-chat-starters.mjs` holds every label to the budget.
 */
const FALLBACK_FOLLOWUPS = [
  "What has Rob shipped recently?",
  "Which case study should I read first?",
  "How does this design system work?",
  "What has Rob built with AI?",
  "Describe Rob's design philosophy",
  "How do I get in touch with Rob?",
];

/**
 * Three questions from the fallback pool, rotated by the turn id (stable
 * across re-renders) and skipping one identical to what the visitor just
 * asked — offering their own question back would read as not listening.
 */
export function fallbackFollowups(turnId: string, question: string): string[] {
  const asked = question.trim().toLowerCase();
  const pool = FALLBACK_FOLLOWUPS.filter((label) => label.toLowerCase() !== asked);
  let hash = 0;
  for (const char of turnId) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return Array.from(
    { length: Math.min(MAX_SUGGESTIONS, pool.length) },
    (_, index) => pool[(hash + index) % pool.length]
  );
}

/**
 * Suggestions have no value once the visitor has moved on, and the widget
 * never blocks on them, so a slow one is simply dropped.
 */
const TIMEOUT_MS = 10_000;

/**
 * Ask for the follow-up questions to offer under a finished answer. Resolves
 * to an empty array on any failure, which the caller stores as-is: it records
 * that the turn was asked about and had nothing to offer.
 */
export async function fetchFollowups(question: string, answer: string): Promise<string[]> {
  try {
    const response = await fetch("/api/chat/followups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, answer }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!response.ok) return [];

    const payload: unknown = await response.json();
    const suggestions = (payload as { suggestions?: unknown })?.suggestions;
    if (!Array.isArray(suggestions)) return [];

    /* The route parses the model's output already. This second pass is not
       distrust of the route but of the network between them: whatever arrives
       is about to be rendered as something the site appears to be saying, and
       the chip budget is enforced wherever a suggestion enters the UI. */
    return suggestions
      .filter((item): item is string => typeof item === "string" && fitsChip(item))
      .slice(0, MAX_SUGGESTIONS);
  } catch {
    return [];
  }
}

/**
 * The turn to ask about, or null when there is nothing to ask about yet:
 * the newest turn must be a committed assistant answer that came from the
 * real backend (an exchange id is the marker, as it is for the thumbs) and
 * has not been asked about already.
 */
export function followupTarget(
  turns: ChatTurn[]
): { id: string; question: string; answer: string } | null {
  const last = turns[turns.length - 1];
  if (!last || last.role !== "assistant") return null;
  if (!last.exchangeId || last.followups || last.text === "") return null;

  // The question this answer replied to, which is the turn before it.
  const question = turns[turns.length - 2];
  if (!question || question.role !== "user") return null;

  return { id: last.id, question: question.text, answer: last.text };
}
