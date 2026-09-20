/**
 * The five architecture maps rendered on /overview.
 *
 * Hardcoded map data, deliberately: the drawings are editorial content, like
 * the case-study covers, and the coordinates are drawing geometry. The
 * renderer and its types live in components/ArchitectureMap and know nothing
 * about this page, so the node graph can graduate into the library later
 * without touching this data's shape.
 *
 * Layouts are generous on purpose. The canvas pans and zooms, so nothing
 * has to squish into a tight chart.
 */

import type { ArchMap } from "@/components/ArchitectureMap/types";
import { LOOP_COUNT } from "@/data/loops";

const VERCEL_LOGO = { logo: "/logos/vercel black.svg", logoDark: "/logos/vercel white.svg" };
const NEXTJS_LOGO = { logo: "/logos/nextjs black.svg", logoDark: "/logos/nextjs white.svg" };

/** One repo, one gate, two destinations. */
export const systemOverviewMap: ArchMap = {
  id: "system-overview",
  title: "The system in one breath",
  label:
    "One repo flows through a generate, validate and gate chain, then splits: Vercel serves visitors and agents, and the npm registry serves package consumers.",
  width: 1460,
  height: 620,
  nodes: [
    { id: "repo", x: 60, y: 274, w: 250, h: 72, title: "One repo", sub: "code · registries · specs", logo: "/logos/Git.svg" },
    { id: "chain", x: 440, y: 274, w: 290, h: 72, title: "Generate · validate · gate", sub: "one chain, before every build", icon: "fact_check", chip: "info" },
    { id: "vercel", x: 860, y: 100, w: 250, h: 72, title: "Vercel", sub: "website + Storybook", ...VERCEL_LOGO },
    { id: "npm-registry", x: 860, y: 448, w: 250, h: 72, title: "npm registry", sub: "@robr0/design-system", kind: "external", logo: "/logos/npm.svg" },
    { id: "visitors", x: 1180, y: 100, w: 240, h: 72, title: "Visitors + agents", sub: "pages · chat · MCP", icon: "groups", chip: "positive" },
    { id: "consumers", x: 1180, y: 448, w: 240, h: 72, title: "Package consumers", sub: "import the components", icon: "download", chip: "positive" },
  ],
  edges: [
    { id: "repo-chain", from: "repo", to: "chain" },
    { id: "chain-vercel", from: "chain", to: "vercel", label: "push to main" },
    { id: "chain-npm", from: "chain", to: "npm-registry", label: "manual release" },
    { id: "vercel-visitors", from: "vercel", to: "visitors" },
    { id: "npm-consumers", from: "npm-registry", to: "consumers" },
  ],
};

