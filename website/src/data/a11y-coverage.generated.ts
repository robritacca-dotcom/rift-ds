// AUTO-GENERATED — do not edit by hand.
// Source of truth: the component registry, the component and behaviour source
// in src/, and the Storybook story files.
// Regenerate: node scripts/generate-a11y-coverage.mjs (runs via predev/prebuild).

export interface A11yCoverage {
  /** Exported Storybook stories — each one a render test plus an axe audit. */
  stories: number;
  /** Components whose source declares an ARIA role or attribute. */
  withAria: number;
  /** Components that name themselves for assistive technology. */
  withAccessibleName: number;
  /** Modules in the shared overlay behaviour layer. */
  behaviourModules: number;
  /** Components built on that layer, by display label. */
  overlayComponents: string[];
}

export const a11yCoverage: A11yCoverage = {
  "stories": 1081,
  "withAria": 137,
  "withAccessibleName": 112,
  "behaviourModules": 5,
  "overlayComponents": [
    "Alert dialog",
    "App sidebar",
    "Attachment viewer",
    "Command palette",
    "Dialog",
    "Drawer",
    "Lightbox"
  ]
};
