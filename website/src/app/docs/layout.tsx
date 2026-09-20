import type { Metadata } from "next";
import { pageOpenGraph, TITLE_TEMPLATE } from "@/config/navigation";

const description =
  "Documentation for robr0 DS: the system overview, the spec files that drive the build, reusable skills, autonomous loops, and the project journal.";

// `title.template` (not a bare string) matters here: /docs now has a real
// sub-page (/docs/get-started), and a plain-string title would null the
// inherited template, dropping the site suffix from every child's tab title.
// The canonical (and og:url) stay layout-level for /docs itself; sub-pages
// self-canonicalize and set their own Open Graph via pageMetadata().
export const metadata: Metadata = {
  alternates: { canonical: "/docs" },
  title: { default: "Docs", template: TITLE_TEMPLATE },
  description,
  openGraph: pageOpenGraph("Docs", description, "/docs"),
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
