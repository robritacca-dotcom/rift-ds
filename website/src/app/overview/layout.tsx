import type { Metadata } from "next";
import { pageOpenGraph } from "@/config/navigation";
import { buildDesignSystemJsonLd } from "@/lib/structuredData";

const title = "Overview of robr0 DS";
const description =
  "An overview of robr0 DS, the AI-ready design system behind this site: the pipeline from written specs to production, and the artifacts you can take and reuse.";

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
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildDesignSystemJsonLd()),
        }}
      />
      {children}
    </>
  );
}
