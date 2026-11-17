import ComponentPageLayout from "@/components/ComponentProps/ComponentPageLayout";
import { componentPageMetadata } from "@/config/navigation";

export const metadata = componentPageMetadata("tree-view");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ComponentPageLayout slug="tree-view">{children}</ComponentPageLayout>;
}
