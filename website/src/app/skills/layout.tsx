import type { Metadata } from "next";
import { pageOpenGraph } from "@/config/navigation";

const title = "Skills";
const description =
  "Reusable Claude Code skill files I wrote to extend robr0 DS, each one a markdown file you can read and copy.";

export const metadata: Metadata = {
  alternates: { canonical: "/skills" },
  title,
  description,
  openGraph: pageOpenGraph(title, description, "/skills"),
};

export default function SkillsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
