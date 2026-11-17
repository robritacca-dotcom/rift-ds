import ComponentPageLayout from "@/components/ComponentProps/ComponentPageLayout";
import { componentPageMetadata } from "@/config/navigation";

export const metadata = componentPageMetadata("artifact-panel");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ComponentPageLayout slug="artifact-panel">{children}</ComponentPageLayout>;
}