/** Five stages, three artifacts, and the only two external touches before runtime. */
export const pipelineMap: ArchMap = {
  id: "pipeline",
  title: "The pipeline",
  label:
    "How a change becomes live, in five stages: authored sources feed the generate and validate chain, which feeds three build artifacts, gated by CI, then shipped to Vercel and the npm registry.",
  width: 2080,
  height: 1220,
  nodes: [
    /* External inputs */
    { id: "figma", x: 40, y: 250, w: 220, h: 64, title: "Figma", sub: "design foundation", kind: "external", logo: "/logos/Figma.svg" },

    /* Stage 1 */
    { id: "z-author", x: 330, y: 140, w: 430, h: 460, kind: "zone", title: "1 · Author", sub: "everything hand-written" },
    { id: "author-src", x: 370, y: 220, w: 350, h: 76, title: "Component source", sub: "code · prop JSDoc · token CSS", icon: "code", chip: "info" },
    { id: "author-specs", x: 370, y: 330, w: 350, h: 76, title: "Root specs", sub: "design.md · content-design.md · CLAUDE.md", icon: "description", chip: "info" },
    { id: "author-data", x: 370, y: 440, w: 350, h: 76, title: "Data registries", sub: "components · tokens · journal", icon: "storage", chip: "info" },

    /* Stage 2 */
    { id: "z-chain", x: 880, y: 240, w: 430, h: 340, kind: "zone", title: "2 · Generate + validate", sub: "no build starts before this passes" },
    { id: "generators", x: 920, y: 330, w: 350, h: 76, title: "Generators", sub: "barrels · corpus · prop API · README · agent skill", icon: "auto_awesome", chip: "warning" },
    { id: "validators", x: 920, y: 450, w: 350, h: 76, title: "Validators", sub: "byte-compare + cross-check every claim", icon: "rule", chip: "warning" },

    /* Stage 3 */
    { id: "z-build", x: 1430, y: 80, w: 430, h: 660, kind: "zone", title: "3 · Build", sub: "three artifacts" },
    { id: "build-pkg", x: 1470, y: 170, w: 350, h: 76, title: "npm package", sub: "vite lib build → dist/", logo: "/logos/vite.svg" },
    { id: "build-storybook", x: 1470, y: 320, w: 350, h: 76, title: "Storybook", sub: "static build · every story a render + interaction test", logo: "/logos/storybook.svg" },
    { id: "build-site", x: 1470, y: 470, w: 350, h: 76, title: "Website", sub: "Next.js · static + ISR pages", ...NEXTJS_LOGO },
    { id: "google-fonts", x: 1470, y: 620, w: 350, h: 64, title: "Google Fonts", sub: "fetched once, then self-hosted", kind: "external", icon: "font_download" },

    /* Stage 4 */
    { id: "z-gate", x: 1430, y: 840, w: 430, h: 300, kind: "zone", title: "4 · Gate", sub: "every push and pull request" },
    { id: "ci", x: 1470, y: 930, w: 350, h: 90, title: "GitHub Actions CI", sub: "axe on every story · hydration smoke · drift guard", logo: "/logos/Git.svg" },

    /* Stage 5 */
    { id: "z-ship", x: 330, y: 840, w: 880, h: 320, kind: "zone", title: "5 · Ship + serve", sub: "two destinations, two paths" },
    { id: "release", x: 370, y: 930, w: 320, h: 76, title: "Release workflow", sub: "manual · OIDC trusted publishing · consumer smoke", icon: "rocket_launch", chip: "positive" },
    { id: "npm-registry", x: 370, y: 1050, w: 320, h: 64, title: "npm registry", sub: "@robr0/design-system", kind: "external", logo: "/logos/npm.svg" },
    { id: "vercel", x: 770, y: 930, w: 350, h: 76, title: "Vercel", sub: "deploys every push to main · two projects", ...VERCEL_LOGO },
    { id: "godaddy", x: 770, y: 1050, w: 350, h: 64, title: "Domain", sub: "DNS pointed at Vercel", kind: "external", icon: "language" },
  ],
  edges: [
    { id: "figma-src", from: "figma", to: "author-src", label: "the foundation's origin" },
    { id: "src-gen", from: "author-src", to: "generators" },
    { id: "specs-gen", from: "author-specs", to: "generators", label: "before every build" },
    { id: "data-gen", from: "author-data", to: "validators" },
    { id: "gen-val", from: "generators", to: "validators" },
    { id: "val-pkg", from: "validators", to: "build-pkg" },
    { id: "val-storybook", from: "validators", to: "build-storybook" },
    { id: "val-site", from: "validators", to: "build-site" },
    { id: "fonts-site", from: "google-fonts", to: "build-site", label: "build time only", kind: "accent" },
    { id: "pkg-ci", from: "build-pkg", to: "ci", fromSide: "right", toSide: "right", bend: -150 },
    { id: "storybook-ci", from: "build-storybook", to: "ci", fromSide: "right", toSide: "right", bend: -110 },
    { id: "site-ci", from: "build-site", to: "ci", fromSide: "right", toSide: "right", bend: -70 },
    { id: "ci-vercel", from: "ci", to: "vercel", label: "push to main deploys" },
    { id: "ci-release", from: "ci", to: "release", label: "dispatched by hand", bend: 170 },
    { id: "release-npm", from: "release", to: "npm-registry", label: "publish from dist/ · provenance" },
    { id: "godaddy-vercel", from: "godaddy", to: "vercel", label: "DNS", kind: "external" },
  ],
};

