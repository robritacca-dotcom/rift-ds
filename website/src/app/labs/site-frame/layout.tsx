import type { ReactNode } from "react";
import SiteFrame from "./SiteFrame";

export const metadata = {
  title: "Labs: site frame",
  description:
    "Three of the site's own pages (home, the components index and the Button page) hosted in the library's SiteLayout, to test that frame on the real site before any page moves to it.",
  // Noindex by design: a labs test page outside the IA, no nav, no sitemap,
  // no corpus (see EXCLUDED_ROUTES in scripts/generate-site-corpus.mjs).
  robots: { index: false, follow: false },
};

/**
 * One frame for all three lab pages: a Next layout never remounts on
 * navigation, so the frame, its lever panel and its settings persist as the
 * reader moves between the home, the index and the sub page.
 */
export default function LabsSiteFrameLayout({ children }: { children: ReactNode }) {
  return <SiteFrame>{children}</SiteFrame>;
}
