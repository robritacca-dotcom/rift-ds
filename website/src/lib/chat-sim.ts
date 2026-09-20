import type { ReactNode } from "react";
import type { ChatEvent, ChatTransport, ChatTransportMessage } from "@/hooks/useChat";

/* ============================================
   Simulated chat transport.

   Build 1 runs the widget entirely on this: scripted status steps at a
   steady beat, a handoff pause, then word-cadence deltas — the same event
   stream the real /api/chat transport will produce in Build 2, so the
   widget cannot tell the difference.

   On top of the rotation, a branching story: every chip the stage offers —
   the three starters and each answer's follow-ups — routes to a scripted
   node, and each path shows off different rich elements (cards, charts,
   tool calls, an approval). The nodes hold text only; the rich elements
   come in through the `content` map the playground passes at creation,
   keyed by `contentKey`, because JSX cannot live in this .ts module.
   Typed free text falls back to the scenario rotation below.

   Beats carried over from the original scratch-page sim.
   ============================================ */

const STATUS_MS = 1600;
const HANDOFF_MS = 350; /* beat for the components' live→done handoff */
const STREAM_MS = 30;

interface SimScenario {
  steps: { status: string; point: string }[];
  response: string;
  /** The follow-up chips offered under the finished answer. Scripted here
      because the sim has no backend to write them: on the site they come
      from a model reading the answer (see lib/chat-followups). Written copy,
      so the chip budget is held by scripts/validate-chat-starters.mjs — the
      route's runtime filter never sees these. */
  followups: string[];
}

/* Scenarios rotate per exchange so a test conversation stays varied:
   short plain answers through long sectioned ones, exercising the Prose
   typography kit (headings, paragraphs, bullets) and below-the-fold
   scrolling. */
