/**
 * POST /api/chat/followups — the three follow-up questions offered under a
 * finished answer.
 *
 * The body is `{ question, answer }`: the visitor's last question and the
 * reply they just read. A small model turns that pair into the questions
 * someone would most likely ask next, and the widget renders them as the same
 * suggestion chips the welcome screen uses.
 *
 * Why a second call rather than part of the answer's own stream: the
 * suggestions are written *from* the completed answer, so the main stream
 * would have to stay open past its last word to carry them — which would hold
 * the turn in its streaming state, delaying the copy and thumbs row and the
 * composer's return. Chips arriving a beat late costs nothing; a response that
 * looks unfinished for a second costs the whole choreography.
 *
 * The response is always `{ suggestions: [...] }`, empty when there is nothing
 * to offer (chat switched off, budget paused, model failure). Suggestions are
 * a nicety: every failure here is silent, and the widget substitutes its
 * written fallback questions for an empty result (lib/chat-followups.ts), so
 * the visitor still sees a row of chips rather than a shimmer that resolved
 * to nothing.
 *
 * Both inputs are untrusted — the question is the visitor's own text, and the
 * answer is model output. Neither can do more than shape the words on three
 * chips that only this visitor sees, and tapping one sends it back through
 * /api/chat, whose persona defends itself. The parsing below is still strict
 * (three lines, short, question-shaped, plain text), because a chip is a
 * sentence the site appears to be saying.
 */
import Anthropic from "@anthropic-ai/sdk";

import { FOLLOWUP_MODEL } from "@/lib/chat-model";
import { SUGGESTION_MAX_CHARS, fitsChip } from "@/lib/chat-suggestions";

import { checkFollowupLimit, recordSpend } from "../guardrails";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Three chips, matching the welcome screen's row. */
const WANTED = 3;

/**
 * Candidates asked for. More than are shown, deliberately: a suggestion that
 * runs past the chip's width is dropped rather than clipped, and asking for
 * exactly three means one long one leaves a row of two. The model writes them
 * best-first and the first three that fit are the ones used.
 */
const CANDIDATES = 5;

/** Shortest thing that could be a real question. */
const MIN_SUGGESTION_CHARS = 12;

/** The question is capped by /api/chat already; this is the same ceiling. */
const MAX_QUESTION_CHARS = 4000;

/**
 * How much of the answer the writer reads. The opening carries the topic, and
 * a long walkthrough's tail is detail the next question rarely hangs on.
 */
const MAX_ANSWER_CHARS = 4000;

/** Enough for three short lines and nothing more. */
const MAX_TOKENS = 200;

/**
 * Cap on the upstream call, well inside the widget's own 10s wait
 * (TIMEOUT_MS in lib/chat-followups.ts): past the widget's window a late
 * answer is billed and never seen, so a slow call should die here rather
 * than run on. Retries are off for the same reason — the SDK's default
 * backoff can stretch one slow upstream moment past every deadline, and
 * the widget's written fallbacks cover a miss better than a late answer.
 */
const UPSTREAM_TIMEOUT_MS = 8_000;

const SYSTEM = `You write the follow-up questions offered under an answer from the chat assistant on robertritacca.com, the portfolio and design system site of Rob Ritacca, a principal product designer.

You are given the visitor's last question and the answer they just read. Write the ${CANDIDATES} questions that visitor is most likely to want to ask next, best first.

Length matters more than anything else here. Each question is shown on a chip, on one line, in a narrow panel. It must be at most ${SUGGESTION_MAX_CHARS} characters including spaces, which is about six words. A question over that length is thrown away and never shown, so write the short version of the question rather than the complete one. Count the characters before you write each line.

Ask the plain question. Cut any phrase that does not change what is being asked: how long the answer should take, how many points it should have, how simple it should be, and the polite run-up to the question itself. "Summarise Rob's career" beats "Give me a two-minute summary of Rob's career". "What did Rob build at Intuit?" beats "Could you briefly explain what Rob built at Intuit?". A chip is a question, not a request.

These are the site's own starter questions, and the length and plainness to match:
What did Rob build at Intuit?
Which case study should I read first?
Why is teal reserved for actions?

The rest of the rules:
- Each question must be answerable by this site: Rob's career and case studies, his writing, the robr0 design system and how this site is built, or established design craft.
- Move the conversation forward. Never re-ask the question just asked, and never ask something the answer already covered.
- The visitor is speaking to the assistant about Rob in the third person: "What did Rob change first?", never "What did you change first?".
- Plain words, British spelling, sentence case. No em dashes, no emoji, no quotation marks, no numbering, no markdown.
- Different angles on what was just said, not one question phrased several ways.

Output exactly ${CANDIDATES} lines, one question per line, and nothing else.`;

