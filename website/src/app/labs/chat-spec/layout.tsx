import type { ReactNode } from "react";

export const metadata = {
  title: "Labs: chat spec",
  description:
    "The chat behaviour spec rendered as a blueprint page, to judge whether it is worth publishing.",
  // Noindex by design: a labs test page, deliberately outside the IA — no
  // nav, no sitemap, no corpus (see EXCLUDED_ROUTES in
  // scripts/generate-site-corpus.mjs).
  robots: { index: false, follow: false },
};

export default function LabsChatSpecLayout({ children }: { children: ReactNode }) {
  return children;
}
