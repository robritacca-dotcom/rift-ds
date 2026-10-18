import type { ReactNode } from "react";

export const metadata = {
  title: "Labs: quick replies",
  description:
    "The five ways an agent's reply can end, from an open question to a short interview, played live in a scripted chat.",
  // Noindex by design: a labs test page, deliberately outside the IA — no
  // nav, no sitemap, no corpus (see EXCLUDED_ROUTES in
  // scripts/generate-site-corpus.mjs).
  robots: { index: false, follow: false },
};

export default function LabsQuickRepliesLayout({ children }: { children: ReactNode }) {
  return children;
}
