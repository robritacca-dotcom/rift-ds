import type { Metadata } from "next";
import { pageOpenGraph } from "@/config/navigation";

const title = "Design MD";
const description =
  "The design language behind robr0 DS in a single markdown reference: tokens, typography, colours, and every component spec.";

export const metadata: Metadata = {
  alternates: { canonical: "/blueprints/design" },
  title,
  description,
  openGraph: pageOpenGraph(title, description, "/blueprints/design"),
};

export default function DesignBlueprintLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