/** Four states a change can be in; the ship skills are the transitions between them. */
export const operatorsMap: ArchMap = {
  id: "operators",
  title: "The operator layer",
  label:
    "Audit skills read the repo and the live site and produce branch work; the ship skills checkpoint, park, land, ship and super-ship move a change between four states: working tree, branches, main, and live.",
  width: 1920,
  height: 920,
  nodes: [
    { id: "z-claude", x: 40, y: 60, w: 1820, h: 250, kind: "zone", title: "Claude Code · the operator layer", sub: "skills named for their end state" },
    { id: "audits", x: 90, y: 160, w: 540, h: 110, title: "Audit skills", sub: "drift · token · content · api · seo · security · a11y · design-qa · …", logo: "/logos/Claude.svg" },
    { id: "loops", x: 700, y: 160, w: 440, h: 110, title: "Recurring loops", sub: `${LOOP_COUNT} loops · every run ends in a report for approval`, icon: "autorenew", chip: "warning" },
    { id: "pre-deploy", x: 1210, y: 160, w: 380, h: 110, title: "pre-deploy", sub: "the full verify, run locally · pushes nothing", icon: "checklist", chip: "positive" },

    { id: "working-tree", x: 60, y: 460, w: 300, h: 80, title: "Working tree", sub: "the session's changes", kind: "state", icon: "edit_note" },
    { id: "branches", x: 560, y: 460, w: 300, h: 80, title: "Branches", sub: "wip topics · worktrees · stashes", kind: "state", icon: "call_split" },
    { id: "main", x: 1060, y: 460, w: 300, h: 80, title: "main", sub: "a push here always deploys", kind: "state", icon: "commit" },
    { id: "live", x: 1560, y: 460, w: 300, h: 80, title: "Live + proven", sub: "smoked against production", kind: "state", icon: "verified" },
  ],
  edges: [
    { id: "audits-wt", from: "audits", to: "working-tree", label: "fixes arrive as branch work" },
    { id: "live-audits", from: "live", to: "audits", fromSide: "top", toSide: "right", label: "several read the live site", kind: "external" },
    { id: "predeploy-main", from: "pre-deploy", to: "main", label: "rehearses the gate" },
    { id: "checkpoint", from: "working-tree", to: "branches", label: "checkpoint · save, keep working", bend: -60 },
    { id: "park", from: "working-tree", to: "branches", label: "park · save, back to a clean main", bend: 110 },
    { id: "land", from: "branches", to: "main", label: "land · triage all, merge local, never push", bend: -60 },
    { id: "ship", from: "main", to: "live", label: "ship · push, watch CI, prove it live", bend: -60 },
    { id: "super-ship", from: "working-tree", to: "live", fromSide: "bottom", toSide: "bottom", label: "super-ship · drift-audit first, then ship the lot", kind: "accent", bend: 260 },
  ],
};

/** One chat exchange, zoomed in: the corpus answers the prose, the lookup tools answer the contracts. */
export const chatExchangeMap: ArchMap = {
  id: "chat-exchange",
  title: "How the chat answers",
  label:
    "A visitor's question passes the guardrails, Claude answers from the cached persona and site corpus, and when the question needs prop or token specifics the model calls two lookup tools that read the generated contracts, the same data the MCP endpoint serves to agents.",
  width: 1720,
  height: 820,
  nodes: [
    { id: "visitor", x: 60, y: 330, w: 280, h: 90, title: "Visitor", sub: "the chat widget, on any page", icon: "person", chip: "positive" },

    { id: "z-chat", x: 440, y: 70, w: 500, h: 680, kind: "zone", title: "/api/chat · one exchange", sub: "streams the whole way" },
    { id: "chat-guardrails", x: 480, y: 160, w: 420, h: 76, title: "Guardrails", sub: "per-visitor rate + daily budget · pick the model tier", icon: "verified_user", chip: "warning" },
    { id: "chat-context", x: 480, y: 300, w: 420, h: 90, title: "System context", sub: "persona + the whole site corpus · cached 1h", icon: "menu_book", chip: "info" },
    { id: "chat-tools", x: 480, y: 450, w: 420, h: 90, title: "Lookup tools", sub: "get_component · get_design_tokens", icon: "search", chip: "info" },
    { id: "chat-contracts", x: 480, y: 610, w: 420, h: 76, title: "Generated contracts", sub: "prop API + token registry, read from memory", icon: "storage", chip: "neutral" },

    { id: "chat-anthropic", x: 1220, y: 300, w: 340, h: 100, title: "Anthropic API", sub: "Claude answers from the corpus, and asks for a lookup when contracts matter", kind: "external", logo: "/logos/Claude.svg" },
    { id: "chat-mcp", x: 1220, y: 600, w: 340, h: 76, title: "/api/mcp", sub: "the same lookups, served to agents", icon: "hub", chip: "info" },
  ],
  edges: [
    { id: "visitor-guardrails", from: "visitor", to: "chat-guardrails", label: "question + the last 10 turns" },
    { id: "guardrails-context", from: "chat-guardrails", to: "chat-context" },
    { id: "context-anthropic", from: "chat-context", to: "chat-anthropic", label: "one streamed model call" },
    { id: "anthropic-tools", from: "chat-anthropic", to: "chat-tools", label: "a prop or token question triggers a lookup", kind: "accent", bend: -50 },
    { id: "tools-contracts", from: "chat-tools", to: "chat-contracts", label: "in-memory read" },
    { id: "tools-anthropic", from: "chat-tools", to: "chat-anthropic", label: "tool result, then the answer", bend: -50 },
    { id: "anthropic-visitor", from: "chat-anthropic", to: "visitor", fromSide: "bottom", toSide: "bottom", label: "the answer streams back · lookups show as trace points", bend: -300 },
    { id: "contracts-mcp", from: "chat-contracts", to: "chat-mcp", label: "shared implementations" },
  ],
};

