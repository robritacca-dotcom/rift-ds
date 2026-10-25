import type { ReactNode } from "react";

export const metadata = {
  title: "Labs: tables",
  description:
    "The table test bench: every table the system offers, from a markdown table to a data grid with every control on, at desktop, tablet and phone width.",
  // Noindex by design: a labs test page, deliberately outside the IA — no
  // nav, no sitemap, no corpus (see EXCLUDED_ROUTES in
  // scripts/generate-site-corpus.mjs).
  robots: { index: false, follow: false },
};

export default function LabsTablesLayout({ children }: { children: ReactNode }) {
  return children;
}
