import type { BreadcrumbItem } from "@/config/navigation";
import {
  AUTHOR_NAME,
  AUTHOR_URL,
  BRAND_NAME,
  REPOSITORY_URL,
  SITE_URL as BRAND_SITE_URL,
} from "@/config/brand.generated";

/* Re-exported under its long-standing name: 8+ modules and 3 build scripts
   read SITE_URL from here, so the brand module feeds it rather than moving
   every import. */
export const SITE_URL = BRAND_SITE_URL;

/**
 * The author, as a Person node. The footer credit's machine-readable
 * twin: both schema nodes name the same person, from the same brand
 * constants, so a crawler reads the credit a visitor reads.
 */
const author = {
  "@type": "Person",
  name: AUTHOR_NAME,
  url: AUTHOR_URL,
} as const;

export function buildWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: BRAND_NAME,
    url: SITE_URL,
    author,
  };
}

/**
 * Builds a SoftwareApplication schema for the design system itself, as a
 * developer-facing piece of software. No component count here: counts are
 * never hardcoded (see CLAUDE.md), and it would drift.
 */
export function buildDesignSystemJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: BRAND_NAME,
    description:
      "An AI-ready React design system: Claude Code builds the components from written specs, generated registries keep the docs from drifting, and every token chains to a primitive you can override.",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    url: `${SITE_URL}/overview`,
    codeRepository: REPOSITORY_URL,
    author,
  };
}

/** Builds a BreadcrumbList schema from the same trail PageBreadcrumb renders. */
export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: `${SITE_URL}${item.href}` } : {}),
    })),
  };
}
