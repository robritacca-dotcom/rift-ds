import { sectionMetadata } from "@/config/navigation";

// The Chat section: an overview of the chat and the three ways to add it.
// Sub-pages take their titles from chatSidebarLinks through pageMetadata.
export const metadata = sectionMetadata(
  "Chat",
  "An AI chat for your app, added in minutes: one command installs it, props set it up, and three pages cover the full, UI-only and headless ways in."
);

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
