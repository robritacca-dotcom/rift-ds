import type { Metadata } from "next";
import { pageOpenGraph } from "@/config/navigation";

// /graph is a standalone top-level page (like /playground) — it lives in no
// sidebar array, so its metadata is a literal rather than pageMetadata().
const title = "System graph";
const description =
  "The design system read out of the source as one graph: primitives, tokens, components, site UI and pages, with every dependency traceable in both directions.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/graph" },
  openGraph: pageOpenGraph(title, description, "/graph"),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
