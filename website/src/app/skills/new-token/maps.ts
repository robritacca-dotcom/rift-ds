import type { ArchMap } from "@/components/ArchitectureMap/types";

/**
 * The action colour traced from its primitive to every home it reaches. The
 * accent edges are the three tiers (primitive, semantic, component CSS);
 * everything else is a documentation home or a file the build chain writes.
 */
export const actionColourMap: ArchMap = {
  id: "action-colour-end-to-end",
  title: "The action colour, end to end",
  label:
    "The action colour is a primitive, referenced by a light and a dark semantic value, used by Button's CSS and documented on a swatch, a Storybook doc and design.md. Generators write the registry, the resolved values and the DTCG files from the CSS, and validators hold every home to it.",
  width: 1960,
  height: 1000,
  nodes: [
    /* 1 · The tiers, by hand */
    { id: "z-tiers", x: 60, y: 120, w: 960, h: 600, kind: "zone", title: "1 · The tiers, by hand", sub: "primitive, semantic, component" },
    { id: "primitive", x: 95, y: 200, w: 270, h: 76, title: "Primitive", sub: "tokens-primitives.css", icon: "palette", chip: "info" },
    { id: "light", x: 405, y: 200, w: 270, h: 76, title: "Light value", sub: "tokens-light.css", icon: "style", chip: "info" },
    { id: "dark", x: 405, y: 420, w: 270, h: 76, title: "Dark value", sub: "tokens-dark.css", icon: "style", chip: "info" },
    { id: "forced", x: 405, y: 600, w: 270, h: 76, title: "Forced colors", sub: "tokens-forced-colors.css", icon: "toggle_on", chip: "info" },
    { id: "button", x: 715, y: 420, w: 270, h: 76, title: "Component CSS", sub: "Button.css", icon: "widgets", chip: "info" },

    /* 2 · Documentation, by hand */
    { id: "z-docs", x: 60, y: 760, w: 960, h: 200, kind: "zone", title: "2 · Documentation, by hand", sub: "where a reader finds it" },
    { id: "spec", x: 95, y: 840, w: 270, h: 76, title: "Spec sentence", sub: "design.md", icon: "description", chip: "info" },
    { id: "story", x: 405, y: 840, w: 270, h: 76, title: "Storybook doc", sub: "Tokens.stories.tsx", logo: "/logos/storybook.svg" },
    { id: "swatch", x: 715, y: 840, w: 270, h: 76, title: "Swatch", sub: "foundations/colour-mode", icon: "grid_view", chip: "info" },

    /* 3 · Every build */
    { id: "z-chain", x: 1100, y: 280, w: 340, h: 480, kind: "zone", title: "3 · Every build", sub: "validate-registry" },
    { id: "generators", x: 1135, y: 360, w: 270, h: 76, title: "Generators", sub: "token registry · token values", icon: "auto_awesome", chip: "warning" },
    { id: "validators", x: 1135, y: 640, w: 270, h: 76, title: "Validators", sub: "references · parity · usage · mirrors", icon: "rule", chip: "warning" },

    /* 4 · Generated */
    { id: "z-gen", x: 1520, y: 120, w: 380, h: 520, kind: "zone", title: "4 · Generated", sub: "never edited by hand" },
    { id: "registry", x: 1555, y: 200, w: 310, h: 76, title: "Token registry", sub: "src/tokens/registry.json", icon: "storage" },
    { id: "values", x: 1555, y: 360, w: 310, h: 76, title: "Resolved values", sub: "src/tokens/values.json", icon: "data_object" },
    { id: "dtcg", x: 1555, y: 520, w: 310, h: 76, title: "DTCG files", sub: "one per theme and mode", icon: "download" },
  ],
  edges: [
    { id: "primitive-light", from: "primitive", to: "light", kind: "accent" },
    { id: "light-button", from: "light", to: "button", label: "var() only", kind: "accent", fromSide: "right", toSide: "top" },
    { id: "primitive-dark", from: "primitive", to: "dark" },
    { id: "light-gen", from: "light", to: "generators" },
    { id: "gen-registry", from: "generators", to: "registry", fromSide: "right", toSide: "left" },
    { id: "gen-values", from: "generators", to: "values", label: "every build" },
    { id: "gen-dtcg", from: "generators", to: "dtcg", fromSide: "right", toSide: "left" },
    { id: "gen-val", from: "generators", to: "validators" },
    { id: "button-val", from: "button", to: "validators", fromSide: "right", toSide: "left" },
    { id: "swatch-val", from: "swatch", to: "validators", label: "both ways", fromSide: "right", toSide: "left" },
  ],
};
