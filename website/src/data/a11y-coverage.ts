/**
 * Accessor for the generated accessibility coverage figures — the numbers
 * /foundations/accessibility displays.
 *
 * The page states countable facts about the library's accessibility work, so
 * none of them may be typed into page copy: they are read out of the source
 * by scripts/generate-a11y-coverage.mjs (which runs via predev/prebuild), and
 * validate-a11y-coverage.mjs keeps the generated file honest.
 */
import { a11yCoverage } from "./a11y-coverage.generated";

export type { A11yCoverage } from "./a11y-coverage.generated";

export const STORY_COUNT = a11yCoverage.stories;
/** Registered components with a story file of their own, each audited by axe on every change. */
export const STORIED_COMPONENT_COUNT = a11yCoverage.storiedComponents;
export const BEHAVIOUR_MODULE_COUNT = a11yCoverage.behaviourModules;
/** The overlays that hold focus while open: they trap Tab, restore focus and make the page behind inert. */
export const modalOverlays = a11yCoverage.modalOverlays;
/** Every component that dismisses through the shared layer stack, modal or not. */
export const layerComponents = a11yCoverage.layerComponents;
