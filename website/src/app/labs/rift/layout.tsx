import type { ReactNode } from "react";

export const metadata = {
  title: "Labs: rift",
  description: "A chat window as frosted glass over a glowing tear in the page, with fine type streaming toward it.",
  // Noindex by design: a labs test page, deliberately outside the IA: no nav,
  // no sitemap, no corpus (see EXCLUDED_ROUTES in
  // scripts/generate-site-corpus.mjs).
  robots: { index: false, follow: false },
};

export default function LabsRiftLayout({ children }: { children: ReactNode }) {
  return children;
}
