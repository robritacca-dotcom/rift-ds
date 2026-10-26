import type { ReactNode } from "react";

export const metadata = {
  title: "Labs: right to left",
  description:
    "The right-to-left bench: the library laid out in Arabic, in an Arabic locale, with a switch back to left to right.",
  // Noindex by design: a labs test page, deliberately outside the IA — no
  // nav, no sitemap, no corpus (see EXCLUDED_ROUTES in
  // scripts/generate-site-corpus.mjs).
  robots: { index: false, follow: false },
};

export default function LabsRtlLayout({ children }: { children: ReactNode }) {
  return children;
}
