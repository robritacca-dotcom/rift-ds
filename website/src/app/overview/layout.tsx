import type { Metadata } from "next";
import { pageOpenGraph } from "@/config/navigation";
import { BRAND_NAME } from "@/config/brand.generated";

const title = `Overview of ${BRAND_NAME}`;
const description =
  `An overview of ${BRAND_NAME}, the AI-ready design system behind this site: the pipeline from written specs to production, and the artifacts you can take and reuse.`;

export const metadata: Metadata = {
  alternates: { canonical: "/overview" },
  title,
  description,
  openGraph: pageOpenGraph(title, description, "/overview"),
};

export default function OverviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // No JSON-LD here: the root layout already emits the SoftwareApplication
  // node on every page, and a second copy on this one duplicated it.
  return <>{children}</>;
}
