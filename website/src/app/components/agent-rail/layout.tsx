import ComponentPageLayout from "@/components/ComponentProps/ComponentPageLayout";
import { componentPageMetadata } from "@/config/navigation";

export const metadata = componentPageMetadata("agent-rail");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ComponentPageLayout slug="agent-rail">{children}</ComponentPageLayout>;
}
