import type { ReactNode } from "react";

export const metadata = {
  title: "Labs: theme showcase",
  description:
    "Live example screens built from the system, each paired with a theme, to show how far one theme pick moves a whole product.",
  // Noindex by design: a labs test page, deliberately outside the IA: no
  // nav, no sitemap, no corpus (see EXCLUDED_ROUTES in
  // scripts/generate-site-corpus.mjs).
  robots: { index: false, follow: false },
};

export default function LabsThemesLayout({ children }: { children: ReactNode }) {
  return children;
}
