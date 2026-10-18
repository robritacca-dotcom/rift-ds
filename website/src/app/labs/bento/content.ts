/**
 * The banners: what each says on the card, and what its overlay holds.
 * Every claim here restates a fact a covered page already makes; the
 * people, teams and figures inside the scenes are fictional demo data.
 */

import type React from "react";
import type { BentoTileProps } from "rift-ds/components/BentoTile/BentoTile";
import {
  ChatScene,
  McpScene,
  TemplatesScene,
  ThemeScene,
  TokensScene,
  UsageScene,
} from "./scenes";

export interface Banner {
  id: string;
  /** Columns spanned in the three-column grid. */
  span: 1 | 2 | 3;
  title: string;
  Scene: React.ComponentType;
  /** How the tile is dressed: BentoTile's own options, passed straight through. */
  tile: Pick<BentoTileProps, "background" | "align">;
  lede: string;
  points: string[];
  primary: { label: string; href: string };
  secondary: { label: string; href: string };
  factsTitle: string;
  facts: Array<[string, string]>;
  features: Array<{ icon: string; text: string }>;
}

export const BANNERS: Banner[] = [
  {
    id: "themes",
    span: 2,
    title: "Re-theme every screen with one attribute",
    Scene: ThemeScene,
    tile: { background: "shader" },
    lede: "Every preset is a complete look, light and dark, shipped as plain CSS. Set data-brand on the root and the whole product follows, with no runtime JavaScript.",
    points: [
      "Swap the whole look from a single attribute",
      "Light and dark ship together for every preset",
      "Every action colour is contrast-checked at build",
      "Export your own look from the playground",
    ],
    primary: { label: "Open the playground", href: "/playground" },
    secondary: { label: "Browse themes", href: "/foundations/themes" },
    factsTitle: "What a preset sets",
    facts: [
      ["Colour", "Action, neutrals, accents"],
      ["Shape", "Radius scale"],
      ["Type", "Faces, scale, weights"],
      ["Feel", "Density, motion, elevation"],
      ["Icons", "Weight and fill"],
    ],
    features: [
      { icon: "palette", text: "Primitives re-key and semantic tokens re-point. Components never change." },
      { icon: "contrast", text: "Every action fill holds contrast with its label in both themes, checked at build time." },
      { icon: "download", text: "The playground exports the CSS, a written brief and a setup prompt for your coding agent." },
    ],
  },
  {
    id: "charts",
    span: 1,
    title: "Charts that wear the theme",
    Scene: UsageScene,
    tile: { background: "shader", align: "start" },
    lede: "The series palette is built from tokens, so every chart re-colours with the preset and the mode, and the action colour always leads.",
    points: [
      "Line, bar, area, pie, radar and more",
      "Series colours follow the theme",
      "Stat tiles and meters on the same scale",
      "Recharts stays an optional peer",
    ],
    primary: { label: "See the bar chart", href: "/components/bar-chart" },
    secondary: { label: "Marketing dashboard", href: "/templates/marketing-dashboard" },
    factsTitle: "From the same tokens",
    facts: [
      ["Series", "Chart palette tokens"],
      ["Surfaces", "Container ramp"],
      ["Numbers", "AnimatedNumber"],
      ["Trends", "Sparkline"],
    ],
    features: [
      { icon: "bar_chart", text: "Charts import from their own entry point, so apps without charts never resolve the dependency." },
      { icon: "dark_mode", text: "Light and dark resolve per token, never per chart." },
      { icon: "dashboard", text: "Panels, legend tiles and stats compose into a full dashboard." },
    ],
  },
  {
    id: "chat",
    span: 1,
    title: "Add an AI chat with one command",
    Scene: ChatScene,
    tile: { background: "solid", align: "end" },
    lede: "npx rift-ds init chat scaffolds the routes, the mount and an env example, and never overwrites a file you already have. Bring a key and the widget is live.",
    points: [
      "Docks beside the page on wide screens",
      "Takes over the viewport on phones",
      "Rate limits and a daily budget built in",
      "A headless engine for your own UI",
    ],
    primary: { label: "Read the chat docs", href: "/docs/chat" },
    secondary: { label: "See the widget", href: "/components/ai-chat" },
    factsTitle: "What it scaffolds",
    facts: [
      ["Route", "app/api/chat"],
      ["Follow-ups", "app/api/chat/followups"],
      ["Feedback", "app/api/chat/feedback"],
      ["Mount", "components/chat"],
      ["Env", ".env.chat.example"],
    ],
    features: [
      { icon: "terminal", text: "One command, and it never overwrites a file you already have." },
      { icon: "shield", text: "Upstash guardrails rate-limit visitors and cap the day's spend." },
      { icon: "code", text: "The useChat engine runs under any interface you build." },
    ],
  },
  {
    id: "tokens",
    span: 1,
    title: "Three tiers, never skipped",
    Scene: TokensScene,
    tile: { background: "shader", align: "start" },
    lede: "Primitives hold the raw values, semantic tokens give them roles, and components only ever read roles. Change a primitive and it cascades everywhere.",
    points: [
      "Components never reference a raw value",
      "Every colour role has a light and dark value",
      "A token that resolves to nothing fails the build",
      "The registry is generated from the CSS",
    ],
    primary: { label: "Explore colour", href: "/foundations/colour-mode" },
    secondary: { label: "Trace the graph", href: "/graph" },
    factsTitle: "The chain",
    facts: [
      ["Primitive", "--primitive-purple-07"],
      ["Semantic", "--color-core-accent-violet"],
      ["Component", ".ds-badge"],
    ],
    features: [
      { icon: "account_tree", text: "Override one primitive and every role that points at it follows." },
      { icon: "rule", text: "Validators hold the registry, the CSS and the docs to each other." },
      { icon: "hub", text: "The graph page traces any token to every component that reads it." },
    ],
  },
  {
    id: "mcp",
    span: 1,
    title: "Give your agent the real API",
    Scene: McpScene,
    tile: { background: "solid", align: "start" },
    lede: "A public MCP endpoint serves every component's props, the token registry and install setup. Your coding agent reads the contract instead of guessing it.",
    points: [
      "No auth, just one URL",
      "Props generated from the shipped types",
      "Agent skills install with npx rift-ds init",
      "Every component as markdown, too",
    ],
    primary: { label: "Connect an agent", href: "/docs/get-started" },
    secondary: { label: "Read llms.txt", href: "/llms.txt" },
    factsTitle: "Tools",
    facts: [
      ["list_components", "The catalogue"],
      ["get_component", "Props and usage"],
      ["list_tokens", "The token registry"],
      ["search_site", "The docs"],
      ["get_setup", "Install steps"],
    ],
    features: [
      { icon: "lan", text: "Streamable HTTP, stateless, and it calls no model." },
      { icon: "description", text: "Append .md to any component page for its prop contract." },
      { icon: "school", text: "Consumer skills teach your agent the library, theming and a style audit." },
    ],
  },
  {
    id: "templates",
    span: 3,
    title: "Complete screens, from the system alone",
    Scene: TemplatesScene,
    tile: { background: "shader" },
    lede: "Dashboards, consoles, calendars and chat homes, each built only from the library's components and tokens. Open one, re-theme it, take it apart.",
    points: [
      "Every screen is built from shipped parts",
      "Each one re-themes with the presets",
      "Phone layouts where the screen needs one",
      "Fictional data, real components",
    ],
    primary: { label: "Browse templates", href: "/templates" },
    secondary: { label: "Payroll console", href: "/templates/payroll-console" },
    factsTitle: "Built from",
    facts: [
      ["Layout", "AppLayout, AppSidebar"],
      ["Data", "Table, DataTable, Stat"],
      ["Status", "Badge, StatusDot"],
      ["Chat", "rift-ds/chat"],
    ],
    features: [
      { icon: "view_quilt", text: "Full-viewport app shells, rendered with no site chrome." },
      { icon: "smartphone", text: "Sidebar shells dress as an app in the carousel's mobile mode." },
      { icon: "forum", text: "The payroll console docks the real chat widget as a rail." },
    ],
  },
];
