/**
 * POST /api/merchant-chat/starters: the welcome chips for whatever the reader
 * has put in front of the merchant sales assistant, as the package's starters
 * handler configured for this one page. The body is `{ context }`, the same
 * string the chat sends, rebuilt the same way (lib/merchant-chat-context.ts):
 * `describe` turns it into what the reader pointed at, looked up in the ledger,
 * and the handler's prompt (startersSystemPrompt in rift-ds/chat/server) writes
 * neutral, broad chips from it, naming nothing about orders; a vertical changes
 * `describe`, never the prompt. The response is always `{ suggestions }`, empty
 * when there is nothing to offer, so the page keeps its written ones.
 * evals/chat-starters holds the result to the house rules. Public, so it runs
 * behind the site chat's guardrails and shares their budget.
 */

import { createStartersHandler } from "rift-ds/chat/server";
import { MERCHANT_KPIS } from "@/data/merchant-sales";
import { FOLLOWUP_MODEL } from "@/lib/chat-model";
import { focusLine, sanitiseTableContext } from "@/lib/merchant-chat-context";
import { guardrails } from "../../chat/guardrails";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const handler = createStartersHandler({
  apiKey: process.env.ANTHROPIC_API_KEY,
  enabled: process.env.CHAT_ENABLED === "true" && Boolean(process.env.ANTHROPIC_API_KEY),
  model: FOLLOWUP_MODEL,
  /* What the page as a whole says, so a chip can name its period without the prompt naming one. */
  page: `The page reports October 2026 against September 2026. Its figures: ${MERCHANT_KPIS.map((kpi) => `${kpi.label} ${kpi.value} (${kpi.delta})`).join(", ")}.`,
  describe: (context) => {
    const sanitised = sanitiseTableContext(context);
    const focus = sanitised ? (JSON.parse(sanitised) as { focus: Record<string, unknown> | null }).focus : null;
    return focus ? focusLine(focus) : null;
  },
  guardrails,
});

export async function POST(request: Request): Promise<Response> {
  return handler(request);
}
