import type { BreadcrumbItem } from "@/config/navigation";
import { SOCIAL_PROFILES } from "@/config/social";

export const SITE_URL = "https://robertritacca.com";

export function buildPersonJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Robert Ritacca",
    url: SITE_URL,
    jobTitle: "Principal Product Designer",
    description:
      "Product designer specialising in AI-native products, agentic experiences, and complex workflows, based in Toronto.",
    /* Employer and education mirror the /about timeline; update both together. */
    worksFor: {
      "@type": "Organization",
      name: "Gusto",
      url: "https://gusto.com",
    },
    alumniOf: [
      {
        "@type": "CollegeOrUniversity",
        name: "University of Toronto",
        url: "https://www.utoronto.ca",
      },
      {
        "@type": "CollegeOrUniversity",
        name: "Sheridan College",
        url: "https://www.sheridancollege.ca",
      },
    ],
    homeLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Toronto",
        addressRegion: "ON",
        addressCountry: "CA",
      },
    },
    knowsAbout: [
      "AI-native product design",
      "Design systems",
      "0-to-1 product design",
      "Agentic experiences",
    ],
    /* The same profiles the footer advertises (mailto is not a sameAs). */
    sameAs: SOCIAL_PROFILES.filter((p) => p.href.startsWith("http")).map(
      (p) => p.href
    ),
  };
}

export function buildWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Robert Ritacca",
    url: SITE_URL,
  };
}

/**
 * Builds an Article schema for a /work case study. Pass the same headline and
 * description the page's `metadata` export declares so the two never disagree.
 */
export function buildCaseStudyJsonLd({
  slug,
  headline,
  description,
}: {
  slug: string;
  headline: string;
  description: string;
}) {
  const url = `${SITE_URL}/work/${slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    image: `${url}/opengraph-image`,
    author: {
      "@type": "Person",
      name: "Robert Ritacca",
      url: SITE_URL,
    },
  };
}

/**
 * Builds a BlogPosting schema for a /writing article. The page's canonical
 * points at Substack (the original), but this still describes the mirrored
 * page's content for richer presentation.
 */
export function buildArticleJsonLd({
  slug,
  title,
  description,
  datePublished,
  image,
}: {
  slug: string;
  title: string;
  description?: string;
  datePublished: string;
  image?: string;
}) {
  const url = `${SITE_URL}/writing/${slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    ...(description ? { description } : {}),
    url,
    datePublished,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    ...(image ? { image } : {}),
    author: { "@type": "Person", name: "Robert Ritacca", url: SITE_URL },
  };
}

/**
 * Builds a SoftwareApplication schema for robr0 DS — the design system itself,
 * as a developer-facing piece of software. No component count here: counts are
 * never hardcoded (see CLAUDE.md), and it would drift.
 */
export function buildDesignSystemJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "robr0 DS",
    description:
      "An AI-ready React design system: Claude Code builds the components from written specs, generated registries keep the docs from drifting, and every token chains to a primitive you can override.",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    url: `${SITE_URL}/overview`,
    codeRepository: "https://github.com/robritacca-dotcom/design-system",
    author: { "@type": "Person", name: "Robert Ritacca", url: SITE_URL },
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
