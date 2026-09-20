import type { Metadata } from "next";
import { pageOpenGraph } from "@/config/navigation";

// /privacy is a standalone top-level page (like /contact) — it lives in no
// sidebar array, so its metadata is a literal rather than pageMetadata().
const title = "Privacy";
const description =
  "What robertritacca.com collects: analytics and site-chat logs, why, and how long they are kept.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/privacy" },
  openGraph: pageOpenGraph(title, description, "/privacy"),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
