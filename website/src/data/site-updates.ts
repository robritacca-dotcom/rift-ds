import data from "./site-updates.json";

export interface SiteUpdateEntry {
  /** Date or date range the theme landed, e.g. "July 21, 2026" */
  meta: string;
  /** Theme title — plain and descriptive, never a commit message */
  title: string;
  /** Short paragraphs: what was built, and when */
  body: string[];
}

/**
 * Single source of truth for the project-journal timeline (/project-journal).
 * Entries are curated stories consolidating many commits into one theme —
 * appended by the site-updates skill on its biweekly run, validated by
 * scripts/validate-site-updates.mjs. Never hardcode an update count —
 * import SITE_UPDATE_COUNT instead.
 */
export const siteUpdates: SiteUpdateEntry[] = data.entries;

/** Bookmark of the last curated commit — the loop reads history from here. */
export const siteUpdatesAsOf: { commit: string; date: string } = data.asOf;

export const SITE_UPDATE_COUNT = siteUpdates.length;
