import type { Metadata } from "next";
import { pageOpenGraph } from "@/config/navigation";

const title = "Claude MD";
const description =
  "The codebase context file Claude Code reads on every session. Project structure, token architecture, and the conventions a builder needs to extend robr0 DS without exploring.";

export const metadata: Metadata = {
  alternates: { canonical: "/blueprints/claude" },
  title,
  description,
  openGraph: pageOpenGraph(title, description, "/blueprints/claude"),
};

export default function ClaudeBlueprintLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
