import data from "./release-log.json";

export interface ReleaseEntry {
  /** The npm version this entry records, e.g. "0.1.0" */
  version: string;
  /** The publish date, ISO YYYY-MM-DD */
  date: string;
  /** Release title — the theme in a few words, never a commit message */
  title: string;
  /** Short paragraphs: what shipped, and what it means for a consumer */
  body: string[];
}

/**
 * Single source of truth for the release log (/releases). One entry per
 * npm release, 1:1 — an entry is written when a version is published and
 * never otherwise, so the log and the registry can never tell different
 * stories. Appended by the release skill as part of the publish ritual;
 * validated by scripts/validate-release-log.mjs. Empty until the first
 * release lands. Never hardcode a count — import RELEASE_COUNT.
 */
export const releases: ReleaseEntry[] = data.releases;

export const RELEASE_COUNT = releases.length;

/** The newest release, or null before the first publish. */
export const latestRelease: ReleaseEntry | null = releases[0] ?? null;
