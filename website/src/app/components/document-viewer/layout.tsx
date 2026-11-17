import ComponentPageLayout from "@/components/ComponentProps/ComponentPageLayout";
import { componentPageMetadata } from "@/config/navigation";

export const metadata = componentPageMetadata("document-viewer");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ComponentPageLayout slug="document-viewer">{children}</ComponentPageLayout>;
}
