import { componentPageMetadata } from "@/config/navigation";

// Title and description come from src/chat/registry.json, through the merged
// component-pages list: the one place the widget's one-line summary lives.
export const metadata = componentPageMetadata("ai-chat");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
