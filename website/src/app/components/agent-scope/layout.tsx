import ComponentPageLayout from "@/components/ComponentProps/ComponentPageLayout";
import { componentPageMetadata } from "@/config/navigation";

// Title and description come from src/components/registry.json, the single
// place a component's one-line summary lives.
export const metadata = componentPageMetadata("agent-scope");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ComponentPageLayout slug="agent-scope">{children}</ComponentPageLayout>;
}
