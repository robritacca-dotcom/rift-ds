import type { ReactNode } from "react";

export const metadata = {
  title: "Labs: Riser, MEP chat",
  description:
    "A chat-first construction platform: the assistant opens a generated building with every MEP trade in it as a live 3D artifact, and moves its view.",
  // Noindex by design: a labs test page, deliberately outside the IA: no
  // nav, no sitemap, no corpus (see EXCLUDED_ROUTES in
  // scripts/generate-site-corpus.mjs).
  robots: { index: false, follow: false },
};

export default function RacewayChatLayout({ children }: { children: ReactNode }) {
  return children;
}
