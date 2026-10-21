/**
 * The home bento's tiles, one per point the hero's rotating subtitle makes,
 * in the same order: what each says on the card, and what its overlay
 * holds. Every claim restates a fact a covered page already makes and links
 * to it; every count and list is a registry or module import.
 */

import type React from "react";
import { COMPONENT_COUNT, componentCategoryMetadata, componentMetadata } from "rift-ds/components/registry";
import { chatWidget } from "rift-ds/chat";
import { MCP_TOOLS } from "@/lib/mcp-tools";
import { PACKAGE_NAME, STORYBOOK_URL } from "@/config/brand.generated";
import {
  AgentsShowcase,
  AgentsTileScene,
  ChatScene,
  ComponentsShowcase,
  ComponentsTileScene,
  InstallShowcase,
  InstallTileScene,
  PlaygroundShowcase,
  PlaygroundTileScene,
  TemplatesList,
  TemplatesProvider,
  TemplatesShowcase,
  TemplatesTileScene,
  ThemePicker,
  ThemesShowcase,
  ThemesTileScene,
} from "./scenes";

export interface BentoFacts {
  title: string;
  rows: Array<[string, string]>;
  /** Long values: each row stacks its value under its name. */
  stacked?: boolean;
}

export interface HomeTile {
  id: "components" | "chat" | "templates" | "themes" | "playground" | "agents" | "install";
  title: string;
  description: string;
  align?: "start" | "center" | "end";
  Scene: React.ComponentType;
  lede: string;
  points: string[];
  primary: { label: string; href: string; icon: string };
  secondary: { label: string; href: string; external?: boolean };
  Showcase: React.ComponentType;
  /** The showcase's side panel: a fact sheet, or a component of its own. */
  side: BentoFacts | { title: string; Component: React.ComponentType };
  features: Array<{ icon: string; text: string }>;
  /** Wraps the showcase and its side panel, for state the two share. */
  Provider?: React.ComponentType<{ children: React.ReactNode }>;
}

/** Every category with the number of components filed under it. */
const CATEGORY_ROWS: Array<[string, string]> = componentCategoryMetadata.map((c) => [
  c.label,
  String(componentMetadata.filter((m) => m.category === c.id).length),
]);

