import registry from "../../../.claude/skills/registry.json";

/**
 * Single source of truth for the number of skills shown on /skills:
 * repo skills marked "displayed" plus "external" ones (personal skills
 * folder). Never hardcode a skills count — import this instead. The
 * build fails if the registry drifts from .claude/skills/ or the page
 * (scripts/validate-skills-registry.mjs).
 */
export const SKILL_COUNT = registry.displayed.length + registry.external.length;
