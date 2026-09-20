import type { Metadata } from "next";
import { pageOpenGraph } from "@/config/navigation";
import { BRAND_NAME } from "@/config/brand.generated";

const title = "Project journal";
const description =
  `The progression of the ${BRAND_NAME} build: an evergreen journal consolidating the largest updates to the design system and this site, curated from the full commit history.`;

export const metadata: Metadata = {
  alternates: { canonical: "/project-journal" },
  title,
  description,
  openGraph: pageOpenGraph(title, description, "/project-journal"),
};

export default function SiteUpdatesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