const SCENARIOS: SimScenario[] = [
  {
    steps: [
      { status: "Reading the readiness tracks", point: "Pull the four readiness tracks and their owners." },
      { status: "Reviewing the legal blocker", point: "Pricing copy is still sitting in legal review." },
      { status: "Drafting the answer", point: "Lead with the overall status, then flag the one real risk." },
    ],
    response:
      "The launch is on track overall. Three of the four readiness tracks are " +
      "green, and the one item I would watch is the **legal review**, since it " +
      "gates the pricing rollout.",
    followups: [
      "Which track is behind?",
      "Who owns the legal review?",
      "What happens if pricing slips?",
    ],
  },
  {
    steps: [
      { status: "Reading the design principles", point: "The principles are stated at the level of token roles." },
      { status: "Tracing them through the tokens", point: "Each principle maps to a small set of semantic tokens." },
      { status: "Collecting examples", point: "The action teal and the status set are the clearest cases." },
      { status: "Structuring the answer", point: "Three sections: tokens, colour, motion." },
    ],
    response:
      "Rob's philosophy comes down to a few firm rules, applied everywhere.\n\n" +
      "### Tokens before components\n\n" +
      "Every visual decision starts as a token. Primitives hold the raw values, " +
      "semantic tokens give them roles, and components only ever reference the " +
      "semantic layer. That one rule is what lets the whole system re-theme " +
      "from a single file.\n\n" +
      "### Colour carries meaning\n\n" +
      "Colour is never decoration. A few examples of how strictly that holds:\n\n" +
      "- The action teal appears only on primary actions and focus rings, so it " +
      "always means click here.\n" +
      "- Five status roles cover info, positive, warning, error, and neutral, " +
      "shared by every status bearing component.\n" +
      "- Chat bubbles draw from their own four tokens, so a theme can retune " +
      "them without touching a component.\n\n" +
      "### Motion is a system\n\n" +
      "Durations and easings are tokens too, and a reduced motion guard " +
      "collapses every one of them. Animation driven from JavaScript sits " +
      "outside that guard and checks the preference itself. If an animation " +
      "cannot say what it is for, it does not ship.",
    followups: [
      "How does a theme swap work?",
      "Why is teal reserved for actions?",
      "What are the five status roles?",
    ],
  },
  {
    steps: [
      { status: "Scanning the project journal", point: "The journal groups work into thematic stories." },
      { status: "Picking the highlights", point: "The ai category and the npm release stand out." },
      { status: "Drafting the answer", point: "Three bullets, then a pointer to the journal." },
    ],
    response:
      "Quite a lot this summer. The highlights:\n\n" +
      "- **The ai category**: a full set of conversation components, from " +
      "ChatMessage and Composer through Reasoning and AgentStatus.\n" +
      "- **npm publishing**: the system ships as a public package with " +
      "provenance, and the site itself consumes it like any other user.\n" +
      "- **This widget**: the chat surface you are using right now, composed " +
      "entirely from those primitives.\n\n" +
      "The project journal on the site tells the longer story, one theme at " +
      "a time.",
    followups: [
      "What is in the ai category?",
      "How do I install the package?",
      "What is this widget built from?",
    ],
  },
  {
    steps: [
      { status: "Mapping the repo layout", point: "A component library and a docs site share one repo." },
      { status: "Following the token chain", point: "Primitives feed semantic tokens, which feed components." },
      { status: "Checking the guardrails", point: "Validators fail the build when surfaces drift." },
      { status: "Structuring the answer", point: "Anatomy first, then tokens, then the safety net." },
    ],
    response:
      "At a high level it is one system with three layers that keep each " +
      "other honest.\n\n" +
      "### The anatomy\n\n" +
      "A React component library and a Next.js documentation site live in one " +
      "repo. The site consumes the published package the same way any outside " +
      "user would, so the docs can never quietly drift from what ships.\n\n" +
      "Each component is self contained: implementation, scoped styles, and " +
      "its Storybook stories sit together in one folder, and every component " +
      "has a live showcase page on the site.\n\n" +
      "### The token chain\n\n" +
      "Colour, spacing, type, and motion all flow through the same three " +
      "tiers:\n\n" +
      "- Primitives hold raw values and are never referenced directly.\n" +
      "- Semantic tokens give each value a role, in light and dark.\n" +
      "- Components spend only semantic tokens, so themes swap cleanly.\n\n" +
      "### The safety net\n\n" +
      "Registries are the single source of truth for anything countable, and " +
      "build time validators check them against reality: every component " +
      "registered, every page present, every token resolving in both themes. " +
      "A render test and an accessibility pass run on every story, on every " +
      "change.\n\n" +
      "The practical result is that a change either fits the system or the " +
      "build says no.",
    followups: [
      "What does a registry actually check?",
      "How does the site use the package?",
      "What runs on every change?",
    ],
  },
];

/* ============================================
   The story graph.

   Keyed by the chip text itself: a starter or follow-up chip sends its
   label as the message, so the label is the routing key. Every follow-up
   below names another node's prompt (or a starter), so no path dead-ends —
   each answer offers three roads, and the roads cross. The chip budget is
   held by scripts/validate-chat-starters.mjs, which reads the followups
   arrays in this file.
   ============================================ */

interface StoryNode {
  /** The chip text that routes here. */
  prompt: string;
  steps: { status: string; point: string }[];
  response: string;
  /** Names a rich element in the playground's content map. */
  contentKey?: string;
  followups: string[];
}

