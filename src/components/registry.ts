import registry from './registry.json';

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
 * `docOnlyHelpers` names the internal documentation helpers that are
 * deliberately excluded from the public count.
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

/** The official public component count. */
export const COMPONENT_COUNT: number = registry.components.length;
