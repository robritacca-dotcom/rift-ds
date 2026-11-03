import type { ArchMap } from "@/components/ArchitectureMap/types";

/**
 * The forest preset traced from its entry in presets.ts to every surface
 * that offers it. The accent edge is the point the page makes: the entry is
 * checked against the gate before any stylesheet ships.
 */
export const forestMap: ArchMap = {
  id: "forest-end-to-end",
  title: "Forest, end to end",
  label:
    "The forest preset is declared once in presets.ts, checked by the completeness gate, composed for light and dark, generated into a stylesheet and a DESIGN.md, and offered on npm, in Storybook, on the home page, in the playground and on its specimen page.",
  width: 1900,
  height: 1000,
  nodes: [
    /* 1 · Declared once */
    { id: "z-declare", x: 60, y: 120, w: 420, h: 820, kind: "zone", title: "1 · Declared once", sub: "written by hand" },
    { id: "entry", x: 95, y: 200, w: 350, h: 76, title: "Forest entry", sub: "THEME_PRESETS in website/src/lib/theme/presets.ts", icon: "tune", chip: "info" },
    { id: "tagline", x: 95, y: 310, w: 350, h: 76, title: "Tagline", sub: "THEME_TAGLINES, one sentence", icon: "short_text", chip: "info" },
    { id: "order", x: 95, y: 420, w: 350, h: 76, title: "Place in the row", sub: "HUE_ORDER, read by every picker", icon: "swap_horiz", chip: "info" },
    { id: "fonts", x: 95, y: 590, w: 350, h: 76, title: "Font files", sub: "src/fonts/presets/, synced by hand", icon: "font_download", chip: "info" },

    /* 2 · Checked and composed */
    { id: "z-chain", x: 560, y: 120, w: 400, h: 820, kind: "zone", title: "2 · Checked and composed", sub: "before every build" },
    { id: "gate", x: 595, y: 200, w: 330, h: 76, title: "Completeness gate", sub: "validate-theme-presets.mjs · AA in every state", icon: "rule", chip: "warning" },
    { id: "export", x: 595, y: 310, w: 330, h: 76, title: "Export check", sub: "validate-theme-export.mjs", icon: "rule", chip: "warning" },
    { id: "composer", x: 595, y: 480, w: 330, h: 76, title: "presetOverrides", sub: "levers to tokens, light and dark", icon: "merge", chip: "warning" },
    { id: "generator", x: 595, y: 590, w: 330, h: 76, title: "Stylesheet generator", sub: "generate-preset-stylesheets.mjs", icon: "auto_awesome", chip: "warning" },
    { id: "mdgen", x: 595, y: 700, w: 330, h: 76, title: "DESIGN.md generator", sub: "generate-theme-design-md.mjs", icon: "auto_awesome", chip: "warning" },

    /* 3 · Generated */
    { id: "z-gen", x: 1040, y: 120, w: 400, h: 820, kind: "zone", title: "3 · Generated", sub: "never edited by hand" },
    { id: "shadcn", x: 1075, y: 260, w: 330, h: 76, title: "shadcn base item", sub: "website/public/r/base.json", icon: "download" },
    { id: "css", x: 1075, y: 370, w: 330, h: 76, title: "forest.css", sub: "src/tokens/presets/ · byte-compared", icon: "palette" },
    { id: "aggregate", x: 1075, y: 480, w: 330, h: 76, title: "presets.css", sub: "imports every preset stylesheet", icon: "inventory_2" },
    { id: "designmd", x: 1075, y: 810, w: 330, h: 76, title: "Theme DESIGN.md", sub: "website/public/themes/forest/", icon: "description" },

    /* 4 · Where people pick it */
    { id: "z-seen", x: 1520, y: 120, w: 340, h: 820, kind: "zone", title: "4 · Where people pick it", sub: "one data-brand attribute" },
    { id: "npm", x: 1550, y: 370, w: 280, h: 76, title: "npm", sub: "rift-ds/tokens/presets/forest.css", kind: "external", logo: "/logos/npm.svg" },
    { id: "storybook", x: 1550, y: 480, w: 280, h: 76, title: "Storybook", sub: "Theme toolbar", logo: "/logos/storybook.svg" },
    { id: "home", x: 1550, y: 590, w: 280, h: 76, title: "Home and header", sub: "tile row · theme switcher", icon: "home" },
    { id: "playground", x: 1550, y: 700, w: 280, h: 76, title: "Playground", sub: "preset picker", icon: "tune" },
    { id: "specimen", x: 1550, y: 810, w: 280, h: 76, title: "Specimen page", sub: "/foundations/themes/forest", icon: "web", chip: "positive" },
  ],
  edges: [
    { id: "entry-gate", from: "entry", to: "gate", label: "checked before it ships", kind: "accent" },
    { id: "entry-composer", from: "entry", to: "composer" },
    { id: "fonts-generator", from: "fonts", to: "generator" },
    { id: "composer-generator", from: "composer", to: "generator" },
    { id: "generator-css", from: "generator", to: "css" },
    { id: "generator-aggregate", from: "generator", to: "aggregate" },
    { id: "css-shadcn", from: "css", to: "shadcn" },
    { id: "mdgen-designmd", from: "mdgen", to: "designmd" },
    { id: "css-npm", from: "css", to: "npm", label: "at release" },
    { id: "aggregate-storybook", from: "aggregate", to: "storybook", label: "imported whole" },
    { id: "aggregate-home", from: "aggregate", to: "home" },
    { id: "aggregate-playground", from: "aggregate", to: "playground" },
    { id: "designmd-specimen", from: "designmd", to: "specimen" },
  ],
};
