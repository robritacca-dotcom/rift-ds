import type { Metadata } from "next";
import { pageOpenGraph } from "@/config/navigation";

const title = "Project journal";
const description =
  "The progression of the robr0 DS build: an evergreen journal consolidating the largest updates to the design system and this site, curated from the full commit history.";

export const metadata: Metadata = {
  alternates: { canonical: "/project-journal" },
  title,
  description,
  openGraph: pageOpenGraph(title, description, "/project-journal"),
};

export default function SiteUpdatesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
