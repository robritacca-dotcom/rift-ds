import type { Metadata } from "next";
import { pageOpenGraph } from "@/config/navigation";

// /playground is a standalone top-level page (like /privacy) — it lives in no
// sidebar array, so its metadata is a literal rather than pageMetadata().
const title = "Playground";
const description =
  "Re-theme the design system live across a component showcase, a type specimen, the chat widget and a full dashboard: pick a brand colour, reshape the radii, swap the typeface, then copy the CSS.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/playground" },
  openGraph: pageOpenGraph(title, description, "/playground"),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
