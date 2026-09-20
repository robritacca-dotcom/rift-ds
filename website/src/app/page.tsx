import type { Metadata } from "next";
import DesignSystemLanding from "./DesignSystemLanding";

/* Title, description and the Open Graph block come from the root layout — this
   page IS the site default. Only the canonical is declared here, because a
   page-level canonical does not inherit (unlike one on the root layout, which
   would canonicalise every page to the homepage — see the layout's comment).
   An explicit canonical keeps shared-link variants (UTM-tagged and other
   query-string URLs) consolidating onto the bare homepage. */
export const metadata: Metadata = { alternates: { canonical: "/" } };

/* The home page IS the design system landing: live components rendered from
   the npm package, an accent switcher that re-themes the page, and links
   into every top-level section. The implementation is the client component
   beside this file; this server wrapper only owns the metadata. */
export default function HomePage() {
  return <DesignSystemLanding />;
}
