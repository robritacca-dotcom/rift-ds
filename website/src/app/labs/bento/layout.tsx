import type { ReactNode } from "react";

export const metadata = {
  title: "Labs: bento",
  description:
    "Feature banners with their own textures and quietly moving UI, each opening into a full overlay.",
  // Noindex by design: a labs test page, deliberately outside the IA — no
  // nav, no sitemap, no corpus (see EXCLUDED_ROUTES in
  // scripts/generate-site-corpus.mjs).
  robots: { index: false, follow: false },
};

export default function LabsBentoLayout({ children }: { children: ReactNode }) {
  return children;
}
