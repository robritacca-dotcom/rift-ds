import type { ReactNode } from "react";

export const metadata = {
  title: "Labs: glass chat",
  description:
    "A chat window as frosted glass over procedural pixel art, with a scanline raster across the stage.",
  // Noindex by design: a labs test page, deliberately outside the IA — no
  // nav, no sitemap, no corpus (see EXCLUDED_ROUTES in
  // scripts/generate-site-corpus.mjs).
  robots: { index: false, follow: false },
};

export default function LabsGlassChatLayout({ children }: { children: ReactNode }) {
  return children;
}
