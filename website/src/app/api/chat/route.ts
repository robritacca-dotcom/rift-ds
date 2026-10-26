/**
 * POST /api/chat: the site chat's backend, as the package's chat handler
 * configured for this site.
 *
 * The protocol (NDJSON `ChatEvent`s, the event order, the body caps, the
 * rule that guardrail outcomes are 200 plus a `notice` and that `error` is
 * only emitted before the first delta) lives in rift-ds/chat/server, so the
 * site and every consumer of the package speak the same stream. What this
 * file supplies is the site: the persona and the generated corpus as the
 * system prompt (the cache breakpoint on the corpus, with a 1-hour TTL that
 * matches how visitors arrive, so the guardrails' price table assumes 2x
 * cache writes), the model allowlist and its budget tiers, the two
 * deterministic lookup tools over the generated registries (shared with
 * /api/mcp through @/lib/site-tools), the package's ask_user tool switched
 * on, the Upstash guardrails, and the
 * notice copy that points people at the docs.
 *
 * The two lookup tools cover what the corpus deliberately leaves out, the
 * component prop API and the token registry. They return plain strings, no
 * cards, so a visitor sees them only as trace points; the tool loop is
 * bounded by maxModelCalls, whose last pass withholds the tools.
 */
import { createChatHandler, type ChatTool } from "rift-ds/chat/server";

import { siteCorpus } from "@/data/site-corpus.generated";
import { BUDGET_CHAT_MODEL, CHAT_MODELS, DEFAULT_CHAT_MODEL } from "@/lib/chat-model";
import { lookupComponent, lookupTokens } from "@/lib/site-tools";

import { guardrails } from "./guardrails";
import { PERSONA } from "./persona";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

/* Two deterministic lookups over generated registry data, shared with the
   public MCP endpoint through @/lib/site-tools. The corpus carries the site's
   prose but deliberately not the prop API or the token registry (they would
   cost tens of thousands of tokens for data most questions never touch), so
   without these the model answers prop- and token-level questions from
   plausible convention rather than the published contract. Same security
   boundary as the corpus: generated, already-published data only. */
const CHAT_TOOLS: ChatTool[] = [
  {
    definition: {
      name: "get_component",
      description:
        "The exact prop contract for one design-system component: every own prop " +
        "with its type, default, requiredness, deprecation status and description, " +
        "plus import paths, generated from the same source as the published .d.ts. " +
        "Use it whenever the answer needs prop-level specifics (names, types, " +
        "defaults, what is deprecated and what replaces it). Never state a prop " +
        "fact from memory when this can confirm it.",
      input_schema: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "Component name, label or docs slug, e.g. Button or agent-plan",
          },
        },
        required: ["name"],
      },
    },
    execute: (args) => JSON.stringify(lookupComponent(String(args.name ?? ""))),
    tracePoint: (args) =>
      typeof args.name === "string" && args.name.trim()
        ? `Checked the ${args.name.trim()} prop contract`
        : "Checked the component API",
  },
  {
    definition: {
      name: "get_design_tokens",
      description:
        "The semantic design-token registry: every token name grouped by category, " +
        "with per-category counts. Use it to enumerate or count tokens, or to check " +
        "whether a token exists. Values and usage guidance stay on the foundations " +
        "pages; link those for the numbers behind a token.",
      input_schema: {
        type: "object",
        properties: {
          category: {
            type: "string",
            description: "A token category to filter by, e.g. colour or motion",
          },
        },
      },
    },
    execute: (args) =>
      JSON.stringify(lookupTokens(typeof args.category === "string" ? args.category : undefined)),
    tracePoint: (args) =>
      typeof args.category === "string" && args.category.trim()
        ? `Read the ${args.category.trim()} token registry`
        : "Read the token registry",
  },
];

/* Measured, not assumed: with this corpus in the system prompt, adaptive
   thinking does not engage, so the effort dial is a cost and latency dial
   here, not a reasoning dial, and sits at the cheap end. The trace-point
   mapping still fires on the rare question that does provoke reasoning. */
const EFFORT = "low";

const handler = createChatHandler({
  apiKey: process.env.ANTHROPIC_API_KEY,
  // The route deploys ahead of its environment variables on purpose, so an
  // unconfigured deploy has to answer politely rather than throw.
  enabled: process.env.CHAT_ENABLED === "true" && Boolean(process.env.ANTHROPIC_API_KEY),
  system: [
    { type: "text", text: PERSONA },
    // The cache breakpoint sits on this block, so the persona caches together
    // with the corpus. Nothing volatile may precede it. The 1-hour TTL
    // matches how visitors actually arrive: most gaps between exchanges are
    // 10-50 minutes, which the default 5-minute cache never survives.
    { type: "text", text: siteCorpus, cache_control: { type: "ephemeral", ttl: "1h" } },
  ],
  // Page context rides after the breakpoint as an uncached trailing block:
  // it changes per request, and the handler has already sanitised the path
  // to a slug charset.
  contextBlock: (path) => `The visitor is currently on the page ${path} of the site.`,
  models: CHAT_MODELS,
  defaultModel: DEFAULT_CHAT_MODEL.value,
  budgetModel: BUDGET_CHAT_MODEL.value,
  tools: CHAT_TOOLS,
  /* The package's built-in ask_user tool: a reply can end in answers to pick
     (which framework, which parts of the system) when the next step depends
     on them. Its guidance lives in the tool description, which sits before
     the cached system blocks and never changes per request, so the corpus
     cache is untouched. Asking ends the exchange with no further call. */
  askUser: true,
  maxModelCalls: 3,
  maxTokens: 3000,
  effort: EFFORT,
  guardrails,
  copy: {
    disabled:
      "This chat is switched off at the moment. The docs cover most of what people ask: components at /components, install and theming at /docs/get-started.",
    refusal:
      "That one is outside what this chat covers. Ask about the design system, its foundations, or how the site is built and it can help.",
    reading: "Reading the site",
    unauthorised:
      "This chat is not configured correctly at the moment. The docs at /docs still cover most of it.",
  },
});

export async function POST(request: Request): Promise<Response> {
  return handler(request);
}
