/**
 * POST /api/chat/followups: the three follow-up questions offered under a
 * finished answer, as the package's follow-ups handler configured for this
 * site. The body is `{ question, answer }` and the response is always
 * `{ suggestions: [...] }`, empty when there is nothing to offer, so the
 * widget substitutes its written fallbacks rather than showing a shimmer
 * that resolved to nothing.
 *
 * Why a second call rather than part of the answer's own stream: the
 * suggestions are written from the completed answer, so the main stream
 * would have to stay open past its last word, which would hold the turn in
 * its streaming state and delay the copy and thumbs row. Chips arriving a
 * beat late costs nothing.
 */
import { createFollowupsHandler } from "rift-ds/chat/server";

import { BRAND_SHORT, SITE_URL } from "@/config/brand.generated";
import { FOLLOWUP_MODEL } from "@/lib/chat-model";

import { guardrails } from "../guardrails";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** The bare host, the way the prompt names the site in prose. */
const SITE_HOST = new URL(SITE_URL).host;

const handler = createFollowupsHandler({
  apiKey: process.env.ANTHROPIC_API_KEY,
  enabled: process.env.CHAT_ENABLED === "true" && Boolean(process.env.ANTHROPIC_API_KEY),
  model: FOLLOWUP_MODEL,
  about: `${SITE_HOST}, the documentation site of the ${BRAND_SHORT} design system: its tokens, components, themes and templates, how the site is built and maintained, or established design craft`,
  examples: [
    "How do I install the package?",
    "How do the theme presets work?",
    "Why is the action colour reserved?",
  ],
  guardrails,
});

export async function POST(request: Request): Promise<Response> {
  return handler(request);
}
