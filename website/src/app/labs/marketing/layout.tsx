import type { ReactNode } from "react";

export const metadata = {
  title: "Labs: marketing dashboard",
  description:
    "A reference marketing dashboard rebuilt from the design system alone, to test how far its tokens and components stretch.",
  // Noindex by design: a labs test page rebuilding a reference product from
  // the system alone, deliberately outside the IA — no nav, no sitemap, no
  // corpus (see EXCLUDED_ROUTES in scripts/generate-site-corpus.mjs).
  robots: { index: false, follow: false },
};

export default function LabsMarketingLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