export const HOME_TILES: HomeTile[] = [
  {
    id: "components",
    title: "Every control your product needs",
    description: `${COMPONENT_COUNT} typed components, from buttons to charts.`,
    Scene: ComponentsTileScene,
    lede: "Forms, charts, overlays, maps and the AI set, all on one props shape and one set of semantic tokens. Native attributes pass through, refs forward, and every prop is documented in the types you install.",
    points: [
      "Every prop described in the shipped types",
      "Server-renderable wherever nothing is interactive",
      "Every story render-tested with accessibility checks",
      "Dark mode from the tokens, never per component",
    ],
    primary: { label: "Browse components", href: "/components", icon: "category" },
    secondary: { label: "Open Storybook", href: STORYBOOK_URL, external: true },
    Showcase: ComponentsShowcase,
    side: { title: "By category", rows: CATEGORY_ROWS },
    features: [
      { icon: "code", text: "One API shape: variant for emphasis, tone for colour, and onValueChange beside onChange." },
      { icon: "accessibility_new", text: "Overlays share one focus trap, one Escape stack and one scroll lock." },
      { icon: "description", text: "Append .md to any component page for its prop contract as markdown." },
    ],
  },
  {
    id: "chat",
    title: "Add an AI chat with one command",
    description: "Streaming answers, tool calls and charts, built in.",
    align: "end",
    Scene: ChatScene,
    lede: "The AI set covers every part of a chat: messages, streaming text, tool calls, reasoning, questions with answers to pick, and the composer. The chat widget composes them into a finished panel, and one command scaffolds it into your app.",
    points: [
      "Docks beside the page on wide screens",
      "Takes over the viewport on phones",
      "Rate limits and a daily budget built in",
      "A headless engine for your own interface",
    ],
    primary: { label: "Add the chat", href: "/docs/chat", icon: "forum" },
    secondary: { label: "Browse templates", href: "/templates" },
    Showcase: ChatScene,
    side: {
      title: "Entry points",
      stacked: true,
      rows: Object.entries(chatWidget.subpaths).map(([key, what]) => [
        `${PACKAGE_NAME}${key.slice(1)}`,
        what,
      ]),
    },
    features: [
      { icon: "terminal", text: "npx rift-ds init chat scaffolds the routes, the mount and an env example, and never overwrites a file." },
      { icon: "swap_horiz", text: "The widget talks to any backend through one transport function." },
      { icon: "view_quilt", text: "The chat home template shows it as a whole page." },
    ],
  },
  {
    id: "templates",
    title: "Start from a finished screen",
    description: "Dashboards, consoles, calendars and chat homes to build on.",
    Scene: TemplatesTileScene,
    lede: "Each template is a complete product screen built only from the library's components and tokens. Pick one on the right to see it live, at desktop, tablet or phone size, in the theme you have on.",
    points: [
      "Every screen is built from shipped parts",
      "Each one re-themes with the presets",
      "Phone layouts where the screen needs one",
      "Fictional data, real components",
    ],
    primary: { label: "Browse templates", href: "/templates", icon: "dashboard" },
    secondary: { label: "Open the chat home", href: "/templates/chat-home" },
    Showcase: TemplatesShowcase,
    side: { title: "Pick a screen", Component: TemplatesList },
    Provider: TemplatesProvider,
    features: [
      { icon: "view_quilt", text: "Full-viewport app shells, rendered with no site chrome." },
      { icon: "smartphone", text: "Sidebar shells dress as an app in the phone frame." },
    ],
  },
  {
    id: "themes",
    title: "A new look in one line",
    description: "Complete themes, light and dark.",
    Scene: ThemesTileScene,
    lede: "Each theme is a complete look in plain CSS, light and dark. Import the stylesheet, set data-brand on the root, and every component follows with no runtime JavaScript. Pick one on the right: this whole page changes with it.",
    points: [
      "Colour, type, shape, density and motion in one look",
      "Light and dark ship together for every theme",
      "Every action colour is contrast-checked at build",
      "Export your own look from the playground",
    ],
    primary: { label: "See the themes", href: "/foundations/themes", icon: "palette" },
    secondary: { label: "Open the playground", href: "/playground" },
    Showcase: ThemesShowcase,
    side: { title: "Try one", Component: ThemePicker },
    features: [
      { icon: "account_tree", text: "Primitives re-key and semantic tokens re-point. Components never change." },
      { icon: "contrast", text: "Every action fill holds contrast with its label in both modes." },
      { icon: "download", text: "The playground exports the CSS, a written brief and a setup prompt for your agent." },
    ],
  },
  {
    id: "playground",
    title: "Make the look your own",
    description: "Move the levers, then take the theme home as files.",
    Scene: PlaygroundTileScene,
    lede: "The playground re-themes components, type, a chat and a full dashboard as you move its levers. Drop in an image or a DESIGN.md and the levers follow it. When the look is right, export it as files for your project.",
    points: [
      "Colour, type, shape, density and motion levers",
      "Every preset is a saved position of the levers",
      "Images are read in your browser, never uploaded",
      "Exports the CSS, a THEME.md and a setup prompt",
    ],
    primary: { label: "Open the playground", href: "/playground", icon: "tune" },
    secondary: { label: "See the themes", href: "/foundations/themes" },
    Showcase: PlaygroundShowcase,
    side: {
      title: "What it exports",
      stacked: true,
      rows: [
        ["Theme CSS", "The token overrides, written by the same composer as the shipped presets."],
        ["THEME.md", "The look described in words, for a person or an agent to read."],
        ["Setup prompt", "Instructions a coding agent can follow to apply the theme."],
      ],
    },
    features: [
      { icon: "image", text: "Drop an image and the action colour, neutrals and accents follow it." },
      { icon: "dashboard", text: "Four views: components, type, chat and a full dashboard." },
      { icon: "lock", text: "Everything runs in your browser. Nothing is uploaded or stored." },
    ],
  },
  {
    id: "agents",
    title: "Your agent knows the API",
    description: "Real props and tokens over MCP, no key needed.",
    align: "start",
    Scene: AgentsTileScene,
    lede: "A public MCP endpoint serves every component's props, the token registry and the install steps, so your coding agent reads the real contract instead of guessing it. The agent skills teach it the library every session.",
    points: [
      "No account and no key, just one URL",
      "Props generated from the shipped types",
      "Skills install with one command",
      "Calls no model, so answers are exact",
    ],
    primary: { label: "Connect an agent", href: "/docs/get-started", icon: "terminal" },
    secondary: { label: "Read llms.txt", href: "/llms.txt" },
    Showcase: AgentsShowcase,
    side: { title: "Tools", stacked: true, rows: MCP_TOOLS.map((t) => [t.name, t.blurb]) },
    features: [
      { icon: "lan", text: "Streamable HTTP and stateless, for any MCP client." },
      { icon: "school", text: "Skills cover the library, applying a theme to existing screens, and a style audit." },
      { icon: "description", text: "Every component's props also ship as a markdown page." },
    ],
  },
  {
    id: "install",
    title: "Free, however you install it",
    description: "MIT licensed, by npm, the shadcn CLI or a clone.",
    Scene: InstallTileScene,
    lede: "No paid tier and no licence key. Install the package, copy single components into your own source with the shadcn CLI, or clone the repository and make it yours.",
    points: [
      "MIT licensed, free for any project",
      "Optional peers stay optional",
      "Components copy in with imports untouched",
      "The whole system is in the repository",
    ],
    primary: { label: "Get started", href: "/docs/get-started", icon: "terminal" },
    secondary: { label: "Release log", href: "/releases" },
    Showcase: InstallShowcase,
    side: {
      title: "The terms",
      rows: [
        ["Licence", "MIT"],
        ["Cost", "$0"],
        ["Package", PACKAGE_NAME],
        ["Registry", "shadcn compatible"],
      ],
    },
    features: [
      { icon: "bar_chart", text: "Charts import from their own entry point, so apps without them never resolve recharts." },
      { icon: "content_copy", text: "Copied components keep the library's layout, so no import is rewritten." },
      { icon: "fork_right", text: "The repository holds the library, this site, the validators and the skills." },
    ],
  },
];
