import registry from './registry.json';
import keyboard from './keyboard-patterns.json';

/**
 * COMPONENT REGISTRY — the single source of truth for the public component
 * list, count, and per-component metadata.
 *
 * The data lives in registry.json. Each entry in `components` carries:
 *
 *   name        the exported component name; also the folder under
 *               src/components unless `folder` says otherwise
 *   label       the display name — "Nav list" for the NavList folder
 *   slug        the website route segment — stored, not derived, so a
 *               name-to-slug exception stays plain data rather than a
 *               special case duplicated across validators
 *   description one line, used for the page title, the sidebar search index,
 *               and anywhere the component is summarised
 *   category    one of `componentCategories`
 *   client      whether the component declares 'use client' — i.e. whether it
 *               uses hooks or defines handlers. Presentational components are
 *               deliberately false so consumers can render them from a React
 *               Server Component.
 *   folder      set only when the implementation lives in a shared folder
 *               rather than one named after the component — the recharts
 *               wrapper set lives in Chart/. Omitted everywhere else.
 *   recharts    true when the component's module imports recharts, so it
 *               exports from the charts barrel rather than the main one
 *               (recharts is an optional peer). Held to the actual imports
 *               by scripts/generate-library-barrel.mjs on every build.
 *
 *   alternatives set where a reader could mistake the component for another:
 *               each names the other component and the condition that picks
 *               it instead. Printed on the page, in the markdown contract
 *               and the schema, and served by the MCP get_component tool.
 *
 * `docOnlyHelpers` names the internal documentation helpers that are
 * deliberately excluded from the public count. `deprecatedAliases` names a
 * renamed component's old name and what replaced it: the old folder keeps
 * one re-exporting module, counted nowhere (the validator owns its shape).
 *
 * scripts/validate-component-registry.mjs compares the registry against the
 * filesystem on every build (library, Storybook, and website), so it cannot
 * silently drift from reality.
 *
 * Anywhere a component count is displayed — the Storybook overview, the
 * website mega-nav, case studies — import COMPONENT_COUNT from here. Never
 * hardcode the number.
 */
export interface ComponentMeta {
  /** Folder under src/components, and the exported component name */
  name: string;
  /** Display name — may differ from `name` (NavList → "Nav list") */
  label: string;
  /** Website route segment under /components */
  slug: string;
  /** One-line summary, used for page titles and search */
  description: string;
  /** Grouping — one of `componentCategories` */
  category: string;
  /** Whether the component declares 'use client' */
  client: boolean;
  /** Folder under src/components when it differs from `name` (shared folders like Chart) */
  folder?: string;
  /** True when the module imports recharts and so exports from the charts barrel, not the main one */
  recharts?: boolean;
  /** The WAI-ARIA keyboard pattern the component follows: a key of `keyboardPatterns`. Set only where the keyboard contract story presses the pattern's keys against it. */
  pattern?: string;
  /** Keyboard patterns that one part of the component follows, where the component as a whole follows another or none: a carousel's dots, a palette's list of results. `part` names it in a sentence. */
  partPatterns?: { pattern: string; part: string }[];
  /**
   * Who owns the component's keys where no pattern covers them: `component` (keys of its own, held by its own stories, or by the component `see` names), `platform` (the browser or the engine underneath) or `none` (nothing to focus). `note` says what the keys do, as a sentence. Every component names a pattern, has a part that does, or carries this.
   */
  keys?: { by: string; note?: string; see?: string };
  /**
   * The components a reader could mistake this one for, each with the condition that picks it instead. `when` completes the sentence "Use <label> instead when …", so it starts lower case and carries no full stop. Every pair is named from both sides.
   */
  alternatives?: { name: string; when: string }[];
}

/** One row of a keyboard pattern: the keys, and what pressing them does. */
export interface KeyboardRow {
  /** The check the keyboard contract story runs for this row */
  id: string;
  /** `KeyboardEvent.key` names (the space bar written `Space`), pressed together when there is more than one. Empty for a behaviour no key starts, such as focus moving in on open. */
  keys: string[];
  /** What starts the behaviour when no key does: "On open", "On focus". Set exactly when `keys` is empty. */
  when?: string;
  /** What the press does, as a sentence */
  text: string;
  /** True when the key belongs to the inline axis, so Left and Right trade places in a right-to-left layout */
  inline?: boolean;
}

/** A WAI-ARIA keyboard pattern and the rows every component naming it is tested against. */
export interface KeyboardPattern {
  /** Display name of the pattern */
  label: string;
  /** The pattern's page in the WAI-ARIA Authoring Practices Guide */
  apg: string;
  /** The tested rows */
  rows: KeyboardRow[];
}

export interface ComponentCategoryMeta {
  /** Category id — the value each component's `category` field carries, and the website route segment under /components */
  id: string;
  /** Display name for the category, used for section headings and landing pages */
  label: string;
  /** One-line summary of what the category holds */
  description: string;
}

/** Full metadata for every public component, alphabetical by name. */
export const componentMetadata: readonly ComponentMeta[] = registry.components;

/** Full metadata for every component category, alphabetical by id. */
export const componentCategoryMetadata: readonly ComponentCategoryMeta[] = registry.categories;

/** The category ids a component may belong to. */
export const componentCategories: readonly string[] = registry.categories.map((c) => c.id);

/**
 * The official public component list, names only.
 *
 * Unchanged in shape from before the metadata migration, so every existing
 * consumer keeps working without an edit.
 */
export const componentRegistry: readonly string[] = registry.components.map((c) => c.name);

/**
 * The keyboard contract: every pattern a component can name as `pattern`,
 * with the rows src/stories/KeyboardContract.stories.tsx presses against
 * each component that names it, in both reading directions.
 */
export const keyboardPatterns: Readonly<Record<string, KeyboardPattern>> = keyboard.patterns;

/** A pattern as one component meets it: the whole component, or the part of it `part` names. */
export interface ComponentKeyboard extends KeyboardPattern {
  /** The pattern's key in `keyboardPatterns` */
  id: string;
  /** The part of the component that follows the pattern; absent when the whole component does */
  part?: string;
}

/** Every keyboard pattern a component is tested against, the whole component's first; empty when it names none. */
export const keyboardFor = (name: string): ComponentKeyboard[] => {
  const component: ComponentMeta | undefined = registry.components.find((c: ComponentMeta) => c.name === name);
  if (!component) return [];
  return [
    ...(component.pattern ? [{ pattern: component.pattern, part: undefined }] : []),
    ...(component.partPatterns ?? []),
  ].map(({ pattern, part }) => ({ id: pattern, ...(part ? { part } : {}), ...keyboardPatterns[pattern] }));
};

/** One alternative as a page prints it: the other component, where its page is, and when to pick it. */
export interface ComponentAlternative {
  /** The other component's exported name */
  name: string;
  /** Its display name */
  label: string;
  /** Its route segment under /components */
  slug: string;
  /** The condition that picks it, completing "Use <label> instead when …" */
  when: string;
}

/** The components a reader could mistake `name` for, with the condition that picks each; empty when it names none. */
export const alternativesFor = (name: string): ComponentAlternative[] => {
  const component: ComponentMeta | undefined = registry.components.find((c: ComponentMeta) => c.name === name);
  return (component?.alternatives ?? []).flatMap(({ name: other, when }) => {
    const target: ComponentMeta | undefined = registry.components.find((c: ComponentMeta) => c.name === other);
    return target ? [{ name: other, label: target.label, slug: target.slug, when }] : [];
  });
};

/** The official public component count. */
export const COMPONENT_COUNT: number = registry.components.length;