/** Runtime, drawn from the edges out: who actually talks to whom once the site is live. */
export const runtimeMap: ArchMap = {
  id: "runtime",
  title: "The architecture at runtime",
  label:
    "The visitor's browser fetches pages from Vercel and sends analytics events directly to Google; the chat route calls Anthropic and Redis, the MCP route serves generated data with no upstream calls, and a cron smokes production every four hours.",
  width: 1700,
  height: 900,
  nodes: [
    { id: "godaddy", x: 140, y: 70, w: 320, h: 64, title: "Domain", sub: "DNS: www → Vercel", kind: "external", icon: "language" },
    { id: "browser", x: 140, y: 200, w: 320, h: 90, title: "Visitor's browser", sub: "gtag + the WebGL background run here", icon: "public", chip: "positive" },
    { id: "ga4", x: 140, y: 376, w: 320, h: 64, title: "Google Analytics 4", sub: "Vercel never sees an event", kind: "external", icon: "monitoring" },
    { id: "runtime-fonts", x: 140, y: 490, w: 320, h: 64, title: "Google Fonts", sub: "two pages fetch type at runtime", kind: "external", icon: "font_download" },
    { id: "agents", x: 140, y: 580, w: 320, h: 76, title: "Agents + MCP clients", sub: "connect with one URL, no key", icon: "smart_toy", chip: "positive" },
    { id: "cron", x: 140, y: 720, w: 320, h: 76, title: "GitHub Actions cron", sub: "the uptime workflow", kind: "external", logo: "/logos/Git.svg" },

    { id: "z-vercel", x: 700, y: 60, w: 460, h: 780, kind: "zone", title: "Vercel", sub: "static edge + serverless routes" },
    { id: "pages", x: 740, y: 150, w: 380, h: 76, title: "Static + ISR pages", sub: "fonts, corpus and gtag baked in at build", ...NEXTJS_LOGO },
    { id: "api-chat", x: 740, y: 290, w: 380, h: 76, title: "/api/chat", sub: "followups · feedback · guardrails", icon: "forum", chip: "info" },
    { id: "api-mcp", x: 740, y: 430, w: 380, h: 90, title: "/api/mcp", sub: "generated data from memory · no model, no auth", icon: "hub", chip: "info" },
    { id: "api-github", x: 740, y: 590, w: 380, h: 76, title: "/api/github-contributions", sub: "the contribution graph", icon: "grid_view", chip: "info" },
    { id: "isr", x: 740, y: 716, w: 380, h: 64, title: "ISR", sub: "served pages can change with no deploy", kind: "state", icon: "autorenew" },

    { id: "anthropic", x: 1320, y: 250, w: 320, h: 76, title: "Anthropic API", sub: "Claude, with the corpus as context", kind: "external", logo: "/logos/Claude.svg" },
    { id: "redis", x: 1320, y: 400, w: 320, h: 76, title: "Redis", sub: "chat log (30d) · spend + rate counters · feedback", kind: "external", icon: "memory" },
    { id: "github-api", x: 1320, y: 590, w: 320, h: 64, title: "GitHub API", sub: "public commit data", kind: "external", logo: "/logos/Git.svg" },
  ],
  edges: [
    { id: "godaddy-pages", from: "godaddy", to: "pages", label: "DNS", kind: "external" },
    { id: "browser-pages", from: "browser", to: "pages", label: "HTML + assets" },
    { id: "browser-chat", from: "browser", to: "api-chat", label: "chat", bend: 40 },
    { id: "browser-ga4", from: "browser", to: "ga4", label: "events go straight to Google", kind: "accent" },
    { id: "browser-fonts", from: "browser", to: "runtime-fonts", fromSide: "left", toSide: "left", label: "playground + MCP landing", kind: "external" },
    { id: "agents-mcp", from: "agents", to: "api-mcp", label: "MCP tools" },
    { id: "cron-isr", from: "cron", to: "isr", label: "smoke every 4h", kind: "external" },
    { id: "chat-anthropic", from: "api-chat", to: "anthropic", label: "model calls" },
    { id: "chat-redis", from: "api-chat", to: "redis", label: "log + budget + rate", bend: 30 },
    { id: "github-github", from: "api-github", to: "github-api", label: "polls" },
  ],
};
