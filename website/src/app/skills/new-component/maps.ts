import type { ArchMap } from "@/components/ArchitectureMap/types";

const NEXTJS_LOGO = { logo: "/logos/nextjs black.svg", logoDark: "/logos/nextjs white.svg" };

/**
 * Button traced from the files written by hand to every surface that shows
 * it. The top lane is the live reads (accent edges); everything below it
 * passes through the build chain first.
 */
export const buttonMap: ArchMap = {
  id: "button-end-to-end",
  title: "Button, end to end",
  label:
    "Button is written once by hand, checked and copied by the build chain, and shown in Storybook, on the site, on npm and to agents. Storybook and the site read the folder live; the rest are generated copies.",
  width: 1900,
  height: 1000,
  nodes: [
    /* 1 · Written by hand */
    { id: "z-write", x: 60, y: 120, w: 420, h: 820, kind: "zone", title: "1 · Written by hand", sub: "once, in the repo" },
    { id: "folder", x: 95, y: 200, w: 350, h: 76, title: "src/components/Button/", sub: "Button.tsx · Button.css · Button.stories.ts", icon: "folder", chip: "info" },
    { id: "registry", x: 95, y: 420, w: 350, h: 76, title: "Registry entry", sub: "src/components/registry.json", icon: "storage", chip: "info" },
    { id: "spec", x: 95, y: 530, w: 350, h: 76, title: "Spec", sub: "design.md", icon: "description", chip: "info" },
    { id: "page", x: 95, y: 640, w: 350, h: 76, title: "Showcase page", sub: "website/src/app/components/button/", icon: "web", chip: "info" },
    { id: "preview", x: 95, y: 750, w: 350, h: 76, title: "Preview tile", sub: "ComponentPreviews.tsx", icon: "grid_view", chip: "info" },

    /* 2 · Before every build */
    { id: "z-chain", x: 560, y: 340, w: 400, h: 400, kind: "zone", title: "2 · Before every build", sub: "a missing piece stops it here" },
    { id: "validators", x: 595, y: 430, w: 330, h: 76, title: "Validators", sub: "folder ↔ registry · prop docs · tokens only", icon: "rule", chip: "warning" },
    { id: "generators", x: 595, y: 590, w: 330, h: 76, title: "Generators", sub: "write every copy in step 3", icon: "auto_awesome", chip: "warning" },

    /* 3 · Generated */
    { id: "z-gen", x: 1040, y: 340, w: 400, h: 600, kind: "zone", title: "3 · Generated", sub: "never edited by hand" },
    { id: "exports", x: 1075, y: 420, w: 330, h: 76, title: "Package exports", sub: "src/index.ts", icon: "inventory_2" },
    { id: "schema", x: 1075, y: 530, w: 330, h: 76, title: "Schema + markdown", sub: "button.json · button.md", icon: "data_object" },
    { id: "shadcn", x: 1075, y: 640, w: 330, h: 76, title: "shadcn entry", sub: "website/public/r/button.json", icon: "download" },
    { id: "api", x: 1075, y: 750, w: 330, h: 76, title: "Prop API + README", sub: "component-api.generated.ts · README.md", icon: "list_alt" },

    /* 4 · Where people see it */
    { id: "z-seen", x: 1520, y: 120, w: 340, h: 820, kind: "zone", title: "4 · Where people see it", sub: "live read or copy" },
    { id: "storybook", x: 1550, y: 200, w: 280, h: 76, title: "Storybook", sub: "finds every stories file", logo: "/logos/storybook.svg" },
    { id: "site", x: 1550, y: 310, w: 280, h: 76, title: "This site", sub: "/components/button", ...NEXTJS_LOGO },
    { id: "npm", x: 1550, y: 420, w: 280, h: 76, title: "npm", sub: "dist/, built at release", kind: "external", logo: "/logos/npm.svg" },
    { id: "agents", x: 1550, y: 590, w: 280, h: 76, title: "Agents + chat", sub: "/api/mcp · site chat", icon: "smart_toy", chip: "positive" },
  ],
  edges: [
    { id: "folder-storybook", from: "folder", to: "storybook", label: "both read the folder live", kind: "accent" },
    { id: "folder-site", from: "folder", to: "site", kind: "accent", bend: -60 },
    { id: "write-chain", from: "registry", to: "validators" },
    { id: "val-gen", from: "validators", to: "generators" },
    { id: "gen-out", from: "generators", to: "schema" },
    { id: "exports-npm", from: "exports", to: "npm", label: "at release" },
    { id: "schema-agents", from: "schema", to: "agents" },
    { id: "api-agents", from: "api", to: "agents", bend: 40 },
  ],
};
