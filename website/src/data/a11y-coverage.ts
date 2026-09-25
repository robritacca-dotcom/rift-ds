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
export const ARIA_COMPONENT_COUNT = a11yCoverage.withAria;
export const ACCESSIBLE_NAME_COUNT = a11yCoverage.withAccessibleName;
export const BEHAVIOUR_MODULE_COUNT = a11yCoverage.behaviourModules;
export const overlayComponents = a11yCoverage.overlayComponents;
