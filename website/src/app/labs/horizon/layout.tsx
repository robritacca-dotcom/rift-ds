import type { ReactNode } from "react";

export const metadata = {
  title: "Labs: horizon chat",
  description:
    "The site chat over a soft planet horizon at night, drawn in a shader, with the composer and rail as one solid coat.",
  // Noindex by design: a labs test page, deliberately outside the IA — no
  // nav, no sitemap, no corpus (see EXCLUDED_ROUTES in
  // scripts/generate-site-corpus.mjs).
  robots: { index: false, follow: false },
};

export default function LabsHorizonLayout({ children }: { children: ReactNode }) {
  return children;
}
