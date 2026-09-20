import type { Metadata } from "next";
import { pageOpenGraph } from "@/config/navigation";

const title = "Loops";
const description =
  "The scheduled agent automations running on this site: what they do, when they run, and the guardrails that keep a human in the loop.";

export const metadata: Metadata = {
  alternates: { canonical: "/loops" },
  title,
  description,
  openGraph: pageOpenGraph(title, description, "/loops"),
};

export default function LoopsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
