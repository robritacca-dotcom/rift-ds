import type { Metadata } from "next";
import { blocks } from "@/data/blocks";

const block = blocks.find((b) => b.name === "app-shell")!;

/* A preview of placeholder data in a fictional product, so it is kept out
   of search (noindex, no canonical, no sitemap entry) and out of the chat
   corpus (EXCLUDED_ROUTES in scripts/generate-site-corpus.mjs). The
   /docs/blocks page is the indexed home of every block. */
export const metadata: Metadata = {
  title: `${block.label} block`,
  description: block.description,
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
