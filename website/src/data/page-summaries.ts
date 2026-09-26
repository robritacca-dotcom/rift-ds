import { componentMetadata } from "rift-ds/components/registry";
import registry from "./page-summaries.json";

/**
 * Accessors for the page-summaries registry — the per-page content for the
 * chat FAB's TLDR panel (AiButton's `summary` prop): a super-concise
 * pre-written summary plus one or two prompt chips that launch the site chat
 * mid-answer.
 *
 * `page-summaries.json` holds the hand-written entries (the static
 * routes). Component pages derive theirs from the component registry's
 * descriptions instead of restating facts. A chromeless route has no FAB
 * and so no entry. `scripts/validate-page-summaries.mjs` holds all of this
 * to the route list in both directions, so a new page cannot ship without
 * a summary or a written exclusion.
 */

export interface PageSummaryChip {
  id: string;
  label: string;
  /** The message actually sent to the chat — may be fuller than the label. */
  prompt: string;
}

export interface PageSummary {
  title: string;
  caption?: string;
  text: string;
  chips: PageSummaryChip[];
}

const chip = (id: string, label: string, prompt: string): PageSummaryChip => ({
  id,
  label,
  prompt,
});

const staticSummaries = registry.routes as Record<string, PageSummary>;

/* The derived chip label for a component page. The validator re-derives
   this template to hold every label inside the suggestion chip budget, so
   a change here needs the matching change there. */
export const componentChipLabel = (label: string) => `How do I use ${label}?`;

function componentSummary(slug: string): PageSummary | null {
  const meta = componentMetadata.find((c) => c.slug === slug);
  if (!meta) return null;
  return {
    title: meta.label,
    text: meta.description,
    chips: [
      chip(
        "usage",
        componentChipLabel(meta.label),
        `How do I use the ${meta.label} component from the design system? Show me the props and a quick example.`
      ),
    ],
  };
}

/** The FAB panel's content for a route, or null for the plain button. */
export function getPageSummary(pathname: string): PageSummary | null {
  const path =
    pathname.length > 1 && pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname;

  const fixed = staticSummaries[path];
  if (fixed) return fixed;

  const component = path.match(/^\/components\/([^/]+)$/);
  if (component) return componentSummary(component[1]);

  return null;
}
