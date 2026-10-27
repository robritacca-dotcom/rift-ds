/**
 * The home bento's three tiles, the look, the agent and the install: what
 * each says on the card, and what its overlay holds. Every claim restates a
 * fact a covered page already makes and links to it; every count and list
 * is a registry or module import.
 */

import type React from "react";
import { MCP_TOOLS } from "@/lib/mcp-tools";
import { PACKAGE_NAME } from "@/config/brand.generated";
import {
  AgentsShowcase,
  AgentsTileScene,
  InstallShowcase,
  InstallTileScene,
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
  id: "themes" | "agents" | "install";
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

export const HOME_TILES: HomeTile[] = [
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
    id: "agents",
    title: "Your agent knows the API",
    description: "Real props and tokens over MCP, no key needed.",
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
