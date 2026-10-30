// AUTO-GENERATED — do not edit by hand.
// Source of truth: the component registry, the component and behaviour source
// in src/, and the Storybook story files.
// Regenerate: node scripts/generate-a11y-coverage.mjs (runs via predev/prebuild).

export interface A11yCoverage {
  /** Exported Storybook stories — each one a render test plus an axe audit. */
  stories: number;
  /** Registered components with a story file of their own. */
  storiedComponents: number;
  /** Modules in the shared overlay behaviour layer. */
  behaviourModules: number;
  /** The modal overlays (they import the focus scope), by display label. */
  modalOverlays: string[];
  /** Every component on the dismissal stack, modal or not, by display label. */
  layerComponents: string[];
}

export const a11yCoverage: A11yCoverage = {
  "stories": 1337,
  "storiedComponents": 162,
  "behaviourModules": 11,
  "modalOverlays": [
    "Alert dialog",
    "App sidebar",
    "Attachment viewer",
    "Bento tile",
    "Command palette",
    "Dialog",
    "Drawer",
    "Lightbox"
  ],
  "layerComponents": [
    "AI button",
    "Alert dialog",
    "Anchor nav",
    "App sidebar",
    "Attachment viewer",
    "Bento tile",
    "Colour picker",
    "Combobox",
    "Command palette",
    "Context menu",
    "Dialog",
    "Drawer",
    "Dropdown",
    "Dropdown menu",
    "Filter bar",
    "Hover card",
    "Lightbox",
    "Model picker",
    "Popover",
    "Rich dropdown",
    "Site header",
    "Source chip",
    "Theme picker",
    "Time picker",
    "Tooltip"
  ]
};
