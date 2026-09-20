/**
 * Canonical external links: Rob's profiles and the places the design
 * system lives off-site. The footer and structuredData's sameAs consume
 * these; the contact page and PageLinks still carry their own copies and
 * can be pointed here as they get touched.
 */

export interface ExternalLink {
  /** Visible label, sentence case. */
  label: string;
  href: string;
}

/** Personal profiles, rendered as the footer's icon row. */
export const SOCIAL_PROFILES: ExternalLink[] = [
  { label: "LinkedIn", href: "https://www.linkedin.com/in/robertritacca/" },
  { label: "X", href: "https://x.com/robr0" },
  { label: "Instagram", href: "https://www.instagram.com/robr0designs/" },
  { label: "GitHub", href: "https://github.com/robritacca-dotcom" },
  { label: "Email", href: "mailto:rob.ritacca@gmail.com" },
];

/** Where the design system lives off-site. */
export const PROJECT_LINKS: ExternalLink[] = [
  { label: "GitHub", href: "https://github.com/robritacca-dotcom/design-system" },
  { label: "npm", href: "https://www.npmjs.com/package/@robr0/design-system" },
  { label: "Storybook", href: "https://design-system-iota-one.vercel.app" },
  { label: "Figma", href: "https://www.figma.com/@robr0" },
];
