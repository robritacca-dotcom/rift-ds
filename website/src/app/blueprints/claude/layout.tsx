import type { Metadata } from "next";
import { pageOpenGraph } from "@/config/navigation";
import { BRAND_NAME } from "@/config/brand.generated";

const title = "Claude MD";
const description =
  `The context file Claude Code reads every session: project structure, token architecture, and the conventions for extending ${BRAND_NAME} without exploring.`;

export const metadata: Metadata = {
  alternates: { canonical: "/blueprints/claude" },
  title,
  description,
  openGraph: pageOpenGraph(title, description, "/blueprints/claude"),
};

export default function ClaudeBlueprintLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