const STORY: StoryNode[] = [
  {
    prompt: "How do I get started?",
    steps: [
      { status: "Reading the first-run flow", point: "The question maps to the first-run flow." },
      { status: "Drafting the answer", point: "Lead with the workspace, then the invite step." },
    ],
    response:
      "Create a workspace from the dashboard, then invite your team from " +
      "Settings. Everyone you add sees the shared projects the moment they " +
      "join. If you would rather not click through it, I can set the whole " +
      "thing up for you.",
    followups: [
      "Set it all up for me",
      "What do the plans include?",
      "How is the trial going?",
    ],
  },
  {
    prompt: "Set it all up for me",
    steps: [
      { status: "Planning the setup", point: "Four steps, from quota check to welcome note." },
      { status: "Creating the workspace", point: "The shared project comes first." },
    ],
    response: "On it. Two steps are done already, and the invites are going out now.",
    contentKey: "setup-plan",
    followups: [
      "Find a time we can all meet",
      "Take us up to twelve seats",
      "How is the trial going?",
    ],
  },
  {
    prompt: "What do the plans include?",
    steps: [
      { status: "Comparing the plans", point: "Three plans differ on collaboration, not on limits." },
      { status: "Drafting the answer", point: "Name what the Team plan adds over the base." },
    ],
    response:
      "Every plan includes unlimited projects. The Team plan adds shared " +
      "workspaces, guest seats, and a 90 day version history.",
    followups: [
      "Which plan fits a team of five?",
      "Where is that written down?",
      "How is the trial going?",
    ],
  },
  {
    prompt: "Which plan fits a team of five?",
    steps: [
      { status: "Matching plans to the team", point: "The visitor needs shared workspaces and guest seats." },
      { status: "Drafting the answer", point: "The Team plan covers both; lead with the card." },
    ],
    response:
      "The Team plan fits what you described: shared workspaces for the " +
      "whole team, and guest seats stay free.",
    contentKey: "team-plan-card",
    followups: [
      "Where is that written down?",
      "Invite my team to a workspace",
      "How is the trial going?",
    ],
  },
  {
    prompt: "Where is that written down?",
    steps: [
      { status: "Collecting the sources", point: "Three product pages back the answer." },
      { status: "Drafting the answer", point: "Cite them so the visitor can check." },
    ],
    response:
      "Each chip opens the page the answer came from, so nothing here needs " +
      "taking on trust.",
    contentKey: "sources",
    followups: [
      "Which plan fits a team of five?",
      "How do I get started?",
      "How is the trial going?",
    ],
  },
  {
    prompt: "How is the trial going?",
    steps: [
      { status: "Pulling the signup numbers", point: "Six weeks of signup data since the trial opened." },
      { status: "Charting the trend", point: "One series tells it; chart it in the card." },
    ],
    response:
      "Signups have climbed for five of the six weeks since the trial " +
      "opened, and last week was the strongest yet.",
    contentKey: "trial-chart",
    followups: [
      "Which plan fits a team of five?",
      "Invite my team to a workspace",
      "Where is that written down?",
    ],
  },
  {
    prompt: "Invite my team to a workspace",
    steps: [
      { status: "Checking the account", point: "Three teammates sit on the account, none invited yet." },
      { status: "Drafting the answer", point: "Confirm before sending anything." },
    ],
    response:
      "Happy to. Give me the word and I will send invites to the three " +
      "teammates on your account, all as editors.",
    followups: [
      "Go ahead and invite the other three",
      "Take us up to twelve seats",
      "Find a time we can all meet",
    ],
  },
  {
    prompt: "Go ahead and invite the other three",
    steps: [
      { status: "Sending the invites", point: "Three teammates to invite, all editors." },
      { status: "Confirming delivery", point: "One call covers the batch." },
    ],
    response:
      "All three invites are out. Everyone lands in the workspace with " +
      "editor access.",
    contentKey: "invite-tool",
    followups: [
      "Find a time we can all meet",
      "Take us up to twelve seats",
      "How is the trial going?",
    ],
  },
  {
    prompt: "Take us up to twelve seats",
    steps: [
      { status: "Locating the seat limit", point: "The seat limit lives in workspace.config.ts." },
      { status: "Preparing the change", point: "One line changes; show the diff." },
    ],
    response:
      "Only the seat count moves, from five to twelve. Everything else in " +
      "the config stays as it was.",
    contentKey: "seat-diff",
    followups: [
      "Go ahead and invite the other three",
      "What do the plans include?",
      "Find a time we can all meet",
    ],
  },
  /* Two nodes the director's rail reaches by sending their prompt — the
     doc drop and the failing sync. Unreferenced by any chip is fine: the
     graph routes whatever text arrives. */
  {
    prompt: "Here is the launch plan we are working from.",
    steps: [
      { status: "Reading the document", point: "Fourteen pages; read it before answering." },
      { status: "Charting the budget", point: "Budget is the decision in the doc; chart it." },
    ],
    response:
      "Three phases, and most of the budget sits behind launch week itself. " +
      "The dates line up with the workspace you already set up, so nothing " +
      "needs to move.",
    contentKey: "launch-analysis",
    followups: [
      "Set it all up for me",
      "Take us up to twelve seats",
      "Find a time we can all meet",
    ],
  },
  {
    prompt: "Sync the shared calendar",
    steps: [
      { status: "Starting the calendar sync", point: "The calendar sync runs after the invites." },
    ],
    response:
      "The sync timed out on the provider's side. Retry below and it should land.",
    contentKey: "flaky-tool",
    followups: [
      "Find a time we can all meet",
      "Go ahead and invite the other three",
      "How is the trial going?",
    ],
  },
  {
    prompt: "Find a time we can all meet",
    steps: [
      { status: "Checking what this needs", point: "Suggesting times needs calendar access." },
      { status: "Preparing the request", point: "Ask before connecting anything." },
    ],
    response: "I can check everyone's calendar for a slot, once you allow it below.",
    contentKey: "calendar-approval",
    followups: [
      "Go ahead and invite the other three",
      "How is the trial going?",
      "How do I get started?",
    ],
  },
];

