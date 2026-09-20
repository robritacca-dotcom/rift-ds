import type { Metadata } from "next";
import { pageOpenGraph } from "@/config/navigation";

const title = "Content MD";
const description =
  "The writing rules behind robr0 DS in a single markdown reference: voice, register by surface, banned words and patterns, and the self-review tests copy passes before it ships.";

export const metadata: Metadata = {
  alternates: { canonical: "/blueprints/content-design" },
  title,
  description,
  openGraph: pageOpenGraph(title, description, "/blueprints/content-design"),
};

export default function ContentDesignBlueprintLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
