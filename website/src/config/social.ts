/**
 * Canonical external links: where the design system lives off-site.
 * Every URL derives from the brand module — nothing here restates one.
 * The footer consumes these; PageLinks carries per-page deep links and
 * can be pointed here as it gets touched.
 */
import {
  FIGMA_URL,
  NPM_URL,
  REPOSITORY_URL,
  STORYBOOK_URL,
} from "@/config/brand.generated";

export interface ExternalLink {
  /** Visible label, sentence case. */
  label: string;
  href: string;
}

/**
 * Personal profiles left with the portfolio. The footer's icon row
 * renders whatever lives here, so the empty list simply removes the row;
 * a product-level social presence can repopulate it later.
 */
export const SOCIAL_PROFILES: ExternalLink[] = [];

/**
 * Every Figma link on the site renders only while this is true. Hidden
 * for now (2026-09-20, Rob): the Figma file lags the coded system badly
 * enough that linking it misleads. Flip to true to restore the whole
 * set at once — the footer row, PageLinks chips, the landing resources
 * strip, and the overview and get-started cards all guard on it.
 */
export const SHOW_FIGMA_LINKS = false;

/** Where the design system lives off-site. */
export const PROJECT_LINKS: ExternalLink[] = [
  { label: "GitHub", href: REPOSITORY_URL },
  { label: "npm", href: NPM_URL },
  { label: "Storybook", href: STORYBOOK_URL },
  ...(SHOW_FIGMA_LINKS ? [{ label: "Figma", href: FIGMA_URL }] : []),
];