/** Chip labels route by text, so matching forgives case and punctuation. */
const normalize = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();

const STORY_BY_PROMPT = new Map(STORY.map((node) => [normalize(node.prompt), node]));

class SimAbortError extends Error {
  constructor() {
    super("Simulated response aborted");
    this.name = "AbortError";
  }
}

const delay = (ms: number, signal: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    if (signal.aborted) {
      reject(new SimAbortError());
      return;
    }
    const timer = window.setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      window.clearTimeout(timer);
      reject(new SimAbortError());
    };
    signal.addEventListener("abort", onAbort, { once: true });
  });

/**
 * A transport that scripts the full live-response choreography: one status
 * step (with its reasoning trace point) per beat, the handoff pause, then
 * the response revealed word by word.
 *
 * `content` is the playground's map of rich elements for the story nodes —
 * a node whose `contentKey` resolves in it commits its answer with that
 * element attached, which is how a chip path ends on a card, a chart, or
 * an approval. Without the map (or for a key it lacks) the node still
 * answers in text, so the transport never depends on the caller.
 */
export function createSimTransport(content?: Record<string, ReactNode>): ChatTransport {
  let exchangeCount = 0;

  return async function* simTransport(
    messages: ChatTransportMessage[],
    signal: AbortSignal
  ): AsyncGenerator<ChatEvent> {
    /* Route by the visitor's message: a chip sends its label, so an exact
       (normalized) match lands on its story node. Typed free text falls
       back to the scenario rotation. */
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    const node = lastUser ? STORY_BY_PROMPT.get(normalize(lastUser.content)) : undefined;

    const scenario = node ?? SCENARIOS[exchangeCount % SCENARIOS.length];
    if (!node) exchangeCount += 1;

    for (const step of scenario.steps) {
      yield { type: "status", label: step.status, point: step.point };
      await delay(STATUS_MS, signal);
    }

    await delay(HANDOFF_MS, signal);

    const words = scenario.response.split(" ");
    for (let i = 0; i < words.length; i += 1) {
      yield { type: "delta", text: i === 0 ? words[i] : ` ${words[i]}` };
      await delay(STREAM_MS, signal);
    }

    const nodeContent = node?.contentKey ? content?.[node.contentKey] : undefined;
    if (nodeContent) {
      yield { type: "content", node: nodeContent };
    }

    /* Before `done`, like the event contract asks: the hook carries them
       into the turn when it commits, so the chips are there with the copy
       and thumbs row rather than a beat behind it. The site's own transport
       cannot do this — its suggestions are written from the finished answer,
       so they are fetched after the commit instead. */
    yield { type: "followups", items: scenario.followups };
    yield { type: "done" };
  };
}
