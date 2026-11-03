import type { ArchMap } from "@/components/ArchitectureMap/types";

/**
 * One pass of the chat quality loop, from a thumbs verdict on the live site
 * to a branch waiting for approval. The accent edges are the point the page
 * makes: a disliked answer becomes a test before anything is fixed.
 */
export const chatQualityMap: ArchMap = {
  id: "chat-quality-loop",
  title: "One loop, end to end",
  label:
    "A visitor's thumbs verdict and the logged exchange it rates are kept for 30 days. The agent reads both without writing, turns each disliked answer into a paraphrased golden-set case, runs the eval once, and lands the fix on a local branch for the owner to merge or delete.",
  width: 2000,
  height: 1000,
  nodes: [
    /* 1 · On the live site */
    { id: "z-live", x: 60, y: 120, w: 600, h: 660, kind: "zone", title: "1 · On the live site", sub: "kept for 30 days" },
    { id: "widget", x: 235, y: 200, w: 250, h: 76, title: "Site chat", sub: "a thumb on each answer", icon: "thumbs_up_down", chip: "info" },
    { id: "chat-route", x: 95, y: 400, w: 250, h: 76, title: "Chat route", sub: "/api/chat", icon: "forum", chip: "info" },
    { id: "feedback-route", x: 375, y: 400, w: 250, h: 76, title: "Feedback route", sub: "/api/chat/feedback", icon: "rate_review", chip: "info" },
    { id: "redis", x: 235, y: 630, w: 250, h: 76, title: "Redis", sub: "exchanges and verdicts", kind: "external", icon: "storage" },

    /* 2 · Read, never written */
    { id: "z-read", x: 720, y: 220, w: 380, h: 560, kind: "zone", title: "2 · Read, never written", sub: "the agent observes" },
    { id: "join", x: 755, y: 300, w: 310, h: 76, title: "Join", sub: "verdict to exchange, by id", logo: "/logos/Claude.svg" },
    { id: "triage", x: 755, y: 460, w: 310, h: 76, title: "Triage", sub: "every dislike, plus silent failures", icon: "rule", chip: "warning" },
    { id: "report", x: 755, y: 630, w: 310, h: 76, title: "Local report", sub: "never committed", icon: "description" },

    /* 3 · Encode, then test */
    { id: "z-test", x: 1160, y: 120, w: 380, h: 820, kind: "zone", title: "3 · Encode, then test", sub: "the case comes before the fix" },
    { id: "spec", x: 1195, y: 200, w: 310, h: 76, title: "Spec rule", sub: "evals/chat/SPEC.md", icon: "gavel" },
    { id: "golden", x: 1195, y: 330, w: 310, h: 76, title: "Golden-set case", sub: "evals/chat/golden-set.json", icon: "playlist_add", chip: "positive" },
    { id: "coverage", x: 1195, y: 460, w: 310, h: 76, title: "Coverage check", sub: "scripts/validate-chat-coverage.mjs", icon: "fact_check", chip: "warning" },
    { id: "dev", x: 1195, y: 590, w: 310, h: 76, title: "Dev server", sub: "npm run dev:eval -w website", icon: "dns" },
    { id: "eval", x: 1195, y: 720, w: 310, h: 76, title: "Eval run", sub: "npm run eval:chat, once", icon: "science", chip: "positive" },

    /* 4 · For approval */
    { id: "z-approve", x: 1620, y: 120, w: 330, h: 820, kind: "zone", title: "4 · For approval", sub: "nothing is pushed" },
    { id: "owner", x: 1655, y: 200, w: 260, h: 76, title: "Owner", sub: "merge approves, delete rejects", icon: "person", chip: "positive" },
    { id: "branch", x: 1655, y: 460, w: 260, h: 76, title: "Local branch", sub: "chat/YYYY-MM-DD-<slug>", icon: "call_split" },
    { id: "fix", x: 1655, y: 720, w: 260, h: 76, title: "Fix the cause", sub: "page prose · persona · lookup tools", icon: "build" },
  ],
  edges: [
    { id: "widget-chat", from: "widget", to: "chat-route" },
    { id: "widget-feedback", from: "widget", to: "feedback-route" },
    { id: "chat-redis", from: "chat-route", to: "redis" },
    { id: "feedback-redis", from: "feedback-route", to: "redis" },
    { id: "redis-join", from: "redis", to: "join", label: "read only" },
    { id: "join-triage", from: "join", to: "triage" },
    { id: "triage-report", from: "triage", to: "report" },
    { id: "triage-golden", from: "triage", to: "golden", label: "paraphrased, never quoted", kind: "accent" },
    { id: "spec-golden", from: "spec", to: "golden" },
    { id: "golden-coverage", from: "golden", to: "coverage" },
    { id: "golden-eval", from: "golden", to: "eval", fromSide: "right", toSide: "right", kind: "accent", bend: -60 },
    { id: "dev-eval", from: "dev", to: "eval" },
    { id: "eval-fix", from: "eval", to: "fix", label: "fails before, passes after", kind: "accent" },
    { id: "fix-branch", from: "fix", to: "branch" },
    { id: "branch-owner", from: "branch", to: "owner" },
  ],
};