/* ============================================
   Parsing
   ============================================ */

/**
 * The model's lines to the chips that are safe to show: plain text, one short
 * question each, no duplicates, at most three. Anything that does not fit the
 * shape is dropped rather than repaired — a mangled chip is worse than one
 * fewer chip, and an empty row is a valid outcome.
 */
function parseSuggestions(text: string): string[] {
  const seen = new Set<string>();
  const suggestions: string[] = [];

  for (const line of text.split("\n")) {
    const cleaned = line
      // Numbering and bullets the instruction asked it not to use.
      .replace(/^\s*(?:[-*•]|\d+[.)])\s*/, "")
      // Markdown emphasis, and the surrounding quotes a model reaches for.
      .replace(/[*_`#]/g, "")
      .replace(/^["'“”‘’]+|["'“”‘’]+$/g, "")
      .replace(/\s+/g, " ")
      .trim();

    if (cleaned.length < MIN_SUGGESTION_CHARS || !fitsChip(cleaned)) continue;
    // A suggestion is a question. A line that is not one is commentary the
    // model was asked not to write.
    if (!cleaned.endsWith("?")) continue;

    const key = cleaned.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    suggestions.push(cleaned);
    if (suggestions.length === WANTED) break;
  }

  return suggestions;
}

/* ============================================
   Handler
   ============================================ */

const empty = () => Response.json({ suggestions: [] });

export async function POST(request: Request): Promise<Response> {
  if (process.env.CHAT_ENABLED !== "true" || !process.env.ANTHROPIC_API_KEY) return empty();

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "invalid JSON" }, { status: 400 });
  }

  if (typeof payload !== "object" || payload === null) {
    return Response.json({ error: "body must be an object" }, { status: 400 });
  }

  const { question, answer } = payload as { question?: unknown; answer?: unknown };
  if (typeof question !== "string" || question.trim() === "") {
    return Response.json({ error: "question must be a non-empty string" }, { status: 400 });
  }
  if (typeof answer !== "string" || answer.trim() === "") {
    return Response.json({ error: "answer must be a non-empty string" }, { status: 400 });
  }

  if (!(await checkFollowupLimit(request))) return empty();

  try {
    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
      timeout: UPSTREAM_TIMEOUT_MS,
      maxRetries: 0,
    });
    const message = await client.messages.create(
      {
        model: FOLLOWUP_MODEL,
        max_tokens: MAX_TOKENS,
        system: SYSTEM,
        messages: [
          {
            role: "user",
            content: `The visitor asked:\n${question.slice(0, MAX_QUESTION_CHARS)}\n\nThe assistant answered:\n${answer.slice(0, MAX_ANSWER_CHARS)}`,
          },
        ],
      },
      // The visitor closing the tab or asking the next question stops this
      // being billed; nothing downstream is waiting on it.
      { signal: request.signal }
    );

    // The day's breaker counts this call too, at this model's own rates now
    // that the price table knows more than one model.
    await recordSpend(message.usage, FOLLOWUP_MODEL);

    const text = message.content
      .map((block) => (block.type === "text" ? block.text : ""))
      .join("");

    return Response.json({ suggestions: parseSuggestions(text) });
  } catch (error) {
    if (!request.signal.aborted) {
      console.error("[chat] follow-up suggestions failed:", error);
    }
    return empty();
  }
}
