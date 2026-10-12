import type { Metadata } from "next";
import { pageOpenGraph } from "@/config/navigation";

// /chat is a standalone top-level page (like /playground): a section with one
// member, so it lives in no sidebar array and its metadata is a literal.
const title = "Chat";
const description =
  "The whole AI chat as one installable widget: the panel with its docked, overlay and takeover forms, the streaming engine, threads, rich cards and the server handlers, configured with props and scaffolded by one command.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/chat" },
  openGraph: pageOpenGraph(title, description, "/chat"),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
